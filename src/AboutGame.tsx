import type { Ref } from 'react'
import { Icon } from './art'
import { LearningOutcomes } from './OutcomeCards'

const attributes = [
  { icon: 'target', title: 'Goal', description: 'Apply STEM knowledge to deliver cargo, develop the islands and design original missions.' },
  { icon: 'book', title: 'Rules', description: 'Follow cargo, balance, flight safety and mission-specific engineering requirements.' },
  { icon: 'rank', title: 'Rewards', description: 'Earn Delivery Income, STEM Bonuses, island development, routes, career ranks, Airline Growth milestones and skill certifications.' },
  { icon: 'flag', title: 'Challenges', description: 'Use scientific reasoning to meet engineering constraints, complete deliveries and build original missions.' },
] as const

const framework = [
  { title: 'Mechanics', description: 'Cargo placement, physical simulation, scientific decisions, verification, income, island development and mission creation.' },
  { title: 'Dynamics', description: 'Experiment, refine a solution using feedback, develop an island district or challenge a peer.' },
  { title: 'Aesthetics', description: 'Discovery, accomplishment, creativity and the satisfaction of contributing to a growing island network.' },
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

        <LearningOutcomes />

        <section className="about-section">
          <h3><Icon name="plane" />Game Description</h3>
          <p>Plan six safe deliveries to connect seven islands, starting at Harbor Base. Solve an engineering problem in each hold and check its centre of gravity. Choose Auto Delivery to let the aircraft fly your load, or Manual Delivery to control it yourself. Both use the same safety checks and earn the same rewards. Each first delivery develops a district on a newly connected island. Optional STEM activities earn additional income.</p>
          <p className="about-diy-copy">DIY Mission Studio is available from the Mission Centre. Create an original mission, build a reference load, verify it and share the challenge with a peer.</p>
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
            <div><dt>Training Centre</dt><dd>Try a short beginner delivery, replay Complete Training or open an individual module such as the temporary DIY exercise.</dd></div>
            <div><dt>Real-time Feedback</dt><dd>Watch the balance point move and get a short flying tip when you need it.</dd></div>
            <div><dt>Progressive Hints</dt><dd>Ask for a hint at any time. After some time experimenting, your instructor may suggest a next step.</dd></div>
            <div><dt>Step-by-step Solutions</dt><dd>See one valid load for each mission. You can open optional maths to see how the balance point was calculated.</dd></div>
            <div><dt>Creative Learning Support</dt><dd>Review a scientific explanation generated from your reference solution. In a shared challenge, open the creator’s reference solution when you need it.</dd></div>
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
                <p>Island development goals set the challenge. Players explore cargo experiments, explain changes using feedback, apply ideas to new missions and evaluate results through loading checks, flights and optional STEM activities.</p>
              </dd>
            </div>
            <div><dt>Scenario-Based Learning</dt><dd>At Mercy Cay, the medical case needs a powered slot and a safe balance. Successful delivery supports the island’s fictional medical campus.</dd></div>
            <div><dt>Constructive Alignment</dt><dd>For LO5, design a mission, submit a reference load, pass the loading and flight checks, then save the mission. The saved design shows task performance. Explaining the reasoning independently calls for separate evidence.</dd></div>
            <div><dt>Creative Learning · Bloom’s Create</dt><dd>Try ideas, refine an original challenge and share it for a peer to solve. The saved mission is an artefact of the design process. Comparing alternative solutions offers an opportunity for peer learning.</dd></div>
            <div><dt>Bloom’s Taxonomy</dt><dd>Recall cargo readings, explain balance, apply loading checks, analyse flight data, evaluate strategies and create an original mission in DIY Mission Studio.</dd></div>
          </dl>
        </details>

        <p className="simulation-note"><Icon name="info" />This game uses simplified educational models to demonstrate centre of gravity and aircraft stability. It is not intended for real-world aircraft loading or flight training.</p>
      </div>
      <footer className="about-footer"><form method="dialog"><button className="secondary-button">Back to Game</button></form></footer>
    </dialog>
  )
}
