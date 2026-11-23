import type { FlightConfiguration, FlightMode, FlightSettings } from './mission'

export const flightStep = 1 / 60
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, high))
export const inside = (value: number, [low, high]: readonly [number, number]) => value >= low && value <= high

export const flightSpeeds = {
  cruise: { name: 'Cruise', rate: 1, disturbance: 1, intensity: 'Standard', description: 'Standard flight speed with manageable disturbances.' },
  express: { name: 'Express', rate: 1.5, disturbance: 1.4, intensity: 'Increased', description: 'Faster delivery with increased control challenges.' },
  rush: { name: 'Rush', rate: 2, disturbance: 1.9, intensity: 'Strong', description: 'Maximum delivery speed. Expect stronger simulated disturbances and make careful pitch adjustments.' },
} as const

export type FlightSpeed = keyof typeof flightSpeeds
export const availableSpeeds = Object.keys(flightSpeeds) as FlightSpeed[]

export function remainingFlightTime(settings: FlightSettings, routeProgress: number, speed: FlightSpeed) {
  return Math.max(0, settings.duration - routeProgress) / flightSpeeds[speed].rate
}

export function aircraftResponse(settings: FlightSettings, configuration: FlightConfiguration) {
  const model = settings.model
  const midpoint = (configuration.targetCgRange[0] + configuration.targetCgRange[1]) / 2
  const offset = clamp((configuration.cg - midpoint) / model.cgSensitivityRange, -1, 1)
  const forward = Math.max(0, -offset)
  const aft = Math.max(0, offset)
  return {
    up: model.pitchAuthority * (1 - .38 * forward + .30 * aft),
    down: model.pitchAuthority * (1 + .15 * aft),
    restoring: model.restoring * (1 + .15 * forward - .68 * aft),
    damping: model.damping * (1 + .10 * forward - .48 * aft),
    trim: -model.trimDemand * forward,
    gust: model.gustStrength * (1 + .42 * aft),
  }
}

export type FlightSample = { time: number; altitude: number }
export type RouteEnd = 'destination' | 'boundary'

export function newFlight(settings: FlightSettings) {
  return {
    ticks: 0, accumulator: 0, routeProgress: 0, disturbance: 1, speedTicks: { cruise: 0, express: 0, rush: 0 },
    altitude: settings.initialAltitude, verticalSpeed: 0, pitch: 0, pitchRate: 0,
    inCorridor: 0, boundaryTicks: 0, lowTicks: 0, highTicks: 0, peakPitch: 0, controlTicks: 0,
    lastControl: 0, lastChange: -Infinity, rapidReversals: 0, end: null as RouteEnd | null,
    samples: [{ time: 0, altitude: settings.initialAltitude }] as FlightSample[],
  }
}

export type FlightRun = ReturnType<typeof newFlight>
type AircraftResponse = ReturnType<typeof aircraftResponse>

function step(run: FlightRun, response: AircraftResponse, settings: FlightSettings, input: number, speed: FlightSpeed) {
  const { gustStrength, maxPitch, maxPitchRate, climbPerDegree, verticalResponse } = settings.model
  const mode = flightSpeeds[speed]
  run.disturbance += (mode.disturbance - run.disturbance) * 3.5 * flightStep
  const time = run.ticks * flightStep
  const pulse = Math.max(0, 1 - Math.abs(time - 11) / 5)
  const pitchGust = response.gust * run.disturbance * (1.2 * Math.sin(time * .9) + .52 * Math.sin(time * 2.15) + 2.0 * pulse)
  const control = input * (input >= 0 ? response.up : response.down)
  const pitchAcceleration = control + response.trim + pitchGust - response.restoring * run.pitch - response.damping * run.pitchRate
  run.pitchRate = clamp(run.pitchRate + pitchAcceleration * flightStep, -maxPitchRate, maxPitchRate)
  run.pitch = clamp(run.pitch + run.pitchRate * flightStep, -maxPitch, maxPitch)
  const airMotion = gustStrength * run.disturbance * (1.25 * Math.sin(time * .52) + .95 * pulse)
  const climb = run.pitch * climbPerDegree + airMotion
  run.verticalSpeed += (climb - run.verticalSpeed) * verticalResponse * flightStep
  run.altitude += run.verticalSpeed * flightStep
  run.ticks++
  run.speedTicks[speed]++
  // Route distance is expressed in cruise-equivalent seconds. Physics and checks run on real active time.
  run.routeProgress += mode.rate * flightStep

  run.peakPitch = Math.max(run.peakPitch, Math.abs(run.pitch))
  if (inside(run.altitude, settings.corridor)) run.inCorridor++
  else if (run.altitude < settings.corridor[0]) run.lowTicks++
  else run.highTicks++
  run.boundaryTicks = inside(run.altitude, settings.boundary) ? 0 : run.boundaryTicks + 1

  if (input !== 0) {
    run.controlTicks++
    if (run.lastControl !== input) {
      if (run.lastControl !== 0 && (run.ticks - run.lastChange) * flightStep <= .8) run.rapidReversals++
      run.lastChange = run.ticks
      run.lastControl = input
    }
  }

  if (run.boundaryTicks * flightStep >= settings.maxBoundarySeconds) run.end = 'boundary'
  else if (run.routeProgress >= settings.duration - 1e-8) {
    run.routeProgress = settings.duration
    run.end = 'destination'
  }
  if (run.ticks % 15 === 0 || run.end) run.samples.push({ time: run.ticks * flightStep, altitude: run.altitude })
}

