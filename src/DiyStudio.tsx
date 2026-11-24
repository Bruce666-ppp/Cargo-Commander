import { useEffect, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Icon } from './art'
import { gameAudio } from './audio'
import { CargoLoading } from './CargoLoading'
import { authorFlightPassed, changeDiyConfig, checkDiyConfig, configIssue, decodeDiyMission, encodeDiyMission, makeDiyMission, newDiyDraft, qualifiesForArchitect, setDiyReference } from './diy'
import type { DiyConfig, DiyDraft, DiyStore, SavedDiy } from './diy'
import { CreatorNote, MissionEditor, MissionFacts, ScientificExplanation, WorkshopHeading } from './DiyWorkshop'
import { FlightReview } from './FlightResults'
import { FlightScreen } from './FlightScreen'
import { QuickFlight } from './QuickFlight'
import { DeliveryOptions } from './DeliveryOptions'
import { creativeReward, money } from './rewards'
import { newHintClock } from './learning'
import { FlightDemonstration, LearningDialog, WorkedSolution } from './LearningSupport'
import { emptyLoadingState, flightConfigurationAllowed, inspectLoading, prepareFlightConfiguration } from './mission'
import type { FlightConfiguration, Hold, LoadingState } from './mission'
import type { FlightReport } from './flight'
import { TutorialSpotlight } from './TutorialSpotlight'
import type { TutorialGuide } from './TutorialSpotlight'

export const sharedToken = (hash: string) => hash.startsWith('#mission=') ? hash.slice(9) : null
export type UpdateDiyStore = (update: (current: DiyStore) => DiyStore) => string
type View = 'studio' | 'library' | 'received' | 'create' | 'solve' | 'explain' | 'test' | 'play' | 'flight' | 'review'
type StudioProps = {
  headingRef: Ref<HTMLHeadingElement>; blocked: boolean; initialToken?: string | null
  store: DiyStore; storageError: string; onStoreChange: UpdateDiyStore
  onExit: () => void; onTraining?: () => void; onCompleteTraining?: () => void; trainingStage?: string
}

const closeDialog = <form method="dialog"><button className="secondary-button">Close</button></form>
const practiceDraft = (): DiyDraft => ({
  ...newDiyDraft(), config: { name: 'Training Airfield Supplies', cargo: [{ type: 0, mass: 10 }], blocked: [], cg: [440, 460], wind: 0 },
})

function SharePanel({ draft, onClose }: { draft: DiyDraft; onClose: () => void }) {
  const encoded = encodeDiyMission(draft)
  const address = new URL(window.location.pathname, window.location.origin)
  if (encoded) address.hash = `mission=${encoded}`
  const [notice, setNotice] = useState('')
  const field = useRef<HTMLInputElement>(null)
  async function copy() {
    try {
      await navigator.clipboard.writeText(address.href)
      setNotice('Mission link copied.')
    } catch {
      field.current?.focus()
      field.current?.select()
      setNotice('Automatic copying is unavailable. Copy the selected link using your browser.')
    }
  }
  return <LearningDialog id="diy-share-title" title="Share Mission Link" label="DIY MISSION STUDIO" onClose={onClose}
    actions={<>{closeDialog}{encoded && <button className="start-button deck-primary" onClick={copy}>Copy Mission Link</button>}</>}>
    <h3>{draft.config.name}</h3>
    {encoded ? <><p>Challenge your friends to complete your original cargo mission!</p>
      <label className="diy-link">Mission link<input ref={field} value={address.href} readOnly /></label>
      <p>The link includes the mission settings, reference solution and any Creator’s Note you added.</p><p role="status">{notice}</p>
    </> : <p>This mission cannot be shared. Check that it is validated and that its note and name fit within the link limit.</p>}
  </LearningDialog>
}

