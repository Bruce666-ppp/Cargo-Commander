import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { gameAudio } from './audio'
import { CargoLoading } from './CargoLoading'
import { Insignia } from './CareerProfile'
import { FlightScreen } from './FlightScreen'
import type { FlightExerciseAction, FlightStatus } from './FlightScreen'
import { describeMove, newHintClock, nextCargoMove, recordComparison } from './learning'
import type { CargoComparison, SuggestedMove } from './learning'
import { MissionBrief } from './MissionDialogs'
import { campaign, emptyLoadingState, formatCg, getCargo, inspectLoading, islandSupplyRun, planCargoMove, prepareFlightConfiguration, verifiedLoadingSolutions } from './mission'
import type { FlightConfiguration, Hold, Mission } from './mission'
import { TutorialSpotlight } from './TutorialSpotlight'
import type { TutorialGuide } from './TutorialSpotlight'

const flightSteps = ['corridor', 'start', 'up', 'down', 'response', 'pace', 'cruise', 'pause', 'resume', 'finish'] as const
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export const trainingModules = [
  { id: 'cargo', title: 'Cargo Loading', description: 'Select, place, move and return a crate.' },
  { id: 'cg', title: 'Centre of Gravity', description: 'Compare equal-distance moves of a heavy crate and a light crate.' },
  { id: 'safety', title: 'Safety Inspection', description: 'Check the payload, balance, blocked positions and powered slots.' },
  { id: 'flight', title: 'Flight Training', description: 'Practise pitch control, flight modes and pausing.' },
  { id: 'career', title: 'Campaign & Achievements', description: 'Explore routes, ranks and skill certifications.' },
  { id: 'diy', title: 'DIY Mission Studio', description: 'Design, balance and test a temporary challenge.' },
] as const
export type TrainingModule = 'quick' | 'complete' | typeof trainingModules[number]['id']
const startSteps: Record<Exclude<TrainingModule, 'quick'>, Step> = { complete: 1, cargo: 2, cg: 3, safety: 5, flight: 6, career: 7, diy: 8 }
const cargoActions = [0, 1, null] as const
const safetyMission: Mission = { ...campaign[3], loadingConstraints: { ...campaign[3].loadingConstraints, blockedSlots: [1] } }
const trainingFlight: Mission = { ...islandSupplyRun, flight: { ...islandSupplyRun.flight, countdown: 2 } }
const target = (id: string) => `[data-tutorial="${id}"]`

export function TrainingCentre({ headingRef, onSelect, onExit }: { headingRef: Ref<HTMLHeadingElement>; onSelect: (module: TrainingModule) => void; onExit: () => void }) {
  return <>
    <div className="page-heading campaign-heading"><div><h1 ref={headingRef} tabIndex={-1}>Training Centre</h1><p>Practise at your own pace. Exercises use temporary missions.</p></div>
      <button className="secondary-button" onClick={onExit}>Back</button></div>
    <section className="active-mission diy-welcome"><h2>Beginner Training</h2><p>Try one cargo delivery, or explore the full training course at your own pace.</p>
      <div className="diy-actions"><button className="start-button" onClick={() => onSelect('quick')}>Quick Beginner Training</button>
        <button className="secondary-button training-complete-entry" onClick={() => onSelect('complete')}>Complete Training</button></div></section>
    <section className="diy-library"><h2>Individual Training Modules</h2><div className="diy-library-grid">
      {trainingModules.map(({ id, title, description }, index) => <article className="panel diy-card" key={id}>
        <p className="diy-status">Module {String(index + 1).padStart(2, '0')}</p><h3>{title}</h3><p>{description}</p>
        <button className="secondary-button" onClick={() => onSelect(id)}>{title}</button>
      </article>)}</div></section>
  </>
}

function plannedMove(mission: Mission, hold: Hold, id: string, destination: number | null): SuggestedMove | null {
  const result = planCargoMove(mission, hold, id, destination)
  return 'error' in result ? null : { id, destination, next: result.next }
}

function cargoGuide(mission: Mission, hold: Hold, move: SuggestedMove, selected: string | null): TutorialGuide {
  const name = getCargo(mission, move.id)?.name
  if (selected !== move.id) return { target: target(`cargo-${move.id}`), title: 'Select the crate', message: `Click the highlighted ${name} crate.` }
  return move.destination === null
    ? { target: target('return-crate'), title: 'Make room in the hold', message: describeMove(mission, hold, move) }
    : {
      target: `[data-cargo-slot="${move.destination}"]`, title: hold.includes(move.id) ? 'Move the crate one slot' : 'Load the crate',
      message: `Now click Slot ${move.destination + 1} to ${hold.includes(move.id) ? 'move' : 'load'} the crate.`,
    }
}

