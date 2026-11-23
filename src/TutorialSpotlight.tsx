import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './art'
import { spotlightLayout, spotlightPath } from './spotlight'

export type TutorialGuide = {
  target: string; title: string; message: string; read?: boolean; focus?: string
  action?: { label: string; run: () => void }; detail?: ReactNode
}

const tabbable = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), summary, [tabindex="0"]'

function lockOutside(root: HTMLElement, target: HTMLElement | null) {
  const altered: HTMLElement[] = []
  function walk(node: HTMLElement) {
    if (node === target || node.inert) return
    if (target && node.contains(target)) {
      for (const child of node.children) if (child instanceof HTMLElement) walk(child)
    } else {
      node.inert = true
      altered.push(node)
    }
  }
  walk(root)
  return () => { for (const node of altered) node.inert = false }
}

const viewportSize = () => ({ width: document.documentElement.clientWidth, height: window.innerHeight })

export function TutorialSpotlight({ step, stageLabel, guide, confirming, onConfirm, onStay, onExit }: {
  step: number; stageLabel?: string; guide: TutorialGuide; confirming: boolean; onConfirm: () => void; onStay: () => void; onExit: () => void
}) {
  const card = useRef<HTMLElement>(null)
  const exit = useRef<HTMLButtonElement>(null)
  const stay = useRef<HTMLButtonElement>(null)
  const [geometry, setGeometry] = useState(() => ({ view: viewportSize(), layout: spotlightLayout(null, { width: 0, height: 0 }, viewportSize()) }))

  useLayoutEffect(() => {
    const root = document.getElementById('root')
    if (!root || !card.current) return
    const panel = card.current
    let target: HTMLElement | null = null
    let restore = () => {}
    let pending: number | undefined
    let focusPending = true
    let previousView = viewportSize()
    const resize = new ResizeObserver(schedule)

    function schedule() {
      if (pending !== undefined) return
      pending = requestAnimationFrame(() => { pending = undefined; update() })
    }

    function update() {
      const next = confirming ? null : root!.querySelector<HTMLElement>(guide.target)
      const changed = target !== next
      const view = viewportSize()
      const resized = previousView.width !== view.width || previousView.height !== view.height
      previousView = view
      if (changed) {
        if (target) resize.unobserve(target)
        target = next
        restore()
        restore = lockOutside(root!, guide.read ? null : target)
        if (target) resize.observe(target)
      }
      if (target && (changed || resized)) {
        const bounds = target.getBoundingClientRect()
        if (bounds.top < 59 || bounds.bottom > view.height - 18) {
          target.scrollIntoView({ block: bounds.height > view.height * .65 ? 'start' : 'center', inline: 'nearest' })
        }
      }
      let rect = target?.getBoundingClientRect() ?? null
      let layout = spotlightLayout(rect, { width: panel.offsetWidth, height: panel.offsetHeight }, view)
      if ((changed || resized) && target && rect && layout.side === 'dock' && rect.height < view.height * .65) {
        target.scrollIntoView({ block: 'center', inline: 'nearest' })
        rect = target.getBoundingClientRect()
        layout = spotlightLayout(rect, { width: panel.offsetWidth, height: panel.offsetHeight }, view)
      }
      root!.style.setProperty('--tutorial-dock-space', `${panel.offsetHeight + 30}px`)
      setGeometry({ view, layout })
      if (confirming && focusPending) {
        stay.current?.focus({ preventScroll: true })
        focusPending = false
      } else if (focusPending && target && !confirming) {
        const actionable = !guide.read ? (guide.focus ? target.querySelector<HTMLElement>(guide.focus) : target.matches(tabbable) ? target : target.querySelector<HTMLElement>(tabbable)) : null
        const focus = actionable && !actionable.matches(':disabled') ? actionable : panel.querySelector<HTMLElement>('button') ?? panel
        focus.focus({ preventScroll: true })
        focusPending = Boolean(!guide.read && (!actionable || actionable.matches(':disabled')) && !guide.action)
      }
    }

    function blockOutside(event: Event) {
      if (!(event.target instanceof Node) || !root!.contains(event.target)) return
      if (!confirming && !guide.read && target?.contains(event.target)) return
      event.preventDefault()
      event.stopPropagation()
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (confirming) onStay()
        else onConfirm()
        return
      }
      if (event.key !== 'Tab') return
      const choices = confirming ? [...panel.querySelectorAll<HTMLElement>(tabbable)] : [
        ...(target && !guide.read ? (target.matches(tabbable) ? [target] : [...target.querySelectorAll<HTMLElement>(tabbable)]) : []),
        ...panel.querySelectorAll<HTMLElement>(tabbable), ...(exit.current ? [exit.current] : []),
      ]
      if (!choices.length) return
      const index = choices.indexOf(document.activeElement as HTMLElement)
      const direction = event.shiftKey ? -1 : 1
      const next = index < 0 ? (event.shiftKey ? choices.length - 1 : 0) : (index + direction + choices.length) % choices.length
      const control = choices[next]
      control.focus({ preventScroll: true })
      if (target?.contains(control)) {
        const rect = control.getBoundingClientRect()
        const dockTop = panel.getBoundingClientRect().top
        if (rect.top < 56 || rect.bottom > previousView.height - 10 || (panel.parentElement?.dataset.placement === 'dock' && rect.bottom > dockTop)) {
          control.scrollIntoView({ block: 'center', inline: 'nearest' })
        }
      }
      event.preventDefault()
    }

    restore = lockOutside(root, null)
    resize.observe(panel)
    resize.observe(root)
    const changes = new MutationObserver(schedule)
    changes.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'data-tutorial'] })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', blockOutside, true)
    document.addEventListener('click', blockOutside, true)
    update()
    return () => {
      if (pending !== undefined) cancelAnimationFrame(pending)
      changes.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', blockOutside, true)
      document.removeEventListener('click', blockOutside, true)
      root.style.removeProperty('--tutorial-dock-space')
      restore()
    }
  }, [guide.target, guide.title, guide.read, guide.focus, guide.action?.label, confirming, onConfirm, onStay])

  const { layout, view } = geometry
  return createPortal(<div className="tutorial-spotlight" data-placement={confirming ? 'confirm' : layout.side}>
    <svg className="tutorial-shade" viewBox={`0 0 ${view.width} ${view.height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={spotlightPath(view, confirming ? null : layout.hole)} fillRule="evenodd" />
    </svg>
    {!confirming && layout.hole && <div key={guide.target} className="tutorial-glow" style={layout.hole} aria-hidden="true" />}
    <button ref={exit} className="tutorial-exit" title="Exit Tutorial" aria-label="Exit Tutorial" onClick={onConfirm} tabIndex={confirming ? -1 : 0}><Icon name="close" /><span>Exit Tutorial</span></button>
    {confirming ? <section ref={card} className="tutorial-card tutorial-confirm" role="alertdialog" aria-modal="true" aria-label="Exit training and continue playing?">
      <h2>Exit training and continue playing?</h2>
      <div className="lesson-navigation"><button ref={stay} className="secondary-button" onClick={onStay}>Continue Training</button><button className="start-button" onClick={onExit}>Exit Tutorial</button></div>
    </section> : <section ref={card} className="tutorial-card" tabIndex={-1} aria-label="Training guidance" style={{ left: layout.card.left, top: layout.card.top, '--arrow-offset': `${layout.arrow}px` } as CSSProperties}>
      {layout.hole && <span className={`tutorial-pointer pointer-${layout.side}`} aria-hidden="true" />}
      <p className="tutorial-stage">{stageLabel ?? `Training · Step ${step} of 8`}</p>
      <div aria-live="polite"><h2>{guide.title}</h2><p>{guide.message}</p></div>
      {guide.detail}
      {guide.action && <button className="start-button tutorial-action" onClick={guide.action.run}>{guide.action.label}</button>}
    </section>}
  </div>, document.body)
}