export function DiyStudio({ headingRef, blocked, initialToken = null, store, storageError, onStoreChange, onExit, onTraining, onCompleteTraining, trainingStage }: StudioProps) {
  const training = Boolean(onCompleteTraining)
  const incoming = useMemo(() => initialToken === null ? null : decodeDiyMission(initialToken), [initialToken])
  const [view, setView] = useState<View>(training ? 'create' : initialToken !== null ? 'received' : 'studio')
  const [draft, setDraft] = useState<DiyDraft>(training ? practiceDraft : newDiyDraft)
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState<LoadingState>(() => emptyLoadingState(makeDiyMission(practiceDraft().config)))
  const [flight, setFlight] = useState<{ configuration: FlightConfiguration; author: boolean; quick: boolean } | null>(null)
  const [report, setReport] = useState<FlightReport | null>(null)
  const [previous, setPrevious] = useState<FlightReport | null>(null)
  const [tries, setTries] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [share, setShare] = useState<DiyDraft | null>(null)
  const [deleteMission, setDeleteMission] = useState<SavedDiy | null>(null)
  const [brief, setBrief] = useState(false)
  const [showReference, setShowReference] = useState(false)
  const [demo, setDemo] = useState<FlightConfiguration | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [trainingConfigStep, setTrainingConfigStep] = useState(0)
  const hintClock = useRef(newHintClock())
  const handledFlight = useRef<FlightReport | null>(null)
  const check = useMemo(() => checkDiyConfig(draft.config), [draft.config])
  const mission = useMemo(() => check.status === 'solvable' ? training ? makeDiyMission(draft.config, true) : check.mission : null, [check, draft.config, training])

  useEffect(() => {
    if (view !== 'flight') gameAudio.setMusic('planning')
  }, [view])

  function go(next: View) {
    setView(next)
    setError('')
    setNotice('')
    window.scrollTo(0, 0)
  }

  function beginEdit(saved?: SavedDiy) {
    if (saved && saved.source !== 'created') return
    setDraft(saved ?? newDiyDraft())
    setId(saved?.id ?? null)
    setReport(null)
    setPrevious(null)
    setTries(0)
    go('create')
  }

  function play(saved: DiyDraft) {
    const checked = checkDiyConfig(saved.config)
    if (!saved.validated || !saved.reference || checked.status !== 'solvable') return
    setDraft(saved)
    setLoading(emptyLoadingState(checked.mission))
    hintClock.current = newHintClock()
    setReport(null)
    setPrevious(null)
    setTries(0)
    go('play')
  }

  function enterSolve() {
    if (!mission) return
    setLoading({ ...emptyLoadingState(mission), hold: draft.reference ?? emptyLoadingState(mission).hold })
    go('solve')
  }

  function saveReference(hold: Hold) {
    if (!mission || !inspectLoading(mission, hold).ready) return
    setDraft(setDiyReference(draft, hold))
    setReport(null)
    go('explain')
  }

  function launch(configuration: FlightConfiguration, author: boolean, quick = false) {
    if (!mission || !flightConfigurationAllowed(mission, configuration, 'delivery')) return
    setFlight({ configuration, author, quick })
    go('flight')
  }

  function testMission(quick = false) {
    if (!mission || !draft.reference || !draft.confirmed) return
    const configuration = prepareFlightConfiguration(mission, draft.reference)
    if (configuration) launch(configuration, true, quick)
  }

  function finishFlight(result: FlightReport) {
    if (handledFlight.current === result || !mission || !flight) return
    handledFlight.current = result
    gameAudio.setEngine(null)
    setPrevious(report)
    setReport(result)
    if (flight.author && authorFlightPassed(draft, mission, result)) {
      setDraft(current => ({ ...current, validated: true }))
      gameAudio.play('success')
      go('test')
    } else {
      if (!result.passed) { setTries(count => count + 1); gameAudio.play('failure') }
      else gameAudio.play('success')
      go('review')
    }
  }

  function saveCreated(validated: boolean) {
    if (training) return
    const issue = configIssue(draft.config, !validated)
    if (issue) { setError(issue); return }
    if (validated && (!draft.confirmed || !draft.validated || !encodeDiyMission(draft))) {
      setError('Finish the reference solution, explanation and test flight before saving a validated mission.')
      return
    }
    const saved: SavedDiy = {
      ...draft, id: id ?? crypto.randomUUID(), source: 'created', validated,
      config: { ...draft.config, name: draft.config.name.trim() },
    }
    const earned = validated && qualifiesForArchitect(saved)
    const failure = onStoreChange(current => ({
      ...current, architect: current.architect || earned,
      missions: [saved, ...current.missions.filter(existing => existing.id !== saved.id)],
    }))
    if (failure) { setError(failure); return }
    const firstBadge = earned && !store.architect
    go('library')
    setNotice(firstBadge ? `Mission Architect earned · ${money(creativeReward)} creative reward!` : validated ? 'Validated mission saved.' : 'Draft saved.')
    if (firstBadge) gameAudio.completeMission(true)
  }

  function saveReceived() {
    if (!incoming || initialToken === null) return
    const token = encodeDiyMission(incoming)
    const saved: SavedDiy = { ...incoming, id: crypto.randomUUID(), source: 'received' }
    const failure = onStoreChange(current => current.missions.some(entry => entry.source === 'received' && encodeDiyMission(entry) === token) ? current :
      { ...current, missions: [saved, ...current.missions] })
    if (failure) setError(failure)
    else { setError(''); setNotice('Challenge saved to My Missions.') }
  }

  function removeMission() {
    if (!deleteMission) return
    const failure = onStoreChange(current => ({ ...current, missions: current.missions.filter(entry => entry.id !== deleteMission.id) }))
    if (failure) setError(failure)
    else setNotice('Mission deleted.')
    setDeleteMission(null)
  }

  function backFromFlight() { go(flight?.author ? 'test' : 'play') }
  const exit = training ? () => setConfirmExit(true) : onExit
  const library = () => go('library')
  const studio = () => go('studio')
  const authorBack = () => training ? exit() : id ? library() : studio()
  const inFlight = view === 'flight' || view === 'review'
  const solveValid = view === 'solve' && mission ? inspectLoading(mission, loading.hold).ready : false
  const tutorialTarget = (name: string) => `[data-tutorial="${name}"]`

  let guide: TutorialGuide | undefined
  if (training && view === 'create') {
    if (trainingConfigStep === 0) guide = {
      target: tutorialTarget('diy-mass'), title: 'Choose a cargo mass', message: 'Change the crate mass to a value from 5 to 20 kg.',
      action: draft.config.cargo[0].mass >= 5 && draft.config.cargo[0].mass <= 20 && draft.config.cargo[0].mass !== 10
        ? { label: 'Confirm Cargo Mass', run: () => setTrainingConfigStep(1) } : undefined,
    }
    else if (!draft.config.blocked.includes(6)) guide = {
      target: tutorialTarget('diy-slot-6'), title: 'Add a constraint', message: 'Block slot 6 so a player must keep that position empty.',
    }
    else guide = { target: tutorialTarget('diy-solve'), title: 'Check your design', message: 'The loading check found a valid arrangement. Continue to make your own.' }
  }
  if (training && view === 'solve') guide = solveValid
    ? { target: tutorialTarget('save-reference'), title: 'Save your reference solution', message: 'The checklist is green. Save the arrangement you made.' }
    : { target: tutorialTarget('loading-practice'), title: 'Load the crate', message: 'Select the crate, then try a slot near the centre of the aircraft.' }
  if (training && view === 'explain') guide = {
    target: '.diy-explanation', title: 'Review your explanation', message: 'The diagram and numbers come from the cargo you loaded. Review them before confirming.',
    action: { label: 'Confirm Explanation', run: () => { setDraft(current => ({ ...current, confirmed: true })); go('test') } },
  }
  if (training && view === 'test') guide = draft.validated
    ? { target: tutorialTarget('diy-tested'), title: 'Your training mission is validated', message: 'In the full studio you can save and copy a link after testing. This exercise finishes here.',
        action: { label: 'Finish DIY Training', run: onCompleteTraining! } }
    : { target: tutorialTarget('diy-test'), title: 'Test your own mission', message: 'Start the short flight and stay in the green altitude band.' }
  if (training && view === 'flight') guide = report ? undefined : {
    target: tutorialTarget('start-flight'), title: 'Start the test flight', message: 'Choose Start Flight. Use small pitch corrections if the aircraft drifts.',
  }
  const [trainingFlightStarted, setTrainingFlightStarted] = useState(false)
  useEffect(() => { if (view !== 'flight') setTrainingFlightStarted(false) }, [view])
  if (training && trainingFlightStarted && inFlight) guide = undefined

  return <div className={training ? 'training-session diy-studio' : 'diy-studio'}>
    {view === 'studio' && <>
      <WorkshopHeading headingRef={headingRef} onBack={onExit} />
      <section className="active-mission diy-welcome">
        <span className="mission-icon"><Icon name="puzzle" /></span>
        <h2>Design a Cargo Challenge</h2>
        <p>Choose cargo and constraints, solve your own loading problem and test it before inviting another Loadmaster to try.</p>
        <p className="diy-unlock"><Icon name="atom" />STEM Challenge · Design a solvable loading problem and verify your reference solution.</p>
        <div className="diy-actions">
          <button className="start-button" onClick={() => beginEdit()}>Create Mission</button>
          <button className="secondary-button" onClick={library}>My Missions</button>
          {onTraining && <button className="secondary-button" onClick={onTraining}>DIY Training</button>}
        </div>
      </section>
    </>}
    {view === 'received' && <>
      <div className="page-heading"><div><h1 ref={headingRef} tabIndex={-1}>{incoming ? "You've received a custom mission!" : 'This mission link cannot be opened'}</h1>
        <p>{incoming ? "Can you solve another Loadmaster's challenge?" : 'The link may be incomplete, unsupported or contain an invalid cargo arrangement.'}</p></div></div>
      <section className="panel diy-card">
        {incoming && <><h2>{incoming.config.name}</h2><MissionFacts config={incoming.config} />
          <p>A reference solution and scientific explanation are available if you need help.</p>
          <div className="flight-page-actions"><button className="start-button flight-primary" onClick={() => play(incoming)}>Accept Challenge</button>
            <button className="secondary-button" onClick={saveReceived}>Save to My Missions</button>
            {onTraining && <button className="secondary-button" onClick={onTraining}>Training Centre</button>}</div>
        </>}
        <button className="secondary-button" onClick={onExit}>Return to Mission Centre</button>
      </section>
    </>}
    {view === 'library' && <>
      <div className="page-heading campaign-heading"><div><h1 ref={headingRef} tabIndex={-1}>My Missions</h1><p>Your own missions and challenges from other Loadmasters.</p></div>
        <div className="diy-actions"><button className="secondary-button" onClick={studio}>Back</button>
          <button className="start-button" onClick={() => beginEdit()}>Create Mission</button></div></div>
      {(['created', 'received'] as const).map(source => <section key={source} className="diy-library" aria-label={source === 'created' ? 'Created Missions' : 'Received Missions'}>
        <h2>{source === 'created' ? 'Created Missions' : 'Received Missions'}</h2>
        {store.missions.some(entry => entry.source === source) ? <div className="diy-library-grid">
          {store.missions.filter(entry => entry.source === source).map(saved => <article key={saved.id} className="panel diy-card">
            <p className="diy-status">{saved.source === 'received' ? 'Received challenge' : saved.validated ? 'Validated' : 'Draft · Unvalidated'}</p>
            <h3>{saved.config.name || 'Untitled draft'}</h3><MissionFacts config={saved.config} />
            <div className="diy-actions">
              {saved.source === 'created' && <button className={saved.validated ? 'secondary-button' : 'start-button'} onClick={() => beginEdit(saved)}>{saved.validated ? 'Edit' : 'Continue Editing'}</button>}
              {saved.validated && <button className="start-button" onClick={() => play(saved)}>Play</button>}
              <button className="secondary-button" disabled={!saved.validated} onClick={() => setShare(saved)}>Share</button>
              <button className="secondary-button" onClick={() => setDeleteMission(saved)}>Delete</button>
            </div>
          </article>)}
        </div> : <p>{source === 'created' ? 'Your saved missions will appear here.' : 'Open a shared link and save the challenge to find it here later.'}</p>}
      </section>)}
    </>}
    {view === 'create' && <>
      <WorkshopHeading headingRef={headingRef} stage={0} training={training} onBack={authorBack} />
      <MissionEditor config={draft.config} check={check} training={training}
        onChange={(config: DiyConfig) => { setDraft(current => changeDiyConfig(current, config)); setError('') }}
        onContinue={enterSolve} onSaveDraft={draft.validated ? undefined : () => saveCreated(false)} />
    </>}
    {(view === 'solve' || view === 'play') && mission && <>
      {view === 'solve' && <WorkshopHeading stage={1} training={training} onBack={() => go('create')} />}
      <CargoLoading mission={mission} loading={loading} setLoading={setLoading} headingRef={headingRef} blocked={blocked || brief}
        hintClock={hintClock.current} onBack={() => go(view === 'solve' ? 'create' : initialToken !== null ? 'received' : 'library')}
        onBrief={() => setBrief(true)} onFlight={(_, configuration) => launch(configuration, false)}
        onQuick={view === 'play' ? configuration => launch(configuration, false, true) : undefined}
        custom={view === 'solve' ? { onSaveReference: saveReference } : { reference: draft.reference ?? undefined, note: draft.note }} />
    </>}
    {view === 'explain' && mission && draft.reference && <>
      <WorkshopHeading headingRef={headingRef} stage={2} training={training} onBack={enterSolve} />
      <ScientificExplanation mission={mission} reference={draft.reference} />
      {!training && <CreatorNote note={draft.note} onChange={note => setDraft(current => ({
        ...current, note: Array.from(note).filter(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join(''),
      }))} />}
      {!training && <div className="flight-page-actions"><button className="start-button flight-primary" onClick={() => {
        setDraft(current => ({ ...current, confirmed: true }))
        go('test')
      }}>Confirm Explanation</button>
        {!draft.validated && <button className="secondary-button" onClick={() => saveCreated(false)}>Save Draft</button>}</div>}
    </>}
    {view === 'test' && mission && draft.reference && <>
      <WorkshopHeading headingRef={headingRef} stage={3} training={training} onBack={() => go('explain')} />
      <section className="panel diy-card" data-tutorial={draft.validated ? 'diy-tested' : undefined}>
        <h2>{draft.validated ? 'Mission Validated' : 'Test Your Mission'}</h2><h3>{mission.title}</h3>
        <MissionFacts config={draft.config} />
        <p>{draft.validated ? 'The saved reference load passed inspection and completed the test flight.' :
          'Test the reference load in Cruise before saving your challenge.'}</p>
        {report?.passed && <p className="diy-ok">{(report.corridorFraction * 100).toFixed(1)}% in the altitude corridor · {report.elapsed.toFixed(1)} s</p>}
        {!draft.validated && !training && <DeliveryOptions onAuto={() => testMission(true)} onManual={() => testMission()} testing />}
        <div className="flight-page-actions">
          {draft.validated ? !training && <button className="start-button flight-primary" onClick={() => saveCreated(true)}>Save Mission</button>
            : training && <button className="start-button flight-primary" data-tutorial="diy-test" onClick={() => testMission()}>Test Your Mission</button>}
          {!training && !draft.validated && <button className="secondary-button" onClick={() => saveCreated(false)}>Save Draft</button>}
          <button className="secondary-button" onClick={() => go('create')}>Edit Mission Settings</button>
        </div>
      </section>
      <ScientificExplanation mission={mission} reference={draft.reference} note={draft.note} />
    </>}
    {view === 'flight' && mission && flight?.quick && <QuickFlight mission={mission} configuration={flight.configuration}
      headingRef={headingRef} paused={blocked} onFinish={finishFlight} onReturn={backFromFlight} />}
    {view === 'flight' && mission && flight && !flight.quick && <div onClickCapture={event => {
      if (training && event.target instanceof Element && event.target.closest(tutorialTarget('start-flight'))) setTrainingFlightStarted(true)
    }}>
      <FlightScreen mission={mission} configuration={flight.configuration} mode="delivery" blocked={blocked || confirmExit || !!demo}
        headingRef={headingRef} onReturn={backFromFlight} onFinish={finishFlight} onDemonstration={training ? undefined : () => setDemo(flight.configuration)} />
      {training && trainingFlightStarted && <button className="secondary-button" onClick={exit}>Exit Tutorial</button>}
    </div>}
    {view === 'review' && mission && report && flight && <>
      <FlightReview mission={mission} report={report} previous={previous} headingRef={headingRef} failedAttempts={tries} custom
        onRetry={() => launch(report.configuration, flight.author, flight.quick)} onReturn={backFromFlight} onDemonstration={training ? undefined : () => setDemo(report.configuration)} />
      <div className="flight-page-actions">{flight.author ? <>
        <button className="secondary-button" onClick={enterSolve}>Return to Reference Solution</button>
        <button className="secondary-button" onClick={() => go('create')}>Edit Mission Settings</button>
      </> : <>
        <button className="secondary-button" onClick={() => setShowReference(true)}>Show Reference Solution</button>
        <button className="secondary-button" onClick={() => go(initialToken !== null ? 'received' : 'library')}>Back to Challenges</button>
      </>}{training && <button className="secondary-button" onClick={exit}>Exit Tutorial</button>}</div>
    </>}
    {(error || storageError) && !training && <p role="alert" className="practice-warning">{error || storageError}</p>}
    {notice && <p role="status" className="diy-ok">{notice}</p>}
    {share && <SharePanel draft={share} onClose={() => setShare(null)} />}
    {deleteMission && <LearningDialog id="delete-diy-title" title="Delete this mission?" label="MY MISSIONS" onClose={() => setDeleteMission(null)}
      actions={<><button className="secondary-button" onClick={() => setDeleteMission(null)}>Cancel</button><button className="secondary-button" onClick={removeMission}>Confirm Delete</button></>}>
      <p>Delete {deleteMission.config.name || 'this untitled draft'} from My Missions on this device?</p>
    </LearningDialog>}
    {brief && <LearningDialog id="diy-brief-title" title={draft.config.name} label="DIY MISSION BRIEF" actions={closeDialog} onClose={() => setBrief(false)}>
      <MissionFacts config={draft.config} /><p>Load the required cargo and check aircraft balance before proceeding.</p>
    </LearningDialog>}
    {demo && mission && <FlightDemonstration mission={mission} configuration={demo} onClose={() => setDemo(null)} />}
    {showReference && mission && draft.reference && <WorkedSolution mission={mission} reference={draft.reference} note={draft.note} onClose={() => setShowReference(false)} />}
    {training && guide && <TutorialSpotlight step={8} stageLabel={trainingStage ?? 'DIY Mission Studio Training'} guide={guide} confirming={confirmExit}
      onConfirm={() => setConfirmExit(true)} onStay={() => setConfirmExit(false)} onExit={onExit} />}
    {training && !guide && confirmExit && <LearningDialog id="diy-exit-training" label="FLIGHT SCHOOL" title="Exit Tutorial?" onClose={() => setConfirmExit(false)}
      actions={<>{closeDialog}<button className="start-button" onClick={onExit}>Exit Tutorial</button></>}>
      <p>This training flight is temporary.</p>
    </LearningDialog>}
  </div>
}
