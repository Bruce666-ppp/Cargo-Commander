import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { connectedAirports, deliveryDiscovery, discoveredAirports, emptyProgress, isMissionUnlocked, networkSummary, nextAvailableMission, readProgress, recordDelivery, recordStemBonus, writeProgress } from '../src/career.ts'
import { advanceFlight, aircraftResponse, flightReport, flightStep, newFlight } from '../src/flight.ts'
import { simulateFlight } from '../src/flight-learning.ts'
import { campaign, emptyLoadingState, inspectLoading, moveCargo, prepareFlightConfiguration, verifiedLoadingSolutions } from '../src/mission.ts'
import { earnings } from '../src/rewards.ts'

function countSolutions(mission, hold = [], used = new Set()) {
  if (hold.length === mission.slots.length) {
    const inspection = inspectLoading(mission, hold)
    const approved = prepareFlightConfiguration(mission, hold)
    assert.equal(Boolean(approved), inspection.ready)
    return Number(inspection.ready)
  }
  let count = countSolutions(mission, [...hold, null], used)
  for (const crate of mission.cargo) {
    if (used.has(crate.id)) continue
    used.add(crate.id)
    count += countSolutions(mission, [...hold, crate.id], used)
    used.delete(crate.id)
  }
  return count
}

function fly(mission, mode = 'delivery', control) {
  const { flight } = mission
  const configuration = prepareFlightConfiguration(mission, verifiedLoadingSolutions[mission.id], mode)
  const run = newFlight(flight)
  const response = aircraftResponse(flight, configuration)
  const correctionEnd = flight.model.gustStrength > 1 ? 11.25 : 10.75
  while (!run.end) {
    const time = run.ticks * flightStep
    advanceFlight(run, response, flight, flightStep, control ?? (time >= 9.5 && time < correctionEnd ? -1 : 0))
  }
  return flightReport(run, configuration, mode, flight)
}

function memoryStorage() {
  const values = new Map()
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
}

test('all six missions have multiple valid arrangements and a verified stored example', () => {
  for (const mission of campaign) {
    assert.ok(countSolutions(mission) > 1, mission.title)
    assert.ok(inspectLoading(mission, verifiedLoadingSolutions[mission.id]).ready, mission.title)
  }
})

test('closed slots, special fittings, restricted swaps and the optional battery obey the real loading rules', () => {
  const [, , relay, medical, , finale] = campaign
  const closed = moveCargo(relay, emptyLoadingState(relay), 'tools', 1)
  assert.match(closed.notice.text, /closed for maintenance/)
  assert.deepEqual(closed.hold, emptyLoadingState(relay).hold)
  const invalidHold = [null, 'tools', 'battery', 'instruments', null, null]
  assert.equal(prepareFlightConfiguration(relay, invalidHold, 'practice'), null)
  assert.match(moveCargo(medical, emptyLoadingState(medical), 'medicine', 0).notice.text, /cannot use slot 1/)
  const medicalHold = { ...emptyLoadingState(medical), hold: verifiedLoadingSolutions[medical.id] }
  assert.match(moveCargo(medical, medicalHold, 'clinic', 2).notice.text, /cannot swap/)
  const finalHold = { ...emptyLoadingState(finale), hold: verifiedLoadingSolutions[finale.id] }
  assert.equal(inspectLoading(finale, finalHold.hold).cargoMass, 92)
  assert.match(moveCargo(finale, finalHold, 'spare', 4).notice.text, /exceeds the 94 kg payload limit/)
})

test('all approved loads can complete delivery in Cruise, and later gusts increase pitch deviation', () => {
  for (const mission of campaign) {
    const result = fly(mission)
    assert.ok(result.passed, mission.title)
    assert.deepEqual(result.modesUsed, [{ speed: 'cruise', time: mission.flight.duration }])
  }
  assert.ok(fly(campaign[4], 'delivery', 0).peakPitch > fly(campaign[0], 'delivery', 0).peakPitch)
  assert.ok(fly(campaign[5], 'delivery', 0).peakPitch > fly(campaign[0], 'delivery', 0).peakPitch)
})