export function TrainingSession({ module, headingRef, blocked, onExit, onFirstMission, missionCentre, diyTraining }: {
  module: Exclude<TrainingModule, 'quick'>; headingRef: Ref<HTMLHeadingElement>; blocked: boolean; onExit: () => void; onFirstMission: () => void
  missionCentre: (start: () => void) => ReactNode; diyTraining: (finish: () => void) => ReactNode
}) {
  const mission = module === 'safety' ? safetyMission : islandSupplyRun
  const [step, setStep] = useState<Step>(startSteps[module])
  const [cargoStep, setCargoStep] = useState(0)
  const [briefing, setBriefing] = useState(false)
  const initialLoad = () => {
    const empty = emptyLoadingState(mission)
    return module === 'cg' ? { ...empty, hold: ['water', null, null, null, null, null] } : empty
  }
  const initialFlight = () => module === 'flight' ? prepareFlightConfiguration(mission, verifiedLoadingSolutions[mission.id], 'practice') : null
  const [loading, setLoading] = useState(initialLoad)
  const [selected, setSelected] = useState<string | null>(null)
  const [beforeCg, setBeforeCg] = useState(mission.aircraft.emptyCg)
  const [heavy, setHeavy] = useState<CargoComparison | null>(null)
  const [light, setLight] = useState<CargoComparison | null>(null)
  const [safetyRead, setSafetyRead] = useState(false)
  const [safetyHint, setSafetyHint] = useState(false)
  const [flight, setFlight] = useState<FlightConfiguration | null>(initialFlight)
  const [flightIndex, setFlightIndex] = useState(0)
  const [flightStatus, setFlightStatus] = useState<FlightStatus>('briefing')
  const [runNumber, setRunNumber] = useState(0)
  const [needsRetry, setNeedsRetry] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const hintClock = useRef(newHintClock())
  const hold = loading.hold
  const inspection = inspectLoading(mission, hold)
  const flightStep = flightSteps[flightIndex]
  const readingFlight = flightStep === 'corridor' || flightStep === 'response' || flightStep === 'finish'
  const recoveringFlight = flightStatus === 'paused' && flightStep !== 'resume' && !readingFlight
  const comparison = step === 4 && !light
    ? !hold.includes('food') ? plannedMove(mission, hold, 'food', 2) : !heavy ? plannedMove(mission, hold, 'water', 1) : plannedMove(mission, hold, 'food', 3)
    : null
  const move = step === 2 ? plannedMove(mission, hold, 'water', module === 'cargo' ? cargoActions[cargoStep] : 0)
    : comparison ?? (step === 5 && safetyHint && !inspection.ready ? nextCargoMove(mission, hold) : null)

  useEffect(() => { if (step !== 6 || needsRetry) gameAudio.setMusic('planning') }, [step, needsRetry])

  function observeMove(before: Hold, after: Hold, id: string) {
    setSelected(null)
    setBeforeCg(inspectLoading(mission, before).cg)
    if (step === 2 && module === 'cargo' && id === 'water') {
      if (cargoStep === cargoActions.length - 1) setStep(9)
      else setCargoStep(index => index + 1)
    } else if (step === 2 && id === 'water' && after[0] === id) setStep(3)
    if (step === 5 && safetyHint) setSafetyHint(false)
    if (step !== 4 || !before.includes('food')) return
    const result = recordComparison(mission, before, after, id)
    if (!result) return
    if (id === 'water' && !heavy) setHeavy(result)
    if (id === 'food' && heavy && result.payload === heavy.payload) setLight(result)
  }

  const advanceFlightGuide = useCallback((action: typeof flightSteps[number]) => {
    setFlightIndex(index => flightSteps[index] === action && index < flightSteps.length - 1 ? index + 1 : index)
  }, [])
  const retryFlight = useCallback(() => setNeedsRetry(true), [])
  const askToExit = useCallback(() => setConfirming(true), [])
  const stayInTraining = useCallback(() => setConfirming(false), [])

  function startPractice(configuration: FlightConfiguration) {
    setFlight(configuration)
    setFlightIndex(0)
    setFlightStatus('briefing')
    setNeedsRetry(false)
    setRunNumber(number => number + 1)
    setStep(6)
  }

  function replay() {
    setLoading(initialLoad())
    setBriefing(false)
    setSelected(null)
    setBeforeCg(mission.aircraft.emptyCg)
    setHeavy(null)
    setLight(null)
    setSafetyRead(false)
    setSafetyHint(false)
    hintClock.current = newHintClock()
    setCargoStep(0)
    setFlight(initialFlight())
    setFlightIndex(0)
    setFlightStatus('briefing')
    setNeedsRetry(false)
    setStep(startSteps[module])
  }

  const compareRead = heavy && light && <dl className="tutorial-comparison">
    {[{ title: 'Water · 30 kg', move: heavy }, { title: 'Food · 10 kg', move: light }].map(item => <div key={item.title}>
      <dt>{item.title}</dt><dd>{formatCg(mission, item.move.before)} → {formatCg(mission, item.move.after)} m <strong>{Math.abs(item.move.after - item.move.before).toFixed(2)} m shift</strong></dd>
    </div>)}
  </dl>

  let guide: TutorialGuide
  if (step === 1) guide = briefing
    ? { target: target('accept-mission'), title: 'Accept your first delivery', message: 'Bring all three crates aboard and find a place for each one so the aircraft is balanced.' }
    : { target: target('start-mission'), title: 'Your first delivery', message: 'Pinehaven is waiting for supplies. Click Start Mission to see what you’ll carry.' }
  else if (move) guide = cargoGuide(mission, hold, move, selected)
  else if (step === 3) guide = {
    target: target('balance-point'), title: 'Look at the balance point', message: 'Adding cargo has moved the aircraft’s balance point. The arrow shows which way it moved.',
    read: true, detail: <p className="tutorial-reading"><strong>{formatCg(mission, beforeCg)} m → {formatCg(mission, inspection.cg)} m</strong></p>,
    action: { label: 'Continue', run: () => setStep(4) },
  }
  else if (step === 4) guide = {
    target: target('balance-point'), title: 'Heavy crates move the point farther', message: 'Both crates moved one slot. The same cargo stayed aboard, but the heavier crate shifted the point farther.',
    read: true, detail: compareRead, action: { label: module === 'cg' ? 'Finish Balance Module' : 'Continue to Safety', run: () => setStep(module === 'cg' ? 9 : 5) },
  }
  else if (step === 5) guide = !safetyRead ? {
    target: target('safety-checklist'), title: 'Check the load before takeoff', message: 'Load all three crates, stay within the weight limit, and put the balance point in the green zone.',
    read: true,
    detail: module === 'safety' ? <p>Slot 1 is closed for this exercise. The medical case goes in powered slot 3 or 4.</p> : undefined,
    action: { label: 'Continue', run: () => setSafetyRead(true) },
  } : inspection.ready && module === 'safety' ? {
    target: target('safety-checklist'), title: 'All checks passed', message: 'Every crate fits a permitted slot, the payload is allowed and the balance point is in range.',
    read: true, action: { label: 'Finish Safety Inspection', run: () => setStep(9) },
  } : inspection.ready ? {
    target: target('practice-flight'), title: 'You’ve passed the safety checks', message: 'Click Practice Flight to try the controls with the load you just balanced.',
  } : {
    target: target('loading-practice'), title: 'Find a safe load', message: 'Load the remaining crate and try moving cargo until the checklist is green.',
    action: { label: 'Show a loading move', run: () => setSafetyHint(true) },
  }
  else if (step === 7) guide = {
    target: target('campaign-training'), title: 'Routes, ranks and certifications', message: 'Explore the Windward Isles by completing official deliveries. Each opens the next route and earns a skill badge.',
    read: true, action: { label: module === 'career' ? 'Finish Campaign Module' : 'Try DIY Mission Studio', run: () => setStep(module === 'career' ? 9 : 8) },
  }
  else if (needsRetry) guide = {
    target: target('retry-flight'), title: 'Try another practice flight', message: 'Take another short flight and practise the controls. You can retry as often as you like.',
  }
  else if (recoveringFlight) guide = {
    target: target('flight-pause'), title: 'Resume your practice', message: 'Click Resume when you’re ready to keep flying.',
  }
  else {
    const instructions: Record<typeof flightStep, TutorialGuide> = {
      corridor: { target: target('flight-view'), title: 'Aim for the green band', message: 'The green band shows where to fly. We’ll start with small changes to the angle of the nose.', read: true, action: { label: 'Continue', run: () => advanceFlightGuide('corridor') } },
      start: { target: target('start-flight'), title: 'Start your practice flight', message: 'Click Start Flight. The pitch controls will wake up after the countdown.' },
      up: { target: target('flight-controls'), focus: target('pitch-up'), title: 'Gently pitch up', message: 'Hold Pitch Up or press W briefly. This raises the nose.' },
      down: { target: target('flight-controls'), focus: target('pitch-down'), title: 'Gently pitch down', message: 'Hold Pitch Down or press S briefly. This lowers the nose.' },
      response: { target: target('flight-view'), title: 'Watch how the aircraft responds', message: 'The flight is paused while you look. Small presses give the aircraft time to respond.', read: true, action: { label: 'Continue', run: () => advanceFlightGuide('response') } },
      pace: { target: target('flight-mode'), focus: target('flight-express'), title: 'Try Express', message: 'Select Express to shorten the trip. In the game, faster modes also add more simulated wind.' },
      cruise: { target: target('flight-mode'), focus: target('flight-cruise'), title: 'Return to Cruise', message: 'Rush is the fastest mode and brings stronger simulated wind. Select Cruise to give yourself more time to steer.' },
      pause: { target: target('flight-pause'), title: 'Pause the flight', message: 'Click Pause when you need time to think.' },
      resume: { target: target('flight-pause'), title: 'Keep flying', message: 'Click Resume to pick up where you left off.' },
      finish: { target: target('flight-view'), title: 'You’re ready to fly', message: 'Use the altitude feedback to see whether your adjustments kept the aircraft in the green band. Try shorter corrections if it overshoots.', read: true, action: { label: module === 'flight' ? 'Finish Flight Module' : 'Continue to Campaign', run: () => setStep(module === 'flight' ? 9 : 7) } },
    }
    guide = instructions[flightStep]
  }

  if (step === 8) return diyTraining(() => setStep(9))
  if (step === 9) return <section className="accomplished-banner training-complete">
    <Insignia icon="check" /><h1 ref={headingRef} tabIndex={-1}>{module === 'complete' ? 'Training Complete!' : 'Module Complete!'}</h1>
    <p>{module === 'complete' ? "You're ready for your first cargo delivery." : 'You can revisit this exercise at any time.'}</p>
    <div className="flight-page-actions">{module === 'complete' && <button className="start-button flight-primary" onClick={onFirstMission}>Start First Mission</button>}
      <button className="secondary-button" onClick={onExit}>Leave Training</button><button className="secondary-button" onClick={replay}>Replay Training</button></div>
  </section>

  return <div className="training-session">
    {step === 1 && (briefing ? <MissionBrief mission={mission} training onAccept={() => setStep(2)} /> : missionCentre(() => setBriefing(true)))}
    {step >= 2 && step <= 5 && <CargoLoading mission={mission} loading={loading} setLoading={setLoading} headingRef={headingRef}
      onBack={askToExit} onBrief={() => {}} onFlight={(_, configuration) => startPractice(configuration)} hintClock={hintClock.current} blocked={blocked}
      training={{ step: step as 2 | 3 | 4 | 5, move, beforeCg, onSelect: setSelected, onPlace: observeMove }} />}
    {step === 6 && flight && (needsRetry
      ? <section className="panel training-retry"><h2>Keep practising</h2><button className="start-button flight-primary" data-tutorial="retry-flight" onClick={() => startPractice(flight)}>Try Practice Again</button></section>
      : <FlightScreen key={runNumber} mission={trainingFlight} configuration={flight} mode="practice" blocked={blocked || confirming}
        headingRef={headingRef} onReturn={module === 'flight' ? askToExit : () => setStep(5)} onFinish={retryFlight}
        exercise={{ next: readingFlight ? 'read' : recoveringFlight ? 'recover' : flightStep as FlightExerciseAction, observe: advanceFlightGuide, onStatus: setFlightStatus }} />)}
    {step === 7 && <section className="panel diy-card" data-tutorial="campaign-training">
      <h2>Your Windward Isles Career</h2><p>Six official deliveries link the islands and advance you from Trainee Loadmaster to Cargo Commander.</p>
      <p>Each completed official mission earns its own certification. Mission Architect celebrates your own validated DIY design. It is independent of the campaign rank and routes.</p>
    </section>}
    <TutorialSpotlight step={step} stageLabel={trainingModules.find(entry => entry.id === module)?.title}
      guide={guide} confirming={confirming} onConfirm={askToExit} onStay={stayInTraining} onExit={onExit} />
  </div>
}
