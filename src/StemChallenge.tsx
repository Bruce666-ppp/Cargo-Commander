import { useState } from 'react'
import { Icon } from './art'
import { AircraftCg } from './LoadingInstruments'
import { calculateLoad, formatCg, formatCgRange, getCargo, inspectLoading } from './mission'
import type { Hold, Mission } from './mission'
import { money, missionPayment } from './rewards'
import { distinctValidHolds, integratedStrategies, massTrial, massTrialsStart, stabilityComparison, stemChallenge, trialCrates } from './stem'

type ActivityProps = { mission: Mission; hold: Hold; onEarn: () => void }

function BalanceCheck({ mission, hold, onEarn }: ActivityProps) {
  const [reading, setReading] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const { cg, balance } = inspectLoading(mission, hold)
  return <form className="stem-form" onSubmit={event => {
    event.preventDefault()
    if (reading.trim() && Number(reading) === Number(formatCg(mission, cg)) && answer === balance) onEarn()
    else setFeedback(`Read the current marker in metres, then compare it with both ends of the ${formatCgRange(mission)} target range.`)
  }}>
    <label>Current CG (m)<input inputMode="decimal" value={reading} onChange={event => setReading(event.target.value)} required /></label>
    <label>Where is it?<select value={answer} onChange={event => setAnswer(event.target.value)} required>
      <option value="">Choose a position</option><option value="forward">Too far forward</option>
      <option value="balanced">Within target range</option><option value="aft">Too far aft</option>
    </select></label>
    <button className="secondary-button">Check Balance Reading</button>
    {feedback && <p role="status">{feedback}</p>}
  </form>
}

