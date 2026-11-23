type Box = { left: number; top: number; width: number; height: number }
type Size = { width: number; height: number }
export type SpotlightLayout = { hole: Box | null; card: Box; side: 'above' | 'below' | 'left' | 'right' | 'dock'; arrow: number }

const edges = (box: Box) => ({ right: box.left + box.width, bottom: box.top + box.height })
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, Math.max(low, high)))

export function spotlightLayout(target: Box | null, card: Size, viewport: Size): SpotlightLayout {
  const gutter = 12
  const gap = 14
  const padding = 7
  const floor = viewport.height - gutter
  const right = viewport.width - gutter
  const midX = viewport.width / 2
  const dock = { ...card, left: Math.max(gutter, midX - card.width / 2), top: Math.max(56, floor - card.height) }
  if (!target) return { hole: null, card: dock, side: 'dock', arrow: 0 }

  const end = edges(target)
  const left = clamp(target.left - padding, 0, viewport.width)
  const top = clamp(target.top - padding, 0, viewport.height)
  const hole = { left, top, width: clamp(end.right + padding, left, viewport.width) - left, height: clamp(end.bottom + padding, top, viewport.height) - top }
  if (!hole.width || !hole.height) return { hole: null, card: dock, side: 'dock', arrow: 0 }
  const edge = edges(hole)
  const centreX = hole.left + hole.width / 2
  const centreY = hole.top + hole.height / 2
  const horizontal = clamp(centreX - card.width / 2, gutter, right - card.width)
  const vertical = clamp(centreY - card.height / 2, 56, floor - card.height)
  const positions = [
    { side: 'below', left: horizontal, top: edge.bottom + gap },
    { side: 'above', left: horizontal, top: hole.top - gap - card.height },
    { side: 'right', left: edge.right + gap, top: vertical },
    { side: 'left', left: hole.left - gap - card.width, top: vertical },
  ] as const
  for (const position of positions) {
    if (position.left < gutter || position.top < 56 || position.left + card.width > right || position.top + card.height > floor) continue
    const lateral = position.side === 'left' || position.side === 'right'
    const arrow = lateral ? clamp(centreY - position.top, 14, card.height - 14) : clamp(centreX - position.left, 14, card.width - 14)
    return { hole, card: { ...card, left: position.left, top: position.top }, side: position.side, arrow }
  }

  // Very tall groups share the screen with a docked card and can scroll clear of it.
  const visibleHeight = Math.max(0, Math.min(edge.bottom, dock.top - gap) - hole.top)
  return { hole: visibleHeight ? { ...hole, height: visibleHeight } : null, card: dock, side: 'dock', arrow: clamp(centreX - dock.left, 14, card.width - 14) }
}

export function spotlightPath(view: Size, hole: Box | null) {
  const outer = `M0 0H${view.width}V${view.height}H0Z`
  if (!hole) return outer
  const { left, top, width, height } = hole
  const { right, bottom } = edges(hole)
  const r = Math.min(10, width / 2, height / 2)
  return `${outer} M${left + r} ${top}H${right - r}Q${right} ${top} ${right} ${top + r}V${bottom - r}Q${right} ${bottom} ${right - r} ${bottom}H${left + r}Q${left} ${bottom} ${left} ${bottom - r}V${top + r}Q${left} ${top} ${left + r} ${top}Z`
}
