import { inside, passedFlightChallenge } from './flight.ts'
import type { FlightReport } from './flight.ts'
import { campaign, flightConfigurationAllowed } from './mission.ts'
import type { Mission } from './mission.ts'

export const ranks = ['Trainee Loadmaster', 'Junior Loadmaster', 'Cargo Specialist', 'Certified Loadmaster', 'Flight Operations Specialist', 'Senior Loadmaster', 'Cargo Commander']

export const certifications = [
  { id: 'balance-basics', icon: 'scale', title: 'Balance Basics', competency: 'Apply centre-of-gravity and payload checks to a delivery.', topic: 'Centre of gravity and mass distribution' },
  { id: 'mass-master', icon: 'crate', title: 'Mass Master', competency: 'Explain how different masses and positions change balance.', topic: 'Centre of gravity and mass distribution' },
  { id: 'cargo-strategist', icon: 'puzzle', title: 'Cargo Strategist', competency: 'Plan a balanced load when some cargo slots are closed.', topic: 'Centre of gravity and mass distribution' },
  { id: 'safety-specialist', icon: 'rank', title: 'Safety Specialist', competency: 'Secure special cargo in approved positions and pass all safety checks.', topic: 'Centre of gravity and mass distribution' },
  { id: 'flight-controller', icon: 'plane', title: 'Flight Controller', competency: 'Use short pitch corrections to maintain altitude through stronger gusts.', topic: 'Aircraft stability and flight control' },
  { id: 'cargo-commander', icon: 'wings', title: 'Cargo Commander', competency: 'Combine cargo planning, loading constraints and flight control in one delivery.', topic: 'Mass distribution, aircraft stability and flight control' },
] as const

export type SavedFlight = {
  cg: number
  cargoMass: number
  aircraftMass: number
  elapsed: number
  routeProgress?: number
  corridorFraction: number
  finalAltitude: number
  peakPitch: number
}

export type CareerProgress = {
  version: 2
  completedMissionIds: string[]
  certificationIds: string[]
  rankMilestone: number
  routeIds: string[]
  unlockedMissionIds: string[]
  bestFlights: Record<string, SavedFlight>
  stemBonusIds: string[]
}

const progressKey = 'cargo-commander.career'

export function resetSavedProgress(storage?: Pick<Storage, 'removeItem'>) {
  try {
    const records = storage ?? window.localStorage
    records.removeItem(progressKey)
    return true
  } catch {
    return false
  }
}

function fromFlights(bestFlights: Record<string, SavedFlight>, stemBonusIds: string[] = []): CareerProgress {
  const completed = campaign.filter(mission => Object.hasOwn(bestFlights, mission.id))
  return {
    version: 2, bestFlights, stemBonusIds, completedMissionIds: completed.map(mission => mission.id),
    rankMilestone: Math.max(0, ...completed.map(mission => mission.career.rankMilestone)),
    certificationIds: [...new Set(completed.map(mission => mission.career.certificationId))],
    routeIds: [...new Set(completed.map(mission => mission.career.routeId))],
    unlockedMissionIds: completed.flatMap(mission => mission.career.nextMissionId ? [mission.career.nextMissionId] : []),
  }
}

export function emptyProgress() { return fromFlights({}) }

export function establishedRoutes(progress: CareerProgress) {
  return campaign.filter(mission => progress.routeIds.includes(mission.career.routeId))
}

export function isMissionUnlocked(progress: CareerProgress, mission: Mission) {
  return mission.id === campaign[0].id || progress.unlockedMissionIds.includes(mission.id)
}

export function nextAvailableMission(progress: CareerProgress) {
  return campaign.find(mission => isMissionUnlocked(progress, mission) && !progress.completedMissionIds.includes(mission.id))
}

export function connectedAirports(progress: CareerProgress) {
  return new Set(establishedRoutes(progress).flatMap(mission => [mission.origin, mission.destination]))
}

export function discoveredAirports(progress: CareerProgress) {
  const airports = connectedAirports(progress)
  const available = nextAvailableMission(progress)
  if (available) { airports.add(available.origin); airports.add(available.destination) }
  return airports
}

export type MapDiscovery = { routeId: string; airport?: string; title: string; detail: string }

