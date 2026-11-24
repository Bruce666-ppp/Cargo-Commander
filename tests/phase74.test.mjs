import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { emptyProgress, readProgress, recordDelivery, recordStemBonus, writeProgress } from '../src/career.ts'
import { districts, districtFor } from '../src/districts.ts'
import { emptyDiyStore, makeDiyMission, authorFlightPassed, readDiyStore, saveDiyStore } from '../src/diy.ts'
import { simulateFlight } from '../src/flight-learning.ts'
import { learningOutcomes } from '../src/learningOutcomes.ts'
import { campaign, emptyLoadingState, inspectLoading, prepareFlightConfiguration, verifiedLoadingSolutions } from '../src/mission.ts'
import { earnedGrowth, earnings, missionPayment } from '../src/rewards.ts'
import { distinctValidHolds, integratedStrategies, massTrial, stabilityComparison } from '../src/stem.ts'

const verify = (mission, hold = verifiedLoadingSolutions[mission.id]) =>
  simulateFlight(mission, prepareFlightConfiguration(mission, hold), 'delivery')?.report

test('quick verification rejects invalid loading and evaluates each of the 71 valid official loads', () => {
  assert.equal(simulateFlight(campaign[0], prepareFlightConfiguration(campaign[0], ['water', 'food', 'equipment', null, null, null], 'practice'), 'delivery'), null)
  let valid = 0
  for (const mission of campaign) {
    function check(hold, slot, remaining) {
      if (slot === hold.length) {
        if (!inspectLoading(mission, hold).ready) return
        const report = verify(mission, hold)
        assert.equal(report.passed, true, mission.number)
        assert.equal(report.elapsed, mission.flight.duration)
        assert.equal(report.configuration.cg, inspectLoading(mission, hold).cg)
        assert.deepEqual(report.configuration.cargoArrangement.map(({ cargo }) => cargo?.id ?? null), hold)
        valid++
        return
      }
      check(hold, slot + 1, remaining)
      for (const id of remaining) {
        const withCrate = [...hold]
        withCrate[slot] = id
        check(withCrate, slot + 1, remaining.filter(item => item !== id))
      }
    }
    check(emptyLoadingState(mission).hold, 0, mission.cargo.map(crate => crate.id))
  }
  assert.equal(valid, 71)
})

test('the mass trials restore identical starting balance and compare equal moves at fixed total mass', () => {
  const heavy = massTrial(0)
  const light = massTrial(1)
  assert.equal(heavy.payload, 70)
  assert.equal(heavy.payload, light.payload)
  assert.equal(heavy.before, light.before)
  assert.equal(heavy.distance, 1)
  assert.equal(light.distance, 1)
  assert.ok(Math.abs(heavy.shift / light.shift - 50 / 12) < 1e-12)
})

test('blocked-slot challenge accepts two genuinely different legal arrangements', () => {
  const mission = campaign[2]
  const original = verifiedLoadingSolutions[mission.id]
  const alternative = ['tools', null, null, 'battery', null, 'instruments']
  assert.equal(distinctValidHolds(mission, original, alternative), true)
  assert.equal(distinctValidHolds(mission, original, [...original]), false)
  assert.equal(distinctValidHolds(mission, original, ['tools', 'battery', null, null, null, 'instruments']), false)
})

test('controlled flights yield reproducibly different corridor results at the same active time and mode', () => {
  const [a, b] = stabilityComparison()
  assert.deepEqual(stabilityComparison(), [a, b])
  assert.equal(a.elapsed, b.elapsed)
  assert.equal(a.timeWithInput, b.timeWithInput)
  assert.deepEqual(a.modesUsed, b.modesUsed)
  assert.equal(a.configuration.totalCargoMass, b.configuration.totalCargoMass)
  assert.equal(a.configuration.safety.ready, true)
  assert.equal(b.configuration.safety.ready, true)
  assert.ok(a.corridorFraction - b.corridorFraction > .25)
  assert.equal(a.passed, true)
  assert.equal(b.passed, false)
})

test('integrated strategies are evaluated by the real payload, powered slot and balance rules', () => {
  const [overweight, unpowered, legal] = integratedStrategies()
  assert.equal(overweight.payloadOk, false)
  assert.equal(unpowered.positionsOk, false)
  assert.equal(legal.ready, true)
  assert.equal(verify(campaign[5], legal.hold).passed, true)
})

