import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import {
  authorFlightPassed, changeDiyConfig, checkDiyConfig, decodeDiyMission, diyShareLimit,
  diyStorageKey, emptyDiyStore, encodeDiyMission, makeDiyMission, newDiyDraft,
  qualifiesForArchitect, readDiyStore, saveDiyStore, setDiyReference, validReference,
} from '../src/diy.ts'
import { advanceFlight, aircraftResponse, flightReport, newFlight } from '../src/flight.ts'
import { verifiedSolution, workedSolution } from '../src/learning.ts'
import { inspectLoading, islandSupplyRun, prepareFlightConfiguration } from '../src/mission.ts'

const config = {
  name: 'Harbour Challenge', cargo: [{ type: 0, mass: 10 }, { type: 3, mass: 10 }],
  blocked: [6], cg: [445, 455], wind: 0,
}
const mission = makeDiyMission(config)
const left = [null, null, 'diy-cargo-1', 'diy-cargo-2', null, null]
const right = [null, null, 'diy-cargo-2', 'diy-cargo-1', null, null]
const author = { ...newDiyDraft(), config, reference: left, confirmed: true }
const saved = { ...author, note: '重心 <plain text> ✈', validated: true }

test('DIY uses the original aircraft and fixed 60 kg envelope parameters', () => {
  assert.equal(checkDiyConfig(config).status, 'solvable')
  assert.equal(mission.payloadLimit, 60)
  assert.equal(mission.aircraft, islandSupplyRun.aircraft)
  assert.equal(mission.slots, islandSupplyRun.slots)
  assert.deepEqual(mission.targetCg, [4.45, 4.55])
  assert.equal(mission.flight.model.gustStrength, 0)
  assert.ok(makeDiyMission({ ...config, wind: 2 }).flight.model.gustStrength > makeDiyMission({ ...config, wind: 1 }).flight.model.gustStrength)
})

test('DIY configuration rejects invalid quantities, cargo, weights, slots, ranges and conditions', () => {
  for (const change of [
    { cargo: [] }, { cargo: Array(7).fill(config.cargo[0]) },
    { cargo: [{ type: 7, mass: 10 }] }, { cargo: [{ type: 0, mass: 51 }] }, { cargo: [{ type: 0, mass: 2.5 }] },
    { cargo: [{ type: 0, mass: 35 }, { type: 2, mass: 26 }] }, { blocked: [2, 3, 4, 5, 6] },
    { blocked: [0] }, { blocked: [7] }, { blocked: [1, 1] },
    { cg: [439, 450] }, { cg: [445, 461] }, { cg: [451, 451] }, { cg: [451, 450] },
    { wind: 3 }, { name: 'a'.repeat(49) }, { name: '   ' },
  ]) assert.equal(checkDiyConfig({ ...config, ...change }).status, 'invalid', JSON.stringify(change))
})

test('loading search distinguishes blocked powered slots and an incompatible target', () => {
  assert.equal(checkDiyConfig({ ...config, blocked: [3, 4], cargo: [{ type: 4, mass: 10 }] }).status, 'unsolvable')
  assert.equal(checkDiyConfig({ ...config, blocked: [2, 4, 5, 6], cargo: [{ type: 3, mass: 45 }] }).status, 'unsolvable')
  const checked = checkDiyConfig({ ...config, cargo: [{ type: 4, mass: 10 }, { type: 0, mass: 10 }] })
  assert.equal(checked.status, 'solvable')
  const hold = verifiedSolution(checked.mission)
  assert.ok([2, 3].includes(hold.indexOf('diy-cargo-1')))
  assert.equal(inspectLoading(checked.mission, hold).ready, true)
})

test('the player reference is retained, alternate arrangements pass and worked steps reproduce the selected load', () => {
  assert.equal(validReference(mission, left), true)
  assert.equal(validReference(mission, right), true)
  assert.equal(validReference(mission, ['diy-cargo-1', null, null, null, null, 'diy-cargo-2']), false)
  assert.equal(validReference(mission, ['diy-cargo-1', 'diy-cargo-1', null, null, null, null]), false)
  assert.deepEqual(workedSolution(mission, right).at(-1).hold, right)
  assert.deepEqual(setDiyReference(author, right).reference, right)
  assert.equal(setDiyReference(author, right).confirmed, false)
  assert.equal(inspectLoading(mission, right).cg, (100 * 4.5 + 10 * 4 + 10 * 5) / 120)
})

