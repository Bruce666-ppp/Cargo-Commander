import { useEffect, useRef } from 'react'
import type { CSSProperties, Ref } from 'react'
import { FlightMap, Icon } from './art'
import { awardTiming, gameAudio } from './audio'
import { Insignia } from './CareerProfile'
import { certifications, networkSummary, ranks } from './career'
import type { CareerProgress, MapDiscovery } from './career'
import { FlightScene } from './FlightScene'
import { retryFlightTip } from './flight-learning'
import { flightCoaching, flightSpeeds, instructorAssessment } from './flight'
import type { FlightReport } from './flight'
import { formatCg } from './mission'
import type { Mission } from './mission'

type Heading = { headingRef: Ref<HTMLHeadingElement> }
const percent = (report: FlightReport) => `${(report.corridorFraction * 100).toFixed(1)}%`
const flightModes = (report: FlightReport) => report.modesUsed.map(({ speed, time }) => `${flightSpeeds[speed].name} (${time.toFixed(1)} s)`).join(' · ')

function AltitudeGraph({ mission, report }: { mission: Mission; report: FlightReport }) {
  const { corridor, boundary } = mission.flight
  const duration = Math.max(1, report.elapsed)
  const measured = report.samples.map(sample => sample.altitude)
  const min = Math.min(boundary[0], ...measured) - 4
  const max = Math.max(boundary[1], ...measured) + 4
  const x = (time: number) => 62 + time / duration * 554
  const y = (altitude: number) => 206 - (altitude - min) / (max - min) * 184
  const points = report.samples.map(sample => `${x(sample.time).toFixed(1)},${y(sample.altitude).toFixed(1)}`).join(' ')
  return (
    <figure className="altitude-figure">
      <svg viewBox="0 0 640 236" role="img" aria-label={`Recorded altitude from departure through ${report.elapsed.toFixed(1)} seconds. The target corridor is ${corridor[0]} to ${corridor[1]} metres.`}>
        <path d="M62 22v184h554" fill="none" stroke="#8ba9b6" />
        <rect x="62" y={y(corridor[1])} width="554" height={y(corridor[0]) - y(corridor[1])} fill="#d8edc7" />
        {corridor.map(altitude => <g key={altitude}><path d={`M62 ${y(altitude)}h554`} stroke="#8ab57c" strokeDasharray="4 4" /><text x="54" y={y(altitude) + 4} textAnchor="end">{altitude} m</text></g>)}
        {[0, duration / 3, 2 * duration / 3, duration].map(time => <text key={time} x={x(time)} y="226" textAnchor="middle">{Number(time.toFixed(1))} s</text>)}
        <polyline points={points} fill="none" stroke="#285b7a" strokeWidth="2.7" strokeLinejoin="round" />
        <circle cx={x(report.elapsed)} cy={y(report.finalAltitude)} r="4" fill="#285b7a" />
      </svg>
      <figcaption>Actual altitude over active flight time <span>Green band · target corridor</span></figcaption>
    </figure>
  )
}

type ReviewProps = Heading & {
  mission: Mission
  report: FlightReport
  previous: FlightReport | null
  onRetry: () => void
  onReturn: () => void
  onPractice: () => void
  onBackToCompletion?: () => void
  campaignComplete?: boolean
  failedAttempts: number
  onDemonstration: () => void
}

