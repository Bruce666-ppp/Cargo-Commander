import { advanceFlight, aircraftResponse, flightReport, flightStep, newFlight } from './flight.ts'
import type { FlightReport, FlightRun, FlightSpeed } from './flight.ts'
import { prepareFlightConfiguration } from './mission.ts'
import type { FlightConfiguration, Mission } from './mission.ts'
import { verifiedSolution } from './learning.ts'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const newFlightCoach = () => ({ since: 0, kind: '', lastTip: -Infinity, issued: 0 })

export function liveFlightTip(coach: ReturnType<typeof newFlightCoach>, run: FlightRun, corridor: readonly [number, number], speed: FlightSpeed, input: number) {
  const [low, high] = corridor
  const time = run.ticks * flightStep
  const kind = Math.abs(run.pitch) > 9 ? 'strong' : run.altitude < low - 1 ? 'low' : run.altitude > high + 1 ? 'high' : ''
  if (coach.kind !== kind) { coach.kind = kind; coach.since = time }
  if (!kind || time - coach.since < .85 || time - coach.lastTip < 7) return null
  coach.lastTip = time
  coach.issued++
  if (speed !== 'cruise' && coach.issued % 2 === 0) return 'Switch to Cruise for gentler simulated wind and more time to adjust.'
  if (kind === 'strong') return 'The nose is moving a lot. Release the controls briefly, then try smaller adjustments.'
  if (kind === 'low') return input > 0 ? 'You’re below the green zone. Watch for the aircraft to start climbing.' : 'You’re below the green zone. Gently pitch up.'
  return input < 0 ? 'You’re above the green zone. Watch for the aircraft to start descending.' : 'You’re above the green zone. Gently pitch down.'
}

export function retryFlightTip(report: FlightReport, mission: Mission, attempts: number) {
  const [low, high] = mission.flight.corridor
  const below = report.finalAltitude < low || (report.finalAltitude <= high && report.timeLow > report.timeHigh)
  const direction = below ? 'up' : 'down'
  if (attempts < 2) return report.peakPitch > 9 || report.rapidReversals >= 3
    ? 'Try short presses. Release the controls and watch what happens before pressing again.'
    : `When your aircraft leaves the green zone, gently pitch ${direction} to guide it back.`
  if (report.modesUsed.some(({ speed }) => speed !== 'cruise')) return `Try Cruise on your next flight. When the aircraft drifts ${below ? 'below' : 'above'} the green zone, use one short Pitch ${below ? 'Up' : 'Down'} press, then wait.`
  if (report.rapidReversals >= 3 || report.peakPitch > 9) return 'Try a single short pitch press, then wait for the nose to settle. Repeated changes can make the aircraft swing past the green zone.'
  if (!report.configuration.safety.ready) return 'For your next comparison, put the balance point inside the green zone in Cargo Loading. Fly again in Cruise and compare how it responds.'
  return `When the altitude starts drifting ${below ? 'down' : 'up'}, try a short Pitch ${below ? 'Up' : 'Down'} press before you reach the edge of the green zone. Then release and watch the altitude.`
}

function simulateLesson(mission: Mission, config: FlightConfiguration) {
  const settings = mission.flight
  const run = newFlight(settings)
  const response = aircraftResponse(settings, config)
  const middle = (settings.corridor[0] + settings.corridor[1]) / 2
  let input = 0
  const snapshot = () => ({ time: run.ticks * flightStep, altitude: run.altitude, pitch: run.pitch, fraction: run.routeProgress / settings.duration, input })
  const frames = [snapshot()]
  while (!run.end) {
    // Use short presses of the same three inputs available to the player.
    const sample = run.ticks % 12 === 0
    if (sample) {
      const desiredPitch = clamp((middle - run.altitude) * .22 - run.verticalSpeed * .78, -6, 6)
      const correction = (desiredPitch - run.pitch) * .24 - run.pitchRate * .11 - response.trim / response.up
      input = correction > .27 ? 1 : correction < -.27 ? -1 : 0
    }
    advanceFlight(run, response, settings, flightStep, input)
    if (sample || run.end) frames.push(snapshot())
  }
  return { report: flightReport(run, config, 'practice', settings), frames, configuration: config }
}

export function flightLesson(mission: Mission, requested: FlightConfiguration) {
  if (requested.safety.ready) {
    const lesson = simulateLesson(mission, requested)
    if (lesson.report.passed) return { ...lesson, reason: '' }
  }
  const example = verifiedSolution(mission)
  const configuration = example && prepareFlightConfiguration(mission, example, 'practice')
  if (!configuration) return null
  const lesson = simulateLesson(mission, configuration)
  const reason = requested.safety.ready
    ? 'This lesson uses a checked example load so you can see a complete flight. Your own cargo stays where you left it.'
    : 'Your current balance point is outside the green zone. This lesson uses a checked example load. Your own cargo stays where you left it.'
  return lesson.report.passed ? { ...lesson, reason } : null
}
