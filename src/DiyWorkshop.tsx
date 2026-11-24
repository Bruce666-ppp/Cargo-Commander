import type { CSSProperties, Ref } from 'react'
import { CargoAircraft, Icon } from './art'
import { cargoTypes, diyCgLimits, diyNameLimit, diyNoteLimit, diyPayloadLimit, diySlotCount, flightConditions } from './diy'
import type { DiyCheck, DiyConfig } from './diy'
import { WorkedHold } from './LearningSupport'
import { ExploreMaths } from './LoadingInstruments'
import { placementRule, workedSolution } from './learning'
import { aircraftPercent, formatCg, formatCgRange, getCargo, inspectLoading, islandSupplyRun } from './mission'
import type { Hold, Mission } from './mission'

const cgOptions = Array.from({ length: diyCgLimits[1] - diyCgLimits[0] + 1 }, (_, index) => diyCgLimits[0] + index)
const metres = (value: number) => (value / 100).toFixed(2)
export const diyStages = ['Create', 'Solve', 'Explain', 'Test & Save'] as const

export function WorkshopHeading({ headingRef, stage, training, onBack }: {
  headingRef?: Ref<HTMLHeadingElement>; stage?: number; training?: boolean; onBack: () => void
}) {
  return <>
    <div className="page-heading campaign-heading">
      <div><h1 ref={headingRef} tabIndex={-1}>DIY Mission Studio</h1>
        <p>{training ? 'Temporary training exercise' : 'Design, solve and test your own cargo mission.'}</p>
      </div>
      <button type="button" className="secondary-button" onClick={onBack}>Back</button>
    </div>
    {stage !== undefined && <ol className="diy-steps" aria-label="DIY workflow">{diyStages.map((name, index) =>
      <li aria-current={stage === index ? 'step' : undefined} key={name}><span>{index + 1}</span>{name}</li>)}</ol>}
  </>
}

export function MissionFacts({ config }: { config: DiyConfig }) {
  const total = config.cargo.reduce((sum, crate) => sum + crate.mass, 0)
  return <>
    <dl className="brief-limits diy-facts">
      <div><dt>Cargo</dt><dd>{config.cargo.length} {config.cargo.length === 1 ? 'crate' : 'crates'} · {total} / {diyPayloadLimit} kg</dd></div>
      <div><dt>Available slots</dt><dd>{diySlotCount - config.blocked.length} of {diySlotCount}</dd></div>
      <div><dt>Target CG</dt><dd>{metres(config.cg[0])}–{metres(config.cg[1])} m</dd></div>
      <div><dt>Flight condition</dt><dd>{flightConditions[config.wind]}</dd></div>
    </dl>
    {config.blocked.length > 0 && <p>Blocked slots {config.blocked.join(', ')}.</p>}
    {config.cargo.some(crate => cargoTypes[crate.type].id === 'medical') && <p>Medical cases use powered slots 3 or 4.</p>}
  </>
}

