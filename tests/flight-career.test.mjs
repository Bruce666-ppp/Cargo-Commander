import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { flightConfigurationAllowed, islandSupplyRun as mission, prepareFlightConfiguration } from '../src/mission.ts'
import { advanceFlight, aircraftResponse, flightReport, flightStep, instructorAssessment, newFlight, passedFlightChallenge, remainingFlightTime } from '../src/flight.ts'
import { emptyProgress, networkSummary, readProgress, recordDelivery, resetSavedProgress, writeProgress } from '../src/career.ts'

test('campaign reset clears the official career record and preserves other game data', () => {
  const audio = JSON.stringify({ muted: true, music: 0.4 })
  const records = new Map([
    ['cargo-commander.career', JSON.stringify(emptyProgress())],
    ['cargo-commander.experience', 'experienced'],
    [`cargo-commander.mechanic.${mission.id}`, 'seen'],
    ['cargo-commander.audio', audio],
    ['cargo-commander.diy', '{"version":1,"architect":true,"missions":[]}'],
    ['another-game', 'saved'],
  ])
  assert.equal(resetSavedProgress({ removeItem: key => records.delete(key) }), true)
  assert.deepEqual([...records], [
    ['cargo-commander.experience', 'experienced'],
    [`cargo-commander.mechanic.${mission.id}`, 'seen'],
    ['cargo-commander.audio', audio],
    ['cargo-commander.diy', '{"version":1,"architect":true,"missions":[]}'],
    ['another-game', 'saved'],
  ])
  assert.equal(resetSavedProgress({ removeItem: () => { throw new Error('storage unavailable') } }), false)
})

const approvedHold = [null, null, 'water', 'equipment', 'food', null]
const forwardHold = ['water', 'equipment', 'food', null, null, null]
const aftHold = [null, null, null, 'food', 'equipment', 'water']
const settings = mission.flight
const approved = prepareFlightConfiguration(mission, approvedHold)
const forward = prepareFlightConfiguration(mission, forwardHold, 'practice')
const aft = prepareFlightConfiguration(mission, aftHold, 'practice')

function simulate(configuration, mode, control = () => 0, hz = 60, speed = 'cruise') {
  const run = newFlight(settings)
  const response = aircraftResponse(settings, configuration)
  for (let frame = 0; !run.end && frame < (settings.duration + 1) * hz; frame++) {
    advanceFlight(run, response, settings, 1 / hz, control(frame / hz), typeof speed === 'function' ? speed(frame / hz) : speed)
  }
  return flightReport(run, configuration, mode, settings)
}

const correction = time => time >= 12 && time < 13 ? -1 : 0
const acceleratedCorrection = time => time >= 9.5 && time < 11.05 ? -1 : 0

test('practice relaxes only the CG range and uses the same authenticated loading snapshot', () => {
  assert.equal(approved.cg, 4.5625)
  assert.equal(forward.cg, 3.8125)
  assert.equal(aft.cg, 5.1875)
  assert.equal(prepareFlightConfiguration(mission, forwardHold), null)
  assert.equal(prepareFlightConfiguration(mission, [null, null, 'water', null, null, null], 'practice'), null)
  assert.equal(prepareFlightConfiguration({ ...mission, payloadLimit: 50 }, approvedHold, 'practice'), null)
  const restricted = { ...mission, loadingConstraints: { allowedSlotsByCargo: { water: [6] } } }
  assert.equal(prepareFlightConfiguration(restricted, approvedHold, 'practice'), null)
  assert.equal(flightConfigurationAllowed(mission, forward, 'practice'), true)
  assert.equal(flightConfigurationAllowed(mission, forward, 'delivery'), false)
  assert.equal(flightConfigurationAllowed(mission, { ...approved, cg: 4.5 }, 'delivery'), false)
})

