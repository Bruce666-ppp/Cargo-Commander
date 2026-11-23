import { useRef, useState } from 'react'
import type { ComponentProps, Ref } from 'react'
import { Icon } from './art'
import { certifications, establishedRoutes, ranks } from './career'
import type { CareerProgress } from './career'
import { campaign } from './mission'

export function Insignia({ icon = 'rank', className = '' }: { icon?: ComponentProps<typeof Icon>['name']; className?: string }) {
  return (
    <span className={`aviation-insignia ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 87" fill="none">
        <path d="M43 29H4l9 9h31m-34 1 10 9h26m-24 1 10 8h18M77 29h39l-9 9H76m34 1-10 9H74m24 1-10 8H70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 4 86 16v25q0 20-26 39Q34 61 34 41V16L60 4Z" className="insignia-shield" stroke="currentColor" strokeWidth="3" />
        <path d="M60 12 79 21v20q0 15-19 30Q41 56 41 41V21l19-9Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="m54 57 6 4 6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span><Icon name={icon} /></span>
    </span>
  )
}

export function CareerProfile({ progress, architect, dialogRef, onClose, onReset }: { progress: CareerProgress; architect: boolean; dialogRef: Ref<HTMLDialogElement>; onClose: () => void; onReset: () => boolean }) {
  const routes = establishedRoutes(progress)
  const [selected, setSelected] = useState(0)
  const confirmation = useRef<HTMLDialogElement>(null)
  const [resetFailed, setResetFailed] = useState(false)
  const certification = certifications[selected]
  const associatedMission = campaign.find(mission => mission.career.certificationId === certification.id)!
  return (
    <>
    <dialog ref={dialogRef} className="about-dialog career-dialog" aria-labelledby="career-title" onClose={onClose} onPointerDown={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}>
      <header className="about-header"><div><p>AVIATION CAREER</p><h2 id="career-title">Achievement Wall</h2></div><form method="dialog"><button className="about-dismiss" aria-label="Close Achievement Wall"><Icon name="close" /></button></form></header>
      <div className="about-body" role="region" aria-label="Achievement Wall content" tabIndex={0}>
        <div className="career-lead"><Insignia icon={progress.rankMilestone === campaign.length ? 'wings' : 'rank'} /><div><span>Current rank</span><h3>{ranks[progress.rankMilestone]}</h3><p>{progress.completedMissionIds.length} of {campaign.length} missions completed</p></div></div>
        <section className="about-section"><h3><Icon name="scale" />STEM Skill Certifications</h3>
          <div className="certification-grid">{certifications.map((cert, index) => {
            const earned = progress.certificationIds.includes(cert.id)
            return <button type="button" className={`certification-card${earned ? ' certified' : ''}`} data-badge={cert.id} key={cert.id}
              aria-pressed={selected === index} aria-controls="certification-detail" onClick={() => setSelected(index)}>
              <Insignia icon={cert.icon} /><span><strong>{cert.title}</strong><small>{!earned && <Icon name="lock" />}{earned ? 'Earned' : 'Locked'}</small></span>
            </button>
          })}</div>
          <div className="cert-detail" id="certification-detail" aria-live="polite">
            <h4>{certification.title}</h4>
            <dl><div><dt>Mission</dt><dd>{associatedMission.number} · {associatedMission.title}</dd></div>
              <div><dt>Competency</dt><dd>{certification.competency}</dd></div>
              <div><dt>STEM topic</dt><dd>{certification.topic}</dd></div>
              <div><dt>Unlock condition</dt><dd>Complete the official delivery for {associatedMission.title}.</dd></div></dl>
          </div>
          <p className="cert-disclaimer">These badges recognise in-game achievements. They confer no real-world aviation qualifications.</p>
        </section>
        <section className="about-section diy-badge" data-badge="mission-architect">
          <Insignia icon="puzzle" className={architect ? 'architect-earned' : ''} />
          <div><h3>Mission Architect</h3><p><strong>Creative STEM Certification · {architect ? 'Earned' : 'Locked'}</strong></p>
            <p>Design an original mission with a loading constraint, save your reference solution, review the explanation, pass the test flight and save the mission.</p>
            <p>Bloom’s Taxonomy · Create</p></div>
        </section>
        <section className="about-section"><h3><Icon name="rank" />Career Milestones</h3>
          <ol className="rank-milestones">{ranks.map((rank, index) => <li key={rank} className={index === progress.rankMilestone ? 'current-rank' : ''}>
            <Icon name={index > progress.rankMilestone ? 'lock' : index === progress.rankMilestone ? 'rank' : 'check'} /><span>{rank}</span><small>{index > progress.rankMilestone ? 'Locked' : index === progress.rankMilestone ? 'Current' : 'Reached'}</small>
          </li>)}</ol>
        </section>
        <section className="about-section"><h3><Icon name="pin" />Established Routes</h3>
          {routes.length ? <ul>{routes.map(route => <li key={route.id}>{route.origin} → {route.destination}</li>)}</ul> : <p>Complete your first delivery to establish a route.</p>}
        </section>
        <section className="about-section"><h3><Icon name="check" />Completed Missions</h3>
          {routes.length ? <ul>{routes.map(route => <li key={route.id}>{route.title} · Best corridor time {(progress.bestFlights[route.id].corridorFraction * 100).toFixed(1)}%</li>)}</ul> : <p>Your completed deliveries will appear here.</p>}
        </section>
      </div>
      <footer className="about-footer career-footer">
        <button type="button" className="secondary-button reset-progress-button" aria-haspopup="dialog" onClick={() => { setResetFailed(false); confirmation.current?.showModal() }}>Reset Progress</button>
        <form method="dialog"><button className="secondary-button">Back to Game</button></form>
      </footer>
    </dialog>
    <dialog ref={confirmation} className="about-dialog reset-progress-dialog" role="alertdialog" aria-labelledby="reset-progress-title" aria-describedby="reset-progress-description">
      <header className="about-header"><h2 id="reset-progress-title">Reset your campaign progress?</h2></header>
      <div className="about-body">
        <p id="reset-progress-description">This will reset official deliveries, mission records, career ranks, route unlocks and the six campaign badges. Your DIY drafts, created and received missions, Mission Architect badge and audio settings will be kept. Complete Mission 03 again to create a new DIY mission.</p>
        {resetFailed && <p className="practice-warning" role="alert">Progress could not be reset. Check that your browser allows local storage and try again.</p>}
      </div>
      <footer className="about-footer">
        <form method="dialog"><button className="secondary-button" autoFocus>Cancel</button></form>
        <button type="button" className="secondary-button reset-progress-button" onClick={() => { if (!onReset()) setResetFailed(true) }}>Reset Progress</button>
      </footer>
    </dialog>
    </>
  )
}