// The accumulator measures active flight time. Rendering can update independently.
export function advanceFlight(run: FlightRun, response: AircraftResponse, settings: FlightSettings, seconds: number, input: number, speed: FlightSpeed = 'cruise') {
  run.accumulator += clamp(seconds, 0, .1)
  while (!run.end && run.accumulator + 1e-9 >= flightStep) {
    step(run, response, settings, clamp(input, -1, 1), speed)
    run.accumulator -= flightStep
  }
}

export type Performance = { end: RouteEnd | null; elapsed: number; routeProgress: number; corridorFraction: number; finalAltitude: number }

export function passedFlightChallenge(settings: FlightSettings, result: Performance) {
  return result.end === 'destination' && Number.isFinite(result.routeProgress) && result.routeProgress >= settings.duration &&
    result.elapsed + 1e-8 >= settings.duration / flightSpeeds.rush.rate && Number.isFinite(result.elapsed) &&
    result.corridorFraction >= settings.requiredCorridorFraction && result.corridorFraction <= 1 && inside(result.finalAltitude, settings.corridor)
}

export function flightReport(run: FlightRun, configuration: FlightConfiguration, mode: FlightMode, settings: FlightSettings) {
  const performance = {
    end: run.end, elapsed: run.ticks * flightStep, routeProgress: run.routeProgress,
    corridorFraction: run.ticks ? run.inCorridor / run.ticks : 0, finalAltitude: run.altitude,
  }
  return {
    ...performance, configuration, mode, passed: passedFlightChallenge(settings, performance),
    timeInCorridor: run.inCorridor * flightStep, timeLow: run.lowTicks * flightStep, timeHigh: run.highTicks * flightStep,
    timeWithInput: run.controlTicks * flightStep, peakPitch: run.peakPitch, rapidReversals: run.rapidReversals,
    modesUsed: availableSpeeds.filter(speed => run.speedTicks[speed] > 0).map(speed => ({ speed, time: run.speedTicks[speed] * flightStep })),
    samples: [...run.samples],
  }
}

export type FlightReport = ReturnType<typeof flightReport>

export const flightCoaching = {
  forward: { label: 'Forward CG', response: 'Greater nose-up demand', forecast: 'Your aircraft requires more nose-up input because its centre of gravity is farther forward.' },
  balanced: { label: 'Within target range', response: 'Predictable response', forecast: 'Your current CG supports a more predictable control response. Make small adjustments to stay within the flight corridor.' },
  aft: { label: 'Aft CG', response: 'Sensitive response', forecast: 'Your aircraft is more sensitive to disturbances. Try making smaller control adjustments.' },
}

export function instructorAssessment(report: FlightReport, settings: FlightSettings) {
  const balance = report.configuration.safety.balance
  const { timeLow, timeHigh, rapidReversals } = report
  const mostlyBelow = timeLow > timeHigh
  let observation = 'You kept the aircraft in the corridor long enough and finished inside it.'
  if (report.end === 'boundary') observation = `The aircraft stayed ${report.finalAltitude < settings.boundary[0] ? 'below' : 'above'} the broader flight boundary for too long.`
  else if (report.corridorFraction < settings.requiredCorridorFraction) observation = `The aircraft spent too much time ${mostlyBelow ? 'below' : 'above'} the target corridor.`
  else if (!inside(report.finalAltitude, settings.corridor)) observation = 'You reached the destination outside the target altitude corridor.'

  let adjustment = 'Use short inputs near the middle of the corridor and release the controls so the model can settle.'
  const largeCorrections = report.peakPitch > 9 || rapidReversals >= 3
  if (!largeCorrections && balance === 'forward' && mostlyBelow) adjustment = 'Try holding Pitch Up a little longer when you need to climb. To compare loads, move a crate towards the tail and check the CG before flying again.'
  if (!largeCorrections && balance === 'aft') adjustment = 'Try smaller inputs and wait for the aircraft to respond. To compare loads, move a crate towards the nose and check the CG before flying again.'
  const control = rapidReversals >= 3 ? 'Several quick changes of control direction were recorded. Leave a short pause between adjustments to see how the aircraft responds.' : ''
  return { observation, model: flightCoaching[balance].forecast, control, adjustment }
}
