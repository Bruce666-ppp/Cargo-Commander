import { calculateLoad, emptyLoadingState, getCargo, inspectLoading, planCargoMove, verifiedLoadingSolutions } from './mission.ts'
import type { Hold, Mission } from './mission.ts'

export type Experience = 'beginner' | 'experienced'
export const experienceKey = 'cargo-commander.experience'
export const mechanicNoteKey = (mission: Mission) => `cargo-commander.mechanic.${mission.id}`

export function readExperience(storage?: Pick<Storage, 'getItem'>): Experience | null {
  try {
    const value = (storage ?? window.localStorage).getItem(experienceKey)
    return value === 'beginner' || value === 'experienced' ? value : null
  } catch { return null }
}

export function saveExperience(value: Experience, storage?: Pick<Storage, 'setItem'>) {
  try { (storage ?? window.localStorage).setItem(experienceKey, value) } catch { /* Play can continue for this session. */ }
}

export type HintLevel = 0 | 1 | 2 | 3
export type HintClock = { elapsed: number; deferUntil: number; level: HintLevel; offer: 'pending' | 'visible' | 'seen' }
export const newHintClock = (): HintClock => ({ elapsed: 0, deferUntil: 0, level: 0, offer: 'pending' })
export const requestHint = (clock: HintClock) => { clock.level = nextLevel(clock.level) }
const nextLevel = (level: HintLevel): HintLevel => level === 0 ? 1 : level === 1 ? 2 : 3

export function advanceHintClock(clock: HintClock, seconds: number, times: Mission['hintTimes'], active: boolean) {
  if (!active) return false
  clock.elapsed += Math.max(0, seconds)
  const reached = (threshold: number) => clock.elapsed >= Math.max(threshold, Math.min(threshold + 12, clock.deferUntil))
  const previous = clock.level
  while (clock.level < 3 && reached(times[clock.level])) requestHint(clock)
  if (clock.offer === 'pending' && reached(times[3])) {
    clock.offer = 'visible'
    return true
  }
  return previous !== clock.level
}

export function noteCargoProgress(clock: HintClock, mission: Mission, before: Hold, after: Hold) {
  const earlier = inspectLoading(mission, before)
  const current = inspectLoading(mission, after)
  const [min, max] = mission.targetCg
  const gap = (cg: number) => Math.max(0, min - cg, cg - max)
  if (current.requiredLoaded > earlier.requiredLoaded || gap(earlier.cg) - gap(current.cg) >= .025) {
    clock.deferUntil = clock.elapsed + 8
  }
}

export function verifiedSolution(mission: Mission): Hold | null {
  const stored = verifiedLoadingSolutions[mission.id]
  if (stored && inspectLoading(mission, stored).ready) return stored
  const required = mission.completionConditions.requiredCargo
  const optional = mission.cargo.filter(crate => !required.includes(crate.id)).map(crate => crate.id)
  const available = [...required, ...optional]
  const search = (hold: Hold, index: number): Hold | null => {
    if (index === available.length) return inspectLoading(mission, hold).ready ? hold : null
    if (index >= required.length) {
      const skipped = search(hold, index + 1)
      if (skipped) return skipped
    }
    for (let slot = 0; slot < hold.length; slot++) {
      const move = planCargoMove(mission, hold, available[index], slot)
      if ('error' in move) continue
      const result = search(move.next, index + 1)
      if (result) return result
    }
    return null
  }
  return search(emptyLoadingState(mission).hold, 0)
}

export type SuggestedMove = { id: string; destination: number | null; next: Hold }

export function nextCargoMove(mission: Mission, hold: Hold): SuggestedMove | null {
  if (inspectLoading(mission, hold).ready) return null
  const example = verifiedSolution(mission)
  if (!example) return null
  const visited = new Set([JSON.stringify(hold)])
  const queue: { hold: Hold; first: SuggestedMove | null }[] = [{ hold, first: null }]
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index]
    for (const crate of mission.cargo) {
      const preferred = example.indexOf(crate.id)
      const destinations = [...new Set([preferred === -1 ? null : preferred, ...mission.slots.map((_, slot) => slot), null])]
      for (const destination of destinations) {
        const move = planCargoMove(mission, state.hold, crate.id, destination)
        if ('error' in move || move.next === state.hold) continue
        const key = JSON.stringify(move.next)
        if (visited.has(key)) continue
        visited.add(key)
        const first = state.first ?? { id: crate.id, destination, next: move.next }
        if (inspectLoading(mission, move.next).ready) return first
        queue.push({ hold: move.next, first })
      }
    }
  }
  return null
}

