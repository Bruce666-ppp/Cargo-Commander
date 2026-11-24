import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CargoAircraft, Icon } from './art'
import { AircraftCg, ExploreMaths, SafetyChecklist } from './LoadingInstruments'
import { FlightDeckDialog } from './MissionDialogs'
import { FlightScene } from './FlightScene'
import { flightLesson } from './flight-learning'
import { advanceHintClock, describeMove, hintStrategy, mechanicNoteKey, nextCargoMove, placementRule, requestHint, workedSolution } from './learning'
import type { Experience, HintClock, SuggestedMove } from './learning'
import { aircraftPercent, formatCg, getCargo, inspectLoading } from './mission'
import type { FlightConfiguration, Hold, Mission } from './mission'

export function LearningDialog({ id, title, children, actions, onClose, label = 'INSTRUCTOR' }: {
  id: string; title: string; children: ReactNode; actions: ReactNode; onClose: () => void; label?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <FlightDeckDialog dialogRef={dialog} id={id} title={title} label={label} onClose={onClose} className="learning-dialog" actions={actions}>{children}</FlightDeckDialog>
}

const Close = () => <form method="dialog"><button className="secondary-button">Close</button></form>

export function ExperienceDialog({ onChoose, onClose }: { onChoose: (experience: Experience) => void; onClose: () => void }) {
  return <LearningDialog id="welcome-title" title="Welcome aboard, Loadmaster!" label="FLIGHT SCHOOL" onClose={onClose} actions={<Close />}>
    <p className="welcome-question">Have you ever loaded and balanced an aircraft before?</p>
    <div className="experience-options">
      <section><span className="panel-icon"><Icon name="book" /></span><h3>I'm a Beginner</h3>
        <p>Place a crate, check the balance and watch your first training delivery.</p>
        <button className="start-button" onClick={() => onChoose('beginner')}>Begin Training</button>
      </section>
      <section><span className="panel-icon"><Icon name="plane" /></span><h3>I'm Experienced</h3>
        <p>Skip basic training and start your delivery missions.</p>
        <button className="secondary-button" onClick={() => onChoose('experienced')}>Enter Mission Centre</button>
      </section>
    </div>
  </LearningDialog>
}

export function useLoadingHelp(clock: HintClock, times: Mission['hintTimes'], enabled: boolean) {
  const [, setRevision] = useState(0)
  const refresh = () => setRevision(revision => revision + 1)
  useEffect(() => {
    if (!enabled) return
    let previous = performance.now()
    let counting = !document.hidden
    function tick() {
      const now = performance.now()
      if (advanceHintClock(clock, (now - previous) / 1000, times, counting)) setRevision(revision => revision + 1)
      previous = now
    }
    function visibility() { tick(); counting = !document.hidden }
    const timer = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', visibility)
      if (counting) clock.elapsed += (performance.now() - previous) / 1000
    }
  }, [clock, times, enabled])
  return {
    level: clock.level, offer: clock.offer === 'visible',
    next: () => { requestHint(clock); refresh() },
    dismiss: () => { clock.offer = 'seen'; refresh() },
  }
}

export function MechanicNote({ mission }: { mission: Mission }) {
  const key = mechanicNoteKey(mission)
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(key) !== 'seen' } catch { return true }
  })
  useEffect(() => {
    if (mission.mechanic) try { localStorage.setItem(key, 'seen') } catch { /* The note can still be dismissed. */ }
  }, [key, mission.mechanic])
  return visible && mission.mechanic ? <section className="lesson-message mechanic-note" aria-label="New loading or flight rule">
    <Icon name="info" /><div><strong>{mission.flight.model.gustStrength > 1 && mission.number === '05' ? 'Flight tip' : 'Instructor tip'}</strong><p>{mission.mechanic}</p></div>
    <button className="secondary-button lesson-small" onClick={() => setVisible(false)}>Dismiss</button>
  </section> : null
}

export function HintMessage({ level, mission, hold, warning, suggestion }: {
  level: 1 | 2 | 3; mission: Mission; hold: Hold; warning?: string; suggestion: SuggestedMove | null
}) {
  const current = inspectLoading(mission, hold)
  const title = ['Understand the balance', 'Choose a strategy', 'Try a move'][level - 1]
  const message = level === 1
    ? 'Both the weight of a crate and its place in the hold affect the aircraft’s balance point.'
    : level === 3 && suggestion ? describeMove(mission, hold, suggestion) : hintStrategy(mission, hold, warning)
  return <section className="lesson-message hint-message" aria-label={`Hint ${level}`}>
    <Icon name="info" /><div><strong>Hint {level} · {title}</strong><p role="status">{message}</p>
      {suggestion && <p className="hint-prediction">Balance point <strong>{formatCg(mission, current.cg)} m → {formatCg(mission, inspectLoading(mission, suggestion.next).cg)} m</strong></p>}
    </div>
  </section>
}

