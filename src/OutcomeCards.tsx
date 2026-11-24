import { Icon } from './art'
import { learningOutcomes } from './learningOutcomes'

export function LearningOutcomes({ home = false }: { home?: boolean }) {
  const id = home ? 'home-outcomes-title' : 'about-outcomes-title'
  const Heading = home ? 'h2' : 'h3'
  const Title = home ? 'h3' : 'h4'
  return <section className={home ? 'panel home-outcomes' : 'about-section about-outcomes'} aria-labelledby={id}>
    <Heading id={id}><Icon name="target" /> Learning Outcomes (ABCD Model)</Heading>
    <ul className="abcd-key" aria-label="ABCD model key">
      {learningOutcomes[0].parts.map(({ kind, name }) => <li key={kind} className={`abcd-${kind}`}>{kind} · {name}</li>)}
    </ul>
    <ol className="outcome-list" role="list">
      {learningOutcomes.map(outcome => <li className="outcome-card" key={outcome.id}>
        <p className="outcome-category">{outcome.id} · {outcome.category}{outcome.id === 'LO5' && ' · Bloom’s Create'}</p>
        <Title>{outcome.title}</Title>
        <p className="abcd-statement">{outcome.parts.map(({ kind, text }) => <span key={kind} className={`abcd-${kind}`}><b aria-hidden="true">{kind}</b>{text}{' '}</span>)}</p>
      </li>)}
    </ol>
  </section>
}
