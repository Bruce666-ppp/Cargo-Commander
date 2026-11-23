export type Cargo = {
  id: string
  name: string
  mass: number
  icon: 'food' | 'tool' | 'water' | 'crate' | 'medical'
  colour: 'mint' | 'blue' | 'sand'
}

export type FlightMode = 'delivery' | 'practice'

export type FlightSettings = {
  duration: number
  countdown: number
  corridor: readonly [number, number]
  boundary: readonly [number, number]
  initialAltitude: number
  requiredCorridorFraction: number
  maxBoundarySeconds: number
  arrivalSeconds: number
  model: {
    cgSensitivityRange: number
    pitchAuthority: number
    restoring: number
    damping: number
    trimDemand: number
    climbPerDegree: number
    verticalResponse: number
    maxPitch: number
    maxPitchRate: number
    gustStrength: number
  }
}

export type Mission = {
  id: string
  number: string
  title: string
  origin: string
  destination: string
  narrative: string
  objective: string
  learningFocus: string
  cargo: readonly Cargo[]
  aircraft: {
    emptyMass: number
    emptyCg: number
    axis: { datumX: number; unitsPerMetre: number; viewWidth: number; end: number }
  }
  slots: readonly number[]
  payloadLimit: number
  targetCg: readonly [number, number]
  loadingConstraints: { blockedSlots?: readonly number[]; allowedSlotsByCargo?: Readonly<Record<string, readonly number[]>> }
  completionConditions: { requiredCargo: readonly string[] }
  flight: FlightSettings
  mechanic?: string
  hintTimes: readonly [number, number, number, number]
  career: { routeId: string; rankMilestone: number; certificationId: string; nextMissionId?: string }
}

export const islandSupplyRun: Mission = {
  id: 'island-supply-run',
  number: '01',
  title: 'Island Supply Run',
  origin: 'Harbor Base',
  destination: 'Pinehaven Airport',
  narrative: 'Welcome aboard, trainee! The team at Pinehaven Airport is waiting for essential supplies. Your first assignment is to prepare a cargo aircraft for a safe delivery. Load all the required crates and make sure the aircraft is properly balanced before departure.',
  objective: "Load all three supply crates, keep the total payload within the aircraft's capacity, and bring the centre of gravity into the permitted range.",
  learningFocus: 'Observe how a crate’s mass and its position change the aircraft’s balance.',
  cargo: [
    { id: 'food', name: 'Food Supplies', mass: 10, icon: 'food', colour: 'mint' },
    { id: 'equipment', name: 'Maintenance Equipment', mass: 20, icon: 'tool', colour: 'blue' },
    { id: 'water', name: 'Water Supplies', mass: 30, icon: 'water', colour: 'sand' },
  ],
  aircraft: { emptyMass: 100, emptyCg: 4.5, axis: { datumX: 114, unitsPerMetre: 60, viewWidth: 780, end: 9 } },
  slots: [2, 3, 4, 5, 6, 7],
  payloadLimit: 60,
  targetCg: [4.4, 4.6],
  loadingConstraints: {},
  hintTimes: [45, 90, 150, 240],
  completionConditions: { requiredCargo: ['food', 'equipment', 'water'] },
  flight: {
    duration: 30, countdown: 3, corridor: [86, 114], boundary: [54, 146], initialAltitude: 100,
    requiredCorridorFraction: .7, maxBoundarySeconds: 2.4, arrivalSeconds: 4,
    model: { cgSensitivityRange: .58, pitchAuthority: 13, restoring: 1.12, damping: 1.44, trimDemand: 2.1,
      climbPerDegree: .92, verticalResponse: 1.65, maxPitch: 23, maxPitchRate: 28, gustStrength: 1 },
  },
  career: { routeId: 'harbor-base-pinehaven', rankMilestone: 1, certificationId: 'balance-basics', nextMissionId: 'coastal-resupply' },
}

