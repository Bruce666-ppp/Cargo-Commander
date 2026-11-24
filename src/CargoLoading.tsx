import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Dispatch, PointerEvent, ReactNode, Ref, SetStateAction } from 'react'
import { CargoAircraft, Icon } from './art'
import { cargoSounds, gameAudio } from './audio'
import { AircraftCg, BalanceKnowledge, InstructorFeedback, SafetyChecklist } from './LoadingInstruments'
import { HintMessage, MechanicNote, WorkedSolution, useCargoSuggestion, useLoadingHelp } from './LearningSupport'
import { TakeoffClearance } from './MissionDialogs'
import { noteCargoProgress } from './learning'
import type { HintClock, SuggestedMove } from './learning'
import { aircraftPercent, emptyLoadingState, formatCgRange, getCargo, inspectLoading, moveCargo, planCargoMove, prepareFlightConfiguration, undoCargoMove } from './mission'
import type { FlightConfiguration, FlightMode, Hold, LoadingState, Mission } from './mission'

type LoadingProps = {
  mission: Mission; loading: LoadingState; setLoading: Dispatch<SetStateAction<LoadingState>>
  headingRef: Ref<HTMLHeadingElement>; onBack: () => void; onBrief: () => void
  onFlight: (mode: FlightMode, configuration: FlightConfiguration) => void
  onQuick?: (configuration: FlightConfiguration) => void
  stem?: ReactNode
  hintClock: HintClock; blocked?: boolean
  custom?: { reference?: Hold; note?: string; onSaveReference?: (hold: Hold) => void }
  training?: { step: 2 | 3 | 4 | 5; move: SuggestedMove | null; beforeCg?: number; onSelect: (id: string | null) => void; onPlace: (before: Hold, after: Hold, id: string) => void }
}
type Destination = number | null | undefined

function dropDestination(event: PointerEvent): Destination {
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-cargo-slot], [data-cargo-tray]')
  if (!target) return undefined
  return target.dataset.cargoSlot === undefined ? null : Number(target.dataset.cargoSlot)
}

