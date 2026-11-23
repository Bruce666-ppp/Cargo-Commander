import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AboutButton, AboutGame } from './AboutGame'
import { FlightMap, Icon } from './art'
import { CargoLoading } from './CargoLoading'
import { HomePage } from './HomePage'
import { MissionBrief } from './MissionDialogs'
import { CareerProfile } from './CareerProfile'
import { FlightScreen } from './FlightScreen'
import { Arrival, CampaignComplete, DiscoveryNotice, FlightReview, MissionAccomplished } from './FlightResults'
import { SoundSettings } from './SoundSettings'
import { gameAudio } from './audio'
import { deliveryDiscovery, emptyProgress, isMissionUnlocked, networkSummary, nextAvailableMission, ranks, readProgress, recordDelivery, resetSavedProgress, writeProgress } from './career'
import type { CareerProgress, MapDiscovery } from './career'
import type { FlightReport } from './flight'
import { ExperienceDialog, FlightDemonstration } from './LearningSupport'
import { newHintClock, readExperience, saveExperience } from './learning'
import type { Experience } from './learning'
import { TrainingSession } from './TrainingSession'
import { campaign, emptyLoadingState, flightConfigurationAllowed, islandSupplyRun } from './mission'
import type { FlightConfiguration, FlightMode, Mission } from './mission'
import './style.css'
import './start-screen.css'
import './loading.css'
import './flight-ui.css'
import './sound-settings.css'
import './campaign.css'
import './learning.css'
import './spotlight.css'

function focusHeading(heading: HTMLHeadingElement | null) {
  if (!heading) return
  window.scrollTo(0, 0)
  heading.focus({ preventScroll: true })
}

function MissionCentre({ progress, discovery, replaying, onStart, onWall, onTraining, onResume, training }: {
  progress: CareerProgress; discovery: MapDiscovery | null; replaying: boolean
  onStart: (mission: Mission) => void; onWall?: () => void; onTraining?: () => void; onResume?: () => void; training?: boolean
}) {
  const available = nextAvailableMission(progress)
  const network = networkSummary(progress)
  const missionHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (replaying) missionHeading.current?.focus() }, [replaying])
  return (
    <>
      <div className="page-heading campaign-heading">
        <div><h1 ref={focusHeading} tabIndex={-1}>Mission Centre</h1><p>Pick a delivery and get your aircraft ready for departure.</p></div>
        {!training && <div className="centre-actions">
          {onResume && <button className="secondary-button" onClick={onResume}>Resume Cargo Loading</button>}
          <button className="secondary-button" onClick={onTraining}><Icon name="book" />Training Centre</button>
          <button className="secondary-button" aria-haspopup="dialog" onClick={onWall}><Icon name="rank" />Achievement Wall</button>
        </div>}
      </div>
      <div className="game-layout">
        <section className="panel map-panel" aria-labelledby="map-heading">
          <div className="panel-heading"><span className="panel-icon"><Icon name="pin" /></span><h2 id="map-heading">The Windward Isles</h2></div>
          <FlightMap progress={progress} discovery={discovery} />
          <div className="map-legend"><span><i />Available route</span><span className="established-key"><i />Established route</span><span className="airport-key"><Icon name="check" />Connected airport</span></div>
          <dl className="mission-network"><div><dt>Established Routes</dt><dd>{network.routes}</dd></div><div><dt>Airports Connected</dt><dd>{network.airports}</dd></div><div><dt>Deliveries Completed</dt><dd>{network.deliveries}</dd></div></dl>
          {discovery && <DiscoveryNotice discovery={discovery} />}
        </section>
        <section className="mission-list" aria-labelledby="missions-heading">
          <h2 id="missions-heading" ref={missionHeading} tabIndex={-1}>{replaying ? 'Replay missions' : 'Delivery missions'}</h2>
          {available && <article className="active-mission">
            <div className="mission-top"><span className="mission-icon"><Icon name="crate" /></span><span className="available"><i />Mission {available.number} · Available</span></div>
            <h3>{available.title}</h3>
            <p className="route">{available.origin} <span aria-hidden="true">→</span><span className="sr-only"> to </span> {available.destination}</p>
            <p className="mission-description">{available.objective}</p>
            <button className="start-button" aria-haspopup={training ? undefined : 'dialog'} data-tutorial="start-mission" onClick={() => onStart(available)}><Icon name="plane" />Start Mission</button>
          </article>}
          {campaign.map((mission, index) => {
            if (mission.id === available?.id) return null
            const complete = progress.completedMissionIds.includes(mission.id)
            return <article className={`locked-mission${complete ? ' completed-mission' : ''}`} key={mission.id}>
              <span className="lock-icon"><Icon name={complete ? 'check' : 'lock'} /></span>
              <div><h3><span className="mission-number">{mission.number}</span> {mission.title}</h3>
                <p>{complete ? 'Completed' : `Complete ${campaign[index - 1]?.title ?? 'the previous mission'} to unlock.`}</p>
              </div>
              {complete ? <button className="secondary-button replay-button" aria-haspopup="dialog" aria-label={`Replay ${mission.title}`} onClick={() => onStart(mission)}>Replay</button> : <span className="locked-label">Locked</span>}
            </article>
          })}
        </section>
      </div>
    </>
  )
}