export function MissionEditor({ config, check, onChange, onContinue, onSaveDraft, training }: {
  config: DiyConfig; check: DiyCheck; onChange: (config: DiyConfig) => void; onContinue: () => void; onSaveDraft?: () => void; training?: boolean
}) {
  const updateCargo = (index: number, crate: DiyConfig['cargo'][number]) =>
    onChange({ ...config, cargo: config.cargo.map((item, number) => number === index ? crate : item) })
  const toggleSlot = (slot: number) => onChange({
    ...config, blocked: config.blocked.includes(slot) ? config.blocked.filter(item => item !== slot) :
      [...config.blocked, slot].sort((a, b) => a - b),
  })
  const position = (arm: number) => aircraftPercent(islandSupplyRun, arm)
  return <div className="diy-editor">
    <section className="panel diy-card">
      <h2>Create Your Mission</h2>
      <p>Start with two crates. Change a mass, add cargo or block a slot to make the challenge your own.</p>
      <label>Mission name<input maxLength={diyNameLimit} placeholder="e.g. Harbour Resupply" value={config.name}
        onChange={event => onChange({ ...config, name: event.currentTarget.value })} /></label>
      <h3>Required Cargo</h3>
      <ul className="diy-cargo">
        {config.cargo.map((crate, index) => <li key={index}>
          <label>Cargo {index + 1}<select value={crate.type}
            onChange={event => updateCargo(index, { ...crate, type: Number(event.currentTarget.value) })}>
            {cargoTypes.map(({ name, id }, type) => <option key={id} value={type}>{name}</option>)}
          </select></label>
          <label>Mass (kg)<input type="number" min={1} max={50} step={1} value={crate.mass || ''}
            aria-label={`Cargo ${index + 1} mass (kg)`} data-tutorial={index === 0 ? 'diy-mass' : undefined}
            onChange={event => updateCargo(index, { ...crate, mass: Number(event.currentTarget.value) })} /></label>
          <button type="button" className="secondary-button diy-remove" aria-label={`Remove cargo ${index + 1}`} disabled={config.cargo.length === 1}
            onClick={() => onChange({ ...config, cargo: config.cargo.filter((_, row) => row !== index) })}><Icon name="close" /></button>
        </li>)}
      </ul>
      <button className="secondary-button" disabled={config.cargo.length >= diySlotCount - config.blocked.length}
        onClick={() => onChange({ ...config, cargo: [...config.cargo, { type: 3, mass: 10 }] })}>Add Cargo</button>
    </section>
    <section className="panel diy-card">
      <h2>Aircraft Settings</h2>
      <p>Select slots to block or reopen. Medical cases fit powered slots 3 and 4.</p>
      <div className="hangar-floor diy-slot-diagram"><div className="orientation" aria-hidden="true"><span>NOSE</span><span>TAIL</span></div>
        <div className="aircraft-board"><CargoAircraft /><div className="diy-slot-buttons" role="group" aria-label="Aircraft cargo slots">
          {islandSupplyRun.slots.map((arm, index) => {
            const slot = index + 1
            const blocked = config.blocked.includes(slot)
            return <button type="button" key={slot} aria-label={`Slot ${slot}, ${blocked ? 'blocked' : 'available'}`}
              aria-pressed={blocked} data-tutorial={`diy-slot-${slot}`}
              className={`slot diy-slot${blocked ? ' slot-closed' : ''}`}
              style={{ left: `${position(arm)}%`, '--slot-width': `${position(1) - position(0)}%` } as CSSProperties}
              disabled={!blocked && config.blocked.length >= diySlotCount - config.cargo.length}
              onClick={() => toggleSlot(slot)}>{blocked ? <><Icon name="lock" /><span>{slot}</span></> : slot}</button>
          })}
        </div></div>
      </div>
      <details className="diy-advanced">
      <summary>Advanced settings · target CG and wind</summary>
      <div className="diy-range">
        <label>Lower CG (m)<select value={config.cg[0]} onChange={event => onChange({ ...config, cg: [Number(event.currentTarget.value), config.cg[1]] })}>
          {cgOptions.filter(value => value < config.cg[1]).map(value => <option key={value} value={value}>{metres(value)}</option>)}
        </select></label>
        <label>Upper CG (m)<select value={config.cg[1]} onChange={event => onChange({ ...config, cg: [config.cg[0], Number(event.currentTarget.value)] })}>
          {cgOptions.filter(value => value > config.cg[0]).map(value => <option key={value} value={value}>{metres(value)}</option>)}
        </select></label>
      </div>
      <label>Flight conditions<select value={config.wind} onChange={event => onChange({ ...config, wind: Number(event.currentTarget.value) })}>
        {flightConditions.map((condition, index) => <option value={index} key={condition}>{condition}</option>)}
      </select></label>
      <p className="simulation-note">60 kg and 4.40–4.60 m are limits for this educational simulation. The wind settings model simple disturbances.</p>
      </details>
    </section>
    <section className="panel diy-card diy-wide">
      <h2>Loading feasibility</h2><MissionFacts config={config} />
      <p role="status" className={check.status === 'solvable' ? 'diy-ok' : 'practice-warning'}>
        {check.status === 'solvable' ? 'Loading solution exists. A successful test flight is still required.' :
          `${check.status === 'invalid' ? 'Check your settings.' : 'No valid loading solution.'} ${check.message}`}
      </p>
      <div className="flight-page-actions">
        <button className="start-button flight-primary" data-tutorial="diy-solve" disabled={check.status !== 'solvable'} onClick={onContinue}>Continue to Solve</button>
        {!training && onSaveDraft && <button className="secondary-button" onClick={onSaveDraft}>Save Draft</button>}
      </div>
    </section>
  </div>
}

export function ScientificExplanation({ mission, reference, note }: { mission: Mission; reference: Hold; note?: string }) {
  const check = inspectLoading(mission, reference)
  return <section className="panel diy-card diy-explanation">
    <h2>Scientific Explanation</h2>
    <WorkedHold mission={mission} hold={reference} />
    <p><strong>{check.requiredLoaded} of {check.requiredTotal} required crates are aboard.</strong> Each uses one permitted slot.</p>
    <p>The cargo adds <strong>{check.cargoMass} kg</strong>, within the {mission.payloadLimit} kg payload limit.</p>
    <p>The empty aircraft starts at {mission.aircraft.emptyCg.toFixed(2)} m with a mass of {mission.aircraft.emptyMass} kg.
      Each crate adds a turning effect based on its mass and distance from the nose. Together they give a balance point of
      {' '}<strong>{formatCg(mission, check.cg)} m</strong>, inside the {formatCgRange(mission)} target range.</p>
    {mission.loadingConstraints.blockedSlots && <p>Blocked slots {mission.loadingConstraints.blockedSlots.join(', ')} remain empty.</p>}
    {Object.keys(mission.loadingConstraints.allowedSlotsByCargo ?? {}).map(id =>
      <p key={id}>{placementRule(mission, id)} This arrangement uses slot {reference.indexOf(id) + 1}.</p>)}
    <h3>One way to load the aircraft</h3>
    <p>This is one valid solution. Other players may discover different solutions that also satisfy the mission requirements.</p>
    <ol className="diy-placement">{workedSolution(mission, reference)?.slice(1).map(({ cargo, slot }) =>
      <li key={cargo}>{getCargo(mission, cargo)?.name} · {getCargo(mission, cargo)?.mass} kg → Slot {(slot ?? 0) + 1}</li>)}</ol>
    <ExploreMaths mission={mission} hold={reference} />
    {note && <div className="diy-note"><h3>Creator's Note</h3><p>{note}</p></div>}
  </section>
}

export function CreatorNote({ note, onChange }: { note: string; onChange: (note: string) => void }) {
  return <label className="panel diy-card diy-note">Creator's Note <small>Optional · {diyNoteLimit} characters</small>
    <input maxLength={diyNoteLimit} value={note} onChange={event => onChange(event.currentTarget.value)}
      placeholder="Why did you choose this cargo arrangement?" />
  </label>
}
