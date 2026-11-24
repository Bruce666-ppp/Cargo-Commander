import { passedFlightChallenge } from './flight.ts'
import type { FlightReport } from './flight.ts'
import { verifiedSolution } from './learning.ts'
import { flightConfigurationAllowed, inspectLoading, islandSupplyRun } from './mission.ts'
import type { Cargo, Hold, Mission } from './mission.ts'

export const diyStorageKey = 'cargo-commander.diy'
export const diyNameLimit = 48
export const diyNoteLimit = 160
export const diyPayloadLimit = islandSupplyRun.payloadLimit
export const diyCgLimits = [440, 460] as const
export const diySlotCount = islandSupplyRun.slots.length
export const diyShareLimit = 1600
export const cargoTypes = [
  ...islandSupplyRun.cargo,
  { name: 'General Supplies', id: 'supplies', mass: 15, icon: 'crate', colour: 'blue' },
  { name: 'Medical Case', id: 'medical', mass: 20, icon: 'medical', colour: 'mint' },
] as const satisfies readonly Cargo[]
export const flightConditions = ['Calm', 'Breeze', 'Strong Winds'] as const
const disturbance = [0, islandSupplyRun.flight.model.gustStrength, 1.65] as const
const maxCrateMass = 50
const maxSavedMissions = 40

export type DiyCargo = { type: number; mass: number }
export type DiyConfig = { name: string; cargo: DiyCargo[]; blocked: number[]; cg: [number, number]; wind: number }
export type DiyDraft = { config: DiyConfig; reference: Hold | null; note: string; confirmed: boolean; validated: boolean }
export type SavedDiy = DiyDraft & { id: string; source: 'created' | 'received' }
export type DiyStore = { version: 1; architect: boolean; missions: SavedDiy[] }

export const defaultDiyConfig = (): DiyConfig => ({
  name: '', cargo: cargoTypes.slice(0, 2).map(({ mass }, type) => ({ type, mass })),
  blocked: [], cg: [...diyCgLimits], wind: 0,
})

export const emptyDiyStore = (): DiyStore => ({ version: 1, architect: false, missions: [] })
export const newDiyDraft = (): DiyDraft => ({
  config: defaultDiyConfig(), reference: null, note: '', confirmed: false, validated: false,
})

function boundedInteger(value: unknown, low: number, high: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= low && value <= high
}