export const campaign: readonly Mission[] = [islandSupplyRun, {
  ...islandSupplyRun,
  id: 'coastal-resupply', number: '02', title: 'Coastal Resupply', destination: 'Sundrift Airport',
  hintTimes: [50, 100, 170, 270],
  narrative: 'The maintenance crew at Sundrift Airport is waiting for a replacement turbine and workshop supplies.',
  objective: 'Deliver the turbine, filters and spare parts within the payload and balance limits.',
  learningFocus: 'Compare the effect of moving the turbine with the effect of moving a lighter crate the same distance.',
  mechanic: 'The 50 kg turbine has a greater effect on the CG than the other crates. Watch the CG marker as you move it.',
  cargo: [
    { id: 'turbine', name: 'Replacement Turbine', mass: 50, icon: 'tool', colour: 'blue' },
    { id: 'filters', name: 'Air Filters', mass: 12, icon: 'food', colour: 'mint' },
    { id: 'spares', name: 'Spare Parts', mass: 8, icon: 'crate', colour: 'sand' },
  ],
  payloadLimit: 72, targetCg: [4.38, 4.58], completionConditions: { requiredCargo: ['turbine', 'filters', 'spares'] },
  career: { routeId: 'harbor-base-sundrift', rankMilestone: 2, certificationId: 'mass-master', nextMissionId: 'inter-island-relay' },
}, {
  ...islandSupplyRun,
  id: 'inter-island-relay', number: '03', title: 'Inter-Island Relay', origin: 'Sundrift Airport',
  hintTimes: [60, 120, 180, 300],
  narrative: 'A maintenance inspection at Sundrift has closed two cargo positions. Pinehaven still needs its relay equipment.',
  objective: 'Balance the relay cargo using the four serviceable slots.',
  learningFocus: 'Plan the distribution of mass when some positions are unavailable.',
  mechanic: 'Slots 2 and 5 are closed for maintenance. Use the four open slots.',
  cargo: [
    { id: 'tools', name: 'Service Tools', mass: 25, icon: 'tool', colour: 'blue' },
    { id: 'instruments', name: 'Radio Instruments', mass: 20, icon: 'crate', colour: 'mint' },
    { id: 'battery', name: 'Relay Battery', mass: 15, icon: 'crate', colour: 'sand' },
  ],
  targetCg: [4.42, 4.65], loadingConstraints: { blockedSlots: [2, 5] }, completionConditions: { requiredCargo: ['tools', 'instruments', 'battery'] },
  career: { routeId: 'sundrift-pinehaven', rankMilestone: 3, certificationId: 'cargo-strategist', nextMissionId: 'emergency-medical-delivery' },
}, {
  ...islandSupplyRun,
  id: 'emergency-medical-delivery', number: '04', title: 'Emergency Medical Delivery', origin: 'Sundrift Airport', destination: 'Mercy Cay Airport',
  hintTimes: [60, 120, 180, 300],
  narrative: 'The clinic on Mercy Cay needs a fresh delivery. The sealed medical case requires the powered fittings in the centre of the hold.',
  objective: 'Load the medical case into a powered slot and balance all three clinic supplies.',
  learningFocus: 'Meet a special cargo requirement while keeping the aircraft safe to fly.',
  mechanic: 'Only slots 3 and 4 have powered fittings for the Medical Case. Cruise is suitable for this delivery.',
  cargo: [
    { id: 'medicine', name: 'Medical Case', mass: 32, icon: 'medical', colour: 'mint' },
    { id: 'coolant', name: 'Coolant Packs', mass: 20, icon: 'water', colour: 'blue' },
    { id: 'clinic', name: 'Clinic Supplies', mass: 16, icon: 'food', colour: 'sand' },
  ],
  payloadLimit: 70, targetCg: [4.47, 4.68], loadingConstraints: { allowedSlotsByCargo: { medicine: [3, 4] } }, completionConditions: { requiredCargo: ['medicine', 'coolant', 'clinic'] },
  career: { routeId: 'sundrift-mercy-cay', rankMilestone: 4, certificationId: 'safety-specialist', nextMissionId: 'flight-through-the-gusts' },
}, {
  ...islandSupplyRun,
  id: 'flight-through-the-gusts', number: '05', title: 'Flight Through the Gusts', origin: 'Mercy Cay Airport', destination: 'Stormwatch Airport',
  hintTimes: [60, 120, 180, 300],
  narrative: 'The crew on mountainous Stormwatch needs weather instruments and shelter supplies. Expect stronger simulated gusts on the approach.',
  objective: 'Deliver the weather supplies and maintain control inside the altitude corridor.',
  learningFocus: 'Observe how a balanced aircraft responds to stronger wind. Make short pitch corrections and watch the response.',
  mechanic: 'Mountain gusts are stronger on this route, even in Cruise. Use short pitch inputs and let the aircraft settle.',
  cargo: [
    { id: 'sensor', name: 'Weather Instruments', mass: 35, icon: 'tool', colour: 'blue' },
    { id: 'shelter', name: 'Shelter Kit', mass: 20, icon: 'crate', colour: 'mint' },
    { id: 'food', name: 'Crew Rations', mass: 15, icon: 'food', colour: 'sand' },
  ],
  payloadLimit: 74, targetCg: [4.49, 4.67], completionConditions: { requiredCargo: ['sensor', 'shelter', 'food'] },
  flight: { ...islandSupplyRun.flight, duration: 32, model: { ...islandSupplyRun.flight.model, gustStrength: 1.55 } },
  career: { routeId: 'mercy-cay-stormwatch', rankMilestone: 5, certificationId: 'flight-controller', nextMissionId: 'operation-windward' },
}, {
  ...islandSupplyRun,
  id: 'operation-windward', number: '06', title: 'Operation Windward', origin: 'Stormwatch Airport', destination: 'Northstar Airport',
  hintTimes: [75, 150, 240, 360],
  narrative: 'Northstar is the final link in the Windward Isles network. Three essential shipments are on the manifest and an optional spare battery is on the apron.',
  objective: 'Deliver the three required crates within the payload, slot and CG limits, then fly safely through the gusts to Northstar.',
  learningFocus: 'Combine mass distribution, engineering constraints and flight control in a single delivery.',
  mechanic: 'Slots 2 and 6 are closed. The Cold-chain Case needs slot 3 or 4. Check the payload before adding the optional battery. Balance your load before flying through the gusts.',
  cargo: [
    { id: 'comms', name: 'Communications Unit', mass: 48, icon: 'tool', colour: 'blue' },
    { id: 'cold', name: 'Cold-chain Case', mass: 30, icon: 'medical', colour: 'mint' },
    { id: 'rations', name: 'Emergency Rations', mass: 14, icon: 'food', colour: 'sand' },
    { id: 'spare', name: 'Spare Battery', mass: 12, icon: 'crate', colour: 'blue' },
  ],
  payloadLimit: 94, targetCg: [4.26, 4.43], loadingConstraints: { blockedSlots: [2, 6], allowedSlotsByCargo: { cold: [3, 4] } },
  completionConditions: { requiredCargo: ['comms', 'cold', 'rations'] },
  flight: { ...islandSupplyRun.flight, duration: 34, requiredCorridorFraction: .75, model: { ...islandSupplyRun.flight.model, gustStrength: 1.65 } },
  career: { routeId: 'stormwatch-northstar', rankMilestone: 6, certificationId: 'cargo-commander' },
}]