export function FlightReview({ mission, report, previous, headingRef, onRetry, onReturn, onPractice, onBackToCompletion, campaignComplete, failedAttempts, onDemonstration }: ReviewProps) {
  const assessment = instructorAssessment(report, mission.flight)
  const { configuration } = report
  const practice = report.mode === 'practice'
  const conclusion = practice ? report.passed ? 'Practice challenge met' : 'Practice flight reviewed' : report.passed ? 'Delivery completed' : 'Delivery challenge not met'
  return (
    <>
      <div className="page-heading flight-heading"><div><p className={`flight-mode mode-${report.mode}`}>{practice ? 'Practice Flight · Educational Simulation' : 'Delivery Flight'}</p><h1 ref={headingRef} tabIndex={-1}>Flight Review</h1><p>{mission.title} · {mission.destination}</p></div></div>
      <div className="review-layout">
        <section className="panel report-chart"><h2>Altitude Record</h2><AltitudeGraph mission={mission} report={report} /></section>
        <section className="panel review-summary" aria-label="Flight measurements">
          <h2>{conclusion}</h2>
          <dl className="result-metrics">
            <div><dt>Time in corridor</dt><dd>{percent(report)} · {report.timeInCorridor.toFixed(1)} s</dd></div>
            <div><dt>Active flight time</dt><dd>{report.elapsed.toFixed(1)} s</dd></div>
            <div><dt>Flight modes used</dt><dd>{flightModes(report)}</dd></div>
            <div><dt>Loaded CG</dt><dd>{formatCg(mission, configuration.cg)} m · {flightCoaching[configuration.safety.balance].label}</dd></div>
            <div><dt>Cargo / loaded aircraft</dt><dd>{configuration.totalCargoMass} / {configuration.totalAircraftMass} kg</dd></div>
            <div><dt>Peak pitch deviation</dt><dd>{report.peakPitch.toFixed(1)}°</dd></div>
            <div><dt>Route status</dt><dd>{report.end === 'destination' ? 'Destination reached' : 'Flight ended at boundary'}</dd></div>
          </dl>
        </section>
        <section className="panel review-instructor"><h2><Icon name="rank" />Instructor Assessment</h2><p>{assessment.observation}</p><p>{assessment.model}</p>{assessment.control && <p>{assessment.control}</p>}<p>{assessment.adjustment}</p>
          {report.modesUsed.some(({ speed }) => speed !== 'cruise') && <p>Faster delivery modes introduce additional simulated disturbances. Careful pitch adjustments help maintain stable flight.</p>}
          {previous && <section className="comparison" aria-label="Flight comparison">
            <p><strong>Previous flight</strong> · CG {formatCg(mission, previous.configuration.cg)} m · {previous.elapsed.toFixed(1)} s total · {flightModes(previous)} · {percent(previous)} in the corridor.</p>
            <p><strong>This flight</strong> · CG {formatCg(mission, configuration.cg)} m · {report.elapsed.toFixed(1)} s total · {flightModes(report)} · {percent(report)} in the corridor.</p>
            <p>Flight mode and pitch inputs also affect performance. Use the same mode and similar inputs to compare how balance affects the aircraft.</p>
          </section>}
          {!report.passed && <div className="retry-guidance"><strong>{failedAttempts > 1 ? 'What to try on your next flight' : 'One thing to try'}</strong><p>{retryFlightTip(report, mission, failedAttempts)}</p>
            {failedAttempts >= 3 && <p>Watch the instructor fly this route, then try it yourself.</p>}
          </div>}
          <button className={`secondary-button${!report.passed && failedAttempts >= 3 ? ' lesson-hint-button' : ''}`} aria-haspopup="dialog" onClick={onDemonstration}>Show Flight Demonstration</button>
        </section>
      </div>
      <div className="flight-page-actions">
        {onBackToCompletion ? <button className="start-button flight-primary" onClick={onBackToCompletion}>{campaignComplete ? 'Back to Campaign Completion' : 'Back to Mission Accomplished'}</button> : <>
          <button className="start-button flight-primary" onClick={onRetry}>{practice ? 'Retry Practice Flight' : 'Retry Flight'}</button>
          <button className="secondary-button" onClick={onReturn}>Return to Cargo Loading</button>
          {!practice && <button className="secondary-button" onClick={onPractice}>Practice Flight</button>}
        </>}
      </div>
    </>
  )
}