test('official rewards are independent, capped, migrated from v1 and do not repeat on replay', () => {
  const records = new Map()
  const storage = { getItem: key => records.get(key), setItem: (key, value) => records.set(key, value) }
  let progress = emptyProgress()
  assert.deepEqual(campaign.map(missionPayment), [
    { income: 400, bonus: 100 }, { income: 600, bonus: 200 }, { income: 900, bonus: 300 },
    { income: 1500, bonus: 500 }, { income: 2200, bonus: 800 }, { income: 3400, bonus: 1100 },
  ])
  assert.equal(recordStemBonus(progress, campaign[1]), progress)
  for (const mission of campaign) {
    const report = verify(mission)
    progress = recordDelivery(progress, mission, report).progress
    assert.equal(recordDelivery(progress, mission, report).progress, progress)
  }
  assert.deepEqual(earnings(progress, false), { base: 9000, stem: 0, creative: 0, total: 9000 })
  storage.setItem('cargo-commander.career', JSON.stringify({ ...progress, version: 1, stemBonusIds: campaign.map(m => m.id) }))
  progress = readProgress(storage)
  assert.equal(progress.version, 2)
  assert.equal(progress.stemBonusIds.length, 0)
  for (const mission of campaign) {
    progress = recordStemBonus(progress, mission)
    assert.equal(recordStemBonus(progress, mission), progress)
  }
  writeProgress(progress, storage)
  assert.deepEqual(readProgress(storage), progress)
  assert.deepEqual(earnings(progress, false), { base: 9000, stem: 3000, creative: 0, total: 12000 })
  assert.equal(earnings(progress, true).total, 14000)
  assert.equal(progress.rankMilestone, 6)
  assert.equal(earnedGrowth(14000).name, 'Creative Enterprise')
})

test('a prospective bonus pays at the first delivery and the creative reward does not depend on the campaign', () => {
  const mission = campaign[0]
  const pending = recordStemBonus(emptyProgress(), mission)
  assert.equal(earnings(pending, false).total, 0)
  assert.equal(earnings(recordDelivery(pending, mission, verify(mission)).progress, false).total, 500)
  const storage = { value: null, getItem() { return this.value }, setItem(key, value) { this.value = value } }
  saveDiyStore({ ...emptyDiyStore(), architect: true }, storage)
  assert.deepEqual(earnings(emptyProgress(), readDiyStore(storage).store.architect), { base: 0, stem: 0, creative: 2000, total: 2000 })
})

test('six unique complexes use original route destinations and each contains at least four facilities', () => {
  assert.equal(districts.length, 6)
  assert.equal(new Set(districts.map(district => district.name)).size, 6)
  assert.ok(campaign.every(mission => districtFor(mission).facilities.length >= 4))
  assert.equal(campaign[0].destination, campaign[2].destination)
  assert.notDeepEqual(districtFor(campaign[0]).map, districtFor(campaign[2]).map)
  assert.equal(districtFor(campaign[3]).name, 'Mercy Cay Medical Complex')
})

test('the DIY author can verify the exact reference through quick flight using the approved envelope', () => {
  const config = { name: 'Quick test', cargo: [{ type: 0, mass: 10 }, { type: 1, mass: 10 }], blocked: [6], cg: [440, 460], wind: 0 }
  const mission = makeDiyMission(config)
  const reference = [null, null, 'diy-cargo-1', 'diy-cargo-2', null, null]
  const report = verify(mission, reference)
  assert.equal(authorFlightPassed({ reference, confirmed: true }, mission, report), true)
  assert.equal(mission.payloadLimit, 60)
  assert.deepEqual(mission.targetCg, [4.4, 4.6])
})

test('the five visible ABCD statements use the approved single principal actions', () => {
  assert.deepEqual(learningOutcomes.map(item => item.behaviour.split(' ')[0]), ['Identify', 'Explain', 'Arrange', 'Select', 'Design'])
  assert.ok(learningOutcomes.every(item => item.parts.map(part => part.kind).join('') === 'ABCD'))
})
