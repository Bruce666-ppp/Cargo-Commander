import { Icon } from './art'
import { aircraftPercent, formatCg, formatCgRange, getCargo, inspectLoading } from './mission'
import type { Hold, Mission } from './mission'

type Inspection = ReturnType<typeof inspectLoading>

const balanceText = { forward: 'Too far forward', balanced: 'Within target range', aft: 'Too far aft' }

export function AircraftCg({ mission, inspection, before }: { mission: Mission; inspection: Inspection; before?: number }) {
  const position = (metres: number) => aircraftPercent(mission, metres)
  const [min, max] = mission.targetCg
  const end = mission.aircraft.axis.end

  return (
    <section className="aircraft-cg" data-tutorial="balance-point" aria-label="Aircraft centre of gravity">
      <div className="cg-axis" role="img" aria-label={`Longitudinal position from nose to tail. Current CG ${formatCg(mission, inspection.cg)} m. Target ${formatCgRange(mission)}. ${balanceText[inspection.balance]}.`}>
        <div className="cg-axis-track" style={{ left: `${position(0)}%`, width: `${position(end) - position(0)}%` }} />
        <div className="cg-target-band" style={{ left: `${position(min)}%`, width: `${position(max) - position(min)}%` }} />
        {[0, ...mission.slots, end].map(tick => <span key={tick} className="cg-tick" style={{ left: `${position(tick)}%` }}>{tick}</span>)}
        <div className="cg-empty-marker" style={{ left: `${position(mission.aircraft.emptyCg)}%` }} />
        {before !== undefined && Math.abs(inspection.cg - before) > .005 && <span aria-hidden="true" className={`cg-change-arrow${before > inspection.cg ? ' cg-change-forward' : ''}`}
          style={{ left: `${position(Math.min(before, inspection.cg))}%`, width: `${Math.abs(position(before) - position(inspection.cg))}%` }} />}
        <div className={`cg-pointer cg-${inspection.balance}`} style={{ left: `${position(inspection.cg)}%` }}>
          <strong>{formatCg(mission, inspection.cg)} m</strong><i />
        </div>
      </div>
      <div className="cg-key">
        <strong className={`cg-balance-label cg-${inspection.balance}`}>{balanceText[inspection.balance]}</strong>
        <span><i className="cg-key-target" />Target {formatCgRange(mission)}</span>
        <span><i className="cg-key-empty" />Empty CG {mission.aircraft.emptyCg.toFixed(2)} m · {mission.aircraft.emptyMass} kg</span>
        <span>Distance from nose datum (m)</span>
      </div>
    </section>
  )
}