export function placementRule(mission: Mission, id: string) {
  const slots = mission.loadingConstraints.allowedSlotsByCargo?.[id]
  return slots ? `${getCargo(mission, id)?.name} uses ${slots.length === 1 ? 'slot' : 'slots'} ${slots.join(' or ')}.` : ''
}

export function hintStrategy(mission: Mission, hold: Hold, warning?: string) {
  const check = inspectLoading(mission, hold)
  if (check.ready) return 'Your load is ready. The balance point is in the green zone and the other checks have passed.'
  if (!check.payloadOk || warning?.includes('exceeds')) return `Keep the load at or below ${mission.payloadLimit} kg. Return an optional crate if it leaves too little room for the required cargo.`
  if (!check.positionsOk || warning?.includes('closed') || warning?.includes('cannot use')) {
    const cargoRules = Object.keys(mission.loadingConstraints.allowedSlotsByCargo ?? {}).map(id => placementRule(mission, id))
    const closed = mission.loadingConstraints.blockedSlots
    const rules = [...(closed?.length ? [`Leave slots ${closed.join(' and ')} empty for maintenance.`] : []), ...cargoRules]
    if (rules.length) return rules.join(' ')
  }
  if (!check.requiredCargoOk) {
    const remaining = mission.completionConditions.requiredCargo.filter(id => !hold.includes(id))
    return remaining.map(id => placementRule(mission, id)).filter(Boolean).join(' ') || 'Bring aboard the remaining required cargo. Check the balance point after each crate joins the load.'
  }
  return check.balance === 'forward'
    ? 'The balance point is too close to the nose. Try moving some cargo towards the tail.'
    : 'The balance point is too close to the tail. Try moving some cargo towards the nose.'
}

export function describeMove(mission: Mission, hold: Hold, move: SuggestedMove) {
  const name = getCargo(mission, move.id)?.name
  const destination = move.destination
  if (destination === null) return `Return ${name} to the inventory to make room for another move.`
  const displaced = getCargo(mission, hold[destination])
  return displaced ? `Swap ${name} with ${displaced.name} in slot ${destination + 1}.` : `Place ${name} in slot ${destination + 1}.`
}

export function workedSolution(mission: Mission) {
  const answer = verifiedSolution(mission)
  if (!answer) return null
  let hold = emptyLoadingState(mission).hold
  const steps: { hold: Hold; before: Hold; cargo: string | null; slot: number | null }[] = [{ hold, before: hold, cargo: null, slot: null }]
  for (const [slot, id] of answer.entries()) {
    if (id === null) continue
    const move = planCargoMove(mission, hold, id, slot)
    if ('error' in move) return null
    steps.push({ hold: move.next, before: hold, cargo: id, slot })
    hold = move.next
  }
  return steps
}

export type CargoComparison = { before: number; after: number; payload: number; distance: number }

export function recordComparison(mission: Mission, before: Hold, after: Hold, id: string): CargoComparison | null {
  const from = before.indexOf(id)
  const to = after.indexOf(id)
  if (from === -1 || to === -1 || before[to] !== null) return null
  const distance = Math.abs(mission.slots[to] - mission.slots[from])
  if (distance !== 1 || before.some((cargo, slot) => slot !== from && slot !== to && cargo !== after[slot])) return null
  const initial = calculateLoad(mission, before)
  const final = calculateLoad(mission, after)
  return { before: initial.cg, after: final.cg, payload: final.cargoMass, distance }
}

export function comparisonMove(mission: Mission, hold: Hold, id: string): SuggestedMove | null {
  const from = hold.indexOf(id)
  for (let slot = 0; slot < hold.length; slot++) {
    if (hold[slot] !== null || (from !== -1 && Math.abs(mission.slots[slot] - mission.slots[from]) !== 1)) continue
    const move = planCargoMove(mission, hold, id, slot)
    if (!('error' in move)) return { id, destination: slot, next: move.next }
  }
  // Free a neighbouring slot by moving its crate into an empty one.
  const neighbour = hold.findIndex((crate, slot) => crate !== null && Math.abs(mission.slots[slot] - mission.slots[from]) === 1)
  const other = hold[neighbour]
  if (!other) return null
  for (let slot = 0; slot < hold.length; slot++) {
    if (hold[slot] !== null) continue
    const move = planCargoMove(mission, hold, other, slot)
    if (!('error' in move)) return { id: other, destination: slot, next: move.next }
  }
  return null
}