function isText(value: unknown, limit: number, required = false): value is string {
  return typeof value === 'string' && value.length <= limit && (!required || value.trim().length > 0) &&
    Array.from(value).every(character => {
      const code = character.charCodeAt(0)
      return code >= 32 && code !== 127
    })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function configIssue(value: unknown, draft = false): string | null {
  if (!isRecord(value) || !isText(value.name, diyNameLimit, !draft)) return 'Enter a mission name of up to 48 characters.'
  const { cargo, blocked, cg, wind } = value
  if (!Array.isArray(cargo) || cargo.length < 1 || cargo.length > diySlotCount) return 'Choose between one and six cargo items.'
  if (!cargo.every(crate => isRecord(crate) && boundedInteger(crate.type, 0, cargoTypes.length - 1))) return 'Choose a cargo type from the list.'
  if (!cargo.every(crate => boundedInteger(crate.mass, 1, maxCrateMass))) return 'Set each cargo mass to a whole number from 1 to 50 kg.'
  if (!Array.isArray(blocked) || blocked.length >= diySlotCount || new Set(blocked).size !== blocked.length ||
      !blocked.every(slot => boundedInteger(slot, 1, diySlotCount))) return 'Choose valid blocked slots and leave at least one slot open.'
  if (!Array.isArray(cg) || cg.length !== 2 || !cg.every(value => boundedInteger(value, ...diyCgLimits)) || cg[0] >= cg[1]) {
    return 'Choose a lower and upper CG target within 4.40–4.60 m, with the lower value first.'
  }
  if (!boundedInteger(wind, 0, flightConditions.length - 1)) return 'Choose Calm, Breeze or Strong Winds.'
  return null
}

export function makeDiyMission(config: DiyConfig, training = false): Mission {
  const powered: Record<string, number[]> = {}
  const cargo = config.cargo.map(({ type, mass }, index) => {
    const model = cargoTypes[type]
    const id = `diy-cargo-${index + 1}`
    if (model.id === 'medical') powered[id] = [3, 4]
    const duplicate = config.cargo.filter(crate => crate.type === type).length > 1
    const ordinal = config.cargo.slice(0, index + 1).filter(crate => crate.type === type).length
    return { ...model, id, mass, name: duplicate ? `${model.name} ${ordinal}` : model.name }
  })
  const { flight } = islandSupplyRun
  return {
    ...islandSupplyRun,
    id: 'diy-mission', number: 'DIY', title: config.name.trim(),
    origin: 'Training Airfield', destination: 'Practice Airstrip',
    narrative: 'A custom loading and flight challenge using the Cargo Commander educational aircraft.',
    objective: 'Load all the required cargo, pass the safety checks and finish the test flight within its limits.',
    learningFocus: 'Use the loading and flight feedback to try a different arrangement.',
    cargo, targetCg: [config.cg[0] / 100, config.cg[1] / 100],
    loadingConstraints: {
      blockedSlots: config.blocked.length ? config.blocked : undefined,
      allowedSlotsByCargo: Object.keys(powered).length ? powered : undefined,
    },
    completionConditions: { requiredCargo: cargo.map(crate => crate.id) },
    flight: { ...flight, duration: training ? 8 : flight.duration, countdown: training ? 2 : flight.countdown,
      model: { ...flight.model, gustStrength: disturbance[config.wind] } },
    career: { routeId: '', rankMilestone: 0, certificationId: '' },
  }
}

export type DiyCheck = { status: 'invalid' | 'unsolvable'; message: string } | { status: 'solvable'; mission: Mission }

export function checkDiyConfig(config: unknown): DiyCheck {
  const issue = configIssue(config)
  if (issue) return { status: 'invalid', message: issue }
  const data = config as DiyConfig
  const total = data.cargo.reduce((mass, crate) => mass + crate.mass, 0)
  if (total > diyPayloadLimit) return { status: 'invalid', message: 'Your cargo is too heavy for this aircraft. Try reducing the cargo mass.' }
  if (data.cargo.length > diySlotCount - data.blocked.length) {
    return { status: 'invalid', message: 'There are not enough available cargo slots. Open a slot or remove a crate.' }
  }
  const poweredAvailable = [3, 4].filter(slot => !data.blocked.includes(slot)).length
  if (data.cargo.filter(crate => cargoTypes[crate.type].id === 'medical').length > poweredAvailable) {
    return { status: 'unsolvable', message: 'Medical cases need powered slots 3 or 4. Open a powered slot or choose fewer medical cases.' }
  }
  const mission = makeDiyMission(data)
  if (!verifiedSolution(mission)) return { status: 'unsolvable', message: 'No loading arrangement meets all these rules. Try changing the cargo masses, blocked slots or target range.' }
  return { status: 'solvable', mission }
}

export function validReference(mission: Mission, hold: unknown): hold is Hold {
  return Array.isArray(hold) && hold.length === mission.slots.length &&
    hold.every(id => id === null || typeof id === 'string') && inspectLoading(mission, hold).ready
}

function loadKey(config: DiyConfig) {
  return JSON.stringify([config.cargo.map(({ type, mass }) => [type, mass]), [...config.blocked].sort(), config.cg, config.wind])
}

export function changeDiyConfig(draft: DiyDraft, config: DiyConfig): DiyDraft {
  return loadKey(config) === loadKey(draft.config) ? { ...draft, config } :
    { ...draft, config, reference: null, confirmed: false, validated: false }
}

export function setDiyReference(draft: DiyDraft, hold: Hold): DiyDraft {
  const checked = checkDiyConfig(draft.config)
  if (checked.status !== 'solvable' || !validReference(checked.mission, hold)) return draft
  if (draft.reference?.every((id, index) => id === hold[index])) return draft
  return { ...draft, reference: [...hold], confirmed: false, validated: false }
}

export function authorFlightPassed(draft: DiyDraft, mission: Mission, report: FlightReport) {
  return draft.confirmed && !!draft.reference && validReference(mission, draft.reference) &&
    report.mode === 'delivery' && report.passed && passedFlightChallenge(mission.flight, report) &&
    flightConfigurationAllowed(mission, report.configuration, 'delivery') &&
    report.configuration.cargoArrangement.every(({ cargo }, index) => (cargo?.id ?? null) === draft.reference?.[index])
}

export function qualifiesForArchitect(draft: DiyDraft) {
  const checked = checkDiyConfig(draft.config)
  if (!draft.confirmed || !draft.validated || checked.status !== 'solvable' || !validReference(checked.mission, draft.reference)) return false
  const { blocked, cg, cargo } = draft.config
  return blocked.length > 0 || cg[0] !== diyCgLimits[0] || cg[1] !== diyCgLimits[1] ||
    cargo.some(({ type }) => cargoTypes[type].id === 'medical')
}

export function readDiyStore(storage?: Pick<Storage, 'getItem'>): { store: DiyStore; error: string } {
  try {
    const text = (storage ?? window.localStorage).getItem(diyStorageKey)
    if (text === null) return { store: emptyDiyStore(), error: '' }
    const raw: unknown = text.length <= 150000 ? JSON.parse(text) : null
    if (!isRecord(raw) || raw.version !== 1 || typeof raw.architect !== 'boolean' ||
        !Array.isArray(raw.missions) || raw.missions.length > maxSavedMissions) throw Error()
    const missions: SavedDiy[] = []
    const ids = new Set<string>()
    for (const entry of raw.missions) {
      if (!isRecord(entry) || !isText(entry.id, 40, true) || ids.has(entry.id) ||
          (entry.source !== 'created' && entry.source !== 'received') || configIssue(entry.config, !entry.validated) ||
          !isText(entry.note, diyNoteLimit) || typeof entry.confirmed !== 'boolean' || typeof entry.validated !== 'boolean') throw Error()
      const config = entry.config as DiyConfig
      const mission = makeDiyMission(config)
      if ((entry.reference !== null && !validReference(mission, entry.reference)) ||
          (entry.confirmed && entry.reference === null) ||
          (entry.validated && (!entry.confirmed || checkDiyConfig(config).status !== 'solvable')) ||
          (entry.source === 'received' && !entry.validated)) throw Error()
      const { id, source, reference, note, confirmed, validated } = entry
      ids.add(id)
      missions.push({ id, source, config, reference, note, confirmed, validated })
    }
    return { store: { version: 1, architect: raw.architect, missions }, error: '' }
  } catch {
    return { store: emptyDiyStore(), error: 'Saved DIY missions are unavailable. Check that this browser allows local storage and reload to try again.' }
  }
}

export function saveDiyStore(store: DiyStore, storage?: Pick<Storage, 'setItem'>) {
  if (store.missions.length > maxSavedMissions) return 'My Missions can hold 40 missions. Delete one before saving another.'
  try {
    (storage ?? window.localStorage).setItem(diyStorageKey, JSON.stringify(store))
    return ''
  } catch {
    return 'The mission was not saved. Your browser may be out of space or local storage may be unavailable.'
  }
}

export type SharedDiy = DiyDraft & { reference: Hold; confirmed: true; validated: true }

export function encodeDiyMission(draft: DiyDraft) {
  const { config, reference, note } = draft
  const checked = checkDiyConfig(config)
  if (!draft.confirmed || !draft.validated || checked.status !== 'solvable' || !validReference(checked.mission, reference) ||
      !isText(note, diyNoteLimit)) return null
  const token = [1, config.name.trim(), config.cargo.map(({ type, mass }) => [type, mass]),
    config.blocked, config.cg, config.wind, reference.map(id => id === null ? 0 : Number(id.slice('diy-cargo-'.length))), note]
  const bytes = new TextEncoder().encode(JSON.stringify(token))
  const encoded = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  return encoded.length <= diyShareLimit ? encoded : null
}

export function decodeDiyMission(encoded: string): SharedDiy | null {
  if (encoded.length > diyShareLimit || !/^[A-Za-z0-9_-]+$/.test(encoded)) return null
  try {
    const bytes = Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), character => character.charCodeAt(0))
    const data: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    if (!Array.isArray(data) || data.length !== 8 || data[0] !== 1) return null
    const [, name, crates, blocked, cg, wind, slots, note] = data
    if (!Array.isArray(crates) || crates.length > diySlotCount ||
        !crates.every(crate => Array.isArray(crate) && crate.length === 2) ||
        !Array.isArray(slots) || slots.length !== diySlotCount ||
        !slots.every(slot => boundedInteger(slot, 0, crates.length)) || !isText(note, diyNoteLimit)) return null
    const config = { name, cargo: crates.map(([type, mass]) => ({ type, mass })), blocked, cg, wind }
    const reference = slots.map(slot => slot === 0 ? null : `diy-cargo-${slot}`)
    const checked = checkDiyConfig(config)
    if (checked.status !== 'solvable' || !validReference(checked.mission, reference)) return null
    return { config, reference, note, confirmed: true, validated: true }
  } catch {
    return null
  }
}
