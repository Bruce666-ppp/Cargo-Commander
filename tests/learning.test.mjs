import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { emptyProgress, recordDelivery } from '../src/career.ts'
import { flightLesson, liveFlightTip, newFlightCoach, retryFlightTip } from '../src/flight-learning.ts'
import { flightStep, newFlight } from '../src/flight.ts'
import { advanceHintClock, hintStrategy, newHintClock, nextCargoMove, noteCargoProgress, readExperience, recordComparison, requestHint, saveExperience, verifiedSolution, workedSolution } from '../src/learning.ts'
import { campaign, emptyLoadingState, getCargo, inspectLoading, planCargoMove, prepareFlightConfiguration, verifiedLoadingSolutions } from '../src/mission.ts'

test('experience choice is independent of the career save', () => {
  const values = new Map([['cargo-commander.career', 'existing progress']])
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
  assert.equal(readExperience(storage), null)
  saveExperience('experienced', storage)
  assert.equal(readExperience(storage), 'experienced')
  saveExperience('beginner', storage)
  assert.equal(readExperience(storage), 'beginner')
  assert.equal(values.get('cargo-commander.career'), 'existing progress')
})

test('the hint clock respects each schedule, pause gates, manual hints and one offer', () => {
  assert.deepEqual(campaign.map(({ hintTimes }) => hintTimes), [
    [45, 90, 150, 240], [50, 100, 170, 270], [60, 120, 180, 300],
    [60, 120, 180, 300], [60, 120, 180, 300], [75, 150, 240, 360],
  ])
  for (const { hintTimes } of campaign) {
    const clock = newHintClock()
    assert.equal(advanceHintClock(clock, hintTimes[0] - 1, hintTimes, true), false)
    assert.equal(advanceHintClock(clock, 500, hintTimes, false), false)
    assert.equal(clock.elapsed, hintTimes[0] - 1)
    assert.equal(advanceHintClock(clock, 1, hintTimes, true), true)
    assert.equal(clock.level, 1)
    requestHint(clock)
    assert.equal(clock.level, 2)
    assert.equal(advanceHintClock(clock, hintTimes[2] - hintTimes[0], hintTimes, true), true)
    assert.equal(clock.level, 3)
    assert.equal(advanceHintClock(clock, hintTimes[3] - hintTimes[2], hintTimes, true), true)
    assert.equal(clock.offer, 'visible')
    clock.offer = 'seen'
    assert.equal(advanceHintClock(clock, 600, hintTimes, true), false)
    assert.equal(clock.offer, 'seen')
  }
})

test('productive moves buy a short delay without clearing the clock or postponing help indefinitely', () => {
  const mission = campaign[0]
  const clock = newHintClock()
  const empty = emptyLoadingState(mission).hold
  const first = planCargoMove(mission, empty, 'food', 3).next
  advanceHintClock(clock, 44, mission.hintTimes, true)
  noteCargoProgress(clock, mission, empty, first)
  assert.equal(clock.elapsed, 44)
  assert.equal(advanceHintClock(clock, 1, mission.hintTimes, true), false)
  for (let second = 46; second <= 57; second++) {
    noteCargoProgress(clock, mission, empty, first)
    advanceHintClock(clock, 1, mission.hintTimes, true)
    assert.equal(clock.level, second < 57 ? 0 : 1)
  }
})

test('specific hints make legal progress from the live hold and explain a necessary unload', () => {
  for (const mission of campaign) {
    let hold = emptyLoadingState(mission).hold
    const original = [...hold]
    const first = nextCargoMove(mission, hold)
    assert.deepEqual(hold, original)
    assert.ok(first)
    for (let move = 0; move < 8 && !inspectLoading(mission, hold).ready; move++) {
      const hint = nextCargoMove(mission, hold)
      assert.ok(hint)
      assert.deepEqual(planCargoMove(mission, hold, hint.id, hint.destination).next, hint.next)
      hold = hint.next
    }
    assert.ok(inspectLoading(mission, hold).ready)
    assert.equal(nextCargoMove(mission, hold), null)
  }
  const [, , relay, medical, , finale] = campaign
  assert.match(hintStrategy(relay, emptyLoadingState(relay).hold, 'Slot 2 is closed'), /slots 2 and 5/)
  assert.match(hintStrategy(medical, emptyLoadingState(medical).hold), /Medical Case uses slots 3 or 4/)
  const partial = ['rations', null, 'cold', null, 'spare', null]
  const action = nextCargoMove(finale, partial)
  assert.equal(action.id, 'spare')
  assert.equal(action.destination, null)
})