export function SafetyChecklist({ mission, inspection, onTestFlight, onPractice, training, id = 'safety-heading' }: {
  mission: Mission; inspection: Inspection; onTestFlight?: () => void; onPractice?: () => void; training?: boolean; id?: string
}) {
  const { requiredCargoOk, requiredLoaded, requiredTotal, payloadOk, cargoMass, cg, balance, positionsOk, ready } = inspection
  const checks = [
    { title: 'Required Cargo', detail: `${requiredLoaded} / ${requiredTotal} crates loaded`, state: requiredCargoOk ? 'passed' : 'pending' },
    { title: 'Payload Limit', detail: `${cargoMass} / ${mission.payloadLimit} kg`, state: payloadOk ? 'passed' : 'adjust' },
    { title: 'Centre of Gravity', detail: `Current ${formatCg(mission, cg)} m · Target ${formatCgRange(mission)}`, state: balance === 'balanced' ? 'passed' : 'adjust' },
    ...(mission.loadingConstraints.blockedSlots || mission.loadingConstraints.allowedSlotsByCargo
      ? [{ title: 'Slot Restrictions', detail: positionsOk ? 'Loaded crates use permitted slots' : 'Move crates to permitted slots', state: positionsOk ? 'passed' : 'adjust' }]
      : []),
    { title: 'Aircraft Readiness', detail: ready ? 'All safety checks passed' : 'Safety checks still open', state: ready ? 'passed' : payloadOk && balance === 'balanced' && positionsOk ? 'pending' : 'adjust' },
  ]
  const outstanding = [
    !requiredCargoOk && 'Load the remaining supplies.',
    !payloadOk && 'Reduce the payload.',
    balance !== 'balanced' && 'Move the CG into the target range.',
    !positionsOk && 'Move crates to permitted slots.',
  ].filter(Boolean).join(' ')

  return (
    <section className="panel safety-panel" data-tutorial="safety-checklist" aria-labelledby={id}>
      <div className="loading-panel-heading"><span className="panel-icon"><Icon name="rank" /></span><h2 id={id}>Safety Checklist</h2></div>
      <ol className="safety-checks">
        {checks.map(check => <li key={check.title}>
          <span className={`check-icon check-${check.state}`}>
            {check.state === 'passed' ? <Icon name="check" /> : check.state === 'adjust' ? <Icon name="warning" /> : <i />}
          </span>
          <div><strong>{check.title}</strong><span className="sr-only">{check.state === 'passed' ? 'Passed' : check.state === 'pending' ? 'Incomplete' : 'Requires adjustment'}</span><p>{check.detail}</p></div>
        </li>)}
      </ol>
      {(onTestFlight || onPractice) && <div className="flight-actions">
        <div role="status">
          {ready ? <div className="ready flight-status-ready"><span><Icon name="check" /></span><strong>Mission Ready</strong></div> : <p id="flight-outstanding">{outstanding}</p>}
        </div>
        {onTestFlight && <button type="button" className="start-button test-flight-button" data-audio-custom="" aria-describedby={ready ? undefined : 'flight-outstanding'} disabled={!ready} onClick={onTestFlight}><Icon name="plane" />Test Flight</button>}
        {onTestFlight && <p className="flight-mode-explanation">Test Flight leads to the official delivery. Practice Flight lets you compare how loads respond, including CG outside the official range.</p>}
        {onPractice && <button type="button" data-tutorial="practice-flight" className={training ? 'start-button test-flight-button' : 'secondary-button practice-launch'} disabled={training ? !ready : !inspection.practiceReady} onClick={onPractice}>Practice Flight</button>}
        {!training && !inspection.practiceReady && <p className="practice-requires">Practice requires all supplies, a valid payload and permitted slots.</p>}
      </div>}
    </section>
  )
}

function guidance({ cargoMass, requiredCargoOk, balance, payloadOk, positionsOk, ready }: Inspection) {
  if (cargoMass === 0) return 'Every aircraft has a centre of gravity, even when it is empty. Start by placing a cargo crate inside the aircraft and observe how the balance changes.'
  if (ready) return 'Excellent work, loadmaster! All required cargo is loaded, the payload is within the limit, and the centre of gravity is inside the target range. Your aircraft is ready for its flight test.'
  if (!payloadOk || !positionsOk) return 'Check the safety checklist and make sure each crate is in a permitted slot and the total payload is within the aircraft’s capacity.'
  if (balance === 'balanced') return "The aircraft's current balance is within the target range, but some required supplies are still missing. Adding more cargo may change the balance again."

  const partial = requiredCargoOk ? '' : 'You have started loading the aircraft. Notice how adding cargo changes the centre of gravity. Load the remaining supplies before completing the safety inspection. '
  const adjustment = balance === 'forward'
    ? 'Too much mass is concentrated towards the nose of the aircraft. This moves the centre of gravity forward. Try moving cargo towards the tail.'
    : 'Too much mass is concentrated towards the tail of the aircraft. This moves the centre of gravity backwards. Try moving cargo towards the nose.'
  return `${partial}${adjustment}`
}