test('forward load reduces nose-up response while aft load weakens restoring and damping', () => {
  const forwardResponse = aircraftResponse(settings, forward)
  const neutralResponse = aircraftResponse(settings, approved)
  const aftResponse = aircraftResponse(settings, aft)
  assert.ok(forwardResponse.up < neutralResponse.up)
  assert.ok(forwardResponse.trim < neutralResponse.trim)
  assert.ok(aftResponse.up > neutralResponse.up)
  assert.ok(aftResponse.restoring < neutralResponse.restoring && aftResponse.damping < neutralResponse.damping)
  const pitchAfterOneSecond = configuration => {
    const run = newFlight(settings)
    for (let step = 0; step < 60; step++) advanceFlight(run, aircraftResponse(settings, configuration), settings, 1 / 60, 1)
    return run.pitch
  }
  assert.ok(pitchAfterOneSecond(forward) < pitchAfterOneSecond(approved))
  assert.ok(pitchAfterOneSecond(aft) > pitchAfterOneSecond(approved))
  assert.ok(simulate(aft, 'practice').peakPitch > simulate(approved, 'practice').peakPitch)
})

test('the approved flight is recoverable with a small input at 30, 60 and 120 FPS', () => {
  const reports = [30, 60, 120].map(hz => simulate(approved, 'delivery', correction, hz))
  for (const report of reports) {
    assert.equal(report.passed, true)
    assert.equal(report.elapsed, 30)
    assert.equal(report.end, 'destination')
    assert.equal(report.timeWithInput, 1)
    assert.deepEqual(report.samples, reports[0].samples)
    assert.equal(report.corridorFraction, reports[0].corridorFraction)
    assert.equal(report.samples.at(-1).altitude, report.finalAltitude)
  }
  const run = newFlight(settings)
  advanceFlight(run, aircraftResponse(settings, approved), settings, 0, 1)
  assert.equal(run.ticks, 0)
  assert.equal(run.pitch, 0)
})

test('over-controlling can fail despite an approved CG, with a recorded boundary and neutral coaching', () => {
  const report = simulate(approved, 'delivery', () => 1)
  assert.equal(report.passed, false)
  assert.equal(report.end, 'boundary')
  assert.ok(report.elapsed < settings.duration)
  assert.match(instructorAssessment(report, settings).observation, /above the broader flight boundary/)
  assert.match(instructorAssessment(report, settings).adjustment, /short inputs/)
  assert.doesNotMatch(instructorAssessment(report, settings).adjustment, /move a crate/)
})

test('Express and Rush reduce travel time while increasing simulated disturbance and keeping flights achievable', () => {
  const baseline = simulate(approved, 'delivery')
  let previousPitch = baseline.peakPitch
  for (const [speed, elapsed] of [['express', 20], ['rush', 15]]) {
    const handsOff = simulate(approved, 'delivery', undefined, 60, speed)
    assert.ok(handsOff.peakPitch > previousPitch)
    previousPitch = handsOff.peakPitch
    const report = simulate(approved, 'delivery', acceleratedCorrection, 60, speed)
    assert.equal(report.elapsed, elapsed)
    assert.equal(report.routeProgress, settings.duration)
    assert.equal(report.passed, true)
    assert.deepEqual(report.modesUsed, [{ speed, time: elapsed }])
    assert.ok(simulate(aft, 'practice', undefined, 60, speed).peakPitch > handsOff.peakPitch)
    assert.equal(recordDelivery(emptyProgress(), mission, report).accepted, true)
  }
})

