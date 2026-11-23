import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent, Ref } from 'react'
import { Icon } from './art'
import { corridorWarningDue, gameAudio, newCorridorWarning } from './audio'
import { FlightScene } from './FlightScene'
import { liveFlightTip, newFlightCoach } from './flight-learning'
import { advanceFlight, aircraftResponse, availableSpeeds, flightCoaching, flightReport, flightSpeeds, flightStep, newFlight, remainingFlightTime } from './flight'
import type { FlightReport, FlightRun, FlightSpeed } from './flight'
import { formatCg } from './mission'
import type { FlightConfiguration, FlightMode, Mission } from './mission'

export const practiceWarning = 'This loading configuration is outside the permitted CG range. It can be explored in this educational simulation, but it is not approved for an official delivery flight.'
export const modeLabel = (mode: FlightMode) => mode === 'practice' ? 'Practice Flight — Educational Simulation' : 'Delivery Flight'
export type FlightExerciseAction = 'start' | 'up' | 'down' | 'pace' | 'cruise' | 'pause' | 'resume'
export type FlightStatus = 'briefing' | 'running' | 'paused'

type FlightProps = {
  mission: Mission
  configuration: FlightConfiguration
  mode: FlightMode
  blocked: boolean
  headingRef: Ref<HTMLHeadingElement>
  onReturn: () => void
  onFinish: (report: FlightReport) => void
  onDemonstration?: () => void
  exercise?: { next: FlightExerciseAction | 'read' | 'recover'; observe: (action: FlightExerciseAction) => void; onStatus: (status: FlightStatus) => void }
}

const snapshot = (run: FlightRun, countdown: number) => ({
  altitude: run.altitude, pitch: run.pitch, routeProgress: run.routeProgress, disturbance: run.disturbance, insideSeconds: run.inCorridor * flightStep, countdown,
})