export function InstructorFeedback({ inspection, notice }: { inspection: Inspection; notice: { text: string; warning?: boolean } | null }) {
  return (
    <section className="panel instructor-panel" aria-labelledby="instructor-heading">
      <div className="loading-panel-heading"><span className="panel-icon"><Icon name="rank" /></span><h2 id="instructor-heading">Instructor Feedback</h2></div>
      <div className="instructor-body">
        <p>{guidance(inspection)}</p>
        {inspection.cargoMass > 0 && inspection.balance !== 'balanced' && <p className="balance-principle">Moving a heavier crate changes the centre of gravity more than moving a lighter crate by the same distance.</p>}
        <div role="status">
          {notice && <p key={notice.text} className={`movement-notice${notice.warning ? ' notice-warning' : ''}`}><Icon name={notice.warning ? 'warning' : 'info'} />{notice.text}</p>}
        </div>
      </div>
    </section>
  )
}

export function ExploreMaths({ mission, hold }: { mission: Mission; hold: Hold }) {
  const { emptyMass, emptyCg } = mission.aircraft
  const rows = [{ label: 'Empty aircraft', mass: emptyMass, position: emptyCg }, ...hold.flatMap((id, slot) => {
    const crate = getCargo(mission, id)
    return crate ? [{ label: crate.name, mass: crate.mass, position: mission.slots[slot] }] : []
  })]
  const total = rows.reduce((sum, row) => sum + row.mass * row.position, 0)
  const { aircraftMass, cg } = inspectLoading(mission, hold)
  return (
    <details className="science-details">
      <summary>Explore the Maths — Optional</summary>
      <p>When two crates travel the same distance and the total load stays the same, moving a 30 kg crate shifts the balance point three times as far as moving a 10 kg crate.</p>
      <ol><li>Multiply each mass by its distance from the nose reference point. Include the empty aircraft.</li><li>Add those results together.</li><li>Divide by the total mass of the aircraft and cargo.</li></ol>
      <div className="math-table"><table><caption>Using the load shown above</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Mass (kg)</th><th scope="col">Distance (m)</th><th scope="col">Mass × distance</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.mass}</td><td>{row.position.toFixed(2)}</td><td>{Number((row.mass * row.position).toFixed(3))}</td></tr>)}</tbody>
      </table></div>
      <p><strong>{Number(total.toFixed(3))} ÷ {aircraftMass} = {formatCg(mission, cg)} m</strong></p>
    </details>
  )
}

export function BalanceKnowledge({ mission, hold }: { mission: Mission; hold: Hold }) {
  return (
    <details className="panel knowledge-card">
      <summary><Icon name="book" />Why Does Balance Matter?</summary>
      <div className="knowledge-body">
        <figure className="seesaw-figure">
          <svg viewBox="0 0 280 94" role="img" aria-label="A seesaw balances when a heavy crate sits closer to the middle and a light crate sits farther away.">
            <path d="M27 60H253" stroke="#315b73" strokeWidth="5" strokeLinecap="round" />
            <path d="m122 84 18-24 18 24z" fill="#a7c997" stroke="#4c7c65" strokeWidth="2" />
            <rect x="87" y="27" width="31" height="31" rx="5" fill="#bbdee6" stroke="#4f8192" strokeWidth="2" />
            <rect x="222" y="39" width="20" height="19" rx="4" fill="#f0dfbb" stroke="#9e7d48" strokeWidth="2" />
            <path d="M103 33v17m-6-6 6 6 6-6m122-1v9m-4-4 4 4 4-4" fill="none" stroke="#315b73" strokeWidth="1.5" />
          </svg>
          <figcaption>Like a seesaw, an aircraft can balance with a heavy crate close to the middle and a lighter crate farther away.</figcaption>
        </figure>
        <p>The centre of gravity is the aircraft’s balance point. Move cargo and watch the marker shift. The green zone shows where that point should sit before takeoff.</p>
        <ExploreMaths mission={mission} hold={hold} />
      </div>
    </details>
  )
}
