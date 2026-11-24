import { useCallback, useRef, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import { CargoLoading } from './CargoLoading'
import { newHintClock } from './learning'
import { emptyLoadingState, formatCg, inspectLoading, islandSupplyRun, planCargoMove, prepareFlightConfiguration } from './mission'
import { QuickFlight } from './QuickFlight'
import { TutorialSpotlight } from './TutorialSpotlight'
import type { TutorialGuide } from './TutorialSpotlight'

const crate = islandSupplyRun.cargo[1]
const mission = { ...islandSupplyRun, id: 'training-supply-delivery', number: 'Training', title: 'Pinehaven Training Delivery',
  cargo: [crate], completionConditions: { requiredCargo: [crate.id] },
  objective: 'Place one crate, move it into balance and verify the simulated flight.',
}
const lessonTitles = ['Place', 'Balance', 'Auto Delivery', 'Reward']

export function QuickTraining({ headingRef, blocked, onExit, reward }: {
  headingRef: Ref<HTMLHeadingElement>; blocked: boolean; onExit: () => void; reward: ReactNode
}) {
  const [step, setStep] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => emptyLoadingState(mission))
  const [confirming, setConfirming] = useState(false)
  const clock = useRef(newHintClock())
  const askExit = useCallback(() => setConfirming(true), [])
  const keepTraining = useCallback(() => setConfirming(false), [])
  const inspection = inspectLoading(mission, loading.hold)
  const configuration = prepareFlightConfiguration(mission, loading.hold)
  const slot = step === 0 ? 1 : 2
  const plan = step < 2 ? planCargoMove(mission, loading.hold, crate.id, slot) : null
  const move = plan && 'next' in plan ? { id: crate.id, destination: slot, next: plan.next } : null
  const choose = selected === crate.id
  const guide: TutorialGuide = step < 2 ? {
    target: choose ? `[data-cargo-slot="${slot}"]` : `[data-tutorial="cargo-${crate.id}"]`,
    title: step === 0 ? 'Place the crate' : 'Move the crate towards the tail',
    message: step === 0 ? choose ? 'Place it in the highlighted slot.' : 'Select the highlighted crate.' :
      choose ? 'Place it in slot 3 and watch the balance point.' : 'Moving the same crate towards the tail also moves the balance point towards the tail.',
  } : {
    target: '[data-tutorial="safety-checklist"]', title: 'Verify the load',
    message: `At ${formatCg(mission, inspection.cg)} m, the load passes all checks. Auto Delivery flies it for you. In campaign missions, you can also choose Manual Delivery.`,
    read: true, action: { label: 'Auto Delivery', run: () => setVerifying(true) },
  }

  return <div className="training-session quick-training">
    <ol className="diy-steps" aria-label="Quick Beginner Training">
      {lessonTitles.map((title, index) => <li aria-current={index === step ? 'step' : undefined} key={title}><span>{index + 1}</span>{title}</li>)}
    </ol>
    {step === 3 ? <>{reward}<div className="flight-page-actions"><button className="start-button flight-primary" onClick={onExit}>Finish Training</button></div></> :
      verifying && configuration ? <QuickFlight mission={mission} configuration={configuration} headingRef={headingRef} paused={blocked}
        training onFinish={report => { if (report.passed) setStep(3); else setVerifying(false) }} onReturn={onExit} /> :
        <>
          <CargoLoading mission={mission} loading={loading} setLoading={setLoading} headingRef={headingRef} blocked={blocked}
            hintClock={clock.current} onBack={askExit} onBrief={() => {}} onFlight={() => {}}
            training={{ step: step === 0 ? 2 : 4, move, onSelect: setSelected,
              onPlace: () => { setSelected(null); setStep(current => current + 1) } }} />
          <TutorialSpotlight step={step + 1} stageLabel={`Quick Training · ${step + 1} of 4`} guide={guide} confirming={confirming}
            onConfirm={askExit} onStay={keepTraining} onExit={onExit} />
        </>}
  </div>
}