export function useCargoSuggestion(mission: Mission, hold: Hold, enabled: boolean) {
  return useMemo(() => enabled ? nextCargoMove(mission, hold) : null, [mission, hold, enabled])
}

export function WorkedHold({ mission, hold, before, activeSlot, step }: { mission: Mission; hold: Hold; before?: number; activeSlot?: number | null; step?: number }) {
  const position = (arm: number) => aircraftPercent(mission, arm)
  return <div className="demo-hangar hangar-floor">
    <div className="orientation" aria-hidden="true"><span>NOSE</span><span>TAIL</span></div>
    <div className="aircraft-board">
      <CargoAircraft />
      <div className="slot-bay" aria-hidden="true" style={{ left: `${position(mission.slots[0] - .5)}%`, width: `${position(mission.slots.at(-1)! + .5) - position(mission.slots[0] - .5)}%` }} />
      {mission.slots.map((arm, slot) => {
        const cargo = getCargo(mission, hold[slot])
        const closed = mission.loadingConstraints.blockedSlots?.includes(slot + 1)
        const highlighted = activeSlot === slot
        return <span key={highlighted ? `${slot}-${step}` : slot} className={`demo-slot${cargo ? ` cargo-${cargo.colour} filled` : ''}${highlighted ? ' lesson-focus demo-placement' : ''}${closed ? ' closed' : ''}`}
          style={{ left: `${position(arm)}%`, width: `${position(.91) - position(0)}%` }} role="img" aria-label={`Slot ${slot + 1}${cargo ? `, ${cargo.name}, ${cargo.mass} kilograms` : closed ? ', closed for maintenance' : ', empty'}`}>
          {cargo ? <><Icon name={cargo.icon} /><span>{cargo.mass} kg</span></> : closed ? <Icon name="lock" /> : slot + 1}
        </span>
      })}
    </div>
    <AircraftCg mission={mission} inspection={inspectLoading(mission, hold)} before={before} />
  </div>
}

