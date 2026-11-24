import { simulateFlight } from './flight-learning.ts'
import { recordComparison } from './learning.ts'
import { campaign, inspectLoading, planCargoMove, prepareFlightConfiguration, verifiedLoadingSolutions } from './mission.ts'
import type { Hold, Mission } from './mission.ts'

const challenges = [
  ['Balance Basics', 'Read your current centre of gravity and check whether it is inside the target range.', 'Compare the current CG with both ends of the permitted range before departure.'],
  ['Mass Distribution', 'Compare equal-distance moves of heavy and light cargo with the same total mass aboard.', 'At the same total mass, a heavier crate moves the CG farther when moved the same distance.'],
  ['Engineering Constraints', 'Find a safe arrangement around the closed positions.', 'A blocked slot changes the available solutions. Different arrangements can still pass the same checks.'],
  ['Special Cargo Requirements', 'Keep the aircraft balanced while the medical case uses a powered slot.', 'The medical case needs a powered slot as well as a balanced, legal aircraft load.'],
  ['Aircraft Stability', 'Compare two simulated flights with the same wind, duration, speed and pitch inputs.', 'Changing the load can alter the simulated response even when both loads pass the loading checks.'],
  ['Integrated Engineering Challenge', 'Choose a strategy that meets the cargo, slot, payload, balance and flight requirements together.', 'Check each rule in turn. A load can look balanced and still fail the payload or slot checks.'],
] as const

export function stemChallenge(mission: Mission) {
  const [title, prompt, takeaway] = challenges[campaign.findIndex(entry => entry.id === mission.id)] ??
    ['Creative Application', 'Design an original challenge, solve the load and verify it with the simulator.', 'A valid design needs both a safe reference load and a successful simulated flight.']
  return { title, prompt, takeaway }
}

export const massTrialsStart: Hold = [null, 'turbine', null, 'filters', null, 'spares']
export const trialCrates = [
  { id: 'turbine', destination: 2, name: 'Turbine', mass: 50 },
  { id: 'filters', destination: 4, name: 'Filters', mass: 12 },
] as const

export function massTrial(index: number) {
  const crate = trialCrates[index]
  if (!crate) return null
  const mission = campaign[1]
  const move = planCargoMove(mission, massTrialsStart, crate.id, crate.destination)
  if ('error' in move) return null
  const measurement = recordComparison(mission, massTrialsStart, move.next, crate.id)
  return measurement ? { ...measurement, hold: move.next, shift: Math.abs(measurement.after - measurement.before) } : null
}

export function distinctValidHolds(mission: Mission, first: Hold, second: Hold) {
  return inspectLoading(mission, first).ready && inspectLoading(mission, second).ready &&
    first.some((id, slot) => id !== second[slot])
}

// Both controlled demonstrations use the same one-second nose-down input.
const samePitch = (time: number) => time >= 9.5 && time < 10.5 ? -1 : 0
export function stabilityComparison() {
  const mission = campaign[4]
  const holds: Hold[] = [
    [null, 'sensor', null, 'food', null, 'shelter'],
    ['food', null, null, 'shelter', 'sensor', null],
  ]
  return holds.map(hold => {
    const configuration = prepareFlightConfiguration(mission, hold)
    if (!configuration) throw new Error('The controlled comparison requires a valid load.')
    return simulateFlight(mission, configuration, 'delivery', samePitch)!.report
  })
}

export function integratedStrategies() {
  const mission = campaign[5]
  const legal = verifiedLoadingSolutions[mission.id]
  const extra = [...legal]
  extra[4] = 'spare'
  const power = [...legal]
  ;[power[0], power[2]] = [power[2], power[0]]
  return [
    { label: 'Bring the spare battery as well as the required cargo', hold: extra },
    { label: 'Use a front slot for the Cold-chain Case', hold: power },
    { label: 'Use a powered slot and carry only the required cargo', hold: legal },
  ].map(option => ({ ...option, ...inspectLoading(mission, option.hold) }))
}
