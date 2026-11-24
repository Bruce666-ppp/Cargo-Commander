import type { Ref } from 'react'
import { AboutButton } from './AboutGame'
import { SoundSettings } from './SoundSettings'
import { CargoAircraft, HomeFlightScene, Icon } from './art'
import { LearningOutcomes } from './OutcomeCards'

const steps = [
  { icon: 'crate', title: 'Load Cargo', description: 'Arrange cargo inside the aircraft.' },
  { icon: 'scale', title: 'Check Balance', description: 'Keep the centre of gravity within the target range.' },
  { icon: 'plane', title: 'Test Flight', description: 'Explore aircraft stability and control.' },
  { icon: 'rank', title: 'Earn Certification', description: 'Earn skill badges, advance your career, and establish new routes.' },
] as const

const overview = ['Arrange cargo.', 'Monitor aircraft balance.', 'Test flight stability.', 'Complete deliveries.', 'Design and share original challenges.']
type HomePageProps = { headingRef: Ref<HTMLHeadingElement>; onStart: () => void; onAbout: () => void }

export function HomePage({ headingRef, onStart, onAbout }: HomePageProps) {
  return (
    <main className="home-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <header className="home-top">
          <span className="stem-badge"><Icon name="atom" />STEM Game</span>
          <div className="home-controls"><SoundSettings /><AboutButton onClick={onAbout} /></div>
        </header>
        <div className="hero-copy">
          <h1 id="home-title" ref={headingRef} tabIndex={-1}>Cargo <span>Commander</span></h1>
          <p className="hero-subtitle">The Balance Mission</p>
          <p className="hero-tagline">Balance cargo · Verify flights · Develop islands</p>
          <button type="button" className="start-button home-start" onClick={onStart}><Icon name="plane" />Start Game</button>
        </div>
        <HomeFlightScene />
      </section>

      <LearningOutcomes home />

      <section className="gameplay-loop" aria-labelledby="loop-heading">
        <h2 id="loop-heading">Gameplay Loop</h2>
        <ol className="gameplay-steps">
          {steps.map(step => (
            <li key={step.title}>
              <span className={`step-icon step-${step.icon}`}><Icon name={step.icon} /></span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="education-grid" aria-label="STEM learning at a glance">
        <article className="panel education-card education-topics">
          <h2><Icon name="scale" />STEM Topics</h2>
          <div className="education-body">
            <div className="education-detail">
              <h3>Centre of Gravity and Mass Distribution</h3>
              <p>Explore how cargo mass and position influence aircraft balance.</p>
            </div>
            <div className="education-detail">
              <h3>Aircraft Stability and Flight Control</h3>
              <p>Investigate how balance affects aircraft stability and controllability.</p>
            </div>
          </div>
        </article>
        <article className="panel education-card education-branches">
          <h2><Icon name="atom" />Branches of STEM</h2>
          <div className="education-body">
            <div className="education-detail branch-detail">
              <span className="branch-icon"><Icon name="atom" /></span>
              <div><h3>Science — Physics</h3><p>Explore mass distribution and centre of gravity.</p></div>
            </div>
            <div className="education-detail branch-detail">
              <span className="branch-icon"><Icon name="tool" /></span>
              <div><h3>Engineering — Aerospace Engineering</h3><p>Apply balance principles to aircraft stability and flight control.</p></div>
            </div>
          </div>
        </article>
        <article className="panel education-card education-overview">
          <h2><Icon name="plane" />Game Overview</h2>
          <div className="education-body">
            <p>Become a trainee loadmaster and complete cargo delivery missions.</p>
            <div className="overview-preview" aria-hidden="true">
              <div className="overview-aircraft">
                <CargoAircraft />
                <span className="overview-hold"><i /><i /><i /><i /><i /><i /></span>
              </div>
            </div>
            <ul className="education-checklist">
              {overview.map(item => <li key={item}><Icon name="check" />{item}</li>)}
            </ul>
          </div>
        </article>
      </section>
    </main>
  )
}