test('material edits invalidate reference, explanation confirmation and validation', () => {
  for (const change of [{ blocked: [1, 6] }, { wind: 2 }, { cg: [446, 455] }, { cargo: [{ type: 0, mass: 12 }] }]) {
    const edited = changeDiyConfig(saved, { ...config, ...change })
    assert.equal(edited.reference, null)
    assert.equal(edited.confirmed, false)
    assert.equal(edited.validated, false)
    assert.equal(encodeDiyMission(edited), null)
  }
  const renamed = changeDiyConfig(saved, { ...config, name: 'A new title' })
  assert.equal(renamed.validated, true)
  assert.equal(setDiyReference(saved, right).validated, false)
})

test('a Cruise flight with the submitted reference can validate, but failure, practice or a different load cannot', () => {
  const configuration = prepareFlightConfiguration(mission, left)
  const run = newFlight(mission.flight)
  const response = aircraftResponse(mission.flight, configuration)
  for (let tick = 0; tick < 310 && !run.end; tick++) advanceFlight(run, response, mission.flight, .1, 0, 'cruise')
  const report = flightReport(run, configuration, 'delivery', mission.flight)
  assert.equal(authorFlightPassed(author, mission, report), true)
  assert.equal(authorFlightPassed({ ...author, confirmed: false }, mission, report), false)
  assert.equal(authorFlightPassed({ ...author, reference: right }, mission, report), false)
  assert.equal(authorFlightPassed(author, mission, { ...report, passed: false }), false)
  assert.equal(authorFlightPassed(author, mission, { ...report, mode: 'practice' }), false)
  assert.equal(encodeDiyMission(author), null)
})

test('the portable fragment reconstructs cargo, solution, constraints and plain-text note without local storage', () => {
  const encoded = encodeDiyMission(saved)
  assert.match(encoded, /^[\w-]+$/)
  assert.ok(encoded.length < diyShareLimit)
  assert.deepEqual(decodeDiyMission(encoded), saved)
  assert.equal(inspectLoading(makeDiyMission(decodeDiyMission(encoded).config), right).ready, true)
})

test('the receiver rejects malformed, oversized, unsupported and tampered payloads', () => {
  const token = JSON.parse(Buffer.from(encodeDiyMission(saved), 'base64url').toString('utf8'))
  const encode = value => Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
  for (const [key, value] of [
    [0, 9], [2, [[0, 99]]], [3, [3, 4]], [4, [410, 480]], [5, 'storm'], [6, [0, 0, 1, 1, 0, 0]], [7, 'x'.repeat(161)],
  ]) {
    const invalid = [...token]
    invalid[key] = value
    assert.equal(decodeDiyMission(encode(invalid)), null)
  }
  assert.equal(decodeDiyMission('e'.repeat(diyShareLimit + 1)), null)
  assert.equal(decodeDiyMission('<script>'), null)
  assert.equal(decodeDiyMission(''), null)
})

test('creative certification requires a confirmed and tested original design with a constraint', () => {
  const baseline = newDiyDraft().config
  baseline.name = 'Name-only change'
  const reference = verifiedSolution(makeDiyMission(baseline))
  assert.equal(qualifiesForArchitect({ ...saved, config: baseline, reference }), false)
  assert.equal(qualifiesForArchitect({ ...saved, validated: false }), false)
  assert.equal(qualifiesForArchitect({ ...saved, reference: null }), false)
  assert.equal(qualifiesForArchitect(saved), true)
})

test('the versioned creative archive round-trips drafts, received challenges and the independent badge', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const store = { ...emptyDiyStore(), architect: true, missions: [
    { ...newDiyDraft(), source: 'created', id: 'draft' },
    { ...saved, source: 'created', id: 'made' },
    { ...saved, source: 'received', id: 'received' },
  ] }
  assert.equal(saveDiyStore(store, storage), '')
  assert.deepEqual(readDiyStore(storage), { store, error: '' })
  assert.notEqual(saveDiyStore(store, { setItem() { throw Error('quota') } }), '')
  data.set(diyStorageKey, '{"version":9}')
  const rejected = readDiyStore(storage)
  assert.notEqual(rejected.error, '')
  assert.deepEqual(rejected.store, emptyDiyStore())
  assert.equal(data.get(diyStorageKey), '{"version":9}')
})
