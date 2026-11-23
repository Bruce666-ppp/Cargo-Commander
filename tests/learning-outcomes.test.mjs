import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { learningAudience, learningOutcomeIntro, learningOutcomes } from '../src/learningOutcomes.ts'

test('the public documentation repeats the four in-game learning outcomes', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  const design = readFileSync(new URL('../GAME_DESIGN.md', import.meta.url), 'utf8')
  assert.deepEqual(learningOutcomes.map(({ id }) => id), ['LO1', 'LO2', 'LO3', 'LO4'])
  for (const document of [readme, design]) {
    assert.ok(document.includes(learningOutcomeIntro))
    for (const { category, title, statement } of learningOutcomes) {
      for (const field of [category, title, statement]) assert.ok(document.includes(field), field)
    }
  }
  assert.ok(design.includes(learningAudience))
  for (const { behaviour, condition, degree } of learningOutcomes) {
    for (const part of [behaviour, condition, degree]) assert.ok(design.includes(part), part)
  }
})