export type Hold = readonly (string | null)[]
// Verified examples for future learning support. The loading rules accept every valid arrangement.
export const verifiedLoadingSolutions: Readonly<Record<string, Hold>> = {
  'island-supply-run': [null, null, 'water', 'equipment', 'food', null],
  'coastal-resupply': [null, null, 'turbine', 'filters', 'spares', null],
  'inter-island-relay': ['battery', null, 'tools', null, null, 'instruments'],
  'emergency-medical-delivery': [null, null, 'medicine', 'coolant', 'clinic', null],
  'flight-through-the-gusts': [null, null, 'sensor', 'shelter', 'food', null],
  'operation-windward': ['rations', null, 'cold', 'comms', null, null],
}
type Notice = { text: string; warning?: boolean }
export type LoadingState = { hold: Hold; previous: Hold | null; notice: Notice | null }
type CargoPlan = { next: Hold; origin: number; crate: Cargo } | { error: string }

export function getCargo(mission: Mission, id: string | null) {
  return mission.cargo.find(crate => crate.id === id)
}

export function emptyLoadingState(mission: Mission): LoadingState {
  return { hold: mission.slots.map(() => null), previous: null, notice: null }
}

export function aircraftPercent(mission: Mission, position: number) {
  const { datumX, unitsPerMetre, viewWidth } = mission.aircraft.axis
  return ((datumX + position * unitsPerMetre) / viewWidth) * 100
}

export function calculateCg(emptyMass: number, emptyCg: number, cargoMass: number, cargoMoment: number) {
  return (emptyMass * emptyCg + cargoMoment) / (emptyMass + cargoMass)
}

