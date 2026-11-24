import { useId } from 'react'
import type { ReactNode, Ref } from 'react'
import { CargoAircraft, Icon } from './art'
import { Insignia } from './CareerProfile'
import { formatCg, formatCgRange } from './mission'
import type { FlightConfiguration, Mission } from './mission'
import { stemChallenge } from './stem'

type DialogProps = {
  dialogRef?: Ref<HTMLDialogElement>
  id: string
  title: string
  label: string
  children: ReactNode
  actions: ReactNode
  className?: string
  onClose?: () => void
  inline?: boolean
}

export function FlightDeckDialog({ dialogRef, id, title, label, children, actions, className = '', onClose, inline }: DialogProps) {
  const content = <>
      <header className="about-header">
        <div><p>{label}</p><h2 id={id}>{title}</h2></div>
        {!inline && <form method="dialog"><button className="about-dismiss" aria-label="Close dialog"><Icon name="close" /></button></form>}
      </header>
      <div className="about-body flight-deck-body" role="region" aria-label={`${title} content`} tabIndex={0}>{children}</div>
      <footer className="about-footer flight-deck-footer">{actions}</footer>
  </>
  const style = `about-dialog flight-deck-dialog ${className}`
  return inline ? <section className={`${style} tutorial-brief`} aria-labelledby={id}>{content}</section>
    : <dialog ref={dialogRef} className={style} aria-labelledby={id} onClose={onClose} onPointerDown={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>{content}</dialog>
}

export function MissionBrief({ mission, dialogRef, onAccept, onClose, training }: { mission: Mission; dialogRef?: Ref<HTMLDialogElement>; onAccept?: () => void; onClose?: () => void; training?: boolean }) {
  const titleId = useId()
  return (
    <FlightDeckDialog
      dialogRef={dialogRef} id={titleId} title={mission.title} label={`MISSION ${mission.number} · BRIEFING`} onClose={onClose} inline={training}
      actions={<>{!training && <form method="dialog"><button className="secondary-button">{onAccept ? 'Back' : 'Return to Cargo Loading'}</button></form>}{onAccept && <button type="button" className="start-button deck-primary" data-tutorial="accept-mission" onClick={onAccept}><Icon name="check" />Accept Mission</button>}</>}
    >
      <div className="brief-route">
        <span><Icon name="pin" />{mission.origin}</span>
        <div className="brief-aircraft" aria-hidden="true"><CargoAircraft /></div>
        <span><Icon name="pin" />{mission.destination}</span>
      </div>
      <p>{training ? 'Pinehaven needs supplies. Bring all three crates aboard and find a place for each one so the aircraft is balanced.' : mission.narrative}</p>
      <section className="brief-objective">
        <h3>Mission Objective</h3><p>{mission.objective}</p><p className="learning-focus">{mission.learningFocus}</p>
        {!training && <p className="mission-mechanic"><strong>STEM Challenge · {stemChallenge(mission).title}</strong><br />{stemChallenge(mission).prompt}</p>}
        {mission.mechanic && <p className="mission-mechanic">{mission.mechanic}</p>}
      </section>
      <section className="brief-manifest">
        <h3>Required Cargo</h3>
        <ul>{mission.cargo.filter(crate => mission.completionConditions.requiredCargo.includes(crate.id)).map(crate => (
          <li key={crate.id}><span className={`cargo-symbol cargo-${crate.colour}`}><Icon name={crate.icon} /></span><span>{crate.name}</span><strong>{crate.mass} kg</strong></li>
        ))}</ul>
      </section>
      <dl className="brief-limits">
        <div><dt>Maximum payload</dt><dd>{mission.payloadLimit} kg</dd></div>
        <div><dt>Target centre of gravity</dt><dd>{formatCgRange(mission)}</dd></div>
      </dl>
    </FlightDeckDialog>
  )
}

export function TakeoffClearance({ mission, configuration, dialogRef, onBegin, onClose }: { mission: Mission; configuration: FlightConfiguration | null; dialogRef: Ref<HTMLDialogElement>; onBegin: () => void; onClose?: () => void }) {
  return (
    <FlightDeckDialog
      dialogRef={dialogRef} className="clearance-dialog" id="flight-ready-title" title="CLEARED FOR TAKEOFF" label="LOADING SAFETY INSPECTION" onClose={onClose}
      actions={<><form method="dialog"><button className="secondary-button">Return to Cargo Loading</button></form><button className="start-button deck-primary" disabled={!configuration?.safety.ready} onClick={onBegin}><Icon name="plane" />Begin Flight</button></>}
    >
      {configuration && <>
        <div className="clearance-visual"><Insignia icon="check" className="clearance-stamp" /><div aria-hidden="true"><CargoAircraft /></div></div>
        <div className="clearance-mission"><strong>{mission.title}</strong><p>Destination · {mission.destination}</p></div>
        <p>Excellent work, Loadmaster! Your aircraft is balanced, all required cargo is loaded, and every safety check has passed. You are cleared for departure.</p>
        <ul className="flight-confirmation-list clearance-checks">
          <li><Icon name="check" />All required cargo loaded</li>
          <li><Icon name="check" />Payload within limit</li>
          <li><Icon name="check" />CG within target range</li>
          {(mission.loadingConstraints.blockedSlots || mission.loadingConstraints.allowedSlotsByCargo) && <li><Icon name="check" />Slot restrictions met</li>}
        </ul>
        <dl className="brief-limits">
          <div><dt>Total cargo weight</dt><dd>{configuration.totalCargoMass} kg</dd></div>
          <div><dt>Loaded CG · Target {formatCgRange(mission)}</dt><dd>{formatCg(mission, configuration.cg)} m</dd></div>
        </dl>
      </>}
    </FlightDeckDialog>
  )
}
