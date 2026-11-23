import type { Ref } from 'react'
import { Icon } from './art'
import { learningAudience, learningOutcomeIntro, learningOutcomes } from './learningOutcomes'

const attributes = [
  { icon: 'target', title: 'Goal', description: 'Complete safe cargo delivery missions.' },
  { icon: 'book', title: 'Rules', description: 'Follow cargo capacity, weight, balance, and flight safety requirements.' },
  { icon: 'rank', title: 'Rewards', description: 'Earn STEM skill certifications, advance through aviation career ranks, and establish new transport routes by completing successful delivery missions.' },
  { icon: 'flag', title: 'Challenges', description: 'Solve increasingly complex cargo-loading and flight-control tasks.' },
] as const

const framework = [
  { title: 'Mechanics', description: 'Cargo placement, centre-of-gravity calculation, flight controls, career milestones, and skill certifications.' },
  { title: 'Dynamics', description: 'Experimentation, strategic planning, iterative problem-solving, and expansion of the aviation network.' },
  { title: 'Aesthetics', description: 'Challenge, discovery, and the achievement of advancing an aviation career.' },
]

export function AboutButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="about-button" aria-haspopup="dialog" onClick={onClick}><Icon name="info" />About Game</button>
}

export function AboutGame({ dialogRef, onClose }: { dialogRef: Ref<HTMLDialogElement>; onClose?: () => void }) {
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="about-dialog"
      aria-labelledby="about-title"
      onPointerDown={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}
    >
      <header className="about-header">
        <div>
          <p>ABOUT THE GAME</p>
          <h2 id="about-title">Cargo Commander — The Balance Mission</h2>
        </div>
        <form method="dialog"><button className="about-dismiss" aria-label="Close About Game" autoFocus><Icon name="close" /></button></form>
      </header>
      <div className="about-body" role="region" aria-label="About Game content" tabIndex={0}>
        <div className="about-intro">
          <section className="about-section">
            <h3><Icon name="scale" />STEM Topics</h3>
            <ul>
              <li><strong>Topic 1: Centre of Gravity and Mass Distribution</strong></li>
              <li><strong>Topic 2: Aircraft Stability and Flight Control</strong></li>
            </ul>
          </section>
          <section className="about-section">
            <h3><Icon name="atom" />Branches of STEM</h3>
            <dl className="learning-support">
              <div><dt>Science — Physics</dt><dd>Understanding the relationship between mass, position, and centre of gravity.</dd></div>
              <div><dt>Engineering — Aerospace Engineering</dt><dd>Applying physical principles to aircraft loading, stability, flight control, and engineering problem-solving.</dd></div>
            </dl>
          </section>
        </div>

        <section className="about-section about-outcomes" aria-labelledby="about-outcomes-title">
          <h3 id="about-outcomes-title"><Icon name="target" />Learning Outcomes (LOs)</h3>
          <p className="outcome-subtitle">Structured using the ABCD Model</p>
          <p>{learningOutcomeIntro}</p>
          <ol className="outcome-list" role="list">
            {learningOutcomes.map(outcome => (
              <li className="outcome-card" key={outcome.id}>
                <p className="outcome-category">{outcome.id} · {outcome.category}</p>
                <h4>{outcome.title}</h4>
                <p>{outcome.statement}</p>
                <details className="outcome-breakdown">
                  <summary aria-label={`View ABCD Breakdown for ${outcome.id}`}>View ABCD Breakdown</summary>
                  <dl>
                    <div><dt>A — Audience</dt><dd>{learningAudience}</dd></div>
                    <div><dt>B — Behaviour</dt><dd>{outcome.behaviour}</dd></div>
                    <div><dt>C — Condition</dt><dd>{outcome.condition}</dd></div>
                    <div><dt>D — Degree</dt><dd>{outcome.degree}</dd></div>
                  </dl>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-section">
          <h3><Icon name="plane" />Game Description</h3>
          <p>Cargo Commander — The Balance Mission is an interactive STEM educational game in which players become trainee aircraft loadmasters responsible for delivering cargo across different islands. Players arrange cargo of different masses, monitor the aircraft's centre of gravity, and conduct simulated flight tests. Through experimentation, feedback, and increasingly challenging missions, players develop an understanding of physics and its application in aerospace engineering.</p>
        </section>

        <section className="about-section">
          <h3><Icon name="crate" />STEM Activities</h3>
          <ul>
            <li>Arrange cargo of different masses to achieve a specified centre-of-gravity range.</li>
            <li>Conduct simulated flight tests to investigate how cargo distribution affects aircraft stability and controllability.</li>
          </ul>
        </section>

        <section className="about-section">
          <h3><Icon name="flag" />Four Game Attributes</h3>
          <div className="about-attributes">
            {attributes.map(attribute => (
              <div className="about-attribute" key={attribute.title}>
                <span><Icon name={attribute.icon} /></span><div><h4>{attribute.title}</h4><p>{attribute.description}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h3><Icon name="tool" />MDA Framework</h3>
          <ol className="about-framework">
            {framework.map(part => <li key={part.title}><h4>{part.title}</h4><p>{part.description}</p></li>)}
          </ol>
        </section>

        <section className="about-section">
          <h3><Icon name="book" />Learning Support</h3>
          <dl className="learning-support">
            <div><dt>Interactive Tutorial</dt><dd>Visit the Training Centre to move real crates, compare how they affect balance, and practise the flight controls.</dd></div>
            <div><dt>Real-time Feedback</dt><dd>Watch the balance point move and get a short flying tip when you need it.</dd></div>
            <div><dt>Progressive Hints</dt><dd>Ask for a hint at any time. After some time experimenting, your instructor may suggest a next step.</dd></div>
            <div><dt>Step-by-step Solutions</dt><dd>See one valid load for each mission. You can open optional maths to see how the balance point was calculated.</dd></div>
            <div><dt>Retry &amp; Reflection</dt><dd>Review your flight, watch a guided flight demonstration, and try the challenge yourself.</dd></div>
          </dl>
        </section>

        <details className="about-section pedagogy-panel">
          <summary>Pedagogical Frameworks</summary>
          <dl className="learning-support">
            <div>
              <dt>5E Learning Model</dt>
              <dd>
                <p className="inquiry-sequence">Engage → Explore → Explain → Elaborate → Evaluate</p>
                <p>Island delivery briefs set the challenge. Players try different cargo positions, use instructor feedback to explain the changes, apply what they learn when slots close or gusts strengthen, and review their flight before trying again.</p>
              </dd>
            </div>
            <div><dt>Scenario-Based Learning</dt><dd>As the loadmaster delivering supplies to Mercy Cay, the player must find a powered slot for the clinic's medical case while keeping the aircraft balanced.</dd></div>
            <div><dt>Constructive Alignment</dt><dd>Each outcome connects to an action and feedback. For example, players practise safe loading with the live balance gauge and check whether the required cargo, payload, slots, and CG pass inspection.</dd></div>
          </dl>
        </details>

        <p className="simulation-note"><Icon name="info" />This game uses simplified educational models to demonstrate centre of gravity and aircraft stability. It is not intended for real-world aircraft loading or flight training.</p>
      </div>
      <footer className="about-footer"><form method="dialog"><button className="secondary-button">Back to Game</button></form></footer>
    </dialog>
  )
}
