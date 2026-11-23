import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  aircraftPercent, calculateLoad, campaign, emptyLoadingState, formatCg, inspectLoading, islandSupplyRun,
  moveCargo, prepareFlightConfiguration, undoCargoMove, validatePayload, validatePositions,
} from '../src/mission.ts'

const mission = islandSupplyRun

test('the empty aircraft and a complete load use the weighted-average CG', () => {
  const empty = emptyLoadingState(mission).hold
  assert.deepEqual(calculateLoad(mission, empty), { cargoMass: 0, aircraftMass: 100, cg: 4.5 })
  assert.equal(inspectLoading(mission, empty).ready, false)

  const hold = [null, null, 'water', 'equipment', 'food', null]
  const expected = (100 * 4.5 + 30 * 4 + 20 * 5 + 10 * 6) / 160
  assert.deepEqual(calculateLoad(mission, hold), { cargoMass: 60, aircraftMass: 160, cg: expected })
  const flight = prepareFlightConfiguration(mission, hold)
  assert.equal(flight.missionId, mission.id)
  assert.equal(flight.cg, 4.5625)
  assert.equal(flight.totalCargoMass, 60)
  assert.equal(flight.totalAircraftMass, 160)
  assert.deepEqual(flight.targetCgRange, [4.4, 4.6])
  assert.deepEqual(flight.cargoArrangement.map(entry => entry.cargo?.id ?? null), hold)
  assert.deepEqual(flight.cargoArrangement.map(entry => entry.position), mission.slots)
  assert.equal(flight.safety.ready, true)
})

test('payload and CG endpoints are inclusive, with no rounding in validation', () => {
  const lower = [null, 'equipment', null, 'water', null, null]
  const upper = [null, 'equipment', null, null, 'water', null]
  assert.equal(inspectLoading(mission, lower).cg, 4.4)
  assert.equal(inspectLoading(mission, lower).balance, 'balanced')
  assert.equal(inspectLoading(mission, upper).cg, 4.6)
  assert.equal(inspectLoading(mission, upper).balance, 'balanced')
  assert.equal(inspectLoading({ ...mission, targetCg: [4.400000001, 4.6] }, lower).balance, 'forward')
  assert.equal(inspectLoading({ ...mission, targetCg: [4.4, 4.599999999] }, upper).balance, 'aft')
  assert.equal(validatePayload(mission, 60), true)
  assert.equal(validatePayload(mission, 60.000000001), false)
  assert.equal(prepareFlightConfiguration(mission, upper), null)
  assert.equal(prepareFlightConfiguration(mission, ['water', 'equipment', 'food', null, null, null]), null)
})

test('CG display distinguishes an unsafe rounded reading from the inclusive limits', () => {
  const relay = campaign.find(entry => entry.number === '03')
  const partial = inspectLoading(relay, [null, null, 'instruments', null, null, null])
  assert.equal(partial.cg.toFixed(2), '4.42')
  assert.equal(partial.balance, 'forward')
  assert.equal(formatCg(relay, partial.cg), '4.417')
  assert.equal(formatCg(mission, 4.6001), '4.6001')
  assert.equal(formatCg(mission, 4.4), '4.40')
  assert.equal(formatCg(mission, 4.6), '4.60')
  assert.equal(formatCg(mission, 4.5625), '4.56')
  assert.equal(formatCg(mission, 4.72), '4.72')
})

test('slot centres, tick marks, CG and target use the same SVG coordinate system', () => {
  const svgX = arm => (aircraftPercent(mission, arm) / 100) * 780
  assert.deepEqual(mission.slots.map(arm => Math.round(svgX(arm))), [234, 294, 354, 414, 474, 534])
  assert.equal(Math.round(svgX(0)), 114)
  assert.equal(Math.round(svgX(4.4)), 378)
  assert.equal(Math.round(svgX(4.6)), 390)
  assert.ok(Math.abs(svgX(4.5625) - 387.75) < 1e-10)
})

test('the same move changes CG three times as much for the 30 kg crate as the 10 kg crate', () => {
  const hold = ['food', 'water', 'equipment', null, null, null]
  const state = { hold, previous: null, notice: null }
  const before = calculateLoad(mission, hold).cg
  const heavy = moveCargo(mission, state, 'water', 4)
  const light = moveCargo(mission, state, 'food', 3)
  const heavyShift = calculateLoad(mission, heavy.hold).cg - before
  const lightShift = calculateLoad(mission, light.hold).cg - before
  assert.ok(Math.abs(heavyShift - 90 / 160) < 1e-12)
  assert.ok(Math.abs(lightShift - 30 / 160) < 1e-12)
  assert.match(heavy.notice.text, /Water Supplies \(30 kg\).*towards the tail.*CG .*→.*0\.56 m towards the tail/)
  assert.match(light.notice.text, /0\.19 m towards the tail/)

  const exactlyBalancedMove = moveCargo(mission, { ...state, hold: ['equipment', 'food', null, null, null, null] }, 'water', 2)
  assert.match(exactlyBalancedMove.notice.text, /remained almost unchanged/)
  assert.doesNotMatch(exactlyBalancedMove.notice.text, /towards the/)
})

test('place, swap, return, undo and reset preserve crate identity and slot exclusivity', () => {
  let state = emptyLoadingState(mission)
  state = moveCargo(mission, state, 'food', 0)
  const occupied = moveCargo(mission, state, 'water', 0)
  assert.strictEqual(occupied.hold, state.hold)
  assert.match(occupied.notice.text, /already holds Food Supplies/)
  assert.equal(undoCargoMove(mission, occupied).hold[0], null)

  state = moveCargo(mission, state, 'water', 3)
  const beforeSwap = state.hold
  state = moveCargo(mission, state, 'food', 3)
  assert.deepEqual(state.hold, ['water', null, null, 'food', null, null])
  assert.match(state.notice.text, /Swapped with Water Supplies/)
  assert.strictEqual(undoCargoMove(mission, state).hold, beforeSwap)
  state = moveCargo(mission, state, 'water', null)
  assert.deepEqual(state.hold, [null, null, null, 'food', null, null])
  assert.equal(inspectLoading(mission, state.hold).cargoMass, 10)
  assert.equal(undoCargoMove(mission, state).previous, null)
  assert.deepEqual(emptyLoadingState(mission).hold, [null, null, null, null, null, null])
  assert.equal(validatePositions(mission, ['water', 'water', null, null, null, null]), false)
  assert.equal(validatePositions(mission, ['unknown', null, null, null, null, null]), false)
  assert.equal(moveCargo(mission, state, 'water', 6).notice.warning, true)
})

test('a future mission can restrict destination slots and reject payload overflow', () => {
  const restricted = { ...mission, loadingConstraints: { allowedSlotsByCargo: { food: [1, 3], water: [3] } } }
  const empty = emptyLoadingState(restricted)
  assert.match(moveCargo(restricted, empty, 'water', 1).notice.text, /cannot use slot 2/)
  const placed = moveCargo(restricted, moveCargo(restricted, empty, 'food', 0), 'water', 2)
  const blocked = moveCargo(restricted, placed, 'food', 2)
  assert.strictEqual(blocked.hold, placed.hold)
  assert.match(blocked.notice.text, /cannot swap/)

  const lightAircraft = { ...mission, payloadLimit: 20 }
  const overweight = moveCargo(lightAircraft, emptyLoadingState(lightAircraft), 'water', 0)
  assert.match(overweight.notice.text, /exceeds the 20 kg payload limit/)
  assert.equal(inspectLoading(lightAircraft, overweight.hold).cargoMass, 0)
})