test('each worked solution uses real slot data and explains the correct weighted average', () => {
  for (const mission of campaign) {
    const steps = workedSolution(mission)
    assert.ok(steps[0].hold.every(crate => crate === null))
    for (const step of steps.slice(1)) {
      assert.deepEqual(planCargoMove(mission, step.before, step.cargo, step.slot).next, step.hold)
      const rows = step.hold.flatMap((id, index) => id === null ? [] : [[getCargo(mission, id).mass, mission.slots[index]]])
      rows.push([mission.aircraft.emptyMass, mission.aircraft.emptyCg])
      const mass = rows.reduce((sum, row) => sum + row[0], 0)
      const distance = rows.reduce((sum, row) => sum + row[0] * row[1], 0) / mass
      assert.ok(Math.abs(distance - inspectLoading(mission, step.hold).cg) < 1e-10)
    }
    assert.ok(inspectLoading(mission, steps.at(-1).hold).ready)
  }
  const medical = { ...campaign[3], loadingConstraints: { allowedSlotsByCargo: { medicine: [4] } } }
  assert.equal(verifiedSolution(medical)[3], 'medicine')
  assert.ok(inspectLoading(medical, workedSolution(medical).at(-1).hold).ready)
})

test('training uses actual equal-distance moves while keeping both crates aboard', () => {
  const mission = campaign[0]
  const initial = [null, 'food', null, 'water', null, null]
  const water = [null, 'food', null, null, 'water', null]
  const food = ['food', null, null, null, 'water', null]
  const heavy = recordComparison(mission, initial, water, 'water')
  const light = recordComparison(mission, water, food, 'food')
  assert.equal(heavy.distance, light.distance)
  assert.equal(heavy.payload, light.payload)
  assert.ok(Math.abs(Math.abs(heavy.after - heavy.before) / Math.abs(light.after - light.before) - 3) < 1e-12)
  assert.equal(recordComparison(mission, initial, [null, 'water', null, 'food', null, null], 'water'), null)
})

test('flight coaching responds to sustained events and the six flight demonstrations cannot award career progress', () => {
  const settings = campaign[0].flight
  const coach = newFlightCoach()
  const run = newFlight(settings)
  const cue = (time, altitude, pitch = 0) => {
    Object.assign(run, { ticks: Math.round(time / flightStep), altitude, pitch })
    return liveFlightTip(coach, run, settings.corridor, 'rush', 0)
  }
  assert.equal(cue(1, 85), null)
  assert.equal(cue(2, 83), null)
  assert.match(cue(3, 83), /Gently pitch up/)
  assert.equal(cue(4, 121), null)
  assert.equal(cue(5, 121), null)
  assert.match(cue(10, 121), /Switch to Cruise/)
  let firstLesson
  for (const mission of campaign) {
    const cargo = prepareFlightConfiguration(mission, verifiedLoadingSolutions[mission.id])
    const demo = flightLesson(mission, cargo)
    firstLesson ??= demo
    assert.ok(demo.report.passed)
    assert.equal(demo.report.mode, 'practice')
    assert.equal(demo.report.elapsed, mission.flight.duration)
    assert.equal(demo.frames.at(-1).fraction, 1)
    assert.ok(demo.frames.some(frame => frame.input === 1) && demo.frames.some(frame => frame.input === -1))
    const progress = emptyProgress()
    assert.strictEqual(recordDelivery(progress, mission, demo.report).progress, progress)
  }
  const unbalanced = prepareFlightConfiguration(campaign[0], ['water', 'equipment', 'food', null, null, null], 'practice')
  const copy = structuredClone(unbalanced)
  const fallback = flightLesson(campaign[0], unbalanced)
  assert.match(fallback.reason, /outside the green zone/)
  assert.ok(fallback.configuration.safety.ready)
  assert.deepEqual(unbalanced, copy)
  assert.match(retryFlightTip({ ...firstLesson.report, peakPitch: 12 }, campaign[0], 2), /single short pitch press/)
})