export function calculateLoad(mission: Mission, hold: Hold) {
  let cargoMass = 0
  let cargoMoment = 0
  hold.forEach((id, slot) => {
    const crate = getCargo(mission, id)
    if (!crate) return
    cargoMass += crate.mass
    cargoMoment += crate.mass * mission.slots[slot]
  })
  const { emptyMass, emptyCg } = mission.aircraft
  return { cargoMass, aircraftMass: emptyMass + cargoMass, cg: calculateCg(emptyMass, emptyCg, cargoMass, cargoMoment) }
}

function cargoFits(mission: Mission, crate: Cargo, slot: number) {
  const allowed = mission.loadingConstraints.allowedSlotsByCargo?.[crate.id]
  return Number.isInteger(slot) && slot >= 0 && slot < mission.slots.length &&
    !mission.loadingConstraints.blockedSlots?.includes(slot + 1) && (!allowed || allowed.includes(slot + 1))
}

export function validatePositions(mission: Mission, hold: Hold) {
  const seen = new Set<string>()
  return hold.length === mission.slots.length && hold.every((id, slot) => {
    if (id === null) return true
    const crate = getCargo(mission, id)
    if (!crate || seen.has(id) || !cargoFits(mission, crate, slot)) return false
    seen.add(id)
    return true
  })
}

export function validatePayload(mission: Mission, cargoMass: number) {
  return cargoMass >= 0 && cargoMass <= mission.payloadLimit
}

export function inspectLoading(mission: Mission, hold: Hold) {
  const load = calculateLoad(mission, hold)
  const required = mission.completionConditions.requiredCargo
  const requiredLoaded = required.filter(id => hold.includes(id)).length
  const requiredCargoOk = requiredLoaded === required.length
  const payloadOk = validatePayload(mission, load.cargoMass)
  const positionsOk = validatePositions(mission, hold)
  const [lower, upper] = mission.targetCg
  const balance: 'forward' | 'balanced' | 'aft' = load.cg < lower ? 'forward' : load.cg > upper ? 'aft' : 'balanced'
  const practiceReady = requiredCargoOk && payloadOk && positionsOk
  const ready = practiceReady && balance === 'balanced'
  return { ...load, requiredLoaded, requiredTotal: required.length, requiredCargoOk, payloadOk, positionsOk, practiceReady, balance, ready }
}

export function formatCgRange(mission: Mission) {
  return `${mission.targetCg[0].toFixed(2)}–${mission.targetCg[1].toFixed(2)} m`
}

export function formatCg(mission: Mission, cg: number) {
  const [lower, upper] = mission.targetCg
  const rounded = cg.toFixed(2)
  if (cg < lower && Number(rounded) >= lower) {
    for (let digits = 3; digits <= 15; digits++) {
      const display = cg.toFixed(digits)
      if (Number(display) < lower) return display
    }
    return String(cg)
  }
  if (cg > upper && Number(rounded) <= upper) {
    for (let digits = 3; digits <= 15; digits++) {
      const display = cg.toFixed(digits)
      if (Number(display) > upper) return display
    }
    return String(cg)
  }
  return rounded
}

export function planCargoMove(mission: Mission, hold: Hold, cargoId: string, destination: number | null): CargoPlan {
  const crate = getCargo(mission, cargoId)
  if (!crate) return { error: 'Choose a cargo item from this mission.' }
  const origin = hold.indexOf(cargoId)
  if (origin === destination || (origin === -1 && destination === null)) return { next: hold, origin, crate }

  const next = [...hold]
  if (destination === null) {
    next[origin] = null
  } else {
    if (!Number.isInteger(destination) || destination < 0 || destination >= hold.length) return { error: 'Drop the crate into an aircraft slot or return it to the inventory.' }
    if (mission.loadingConstraints.blockedSlots?.includes(destination + 1)) return { error: `Slot ${destination + 1} is closed for maintenance.` }
    if (!cargoFits(mission, crate, destination)) return { error: `${crate.name} cannot use slot ${destination + 1}. Choose a highlighted slot.` }
    const displaced = getCargo(mission, hold[destination])
    if (displaced && origin === -1) return { error: `Slot ${destination + 1} already holds ${displaced.name}. Choose an empty slot or return that crate to the inventory.` }
    if (displaced && !cargoFits(mission, displaced, origin)) return { error: `Those crates cannot swap because ${displaced.name} cannot use slot ${origin + 1}.` }
    if (origin !== -1) next[origin] = hold[destination]
    next[destination] = cargoId
  }
  if (!validatePositions(mission, next)) return { error: 'Use one permitted slot for each crate.' }
  if (!validatePayload(mission, calculateLoad(mission, next).cargoMass)) return { error: `This placement exceeds the ${mission.payloadLimit} kg payload limit. Return some cargo before adding this crate.` }
  return { next, origin, crate }
}

