import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { spotlightLayout, spotlightPath } from '../src/spotlight.ts'

const card = { width: 310, height: 140 }
const desktop = { width: 1200, height: 760 }

test('the instruction card chooses a clear position and points towards a small control', () => {
  const layout = spotlightLayout({ left: 1030, top: 511, width: 126, height: 44 }, card, desktop)
  assert.equal(layout.side, 'below')
  assert.ok(layout.card.top > layout.hole.top + layout.hole.height)
  assert.ok(layout.card.left + layout.card.width <= desktop.width)
  assert.ok(layout.arrow > 0 && layout.arrow < card.width)
  assert.match(spotlightPath(desktop, layout.hole), /^M0 0H1200V760H0Z M/)
})

test('partly visible targets are clipped and a narrow tall workspace has room above a docked card', () => {
  const phone = { width: 375, height: 650 }
  const layout = spotlightLayout({ left: -5, top: 67, width: 380, height: 870 }, card, phone)
  assert.equal(layout.side, 'dock')
  assert.equal(layout.hole.left, 0)
  assert.equal(layout.hole.width, phone.width)
  assert.ok(layout.hole.top + layout.hole.height < layout.card.top)
  assert.ok(layout.card.top + layout.card.height < phone.height)
})

test('an absent or out-of-view target leaves no clickable gap in the shade', () => {
  assert.equal(spotlightLayout(null, card, desktop).hole, null)
  assert.equal(spotlightLayout({ left: 10, top: 900, width: 220, height: 60 }, card, desktop).hole, null)
  assert.equal(spotlightPath(desktop, null), 'M0 0H1200V760H0Z')
})