export function FlightScreen({ mission, configuration, mode, blocked, headingRef, onReturn, onFinish, onDemonstration, exercise }: FlightProps) {
  const settings = mission.flight
  const [run] = useState(() => newFlight(settings))
  const response = useMemo(() => aircraftResponse(settings, configuration), [settings, configuration])
  const countdown = useRef(settings.countdown)
  const [hud, setHud] = useState(() => snapshot(run, countdown.current))
  const [status, setStatus] = useState<FlightStatus>('briefing')
  const [speed, setSpeed] = useState<FlightSpeed>('cruise')
  const speedRef = useRef<FlightSpeed>('cruise')
  const keys = useRef(new Set<string>())
  const pointers = useRef(new Map<number, number>())
  const phaseButton = useRef<HTMLButtonElement>(null)
  const flightStarted = useRef(false)
  const warning = useRef(newCorridorWarning())
  const liveCoach = useRef(newFlightCoach())
  const hideTipAt = useRef<number | null>(null)
  const [tip, setTip] = useState('')
  const observeExercise = exercise?.observe
  const notifyExercise = exercise?.onStatus
  const exerciseStep = exercise?.next
  const reading = exerciseStep === 'read'
  const exerciseTicks = useRef(0)
  const pauseAction = status === 'paused' ? 'resume' : 'pause'
  const canTogglePause = !exerciseStep || exerciseStep === pauseAction || exerciseStep === 'recover'
  const pitchPermission = !exerciseStep ? null : exerciseStep === 'up' ? 1 : exerciseStep === 'down' ? -1 : 0
  const [input, setInput] = useState(0)
  const fraction = Math.min(hud.routeProgress / settings.duration, 1)
  const pace = flightSpeeds[speed]
  const coaching = flightCoaching[configuration.safety.balance]
  const paused = status === 'paused' || blocked

  const refreshInput = useCallback(() => {
    const held = [...pointers.current.values()]
    const up = keys.current.has('w') || keys.current.has('arrowup') || held.includes(1)
    const down = keys.current.has('s') || keys.current.has('arrowdown') || held.includes(-1)
    const value = Number(up) - Number(down)
    setInput(value)
    return value
  }, [])
  const currentInput = useRef(0)

  const clearInput = useCallback(() => {
    keys.current.clear()
    pointers.current.clear()
    currentInput.current = refreshInput()
  }, [refreshInput])

  const pause = useCallback(() => {
    clearInput()
    setStatus(previous => previous === 'running' ? 'paused' : previous)
  }, [clearInput])

  const togglePause = useCallback(() => {
    if (blocked || !canTogglePause) return
    clearInput()
    if (exerciseStep === pauseAction) observeExercise?.(pauseAction)
    setStatus(previous => previous === 'briefing' ? previous : previous === 'running' ? 'paused' : 'running')
  }, [blocked, canTogglePause, clearInput, exerciseStep, observeExercise, pauseAction])

  useEffect(() => { if (blocked) pause() }, [blocked, pause])
  useEffect(() => { notifyExercise?.(status) }, [status, notifyExercise])

  useEffect(() => {
    if (status === 'briefing') return
    function keyDown(event: KeyboardEvent) {
      if (blocked || reading || event.target instanceof HTMLInputElement || event.ctrlKey || event.altKey || event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === ' ' && (!(event.target instanceof HTMLButtonElement) || event.target.classList.contains('pitch-button'))) {
        event.preventDefault()
        if (!event.repeat) togglePause()
      }
      if (status !== 'running' || !['w', 's', 'arrowup', 'arrowdown'].includes(key)) return
      event.preventDefault()
      const direction = key === 'w' || key === 'arrowup' ? 1 : -1
      if (countdown.current > 0 || (pitchPermission !== null && pitchPermission !== direction)) return
      keys.current.add(key)
      currentInput.current = refreshInput()
    }
    function keyUp(event: KeyboardEvent) {
      if (keys.current.delete(event.key.toLowerCase())) currentInput.current = refreshInput()
    }
    function hidden() { if (document.hidden) pause() }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', hidden)
    }
  }, [status, blocked, reading, pitchPermission, pause, refreshInput, togglePause])

  useEffect(() => {
    if (status !== 'running' || blocked || reading) return
    let frame: number
    let previous: number | null = null
    let paintedAt = -Infinity
    let playingEngine = false
    function animate(now: number) {
      let seconds = previous === null ? 0 : Math.min((now - previous) / 1000, .1)
      previous = now
      if (countdown.current > 0) {
        const spent = Math.min(seconds, countdown.current)
        countdown.current -= spent
        seconds -= spent
      }
      if (seconds > 0) {
        const ticksBefore = run.ticks
        advanceFlight(run, response, settings, seconds, currentInput.current, speedRef.current)
        if (observeExercise) {
          const direction = currentInput.current
          exerciseTicks.current = direction ? exerciseTicks.current + run.ticks - ticksBefore : 0
          if (exerciseTicks.current >= 12) {
            exerciseTicks.current = 0
            clearInput()
            observeExercise(direction > 0 ? 'up' : 'down')
          }
        }
        if (run.ticks > 0 && !run.end && !playingEngine) {
          gameAudio.setMusicIntensity(flightSpeeds[speedRef.current].rate - 1)
          gameAudio.setFlightMusicPaused(false)
          gameAudio.setMusic('flight')
          gameAudio.setEngine(flightStarted.current ? 'cruise' : 'takeoff')
          flightStarted.current = true
          playingEngine = true
        }
        if (!run.end && corridorWarningDue(warning.current, run.altitude, run.ticks * flightStep, settings.corridor)) gameAudio.play('flightWarning')
        if (!run.end && !observeExercise) {
          const time = run.ticks * flightStep
          const message = liveFlightTip(liveCoach.current, run, settings.corridor, speedRef.current, currentInput.current)
          if (message) { setTip(message); hideTipAt.current = time + 4.5 }
          else if (hideTipAt.current !== null && time > hideTipAt.current) { setTip(''); hideTipAt.current = null }
        }
      }
      if (now - paintedAt >= 40 || run.end) {
        paintedAt = now
        setHud(snapshot(run, countdown.current))
      }
      if (run.end) onFinish(flightReport(run, configuration, mode, settings))
      else frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frame)
      if (playingEngine) {
        gameAudio.setEngine(null)
        gameAudio.setFlightMusicPaused(true)
      }
    }
  }, [status, blocked, reading, run, response, settings, configuration, mode, onFinish, observeExercise, clearInput])

  function press(event: PointerEvent<HTMLButtonElement>, direction: number) {
    if (status !== 'running' || blocked || countdown.current > 0 || event.button !== 0 || (pitchPermission !== null && pitchPermission !== direction)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, direction)
    currentInput.current = refreshInput()
  }

  function release(event: PointerEvent<HTMLButtonElement>) {
    if (pointers.current.delete(event.pointerId)) currentInput.current = refreshInput()
  }

  function start() {
    if (exerciseStep && exerciseStep !== 'start') return
    setStatus('running')
    observeExercise?.('start')
  }

  function chooseSpeed(next: FlightSpeed) {
    speedRef.current = next
    setSpeed(next)
    gameAudio.setMusicIntensity(flightSpeeds[next].rate - 1)
    if (exerciseStep === 'pace' && next === 'express') observeExercise?.('pace')
    if (exerciseStep === 'cruise' && next === 'cruise') observeExercise?.('cruise')
  }

  useEffect(() => {
    if (!observeExercise && status === 'running' && run.ticks === 0) phaseButton.current?.focus({ preventScroll: true })
  }, [status, run, observeExercise])

  const altitudeStatus = hud.altitude < settings.corridor[0] ? 'Below corridor' : hud.altitude > settings.corridor[1] ? 'Above corridor' : 'In corridor'
  const countdownVisible = status !== 'briefing' && hud.countdown > 0

  return (
    <>
      <div className="page-heading flight-heading">
        <div><p className={`flight-mode mode-${mode}`}>{mission.id === 'diy-mission' ? 'Custom Mission Test Flight' : modeLabel(mode)}</p><h1 ref={headingRef} tabIndex={-1}>{mission.title}</h1><p>Destination · {mission.destination}</p></div>
        <button className="secondary-button" onClick={onReturn}>Return to Cargo Loading</button>
      </div>

      {status === 'briefing' && <section className="panel flight-brief-stripe" aria-labelledby="flight-briefing">
        <h2 id="flight-briefing">Flight Briefing</h2>
        <p>Use Pitch Up and Pitch Down to guide your aircraft through the green flight corridor. Your cargo arrangement affects how the aircraft responds to your controls.</p>
        <p>{exercise ? 'Watch the green corridor and try the highlighted controls. You can practise again if the flight ends before you try them all.' : `Complete the route, spend at least ${Math.round(settings.requiredCorridorFraction * 100)}% of your active flight in the corridor and finish inside it. Avoid staying outside the wider flight boundary. In Cruise, the route takes ${settings.duration} seconds.`}</p>
        {settings.model.gustStrength > 1 && <p><strong>Mountain gusts.</strong> Use short pitch corrections and allow time for the aircraft to respond.</p>}
        <p><strong>{coaching.label} · {formatCg(mission, configuration.cg)} m.</strong> {coaching.forecast}</p>
        {onDemonstration && <button className="secondary-button lesson-small" aria-haspopup="dialog" onClick={onDemonstration}>Show Flight Demonstration</button>}
      </section>}
      {mode === 'practice' && !configuration.safety.ready && <p className="practice-warning practice-mode-warning"><Icon name="warning" />{practiceWarning}</p>}

      <section className="panel flight-panel" aria-label="Flight simulator">
        <div className="flight-telemetry">
          <div><span>Altitude</span><strong>{hud.altitude.toFixed(0)} m</strong><small>{altitudeStatus}</small></div>
          <div><span>Pitch angle</span><strong>{hud.pitch.toFixed(1)}°</strong><small>{hud.pitch > .5 ? 'Nose up' : hud.pitch < -.5 ? 'Nose down' : 'Nearly level'}</small></div>
          <div><span>Loaded CG</span><strong>{formatCg(mission, configuration.cg)} m</strong><small>{coaching.label}</small></div>
          <div><span>Time in corridor</span><strong>{hud.insideSeconds.toFixed(1)} s</strong><small>Target {settings.corridor.join('–')} m</small></div>
          <div className="route-progress"><span>Flight progress</span><strong>{Math.round(fraction * 100)}%</strong><progress max={1} value={fraction} aria-label="Flight progress" /><small>{coaching.response}</small></div>
        </div>
        <div className="flight-pace" data-speed={speed} data-tutorial="flight-mode">
          <div className="pace-row">
            <div role="group" aria-label="Flight Mode" className="pace-picker">
              <strong>Flight Mode</strong>
              <div className="pace-segments">
                {availableSpeeds.map(value => {
                  const option = flightSpeeds[value]
                  return <button key={value} type="button" data-tutorial={`flight-${value}`} disabled={Boolean(exerciseStep && !(exerciseStep === 'pace' && value === 'express') && !(exerciseStep === 'cruise' && value === 'cruise'))} aria-pressed={speed === value} onClick={() => chooseSpeed(value)}>{option.rate}× {option.name}</button>
                })}
              </div>
            </div>
            <div className="pace-facts">
              <span>Est. remaining <strong>{Math.ceil(remainingFlightTime(settings, hud.routeProgress, speed))} s</strong></span>
              <span>Challenge <strong>{pace.intensity} · {pace.disturbance}×</strong></span>
            </div>
          </div>
          <p className="pace-description">{pace.description} Modes change gameplay pace and simulated wind.</p>
        </div>
        <div className="flight-console" data-tutorial="flight-controls">
          <div><strong>Flight controls</strong><p>{exercise ? <>Hold a pitch button briefly, or use <kbd>W</kbd> to pitch up or <kbd>S</kbd> to pitch down.</> : <><kbd>W</kbd> / <kbd>↑</kbd> Pitch Up · <kbd>S</kbd> / <kbd>↓</kbd> Pitch Down · <kbd>Space</kbd> Pause / Resume</>}</p></div>
          <div className="pilot-buttons">
            {[{ label: 'Pitch Up', direction: 1 }, { label: 'Pitch Down', direction: -1 }].map(control => (
              <button key={control.direction} type="button" className="secondary-button pitch-button" data-tutorial={control.direction > 0 ? 'pitch-up' : 'pitch-down'} data-audio-custom="" aria-pressed={input === control.direction} disabled={status !== 'running' || blocked || countdownVisible || (pitchPermission !== null && pitchPermission !== control.direction)}
                onPointerDown={event => press(event, control.direction)} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>{control.label}</button>
            ))}
            {status === 'briefing'
              ? <button className="start-button flight-primary" data-tutorial="start-flight" onClick={start}><Icon name="plane" />Start Flight</button>
              : <button ref={phaseButton} className="secondary-button pause-button" data-tutorial="flight-pause" disabled={!canTogglePause} onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>}
          </div>
        </div>
        {tip && <p className="flight-live-tip" role="status"><Icon name="rank" />{tip}</p>}
        <div className="flight-view" data-tutorial="flight-view">
          <FlightScene destination={mission.destination} settings={settings} altitude={hud.altitude} pitch={hud.pitch} fraction={fraction} disturbance={hud.disturbance} />
          {(countdownVisible || (paused && status !== 'briefing')) && <div className="flight-overlay" role="status"><span>{paused ? 'Paused' : 'Preparing for takeoff'}</span>{countdownVisible && !paused && <strong>{Math.ceil(hud.countdown)}</strong>}</div>}
        </div>
      </section>
      <section className="panel flight-coach" aria-labelledby="flight-instructor">
        <h2 id="flight-instructor">Instructor</h2>
        {status !== 'briefing' && <p>{coaching.forecast}</p>}
        <details><summary>Why does the aircraft respond this way?</summary><p>A forward CG increases the nose-up input needed to change pitch. An aft CG weakens the tendency to return towards level flight, so small gusts and adjustments can have a larger effect. Compare the same control input with two different loads.</p></details>
        <p className="simulation-note">Simplified educational model. Intended for comparing loads and control response.</p>
      </section>
    </>
  )
}