function describeCgChange(mission: Mission, before: number, after: number) {
  const change = after - before
  const values = `${formatCg(mission, before)} m → ${formatCg(mission, after)} m.`
  if (Math.abs(change) < 0.005 || before.toFixed(2) === after.toFixed(2)) return `CG ${values} The centre of gravity remained almost unchanged.`
  return `CG ${values} It moved ${Math.abs(change).toFixed(2)} m towards the ${change < 0 ? 'nose' : 'tail'}.`
}

export function moveCargo(mission: Mission, state: LoadingState, cargoId: string, destination: number | null): LoadingState {
  const move = planCargoMove(mission, state.hold, cargoId, destination)
  if ('error' in move) return { ...state, notice: { warning: true, text: move.error } }
  if (move.next === state.hold) return state

  const { crate, origin, next } = move
  const label = `${crate.name} (${crate.mass} kg)`
  let action: string
  if (destination === null) {
    action = `Returned ${label} from slot ${origin + 1} to the inventory.`
  } else if (origin === -1) {
    action = `Loaded ${label} into slot ${destination + 1} at ${mission.slots[destination].toFixed(2)} m.`
  } else {
    const direction = mission.slots[destination] > mission.slots[origin] ? 'tail' : 'nose'
    const swapped = getCargo(mission, state.hold[destination])
    action = `Moved ${label} towards the ${direction}, from slot ${origin + 1} to slot ${destination + 1}.`
    if (swapped) action += ` Swapped with ${swapped.name} (${swapped.mass} kg).`
  }
  const change = describeCgChange(mission, calculateLoad(mission, state.hold).cg, calculateLoad(mission, next).cg)
  return { hold: next, previous: state.hold, notice: { text: `${action} ${change}` } }
}

export function undoCargoMove(mission: Mission, state: LoadingState): LoadingState {
  if (!state.previous) return state
  const change = describeCgChange(mission, calculateLoad(mission, state.hold).cg, calculateLoad(mission, state.previous).cg)
  return { hold: state.previous, previous: null, notice: { text: `Last cargo movement undone. ${change}` } }
}

export function prepareFlightConfiguration(mission: Mission, hold: Hold, mode: FlightMode = 'delivery') {
  const safety = inspectLoading(mission, hold)
  if (!(mode === 'delivery' ? safety.ready : safety.practiceReady)) return null
  return {
    missionId: mission.id,
    cargoArrangement: mission.slots.map((position, index) => ({ slot: index + 1, position, cargo: getCargo(mission, hold[index]) ?? null })),
    totalCargoMass: safety.cargoMass,
    totalAircraftMass: safety.aircraftMass,
    cg: safety.cg,
    targetCgRange: mission.targetCg,
    safety,
  }
}

export type FlightConfiguration = NonNullable<ReturnType<typeof prepareFlightConfiguration>>

export function flightConfigurationAllowed(mission: Mission, configuration: FlightConfiguration, mode: FlightMode) {
  if (configuration.missionId !== mission.id || configuration.cargoArrangement.length !== mission.slots.length) return false
  const expected = prepareFlightConfiguration(mission, configuration.cargoArrangement.map(slot => slot.cargo?.id ?? null), mode)
  if (!expected) return false
  return expected.cg === configuration.cg && expected.totalCargoMass === configuration.totalCargoMass &&
    expected.totalAircraftMass === configuration.totalAircraftMass &&
    expected.targetCgRange.every((value, index) => value === configuration.targetCgRange[index]) &&
    expected.safety.ready === configuration.safety.ready && expected.safety.balance === configuration.safety.balance &&
    expected.cargoArrangement.every((slot, index) => {
      const actual = configuration.cargoArrangement[index]
      return slot.slot === actual.slot && slot.position === actual.position && slot.cargo?.mass === actual.cargo?.mass
    })
}