export function Arrival({ mission, headingRef, blocked, onFinish }: Heading & { mission: Mission; blocked: boolean; onFinish: () => void }) {
  const duration = mission.flight.arrivalSeconds
  const remaining = useRef(duration * 1000)
  const finished = useRef(false)
  const touchdownAnnounced = useRef(false)

  function finish() {
    if (finished.current) return
    finished.current = true
    onFinish()
  }

  useEffect(() => {
    if (blocked) return
    const startedAt = performance.now()
    const touchdown = window.setTimeout(() => {
      if (finished.current || touchdownAnnounced.current) return
      touchdownAnnounced.current = true
      gameAudio.play('arrival')
    }, Math.max(0, remaining.current - duration * 1000 * .25))
    const timer = window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true
        onFinish()
      }
    }, remaining.current)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(touchdown)
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
    }
  }, [blocked, duration, onFinish])

  return (
    <>
      <div className="page-heading flight-heading"><div><p className="flight-mode">Delivery Flight · Arrival</p><h1 ref={headingRef} tabIndex={-1}>{mission.destination}</h1><p>Delivery flight passed. Your aircraft is approaching the runway.</p></div><button className="secondary-button" onClick={finish}>Skip Animation</button></div>
      <div className={`panel arrival-view${blocked ? ' arrival-paused' : ''}`}><FlightScene destination={mission.destination} settings={mission.flight} altitude={mission.flight.initialAltitude} fraction={1} pitch={0} arrival /><p><Icon name="pin" />{mission.destination} · Scripted arrival</p></div>
    </>
  )
}

type CompletionProps = Heading & {
  mission: Mission; report: FlightReport; progress: CareerProgress; firstDelivery: boolean; animateAwards: boolean; discovery: MapDiscovery | null
  onNext: () => void; onContinue: () => void; onReport: () => void; onReplay: () => void
}

export function DiscoveryNotice({ discovery }: { discovery: MapDiscovery }) {
  return <div className="discovery-notice" role="status"><span className="panel-icon"><Icon name="pin" /></span><div><strong>{discovery.title}</strong><p>{discovery.detail}</p></div></div>
}

export function MissionAccomplished({ mission, report, progress, firstDelivery, animateAwards, discovery, headingRef, onNext, onContinue, onReport, onReplay }: CompletionProps) {
  const { configuration } = report
  const delivered = configuration.cargoArrangement.flatMap(slot => slot.cargo ? [slot.cargo] : [])
  const rank = ranks[mission.career.rankMilestone]
  const certificate = certifications.find(cert => cert.id === mission.career.certificationId)!
  return (
    <>
      <section className="accomplished-banner">
        <Insignia icon="check" className="achievement-emblem" />
        <p>{mission.title} · {mission.origin} → {mission.destination}</p>
        <h1 ref={headingRef} tabIndex={-1}>MISSION ACCOMPLISHED!</h1>
        <p>Your cargo has safely arrived at {mission.destination}.</p>
      </section>
      <div className="flight-page-actions campaign-actions"><button className="start-button flight-primary" aria-haspopup="dialog" onClick={onNext}>Next Mission</button><button className="secondary-button" onClick={onContinue}>Return to Mission Centre</button><button className="secondary-button" onClick={onReport}>View Flight Report</button><button className="secondary-button" aria-haspopup="dialog" onClick={onReplay}>Replay Mission</button></div>
      {discovery && <section className="panel completion-discovery" aria-label="Map discovery"><DiscoveryNotice discovery={discovery} /><FlightMap progress={progress} discovery={animateAwards ? discovery : null} /></section>}
      <div className={`completion-awards${firstDelivery && animateAwards ? ' first-awards' : ''}`} style={{
        '--promotion-delay': `${awardTiming.promotion}s`, '--route-delay': `${awardTiming.route}s`, '--certification-delay': `${awardTiming.certification}s`,
      } as CSSProperties}>
        <article className="panel promotion-card"><Insignia /><div><h2>{firstDelivery ? 'Rank Promotion' : 'Career Rank'}</h2><strong>{firstDelivery ? `${ranks[mission.career.rankMilestone - 1]} → ${rank}` : ranks[progress.rankMilestone]}</strong><p>{firstDelivery ? `This delivery earned your promotion to ${rank}.` : 'Your existing promotion is recorded in the Achievement Wall.'}</p></div></article>
        <article className="panel certification-award certified" data-badge={certificate.id}><Insignia icon={certificate.icon} /><div><h2>{certificate.title}</h2><strong>{firstDelivery ? 'STEM certification earned' : 'STEM certification held'}</strong><p>{certificate.competency}</p></div></article>
        <article className="panel route-award"><Insignia icon="pin" /><div><h2>Established Route</h2><strong>{mission.origin} → {mission.destination}</strong><p>{firstDelivery ? 'This route is now part of your aviation network.' : 'This delivery used an established route.'}</p></div></article>
      </div>
      <div className="completion-details">
        <section className="panel review-summary"><h2>Delivery Summary</h2><dl className="result-metrics">
          <div><dt>Cargo delivered</dt><dd>{configuration.totalCargoMass} kg · {delivered.length} crates</dd></div>
          <div><dt>Manifest</dt><dd>{delivered.map(crate => `${crate.name} (${crate.mass} kg)`).join(' · ')}</dd></div>
          <div><dt>Final loaded CG</dt><dd>{formatCg(mission, configuration.cg)} m · within target range</dd></div>
          <div><dt>Flight performance</dt><dd>{percent(report)} in the corridor · {report.elapsed.toFixed(1)} s flown</dd></div>
          <div><dt>Safety status</dt><dd>All safety checks passed</dd></div>
        </dl></section>
        <section className="panel review-instructor"><h2>What You Learned</h2><ul>
          <li>{mission.learningFocus}</li>
          <li>Cargo mass and position determine how the aircraft balances. Your load brought the CG to {formatCg(mission, configuration.cg)} m.</li>
          <li>A suitable CG supports stable, controllable flight in this simplified model. Your aircraft spent {percent(report)} of the flight in the target corridor.</li>
        </ul></section>
      </div>
    </>
  )
}

