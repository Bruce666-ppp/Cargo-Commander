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
import { emptyLoadingState, formatCg, getCargo, inspectLoading, islandSupplyRun, planCargoMove } from './mission'
import type { FlightConfiguration, Hold } from './mission'
import { TutorialSpotlight } from './TutorialSpotlight'
import type { TutorialGuide } from './TutorialSpotlight'

const mission = islandSupplyRun
const trainingFlight = { ...mission, flight: { ...mission.flight, duration: 30, countdown: 2 } }
const flightSteps = ['corridor', 'start', 'up', 'down', 'response', 'pace', 'cruise', 'pause', 'resume', 'finish'] as const
type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7
const target = (id: string) => `[data-tutorial="${id}"]`

function plannedMove(hold: Hold, id: string, destination: number): SuggestedMove | null {
  const result = planCargoMove(mission, hold, id, destination)
  return 'error' in result ? null : { id, destination, next: result.next }
}

function cargoGuide(hold: Hold, move: SuggestedMove, selected: string | null): TutorialGuide {
  const name = getCargo(mission, move.id)?.name
  if (selected !== move.id) return { target: target(`cargo-${move.id}`), title: 'Select the crate', message: `Click the highlighted ${name} crate.` }
  return move.destination === null
    ? { target: target('return-crate'), title: 'Make room in the hold', message: describeMove(mission, hold, move) }
    : {
      target: `[data-cargo-slot="${move.destination}"]`, title: hold.includes(move.id) ? 'Move the crate one slot' : 'Load the crate',
      message: `Now click Slot ${move.destination + 1} to ${hold.includes(move.id) ? 'move' : 'load'} the crate.`,
    }
}