export function CargoLoading({ mission, loading, setLoading, headingRef, onBack, onBrief, onFlight, onQuick, stem, hintClock, blocked, training, custom }: LoadingProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number; destination: Destination } | null>(null)
  const dragStart = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const flightDialog = useRef<HTMLDialogElement>(null)
  const [flight, setFlight] = useState<FlightConfiguration | null>(null)
  const [solutionOpen, setSolutionOpen] = useState(false)
  const { hold } = loading
  const authoring = Boolean(custom?.onSaveReference)
  const inspection = inspectLoading(mission, hold)
  const help = useLoadingHelp(hintClock, mission.hintTimes, !authoring && !training && !blocked && !flight && !solutionOpen && !inspection.ready)
  const suggestion = useCargoSuggestion(mission, hold, help.level === 3 && !solutionOpen)
  const targetMove = training ? null : suggestion
  const activeCargo = dragging?.id ?? selected
  const draggedCrate = getCargo(mission, dragging?.id ?? null)
  const position = (arm: number) => aircraftPercent(mission, arm)
  const firstSlot = mission.slots[0]
  const lastSlot = mission.slots[mission.slots.length - 1]

  useEffect(() => { if (inspection.ready && hintClock.offer === 'visible') hintClock.offer = 'seen' }, [inspection.ready, hintClock])

  function applyLoading(next: LoadingState, action: 'place' | 'neutral') {
    if (next === loading) return
    if (next.notice?.warning) gameAudio.play('invalid')
    else {
      if (!training && action === 'place') noteCargoProgress(hintClock, mission, hold, next.hold)
      for (const [cue, delay] of cargoSounds(inspection, inspectLoading(mission, next.hold), action)) gameAudio.play(cue, delay)
    }
    setLoading(next)
  }

  function placeCargo(id: string, destination: number | null) {
    if (training?.move && (training.move.id !== id || training.move.destination !== destination)) return
    const result = moveCargo(mission, loading, id, destination)
    applyLoading(result, 'place')
    if (result.hold !== hold && !result.notice?.warning) training?.onPlace(hold, result.hold, id)
    setSelected(result.notice?.warning ? id : null)
  }

  function selectCargo(id: string | null) {
    if (training?.move && training.move.id !== id) return
    if (id !== null && id !== selected) gameAudio.play('pickup')
    setSelected(id)
    training?.onSelect(id)
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (training && (training.step !== 5 || training.move !== null)) return
    if (!event.isPrimary || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { id, x: event.clientX, y: event.clientY, moved: false }
  }

  function updateDrag(event: PointerEvent) {
    const start = dragStart.current
    if (!start || !event.isPrimary) return
    if (!start.moved) {
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) return
      start.moved = true
      gameAudio.play('pickup')
      setSelected(null)
    }
    setDragging({ id: start.id, x: event.clientX, y: event.clientY, destination: dropDestination(event) })
  }

  function cancelDrag() {
    dragStart.current = null
    setDragging(null)
  }

  function endDrag(event: PointerEvent) {
    const start = dragStart.current
    if (!start || !event.isPrimary) return
    if (start.moved) {
      suppressClick.current = true
      const destination = dropDestination(event)
      if (destination === undefined) {
        gameAudio.play('invalid')
        setLoading(current => ({ ...current, notice: { warning: true, text: 'Drop the crate into a highlighted aircraft slot or return it to the inventory.' } }))
        setSelected(start.id)
      } else {
        placeCargo(start.id, destination)
      }
    }
    cancelDrag()
  }

  function chooseSlot(index: number) {
    if (selected !== null && selected !== hold[index]) placeCargo(selected, index)
    else selectCargo(selected === null ? hold[index] : null)
  }

  function undo() {
    applyLoading(undoCargoMove(mission, loading), 'neutral')
    setSelected(null)
    cancelDrag()
  }

  function reset() {
    applyLoading({ ...emptyLoadingState(mission), notice: { text: 'Arrangement reset. All crates are back in the inventory.' } }, 'neutral')
    setSelected(null)
    cancelDrag()
  }

  function testFlight() {
    const configuration = prepareFlightConfiguration(mission, hold)
    if (!configuration) return
    setFlight(configuration)
    flightDialog.current?.showModal()
    gameAudio.play('clearance')
  }

  function practiceFlight() {
    const configuration = prepareFlightConfiguration(mission, hold, 'practice')
    if (configuration && (!training || (training.step === 5 && configuration.safety.ready))) onFlight('practice', configuration)
  }

  function showSolution() { help.dismiss(); setSolutionOpen(true) }

  return (
    <>
      <div className="page-heading loading-heading">
        <h1 ref={headingRef} tabIndex={-1}>Cargo Loading</h1>
        <button className="secondary-button" onClick={onBack}>Back</button>
      </div>
      <section className="panel active-brief" aria-labelledby="current-mission">
        <span className="panel-icon"><Icon name="pin" /></span>
        <div>
          <p className="active-route">{mission.origin} <span aria-hidden="true">→</span><span className="sr-only"> to </span> {mission.destination}</p>
          <h2 id="current-mission">Mission {mission.number} · {mission.title}</h2>
          <p>{mission.objective}</p>
          <p className="mission-rule">One crate per slot · {mission.payloadLimit} kg payload limit · CG {formatCgRange(mission)}</p>
        </div>
        <div className="loading-help-actions brief-button">
          <button className="secondary-button" aria-haspopup="dialog" onClick={onBrief}><Icon name="book" />Mission Brief</button>
          {!authoring && <><button className={`secondary-button${help.level || help.offer ? ' lesson-hint-button' : ''}`} aria-controls="cargo-hints" onClick={help.next}><Icon name="info" />Hint</button>
          <button className="secondary-button" aria-haspopup="dialog" onClick={showSolution}>Show Solution</button></>}
        </div>
      </section>

      {stem}
      {!training && <MechanicNote mission={mission} />}
      <div id="cargo-hints">
        {help.level !== 0 && <HintMessage level={help.level} mission={mission} hold={hold} warning={loading.notice?.warning ? loading.notice.text : undefined} suggestion={suggestion} />}
        {help.offer && !inspection.ready && <section className="lesson-message solution-offer" aria-label="Solution invitation">
          <Icon name="book" /><div><strong>Need a little more help?</strong><p>Your instructor can show you one possible solution and explain why it works.</p></div>
          <div className="lesson-navigation"><button className="secondary-button lesson-small" onClick={help.dismiss}>Keep Trying</button><button className="secondary-button lesson-small" onClick={showSolution}>Show Solution</button></div>
        </section>}
      </div>

      <div
        className="game-layout loading-layout"
        data-tutorial="loading-practice"
        onPointerDownCapture={() => { suppressClick.current = false }}
        onPointerMove={updateDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        onClickCapture={event => {
          if (suppressClick.current && event.detail > 0) {
            event.stopPropagation()
            suppressClick.current = false
          }
        }}
      >
        <section className="panel hangar" aria-labelledby="hold-heading">
          <div className="panel-heading">
            <span className="panel-icon"><Icon name="plane" /></span><h2 id="hold-heading">Aircraft Hold</h2>
            <span className="heading-meta">{inspection.requiredLoaded} / {inspection.requiredTotal} crates loaded</span>
          </div>
          <div className="hangar-floor">
            <div className="orientation" aria-hidden="true"><span>NOSE</span><span>TAIL</span></div>
            <div className="aircraft-board">
              <CargoAircraft />
              <div className="slot-bay" aria-hidden="true" style={{ left: `${position(firstSlot - .5)}%`, width: `${position(lastSlot + .5) - position(firstSlot - .5)}%` }} />
              {mission.slots.map((arm, index) => {
                const crate = getCargo(mission, hold[index])
                const closed = mission.loadingConstraints.blockedSlots?.includes(index + 1)
                const plan = activeCargo && activeCargo !== crate?.id ? planCargoMove(mission, hold, activeCargo, index) : null
                const error = plan && 'error' in plan ? plan.error : null
                const title = `Slot ${index + 1}, ${arm.toFixed(2)} m from nose datum`
                return <button
                  key={index}
                  type="button"
                  className={`slot${crate ? ` named-crate cargo-${crate.colour}` : ''}${closed ? ' slot-closed' : plan ? error ? ' slot-blocked' : ' slot-eligible' : ''}${dragging?.destination === index ? ' slot-hovered' : ''}${targetMove?.destination === index || (crate && targetMove?.id === crate.id) ? ' lesson-focus' : ''}`}
                  style={{ left: `${position(arm)}%`, '--slot-width': `${position(1) - position(0)}%` } as CSSProperties}
                  title={closed ? `Slot ${index + 1} · Closed for maintenance` : error || title}
                  aria-label={`${title}, ${closed ? 'closed for maintenance' : crate ? `${crate.name}, ${crate.mass} kg` : 'empty'}${error && !closed ? `. ${error}` : ''}`}
                  aria-pressed={crate ? selected === crate.id : undefined}
                  aria-disabled={closed || undefined}
                  data-tutorial={crate ? `cargo-${crate.id}` : undefined}
                  data-cargo-slot={index}
                  data-audio-custom=""
                  onPointerDown={event => { if (crate) startDrag(event, crate.id) }}
                  onClick={() => { if (!closed) chooseSlot(index) }}
                >{closed ? <><Icon name="lock" /><span>{index + 1}</span></> : crate ? <><Icon name={crate.icon} /><span>{crate.mass}<small> kg</small></span></> : index + 1}</button>
              })}
            </div>
            <AircraftCg mission={mission} inspection={inspection} before={training?.beforeCg} />
          </div>
          <div className="hangar-footer">
            <p>Drag a crate or select it, then choose a slot.</p>
            <div className="hold-actions">
              <button className="secondary-button" data-audio-custom="" onClick={undo} disabled={!loading.previous}><Icon name="undo" />Undo</button>
              <button className="secondary-button" data-audio-custom="" onClick={reset}><Icon name="reset" />Reset</button>
            </div>
          </div>
        </section>

        <section className={`panel cargo-tray inventory-panel${dragging?.destination === null ? ' receiving' : ''}`} aria-labelledby="tray-heading" data-cargo-tray>
          <div className="loading-panel-heading"><span className="panel-icon"><Icon name="crate" /></span><h2 id="tray-heading">Cargo Inventory</h2><span className="heading-meta">{hold.filter(id => id !== null).length} / {mission.cargo.length} aboard</span></div>
          <ul className="inventory-list">
            {mission.cargo.map(crate => {
              const slot = hold.indexOf(crate.id)
              const permitted = mission.loadingConstraints.allowedSlotsByCargo?.[crate.id]
              const note = permitted ? `Fits slots ${permitted.join(' or ')}` : mission.completionConditions.requiredCargo.includes(crate.id) ? '' : 'Optional cargo'
              const details = <><span className={`cargo-symbol cargo-${crate.colour}`}><Icon name={crate.icon} /></span><span className="inventory-name">{crate.name}{note && <small>{note}</small>}</span><strong>{crate.mass} kg</strong></>
              return <li key={crate.id}>{slot >= 0
                ? <div className="inventory-item inventory-loaded">{details}<span className="inventory-slot">Slot {slot + 1}</span></div>
                : <button type="button" data-tutorial={`cargo-${crate.id}`} data-audio-custom="" className={`inventory-item named-crate cargo-${crate.colour}${targetMove?.id === crate.id ? ' lesson-focus' : ''}`} aria-label={`${crate.name}, ${crate.mass} kg${note ? `, ${note}` : ''}`} aria-pressed={selected === crate.id} onPointerDown={event => startDrag(event, crate.id)} onClick={() => selectCargo(selected === crate.id ? null : crate.id)}>{details}</button>}
              </li>
            })}
          </ul>
          <div className="inventory-foot">
            <button className={`tray-return${targetMove?.destination === null ? ' lesson-focus' : ''}`} data-tutorial="return-crate" data-audio-custom="" disabled={selected === null || !hold.includes(selected)} onClick={() => { if (selected !== null) placeCargo(selected, null) }}>Return selected crate</button>
            <span>Drop crates here to unload.</span>
          </div>
        </section>

        <SafetyChecklist mission={mission} inspection={inspection} onTestFlight={training || authoring ? undefined : testFlight}
          onQuickFlight={onQuick && !training && !authoring ? () => {
            const configuration = prepareFlightConfiguration(mission, hold)
            if (configuration) onQuick(configuration)
          } : undefined}
          onPractice={!custom && (!training || training.step === 5) ? practiceFlight : undefined}
          onSaveReference={custom?.onSaveReference ? () => custom.onSaveReference?.(hold) : undefined}
          custom={Boolean(custom)} training={training?.step === 5} />

        <div className="learning-panel">
          <InstructorFeedback inspection={inspection} notice={loading.notice} />
          <BalanceKnowledge mission={mission} hold={hold} />
        </div>

        {dragging && draggedCrate && <div className={`named-crate cargo-${draggedCrate.colour} drag-preview`} aria-hidden="true" style={{ left: dragging.x, top: dragging.y }}><Icon name={draggedCrate.icon} />{draggedCrate.mass} kg</div>}
      </div>
      {!training && !authoring && <TakeoffClearance mission={mission} configuration={flight} dialogRef={flightDialog} onClose={() => setFlight(null)} onBegin={() => {
        if (!flight) return
        flightDialog.current?.close()
        onFlight('delivery', flight)
      }} />}
      {solutionOpen && <WorkedSolution mission={mission} reference={custom?.reference} note={custom?.note}
        onClose={() => setSolutionOpen(false)} onRetry={() => { reset(); setSolutionOpen(false) }} onSkip={training ? onBack : undefined} />}
    </>
  )
}