function MassExperiment({ mission, onEarn }: ActivityProps) {
  const [prediction, setPrediction] = useState<number | null>(null)
  const [ran, setRan] = useState<number[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const trials = [massTrial(0), massTrial(1)]
  const start = calculateLoad(mission, massTrialsStart)
  return <div className="stem-activity">
    <p>Which crate moves the CG farther? Both trials start at CG {start.cg.toFixed(3)} m with {start.cargoMass} kg aboard. Each trial resets to the same load before moving one crate 1 m towards the tail.</p>
    <div className="diy-actions" aria-label="Predict the greater change">
      {trialCrates.map(({ name, mass }, index) => <button key={name} className="secondary-button" aria-pressed={prediction === index}
        onClick={() => { setPrediction(index); setFeedback('') }}>{name} · {mass} kg</button>)}
    </div>
    <div className="diy-actions">{trialCrates.map(({ name }, index) => <button key={name} className="secondary-button" disabled={prediction === null}
      onClick={() => { setActive(index); setRan(current => current.includes(index) ? current : [...current, index]) }}>Move {name} 1 m</button>)}</div>
    {active !== null && trials[active] && <div className="stem-trajectory"><AircraftCg mission={mission}
      inspection={inspectLoading(mission, trials[active].hold)} before={start.cg} /></div>}
    <ul className="stem-measurements" aria-live="polite">{ran.map(index => {
      const trial = trials[index]
      return trial && <li key={index}>{trialCrates[index].name}: {trial.before.toFixed(3)} → {trial.after.toFixed(3)} m · Shift {trial.shift.toFixed(3)} m</li>
    })}</ul>
    <button className="secondary-button" disabled={ran.length !== 2 || prediction === null} onClick={() => {
      if (prediction !== null && (trials[prediction]?.shift ?? 0) > (trials[1 - prediction]?.shift ?? 0)) onEarn()
      else setFeedback('Compare the two recorded shifts. The distances and total mass are equal, so the heavier crate changes the balance more. Try again.')
    }}>Check Prediction</button>
    {feedback && <p role="status">{feedback}</p>}
  </div>
}

function FindAnotherLoad({ mission, hold, onEarn }: ActivityProps) {
  const [first, setFirst] = useState<Hold | null>(null)
  const [message, setMessage] = useState('')
  return <div className="stem-activity">
    <p>{first ? `First safe arrangement recorded at ${formatCg(mission, inspectLoading(mission, first).cg)} m. Change the cargo positions and find another.` : 'Use the aircraft hold to find two different arrangements that both pass all checks.'}</p>
    <button className="secondary-button" onClick={() => {
      if (!inspectLoading(mission, hold).ready) setMessage('This layout has open checks. Recheck the payload, slots and balance before recording it.')
      else if (!first) { setFirst([...hold]); setMessage('First layout saved for this activity.') }
      else if (distinctValidHolds(mission, first, hold)) onEarn()
      else setMessage('That is the same layout. Move at least one crate and check the balance again.')
    }}>{first ? 'Record Second Safe Layout' : 'Record First Safe Layout'}</button>
    {message && <p role="status">{message}</p>}
  </div>
}

function Decision({ question, choices, answer, hints, onEarn }: {
  question: string; choices: readonly string[]; answer: number; hints: readonly string[]; onEarn: () => void
}) {
  const [feedback, setFeedback] = useState('')
  return <div className="stem-activity">
    <p>{question}</p>
    <div className="diy-actions">{choices.map((label, index) => <button key={label} className="secondary-button"
      onClick={() => index === answer ? onEarn() : setFeedback(hints[index])}>{label}</button>)}</div>
    {feedback && <p role="status">{feedback}</p>}
  </div>
}

function StabilityCheck({ mission, onEarn }: ActivityProps) {
  const [viewed, setViewed] = useState(false)
  const results = viewed ? stabilityComparison() : null
  return <div className="stem-activity">
    <p>Compare two valid loads on the same route. The simulator runs both in Cruise with identical wind and one identical pitch correction.</p>
    {!results ? <button className="secondary-button" onClick={() => setViewed(true)}>Compare Two Flights</button> : <>
      <ul className="stem-measurements">{results.map((report, index) => <li key={index}>
        Flight {index === 0 ? 'A' : 'B'} · CG {formatCg(mission, report.configuration.cg)} m · {(report.corridorFraction * 100).toFixed(1)}% in the corridor · Final altitude {report.finalAltitude.toFixed(1)} m · {report.elapsed.toFixed(0)} s
      </li>)}</ul>
      <Decision question="Which aircraft spent more of its flight in the target altitude corridor?"
        choices={['Flight A', 'Flight B']} answer={results[0].corridorFraction > results[1].corridorFraction ? 0 : 1}
        hints={['Read the actual corridor percentages for both flights.', 'Compare the measured percentages. Both flights used the same wind and pitch input.']} onEarn={onEarn} />
    </>}
  </div>
}

function IntegratedCheck({ mission, onEarn }: ActivityProps) {
  const strategies = integratedStrategies()
  return <div className="stem-activity">
    <ul className="stem-measurements">{strategies.map(({ label, hold, cargoMass }) =>
      <li key={label}><strong>{label} · {cargoMass} kg</strong><br />{hold.flatMap((id, slot) => id ? [`Slot ${slot + 1}: ${getCargo(mission, id)?.name}`] : []).join(' · ')}</li>)}</ul>
    <Decision question="Which strategy satisfies the manifest, powered slot, payload and target range together?"
      choices={['Carry the spare', 'Use the front slot', 'Use power for the case and leave the spare']}
      answer={strategies.findIndex(option => option.ready)}
      hints={strategies.map(option => !option.payloadOk ? `This load exceeds the ${mission.payloadLimit} kg payload limit.` :
        !option.positionsOk ? 'The Cold-chain Case needs powered slot 3 or 4.' : `Compare the CG with the ${formatCgRange(mission)} range.`)}
      onEarn={onEarn} />
  </div>
}

export function StemChallenge({ mission, hold, earned, delivered, onEarn }: ActivityProps & { earned: boolean; delivered: boolean }) {
  const stem = stemChallenge(mission)
  const payment = missionPayment(mission)
  const props = { mission, hold, onEarn }
  return <section className="panel stem-challenge" aria-label="STEM Challenge">
    <div className="stem-challenge-heading"><span className="panel-icon"><Icon name="atom" /></span><div>
      <h2>STEM Challenge · {stem.title}</h2><p>{stem.prompt}</p>
    </div></div>
    <details className="stem-bonus">
      <summary>{earned ? `STEM Bonus · ${delivered ? 'earned' : 'ready after delivery'}` : `Optional STEM Bonus · ${money(payment.bonus)}`}</summary>
      {earned ? <p role="status">{stem.takeaway} {delivered ? `${money(payment.bonus)} added to Total Earnings.` : `Finish the delivery to receive ${money(payment.bonus)}.`}</p> :
        mission.number === '01' ? <BalanceCheck {...props} /> :
        mission.number === '02' ? <MassExperiment {...props} /> :
        mission.number === '03' ? <FindAnotherLoad {...props} /> :
        mission.number === '04' ? <Decision question="Why must the Medical Case use slot 3 or 4?"
          choices={['To use the powered fittings', 'To keep the case near the door', 'To reduce the mass of the case']} answer={0}
          hints={['', 'The mission requires the powered fittings. The door position is not the reason.', 'Moving cargo changes balance, but the case keeps the same mass.']}
          onEarn={onEarn} /> :
        mission.number === '05' ? <StabilityCheck {...props} /> : <IntegratedCheck {...props} />}
    </details>
  </section>
}