function GameHeader({ rank, onHome, onAbout, onCareer, onSettings }: { rank: string; onHome: () => void; onAbout: () => void; onCareer: () => void; onSettings: (open: boolean) => void }) {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <button type="button" className="wordmark" aria-label="Cargo Commander home" onClick={onHome}><span className="brand-icon"><Icon name="plane" /></span>Cargo Commander</button>
        <div className="game-header-actions">
          <button type="button" className="player-rank" aria-haspopup="dialog" aria-label={`Achievement Wall · ${rank}`} onClick={onCareer}><Icon name="rank" /><span>{rank}</span></button>
          <SoundSettings onOpenChange={onSettings} />
          <AboutButton onClick={onAbout} />
        </div>
      </div>
    </header>
  )
}

type Screen = 'home' | 'mission' | 'loading' | 'flight' | 'review' | 'arrival' | 'accomplished' | 'campaign' | 'training'
const trainingProgress = emptyProgress()

function App({ onReset }: { onReset: () => boolean }) {
  const [mission, setMission] = useState(islandSupplyRun)
  const [briefingMission, setBriefingMission] = useState<Mission | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [experience, setExperience] = useState(readExperience)
  const [welcome, setWelcome] = useState(false)
  const about = useRef<HTMLDialogElement>(null)
  const brief = useRef<HTMLDialogElement>(null)
  const career = useRef<HTMLDialogElement>(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [progress, setProgress] = useState(readProgress)
  const progressRef = useRef(progress)
  const [loading, setLoading] = useState(() => emptyLoadingState(mission))
  const hintClock = useRef(newHintClock())
  const [draft, setDraft] = useState(false)
  const [launch, setLaunch] = useState<{ mode: FlightMode; configuration: FlightConfiguration } | null>(null)
  const [report, setReport] = useState<FlightReport | null>(null)
  const [previousReport, setPreviousReport] = useState<FlightReport | null>(null)
  const latestReport = useRef<FlightReport | null>(null)
  const handledArrival = useRef<FlightReport | null>(null)
  const [firstDelivery, setFirstDelivery] = useState(false)
  const [discovery, setDiscovery] = useState<MapDiscovery | null>(null)
  const [replaying, setReplaying] = useState(false)
  const [reportFromCompletion, setReportFromCompletion] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({})
  const [demo, setDemo] = useState<FlightConfiguration | null>(null)

  useEffect(() => {
    function unlock(event: Event) { if (event.isTrusted) gameAudio.unlock() }
    function click(event: MouseEvent) {
      if (!event.isTrusted || !(event.target instanceof Element)) return
      const control = event.target.closest('button, summary')
      if (!control || (control instanceof HTMLButtonElement && control.disabled)) return
      gameAudio.unlock()
      if (!control.hasAttribute('data-audio-custom')) gameAudio.play('click')
    }
    function visibility() { gameAudio.setVisible(!document.hidden) }
    visibility()
    document.addEventListener('pointerdown', unlock, true)
    document.addEventListener('keydown', unlock, true)
    document.addEventListener('click', click, true)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
      document.removeEventListener('click', click, true)
      document.removeEventListener('visibilitychange', visibility)
      gameAudio.setMusic(null)
      gameAudio.setEngine(null)
      gameAudio.stop()
    }
  }, [])

  useEffect(() => {
    if (screen !== 'flight') gameAudio.setMusic('planning')
    if (screen === 'accomplished' || screen === 'campaign') return () => gameAudio.stop('achievement')
  }, [screen])

  useEffect(() => {
    if (!briefingMission || !brief.current) return
    setOverlayOpen(true)
    brief.current.showModal()
    brief.current.querySelector('.about-body')?.scrollTo(0, 0)
  }, [briefingMission])

  useEffect(() => {
    if (screen !== 'mission' || !discovery) return
    const timer = window.setTimeout(() => setDiscovery(null), 4200)
    return () => window.clearTimeout(timer)
  }, [screen, discovery])

  function openDialog(dialog: HTMLDialogElement | null) {
    if (!dialog) return
    if (screen === 'flight' || screen === 'arrival') {
      gameAudio.setEngine(null)
      gameAudio.setFlightMusicPaused(true)
    }
    setOverlayOpen(true)
    dialog.showModal()
    dialog.querySelector('.about-body')?.scrollTo(0, 0)
  }

  function showBrief(selection: Mission) {
    if (isMissionUnlocked(progressRef.current, selection)) setBriefingMission(selection)
  }

  function acceptMission() {
    if (!briefingMission || !isMissionUnlocked(progressRef.current, briefingMission)) return
    brief.current?.close()
    setMission(briefingMission)
    setLoading(emptyLoadingState(briefingMission))
    hintClock.current = newHintClock()
    setDraft(true)
    latestReport.current = null
    setReport(null)
    setPreviousReport(null)
    setScreen('loading')
  }

  function launchFlight(mode: FlightMode, configuration: FlightConfiguration) {
    if (!flightConfigurationAllowed(mission, configuration, mode)) return
    setLaunch({ mode, configuration })
    setScreen('flight')
  }

  const finishFlight = useCallback((result: FlightReport) => {
    if (latestReport.current === result) return
    const arriving = result.mode === 'delivery' && result.passed && flightConfigurationAllowed(mission, result.configuration, 'delivery')
    gameAudio.setEngine(null, arriving ? .72 : .22)
    if (!result.passed) {
      gameAudio.play('failure')
      setFailedAttempts(counts => ({ ...counts, [mission.id]: (counts[mission.id] ?? 0) + 1 }))
    }
    setPreviousReport(latestReport.current)
    latestReport.current = result
    setReport(result)
    setReportFromCompletion(false)
    setScreen(arriving ? 'arrival' : 'review')
  }, [mission])

  const finishArrival = useCallback(() => {
    if (!report || handledArrival.current === report) return
    handledArrival.current = report
    const before = progressRef.current
    const result = recordDelivery(before, mission, report)
    if (!result.accepted) {
      setScreen('review')
      return
    }
    if (progressRef.current !== result.progress) {
      progressRef.current = result.progress
      setProgress(result.progress)
      setSaveFailed(!writeProgress(result.progress))
    }
    setFirstDelivery(result.firstDelivery)
    setDraft(false)
    setFailedAttempts(counts => ({ ...counts, [mission.id]: 0 }))
    if (result.firstDelivery) setDiscovery(deliveryDiscovery(mission, before, result.progress))
    gameAudio.completeMission(result.firstDelivery)
    setScreen(mission.career.nextMissionId ? 'accomplished' : 'campaign')
  }, [mission, report])

  const returnToLoading = () => setScreen('loading')
  const toMissionCentre = () => { setReplaying(false); setScreen('mission') }
  const replayMissions = () => { setReplaying(true); setScreen('mission') }
  const viewReport = () => { setReportFromCompletion(true); setScreen('review') }
  const next = campaign.find(entry => entry.id === mission.career.nextMissionId)

  function startGame() {
    if (experience || progress.completedMissionIds.length) toMissionCentre()
    else setWelcome(true)
  }

  function chooseExperience(value: Experience) {
    saveExperience(value)
    setExperience(value)
    setWelcome(false)
    if (value === 'beginner') setScreen('training')
    else toMissionCentre()
  }

  function showDemonstration(configuration: FlightConfiguration) { setOverlayOpen(true); setDemo(configuration) }

  return (
    <>
      {screen === 'home' ? (
        <HomePage headingRef={focusHeading} onStart={startGame} onAbout={() => openDialog(about.current)} />
      ) : (
        <>
          <GameHeader rank={ranks[progress.rankMilestone]} onHome={() => { setSettingsOpen(false); setScreen('home') }} onAbout={() => openDialog(about.current)} onCareer={() => openDialog(career.current)} onSettings={setSettingsOpen} />
          <main className={`game-shell${screen === 'loading' ? ' loading-shell' : ''}`} key={screen}>
            {screen === 'mission' && <MissionCentre progress={progress} discovery={discovery} replaying={replaying} onStart={showBrief} onWall={() => openDialog(career.current)} onTraining={() => setScreen('training')} onResume={draft ? returnToLoading : undefined} />}
            {screen === 'training' && <TrainingSession headingRef={focusHeading} blocked={overlayOpen || settingsOpen} onExit={toMissionCentre} onFirstMission={() => { toMissionCentre(); showBrief(islandSupplyRun) }}
              missionCentre={start => <MissionCentre progress={trainingProgress} discovery={null} replaying={false} onStart={start} training />} />}
            {screen === 'loading' && <CargoLoading mission={mission} loading={loading} setLoading={setLoading} hintClock={hintClock.current} blocked={overlayOpen || settingsOpen} headingRef={focusHeading} onBack={toMissionCentre} onBrief={() => openDialog(brief.current)} onFlight={launchFlight} />}
            {screen === 'flight' && launch && <FlightScreen mission={mission} {...launch} blocked={overlayOpen} headingRef={focusHeading} onReturn={returnToLoading} onFinish={finishFlight} onDemonstration={() => showDemonstration(launch.configuration)} />}
            {screen === 'arrival' && <Arrival mission={mission} headingRef={focusHeading} blocked={overlayOpen} onFinish={finishArrival} />}
            {screen === 'review' && report && <FlightReview mission={mission} report={report} previous={previousReport} headingRef={focusHeading}
              failedAttempts={failedAttempts[mission.id] ?? 0} onDemonstration={() => showDemonstration(report.configuration)}
              onRetry={() => launchFlight(report.mode, report.configuration)} onReturn={returnToLoading} onPractice={() => launchFlight('practice', report.configuration)}
              campaignComplete={!next} onBackToCompletion={reportFromCompletion ? () => setScreen(next ? 'accomplished' : 'campaign') : undefined} />}
            {screen === 'accomplished' && report && next && <MissionAccomplished mission={mission} report={report} progress={progress} firstDelivery={firstDelivery} animateAwards={!reportFromCompletion} headingRef={focusHeading} onContinue={toMissionCentre}
              discovery={firstDelivery && discovery?.routeId === mission.career.routeId ? discovery : null} onNext={() => showBrief(next)} onReport={viewReport} onReplay={() => showBrief(mission)} />}
            {screen === 'campaign' && <CampaignComplete progress={progress} celebrate={firstDelivery && !reportFromCompletion} headingRef={focusHeading} onContinue={toMissionCentre} onReport={viewReport}
              onWall={() => openDialog(career.current)} onReplay={replayMissions} />}
            {saveFailed && (screen === 'accomplished' || screen === 'campaign') && <p className="practice-warning" role="status">Local saving is unavailable. Your rewards are available during this session.</p>}
          </main>
        </>
      )}
      <AboutGame dialogRef={about} onClose={() => setOverlayOpen(false)} />
      <CareerProfile dialogRef={career} progress={progress} onClose={() => setOverlayOpen(false)} onReset={onReset} />
      <MissionBrief mission={briefingMission ?? mission} dialogRef={brief} onAccept={briefingMission ? acceptMission : undefined} onClose={() => { setBriefingMission(null); setOverlayOpen(false) }} />
      {welcome && <ExperienceDialog onChoose={chooseExperience} onClose={() => setWelcome(false)} />}
      {demo && <FlightDemonstration mission={mission} configuration={demo} onClose={() => { setDemo(null); setOverlayOpen(false) }} />}
    </>
  )
}

function Game() {
  const [session, setSession] = useState(0)
  return <App key={session} onReset={() => {
    if (!resetSavedProgress()) return false
    setSession(current => current + 1)
    return true
  }} />
}

createRoot(document.getElementById('root')!).render(<Game />)
