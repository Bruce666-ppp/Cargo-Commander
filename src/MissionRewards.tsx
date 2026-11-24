import { useEffect, useState } from 'react'
import type { Ref } from 'react'
import { Icon } from './art'
import { gameAudio } from './audio'
import { districtFor } from './districts'
import { DistrictScene } from './IslandDevelopment'
import { campaign, islandSupplyRun } from './mission'
import type { Mission } from './mission'
import { earnedGrowth, growthMilestones, money } from './rewards'
import { stemChallenge } from './stem'

export type DeliveryAward = { income: number; bonus: number; milestone?: string }
export const noAward: DeliveryAward = { income: 0, bonus: 0 }

export function AirlineGrowth({ total, developed, onDistricts }: { total: number; developed: number; onDistricts: () => void }) {
  const next = growthMilestones.find(milestone => milestone.amount > total)
  const reached = earnedGrowth(total)
  return <section className="panel growth-panel" aria-labelledby="growth-title">
    <div className="growth-earnings"><span className="panel-icon"><Icon name="flag" /></span>
      <div><h2 id="growth-title">Total Earnings</h2><strong>{money(total)}</strong></div></div>
    <div className="growth-meter"><h3>Airline Growth {reached ? `· ${reached.name}` : ''}</h3>
      <progress value={total} max={next?.amount ?? growthMilestones.at(-1)!.amount} aria-label="Earnings towards next milestone" />
      <p>{next ? `Next · ${next.name} at ${money(next.amount)}` : 'All financial milestones reached'}</p></div>
    <button className="secondary-button" onClick={onDistricts}>Island Development · {developed}/6</button>
  </section>
}

export function DevelopmentGallery({ completed, onBack }: { completed: string[]; onBack: () => void }) {
  return <>
    <div className="page-heading campaign-heading"><div><h1>Island Development</h1><p>{completed.length} of 6 districts developed across the Windward Isles.</p></div>
      <button className="secondary-button" onClick={onBack}>Back to Mission Centre</button></div>
    <div className="development-gallery">{campaign.map(mission => {
      const district = districtFor(mission)
      const built = completed.includes(mission.id)
      return <article className="panel development-card" key={mission.id}><DistrictScene district={district} developed={built} />
        <div><p className="diy-status">Mission {mission.number} · {built ? 'Developed' : 'Awaiting delivery'}</p><h2>{district.name}</h2><p>{district.story}</p></div>
      </article>
    })}</div>
  </>
}

export function MissionReward({ mission, award, first, headingRef, final = false, training = false }: {
  mission: Mission; award: DeliveryAward; first: boolean; headingRef?: Ref<HTMLHeadingElement>; final?: boolean; training?: boolean
}) {
  const district = districtFor(mission)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [elapsed, setElapsed] = useState(first && !reduced ? 0 : 4550)
  const [skipped, setSkipped] = useState(false)
  const duration = 4550
  const animating = !skipped && elapsed < duration
  const amount = award.income + award.bonus
  const count = animating ? Math.round(amount * Math.max(0, Math.min(1, (elapsed - 2450) / 1450))) : amount

  useEffect(() => {
    if (!first) return
    gameAudio.celebrateDistrict({ buildings: district.facilities.length, bonus: award.bonus > 0, final, reduced })
    return () => gameAudio.stop('achievement')
  }, [first, district, award.bonus, final, reduced])

  useEffect(() => {
    if (!first || reduced || skipped) return
    const start = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start
      setElapsed(Math.min(duration, elapsed))
      if (elapsed >= duration) window.clearInterval(timer)
    }, 45)
    return () => window.clearInterval(timer)
  }, [first, reduced, skipped])

  function skip() { setSkipped(true); gameAudio.stop('achievement') }

  return <section className="mission-reward" aria-labelledby="mission-reward-title">
    <header className="mission-reward-top"><div>
      <p className="reward-kicker">{training ? 'Training delivery · sample rewards' : `Mission ${mission.number} · ${mission.title}`}</p>
      <h1 id="mission-reward-title" ref={headingRef} tabIndex={-1}>MISSION COMPLETE!</h1>
      <p>{training ? 'Your science decision helped the training flight reach Pinehaven.' : `Delivery completed at ${mission.destination}.`}</p>
    </div>{animating && <button type="button" className="secondary-button" onClick={skip}>Skip Animation</button>}</header>
    <div className="reward-grid">
      <div className="reward-cash">
        <span className="reward-medal"><Icon name="wings" /></span>
        <dl><div><dt>Delivery Income</dt><dd>{money(award.income)}</dd></div>
          <div><dt>STEM Bonus</dt><dd>{award.bonus ? money(award.bonus) : '—'}</dd></div></dl>
        <p className="reward-kicker">Total Reward</p>
        <strong className="reward-amount" aria-hidden="true">{money(count)}</strong><span className="sr-only">{money(amount)}</span>
        {award.milestone && <p className="reward-milestone"><Icon name="rank" />Airline Growth · {award.milestone}</p>}
        {!training && !amount && <p>This route and its development are already recorded.</p>}
      </div>
      <div className="reward-district"><h2>Island Development · {district.name}</h2>
        <div className="district-comparison">
          <figure><DistrictScene district={district} developed={false} /><figcaption>Before development</figcaption></figure>
          <figure><DistrictScene district={district} developed animate={animating} />
            <figcaption>{animating ? elapsed < 900 ? 'Surveying the site' : elapsed < 3250 ? 'Building the district' : 'District opening' : 'District complete'}</figcaption></figure>
        </div><p>{district.story}</p>
      </div>
    </div>
    <div className="reward-takeaway"><Icon name="book" /><div><h2>What You Learned</h2><p>{stemChallenge(mission).takeaway}</p></div></div>
    {training && <p className="reward-training-note">These sample rewards and buildings belong to training. Your campaign and earnings are unchanged.</p>}
  </section>
}

export function TrainingReward() {
  return <MissionReward mission={islandSupplyRun} award={{ income: 400, bonus: 100 }} first training />
}