test('switching in either direction preserves active time, aircraft state, and all mandatory flight checks', () => {
  const run = newFlight(settings)
  const response = aircraftResponse(settings, approved)
  for (let frame = 0; frame < 360; frame++) advanceFlight(run, response, settings, flightStep, 0)
  const before = structuredClone(run)
  advanceFlight(run, response, settings, 0, 1, 'rush')
  assert.deepEqual(run, before)
  assert.ok(Math.abs(remainingFlightTime(settings, run.routeProgress, 'rush') - 12) < 1e-8)
  advanceFlight(run, response, settings, flightStep, 0, 'rush')
  assert.ok(run.disturbance > 1 && run.disturbance < 1.1)
  const mixed = time => time < 5 ? 'cruise' : time < 11 ? 'rush' : time < 15 ? 'express' : 'cruise'
  const input = time => time >= 9.5 && time < 11 ? -1 : 0
  const report = simulate(approved, 'delivery', input, 30, mixed)
  assert.deepEqual(report.samples, simulate(approved, 'delivery', input, 120, mixed).samples)
  assert.equal(report.elapsed, 22)
  assert.deepEqual(report.modesUsed, [{ speed: 'cruise', time: 12 }, { speed: 'express', time: 4 }, { speed: 'rush', time: 6 }])
  assert.ok(Math.abs(report.corridorFraction - report.timeInCorridor / report.elapsed) < 1e-8)
  assert.equal(passedFlightChallenge(settings, { ...report, routeProgress: 29.9 }), false)
  assert.equal(passedFlightChallenge(settings, { ...report, elapsed: 12 }), false)
  assert.equal(passedFlightChallenge(settings, { ...report, corridorFraction: .69 }), false)
  assert.equal(passedFlightChallenge(settings, { ...report, finalAltitude: 115 }), false)
  Object.assign(run, {
    routeProgress: settings.duration - flightStep, altitude: settings.boundary[1] + 1,
    boundaryTicks: Math.ceil(settings.maxBoundarySeconds / flightStep) - 1,
  })
  advanceFlight(run, response, settings, flightStep, 0, 'rush')
  assert.equal(run.end, 'boundary')
})

test('only successful official flights can establish the route, promote or certify', () => {
  const initial = emptyProgress()
  const practice = simulate(approved, 'practice', correction)
  assert.equal(practice.passed, true)
  assert.strictEqual(recordDelivery(initial, mission, practice).progress, initial)
  assert.strictEqual(recordDelivery(initial, mission, simulate(approved, 'delivery', () => 1)).progress, initial)
  const success = simulate(approved, 'delivery', correction)
  assert.strictEqual(recordDelivery(initial, mission, { ...success, configuration: forward }).progress, initial)
  const first = recordDelivery(initial, mission, success)
  assert.equal(first.accepted, true)
  assert.equal(first.firstDelivery, true)
  assert.equal(first.progress.rankMilestone, 1)
  assert.deepEqual(first.progress.certificationIds, ['balance-basics'])
  assert.deepEqual(first.progress.routeIds, ['harbor-base-pinehaven'])
  assert.deepEqual(first.progress.unlockedMissionIds, ['coastal-resupply'])
  assert.deepEqual(networkSummary(first.progress), { routes: 1, airports: 2, deliveries: 1 })
  const duplicate = recordDelivery(first.progress, mission, success)
  assert.equal(duplicate.firstDelivery, false)
  assert.strictEqual(duplicate.progress, first.progress)
})

test('replays can improve a saved record without duplicating milestones, and storage restores progress', () => {
  const first = recordDelivery(emptyProgress(), mission, simulate(approved, 'delivery', time => time >= 19 && time < 20 ? -1 : 0))
  assert.equal(first.firstDelivery, true)
  const replay = recordDelivery(first.progress, mission, simulate(approved, 'delivery', correction))
  assert.equal(replay.firstDelivery, false)
  assert.ok(replay.progress.bestFlights[mission.id].corridorFraction > first.progress.bestFlights[mission.id].corridorFraction)
  assert.deepEqual(networkSummary(replay.progress), { routes: 1, airports: 2, deliveries: 1 })
  const values = new Map()
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
  assert.equal(writeProgress(replay.progress, storage), true)
  assert.deepEqual(readProgress(storage), replay.progress)
  const key = [...values.keys()][0]
  const damaged = JSON.parse(values.get(key))
  damaged.rankMilestone = 6
  damaged.certificationIds.push('cargo-commander')
  values.set(key, JSON.stringify(damaged))
  assert.deepEqual(readProgress(storage), replay.progress)
  const legacy = structuredClone(replay.progress)
  delete legacy.bestFlights[mission.id].routeProgress
  values.set(key, JSON.stringify(legacy))
  assert.deepEqual(readProgress(storage), legacy)
  values.set(key, '{invalid json')
  assert.deepEqual(readProgress(storage), emptyProgress())
})