export function deliveryDiscovery(mission: Mission, before: CareerProgress, after: CareerProgress): MapDiscovery {
  const known = discoveredAirports(before)
  const airport = [...discoveredAirports(after)].find(name => !known.has(name))
  const next = nextAvailableMission(after)
  const routeId = mission.career.routeId
  if (airport) return { routeId, airport, title: 'New Destination Discovered', detail: `${airport} · ${next?.title ?? ''}` }
  if (next) return { routeId, title: 'New Route Discovered', detail: `${next.origin} → ${next.destination} · ${next.title}` }
  return { routeId, title: 'Network Established', detail: 'All six airports are connected.' }
}

export function networkSummary(progress: CareerProgress) {
  return {
    routes: progress.routeIds.length,
    airports: connectedAirports(progress).size,
    deliveries: progress.completedMissionIds.length,
  }
}

export function recordDelivery(progress: CareerProgress, requested: Mission, report: FlightReport) {
  const mission = campaign.find(entry => entry.id === requested.id)
  if (!mission || !isMissionUnlocked(progress, mission) || report.mode !== 'delivery' || !report.passed || !passedFlightChallenge(mission.flight, report) ||
      !flightConfigurationAllowed(mission, report.configuration, 'delivery')) return { progress, accepted: false, firstDelivery: false }

  const previous = progress.bestFlights[mission.id]
  if (previous && previous.corridorFraction >= report.corridorFraction) return { progress, accepted: true, firstDelivery: false }
  const { cg, totalCargoMass, totalAircraftMass } = report.configuration
  const bestFlights = {
    ...progress.bestFlights,
    [mission.id]: { cg, cargoMass: totalCargoMass, aircraftMass: totalAircraftMass, elapsed: report.elapsed, routeProgress: report.routeProgress, corridorFraction: report.corridorFraction, finalAltitude: report.finalAltitude, peakPitch: report.peakPitch },
  }
  return { progress: fromFlights(bestFlights, progress.stemBonusIds), accepted: true, firstDelivery: previous === undefined }
}

export function recordStemBonus(progress: CareerProgress, mission: Mission) {
  if (!campaign.some(entry => entry.id === mission.id) || !isMissionUnlocked(progress, mission) || progress.stemBonusIds.includes(mission.id)) return progress
  return { ...progress, stemBonusIds: [...progress.stemBonusIds, mission.id] }
}

function savedFlightValid(value: unknown, mission: Mission): value is SavedFlight {
  if (!value || typeof value !== 'object') return false
  const flight = value as SavedFlight
  const requiredMass = mission.cargo.filter(crate => mission.completionConditions.requiredCargo.includes(crate.id)).reduce((sum, crate) => sum + crate.mass, 0)
  return [flight.cg, flight.cargoMass, flight.aircraftMass, flight.elapsed, flight.corridorFraction, flight.finalAltitude, flight.peakPitch].every(Number.isFinite) &&
    inside(flight.cg, mission.targetCg) && flight.cargoMass >= requiredMass && flight.cargoMass <= mission.payloadLimit &&
    flight.aircraftMass === mission.aircraft.emptyMass + flight.cargoMass && flight.peakPitch >= 0 &&
    (flight.routeProgress === undefined || Number.isFinite(flight.routeProgress)) &&
    passedFlightChallenge(mission.flight, { ...flight, routeProgress: flight.routeProgress ?? flight.elapsed, end: 'destination' })
}

export function readProgress(storage?: Pick<Storage, 'getItem'>) {
  try {
    const saved = JSON.parse((storage ?? window.localStorage).getItem(progressKey) ?? 'null')
    if ((saved?.version === 1 || saved?.version === 2) && saved.bestFlights && typeof saved.bestFlights === 'object') {
      const flights: Record<string, SavedFlight> = {}
      for (const mission of campaign) {
        const flight: unknown = saved.bestFlights[mission.id]
        if (!savedFlightValid(flight, mission)) break
        flights[mission.id] = flight
      }
      const progress = fromFlights(flights)
      const bonus: unknown = saved.version === 2 ? saved.stemBonusIds : null
      if (Array.isArray(bonus)) progress.stemBonusIds = campaign.filter(mission => bonus.includes(mission.id) && isMissionUnlocked(progress, mission)).map(mission => mission.id)
      return progress
    }
  } catch { /* An unavailable or malformed local save can be ignored. */ }
  return emptyProgress()
}

export function writeProgress(progress: CareerProgress, storage?: Pick<Storage, 'setItem'>) {
  try {
    (storage ?? window.localStorage).setItem(progressKey, JSON.stringify(progress))
    return true
  } catch { return false }
}