type CampaignCompleteProps = Heading & {
  progress: CareerProgress; celebrate: boolean; onWall: () => void; onContinue: () => void; onReplay: () => void; onReport: () => void
}

export function CampaignComplete({ progress, celebrate, headingRef, onWall, onContinue, onReplay, onReport }: CampaignCompleteProps) {
  const { deliveries, routes, airports } = networkSummary(progress)
  return (
    <>
      <section className={`accomplished-banner campaign-banner${celebrate ? ' campaign-celebrate' : ''}`}>
        <Insignia icon="wings" className="campaign-emblem" />
        <h1 ref={headingRef} tabIndex={-1}>YOU ARE THE CARGO COMMANDER!</h1>
        <p>Final rank · {ranks[progress.rankMilestone]}</p>
      </section>
      <div className="flight-page-actions campaign-actions"><button className="start-button flight-primary" aria-haspopup="dialog" onClick={onWall}>View Achievement Wall</button><button className="secondary-button" onClick={onContinue}>Return to Mission Centre</button><button className="secondary-button" onClick={onReplay}>Replay Missions</button><button className="secondary-button" onClick={onReport}>View Flight Report</button></div>
      <div className="game-layout campaign-summary">
        <section className="panel map-panel" aria-labelledby="completed-map"><div className="panel-heading"><span className="panel-icon"><Icon name="pin" /></span><h2 id="completed-map">The Windward Isles</h2></div><FlightMap progress={progress} />
          <dl className="campaign-totals"><div><dt>Completed missions</dt><dd>{deliveries}</dd></div><div><dt>Established routes</dt><dd>{routes}</dd></div><div><dt>Connected airports</dt><dd>{airports}</dd></div><div><dt>Earned certifications</dt><dd>{progress.certificationIds.length}</dd></div></dl>
        </section>
        <section className="panel review-instructor campaign-learning"><h2>What You Learned</h2>
          <h3>Centre of Gravity and Mass Distribution</h3><p>You used cargo mass and distance from the datum to balance the aircraft while meeting payload and slot limits.</p>
          <h3>Aircraft Stability and Flight Control</h3><p>You observed how the load and simulated gusts affect aircraft stability, then used pitch corrections to stay in the flight corridor.</p>
        </section>
      </div>
    </>
  )
}