test('each successful delivery mode earns the same payment, certification and new connection', () => {
  let progress = emptyProgress()
  for (const mission of campaign) {
    const pending = recordStemBonus(progress, mission)
    const configuration = prepareFlightConfiguration(mission, verifiedLoadingSolutions[mission.id])
    const auto = recordDelivery(pending, mission, simulateFlight(mission, configuration, 'delivery').report)
    const manual = recordDelivery(pending, mission, fly(mission))
    assert.ok(auto.firstDelivery && manual.firstDelivery)
    assert.deepEqual(earnings(auto.progress, false), earnings(manual.progress, false))
    assert.deepEqual(auto.progress.routeIds, manual.progress.routeIds)
    assert.deepEqual(auto.progress.certificationIds, manual.progress.certificationIds)
    assert.deepEqual(auto.progress.completedMissionIds, manual.progress.completedMissionIds)
    progress = auto.progress
    assert.equal(earnings(recordDelivery(progress, mission, fly(mission)).progress, false).total, earnings(progress, false).total)
  }
})

test('official deliveries advance all six ranks, routes and badges through the discovery sequence', () => {
  let progress = emptyProgress()
  assert.deepEqual([...discoveredAirports(progress)], ['Harbor Base', 'Pinehaven Airport'])
  assert.deepEqual([...connectedAirports(progress)], ['Harbor Base'])
  const newAirports = ['Sundrift Airport', 'Coral Point Airport', 'Mercy Cay Airport', 'Stormwatch Airport', 'Northstar Airport', undefined]
  const storage = memoryStorage()
  for (const [index, mission] of campaign.entries()) {
    assert.equal(nextAvailableMission(progress), mission)
    assert.equal(mission.origin, index === 0 ? 'Harbor Base' : campaign[index - 1].destination)
    assert.ok(connectedAirports(progress).has(mission.origin))
    assert.ok(!connectedAirports(progress).has(mission.destination))
    if (index < 5) assert.equal(isMissionUnlocked(progress, campaign[index + 1]), false)
    const report = fly(mission)
    const { progress: updated, accepted, firstDelivery } = recordDelivery(progress, mission, report)
    assert.ok(accepted && firstDelivery)
    assert.equal(updated.rankMilestone, index + 1)
    assert.deepEqual(updated.certificationIds, campaign.slice(0, index + 1).map(entry => entry.career.certificationId))
    assert.ok(updated.routeIds.includes(mission.career.routeId))
    const discovery = deliveryDiscovery(mission, progress, updated)
    assert.equal(discovery.airport, newAirports[index])
    assert.deepEqual([...connectedAirports(updated)].filter(airport => !connectedAirports(progress).has(airport)), [mission.destination])
    const replay = recordDelivery(updated, mission, report)
    assert.equal(replay.firstDelivery, false)
    assert.strictEqual(replay.progress, updated)
    writeProgress(updated, storage)
    progress = readProgress(storage)
    assert.deepEqual(progress, updated)
  }
  assert.equal(nextAvailableMission(progress), undefined)
  assert.deepEqual(networkSummary(progress), { deliveries: 6, routes: 6, airports: 7 })
  assert.equal(discoveredAirports(progress).size, 7)
})

test('a legacy Mission 01 save opens Coastal Resupply and later rewards require unlocked official success', () => {
  const [first, second, third] = campaign
  const initial = emptyProgress()
  assert.strictEqual(recordDelivery(initial, second, fly(second)).progress, initial)
  const save = recordDelivery(initial, first, fly(first)).progress
  delete save.bestFlights[first.id].routeProgress
  const storage = memoryStorage()
  writeProgress(save, storage)
  const restored = readProgress(storage)
  assert.deepEqual(restored, save)
  assert.equal(nextAvailableMission(restored), second)
  for (const [mission, result] of [[second, fly(second, 'practice')], [second, fly(second, 'delivery', 1)], [third, fly(third)]]) {
    assert.strictEqual(recordDelivery(restored, mission, result).progress, restored)
  }
})