export function TrainingSession({ headingRef, blocked, onExit, onFirstMission, missionCentre }: {
  headingRef: Ref<HTMLHeadingElement>; blocked: boolean; onExit: () => void; onFirstMission: () => void; missionCentre: (start: () => void) => ReactNode
}) {
  const [step, setStep] = useState<Step>(1)
  const [briefing, setBriefing] = useState(false)
  const [loading, setLoading] = useState(() => emptyLoadingState(mission))
  const [selected, setSelected] = useState<string | null>(null)
  const [beforeCg, setBeforeCg] = useState(mission.aircraft.emptyCg)
  const [heavy, setHeavy] = useState<CargoComparison | null>(null)
  const [light, setLight] = useState<CargoComparison | null>(null)
  const [safetyRead, setSafetyRead] = useState(false)
  const [safetyHint, setSafetyHint] = useState(false)
  const [flight, setFlight] = useState<FlightConfiguration | null>(null)
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
    ? !hold.includes('food') ? plannedMove(hold, 'food', 2) : !heavy ? plannedMove(hold, 'water', 1) : plannedMove(hold, 'food', 3)
    : null
  const move = step === 2 ? plannedMove(hold, 'water', 0)
    : comparison ?? (step === 5 && safetyHint && !inspection.ready ? nextCargoMove(mission, hold) : null)

  useEffect(() => { if (step !== 6 || needsRetry) gameAudio.setMusic('planning') }, [step, needsRetry])

  function observeMove(before: Hold, after: Hold, id: string) {
    setSelected(null)
    setBeforeCg(inspectLoading(mission, before).cg)
    if (step === 2 && id === 'water' && after[0] === id) setStep(3)
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
    setLoading(emptyLoadingState(mission))
    setBriefing(false)
    setSelected(null)
    setBeforeCg(mission.aircraft.emptyCg)
    setHeavy(null)
    setLight(null)
    setSafetyRead(false)
    setSafetyHint(false)
    hintClock.current = newHintClock()
    setStep(1)
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
  else if (move) guide = cargoGuide(hold, move, selected)
  else if (step === 3) guide = {
    target: target('balance-point'), title: 'Look at the balance point', message: 'Adding cargo has moved the aircraft’s balance point. The arrow shows which way it moved.',
    read: true, detail: <p className="tutorial-reading"><strong>{formatCg(mission, beforeCg)} m → {formatCg(mission, inspection.cg)} m</strong></p>,
    action: { label: 'Continue', run: () => setStep(4) },
  }
  else if (step === 4) guide = {
    target: target('balance-point'), title: 'Heavy crates move the point farther', message: 'Both crates moved one slot. The same cargo stayed aboard, but the heavier crate shifted the point farther.',
    read: true, detail: compareRead, action: { label: 'Continue to Safety', run: () => setStep(5) },
  }
  else if (step === 5) guide = !safetyRead ? {
    target: target('safety-checklist'), title: 'Check the load before takeoff', message: 'Load all three crates, stay within the weight limit, and put the balance point in the green zone.',
    read: true, action: { label: 'Continue', run: () => setSafetyRead(true) },
  } : inspection.ready ? {
    target: target('practice-flight'), title: 'You’ve passed the safety checks', message: 'Click Practice Flight to try the controls with the load you just balanced.',
  } : {
    target: target('loading-practice'), title: 'Find a safe load', message: 'Load the remaining crate and try moving cargo until the checklist is green.',
    action: { label: 'Show a loading move', run: () => setSafetyHint(true) },
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
      cruise: { target: target('flight-mode'), focus: target('flight-cruise'), title: 'Return to Cruise', message: 'Select Cruise to give yourself more time to steer.' },
      pause: { target: target('flight-pause'), title: 'Pause the flight', message: 'Click Pause when you need time to think.' },
      resume: { target: target('flight-pause'), title: 'Keep flying', message: 'Click Resume to pick up where you left off.' },
      finish: { target: target('flight-view'), title: 'You’re ready to fly', message: 'Use short pitch adjustments to stay inside the green band.', read: true, action: { label: 'Finish Training', run: () => setStep(7) } },
    }
    guide = instructions[flightStep]
  }

  if (step === 7) return <section className="accomplished-banner training-complete">
    <Insignia icon="check" /><h1 ref={headingRef} tabIndex={-1}>Training Complete!</h1>
    <p>You're ready for your first cargo delivery. Keep experimenting, watch your balance, and ask your instructor for help whenever you need it.</p>
    <div className="flight-page-actions"><button className="start-button flight-primary" onClick={onFirstMission}>Start First Mission</button><button className="secondary-button" onClick={onExit}>Return to Mission Centre</button><button className="secondary-button" onClick={replay}>Replay Training</button></div>
  </section>

  return <div className="training-session">
    {step === 1 && (briefing ? <MissionBrief mission={mission} training onAccept={() => setStep(2)} /> : missionCentre(() => setBriefing(true)))}
    {step >= 2 && step <= 5 && <CargoLoading mission={mission} loading={loading} setLoading={setLoading} headingRef={headingRef}
      onBack={askToExit} onBrief={() => {}} onFlight={(_, configuration) => startPractice(configuration)} hintClock={hintClock.current} blocked={blocked}
      training={{ step: step as 2 | 3 | 4 | 5, move, beforeCg, onSelect: setSelected, onPlace: observeMove }} />}
    {step === 6 && flight && (needsRetry
      ? <section className="panel training-retry"><h2>Keep practising</h2><button className="start-button flight-primary" data-tutorial="retry-flight" onClick={() => startPractice(flight)}>Try Practice Again</button></section>
      : <FlightScreen key={runNumber} mission={trainingFlight} configuration={flight} mode="practice" blocked={blocked || confirming}
        headingRef={headingRef} onReturn={() => setStep(5)} onFinish={retryFlight}
        exercise={{ next: readingFlight ? 'read' : recoveringFlight ? 'recover' : flightStep as FlightExerciseAction, observe: advanceFlightGuide, onStatus: setFlightStatus }} />)}
    <TutorialSpotlight step={step} guide={guide} confirming={confirming} onConfirm={askToExit} onStay={stayInTraining} onExit={onExit} />
  </div>
}
