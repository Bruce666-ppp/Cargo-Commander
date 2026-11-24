import { useEffect, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import { FlightScene } from './FlightScene'
import { simulateFlight } from './flight-learning'
import type { FlightReport } from './flight'
import { formatCg, formatCgRange } from './mission'
import type { FlightConfiguration, Mission } from './mission'

export function QuickFlight({ mission, configuration, headingRef, paused, official, training, onFinish, onReturn }: {
  mission: Mission; configuration: FlightConfiguration; headingRef?: Ref<HTMLHeadingElement>
  paused?: boolean; official?: boolean; training?: boolean; onFinish: (report: FlightReport) => void; onReturn: () => void
}) {
  const result = useMemo(() => simulateFlight(mission, configuration, 'delivery'), [mission, configuration])
  const [elapsed, setElapsed] = useState(0)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const last = (result?.frames.length ?? 1) - 1
  const playback = reduced ? 500 : 4250
  const done = elapsed >= playback
  const frame = result?.frames[Math.min(last, Math.floor(elapsed / playback * last))]
  const finished = useRef(false)

  useEffect(() => {
    if (!result || done || paused) return
    let previous = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      if (!document.hidden) setElapsed(time => Math.min(playback, time + now - previous))
      previous = now
    }, 45)
    return () => window.clearInterval(timer)
  }, [result, done, paused, playback])

  const delivered = official && done && result?.report.passed
  useEffect(() => {
    if (!delivered || paused || !result || finished.current) return
    finished.current = true
    onFinish(result.report)
  }, [delivered, paused, result, onFinish])

  function review() {
    if (!result || finished.current) return
    finished.current = true
    onFinish(result.report)
  }

  return <section className="panel quick-verification">
    <header className="panel-heading">
      <div><h1 ref={headingRef} tabIndex={-1}>Auto Delivery</h1>
        <p>{mission.title} · The aircraft flies in Cruise using the load you arranged.</p></div>
    </header>
    {frame && result ? <>
      <FlightScene destination={mission.destination} settings={mission.flight} altitude={frame.altitude} pitch={frame.pitch} fraction={frame.fraction} />
      <dl className="brief-limits quick-metrics">
        <div><dt>Your loaded CG</dt><dd>{formatCg(mission, configuration.cg)} m</dd></div>
        <div><dt>Target CG</dt><dd>{formatCgRange(mission)}</dd></div>
        <div><dt>Simulated time</dt><dd>{frame.time.toFixed(1)} of {mission.flight.duration} s</dd></div>
        <div><dt>Current altitude</dt><dd>{frame.altitude.toFixed(1)} m</dd></div>
      </dl>
      <p className="quick-explanation">The simulator is evaluating your {configuration.totalCargoMass} kg load. The green band marks the safe altitude corridor for this mission.</p>
      <p className="quick-explanation">{configuration.cargoArrangement.flatMap(({ slot, cargo }) => cargo ? [`${cargo.name} (${cargo.mass} kg) → slot ${slot}`] : []).join(' · ')}</p>
      <p className="quick-explanation" role="status">{done ? `${result.report.passed ? 'Flight verified' : 'Flight requirements not met'} · ${(result.report.corridorFraction * 100).toFixed(1)}% in the altitude corridor.` : 'The plane flies automatically. Watch how your load affects its flight.'}</p>
    </> : <p className="quick-explanation" role="alert">This load did not pass the safety checks. Return to the hold and verify it again.</p>}
    <footer className="flight-page-actions">
      {result && (!official || !result.report.passed) && <button className="start-button flight-primary" disabled={!done || paused} onClick={review}>{result.report.passed ? training ? 'See Training Reward' : 'Continue' : 'Review Flight'}</button>}
      <button className="secondary-button" onClick={onReturn}>{training ? 'Exit Training' : 'Return to Cargo Loading'}</button>
    </footer>
  </section>
}