export function WorkedSolution({ mission, reference, note, onClose, onRetry, onSkip }: { mission: Mission; reference?: Hold; note?: string; onClose: () => void; onRetry?: () => void; onSkip?: () => void }) {
  const steps = useMemo(() => workedSolution(mission, reference), [mission, reference])
  const [index, setIndex] = useState(0)
  const step = steps?.[index]
  const crate = getCargo(mission, step?.cargo ?? null)
  const final = steps && index === steps.length - 1
  const current = step && inspectLoading(mission, step.hold)
  const earlier = step && inspectLoading(mission, step.before)
  const status = current?.balance === 'balanced' ? 'Inside the green zone' : current?.balance === 'aft' ? 'Too close to the tail' : 'Too close to the nose'
  return <LearningDialog id="worked-solution-title" title="One way to balance the aircraft" label={mission.title} onClose={onClose}
    actions={<><Close />{onSkip && <button className="secondary-button" onClick={onSkip}>Skip Tutorial</button>}{steps && onRetry && <button className="start-button deck-primary" onClick={onRetry}>Try It Yourself</button>}</>}>
    {!step || !current || !earlier || !steps ? <p>A checked loading example is unavailable for this mission.</p> : <>
      <div className="lesson-step"><strong>Step {index + 1} of {steps.length}</strong><progress max={steps.length} value={index + 1} aria-label="Worked solution progress" /></div>
      <WorkedHold mission={mission} hold={step.hold} before={earlier.cg} activeSlot={step.slot} step={index} />
      <div className="lesson-example" aria-live="polite">
        <div className="lesson-example-values"><span>Before <strong>{formatCg(mission, earlier.cg)} m</strong></span><span aria-hidden="true">→</span><span>After <strong>{formatCg(mission, current.cg)} m</strong></span><strong className={current.balance === 'balanced' ? 'good-balance' : 'check-balance'}>{status}</strong></div>
        {crate && step.slot !== null ? <p><span className={`cargo-symbol cargo-${crate.colour}`}><Icon name={crate.icon} /></span><span><strong>{crate.name} · {crate.mass} kg · Slot {step.slot + 1}</strong><br />{Math.abs(current.cg - earlier.cg) < .005 ? 'The balance point stays almost in the same place.' : `The balance point moves towards the ${current.cg < earlier.cg ? 'nose' : 'tail'}.`} {placementRule(mission, crate.id)}</span></p>
          : <p>The empty aircraft already has a balance point. Choose Next Step to see how the first crate changes it.</p>}
      </div>
      <div className="lesson-navigation"><button className="secondary-button" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous Step</button><button className="secondary-button" disabled={Boolean(final)} onClick={() => setIndex(index + 1)}>Next Step</button><button className="secondary-button" disabled={index === 0} onClick={() => setIndex(0)}>Replay</button></div>
      {final && <div className="solution-final">
        <SafetyChecklist mission={mission} inspection={current} id="worked-safety-heading" />
        <p>{current.requiredLoaded} required crates are aboard. The {current.cargoMass} kg load fits the {mission.payloadLimit} kg limit, and {formatCg(mission, current.cg)} m is inside the green zone.</p>
        {mission.loadingConstraints.blockedSlots && <p>Slots {mission.loadingConstraints.blockedSlots.join(' and ')} stay empty for maintenance.</p>}
        {Object.keys(mission.loadingConstraints.allowedSlotsByCargo ?? {}).map(id => <p key={id}>{placementRule(mission, id)} It is in slot {step.hold.indexOf(id) + 1} here.</p>)}
        <h3>Now Try It Yourself!</h3><p>You've seen one way to solve this challenge. Try arranging the cargo yourself. There may be other correct solutions too.</p>
      </div>}
      <ExploreMaths mission={mission} hold={step.hold} />
      {final && note && <div className="diy-note"><h3>Creator's Note</h3><p>{note}</p></div>}
      {onRetry && <p className="solution-exit-note">Close keeps your cargo where it was. Try It Yourself starts with an empty hold.</p>}
    </>}
  </LearningDialog>
}

export function FlightDemonstration({ mission, configuration, onClose }: { mission: Mission; configuration: FlightConfiguration; onClose: () => void }) {
  const lesson = useMemo(() => flightLesson(mission, configuration), [mission, configuration])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = (lesson?.frames.length ?? 1) - 1
  const frame = lesson?.frames[index]
  useEffect(() => {
    if (!playing || index === last) return
    const timer = window.setTimeout(() => { if (!document.hidden) setIndex(index + 1); else setPlaying(false) }, 180)
    return () => window.clearTimeout(timer)
  }, [playing, index, last])
  function step(change: number) { setPlaying(false); setIndex(current => Math.max(0, Math.min(last, current + change))) }
  const moving = playing && index < last
  const action = frame?.input === 1 ? 'Pitch Up' : frame?.input === -1 ? 'Pitch Down' : 'Release and watch'
  return <LearningDialog id="flight-demo-title" title="Watch a guided flight" onClose={onClose} actions={<Close />}>
    {lesson?.reason && <p>{lesson.reason}</p>}
    {frame ? <>
      <p>Watch the instructor use short presses to stay in the green corridor in Cruise.</p>
      <div className="lesson-step"><strong>{frame.time.toFixed(1)} s · {frame.altitude.toFixed(0)} m</strong><progress max={last} value={index} aria-label="Flight demonstration progress" /></div>
      <FlightScene destination={mission.destination} settings={mission.flight} altitude={frame.altitude} pitch={frame.pitch} fraction={frame.fraction} />
      <div className="lesson-example" aria-live={moving ? 'off' : 'polite'}><strong>{action}</strong><p>{frame.input > 0 ? 'A short pitch-up press helps the aircraft climb.' : frame.input < 0 ? 'A short pitch-down press helps the aircraft descend.' : 'Let the aircraft respond before making another adjustment.'}</p></div>
      <div className="lesson-navigation"><button className="secondary-button" disabled={index === 0} onClick={() => step(-5)}>Previous Moment</button>
        <button className="secondary-button" onClick={() => { if (index === last) setIndex(0); setPlaying(!moving) }}>{moving ? 'Pause Demonstration' : 'Play Demonstration'}</button>
        <button className="secondary-button" disabled={index === last} onClick={() => step(5)}>Next Moment</button></div>
    </> : <><FlightScene destination={mission.destination} settings={mission.flight} altitude={mission.flight.initialAltitude} pitch={0} fraction={0} /><p>Try Cruise and aim for the middle of the green corridor. Use one short pitch press if you drift, then wait for the aircraft to respond.</p></>}
  </LearningDialog>
}
