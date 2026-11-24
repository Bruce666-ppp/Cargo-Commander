import { useId } from 'react'

export type ModernKind = 'water-tower' | 'spire' | 'terraced-tower' | 'atrium' | 'wave-terminal' | 'flight-tower' | 'solar-lab'

type Volume = { w: number; d: number; h: number }
type Glazing = Volume & { glass: string; dark: string }
const structure = '#fbf3df'
const edge = '#59828b'
const shadow = '#96b6b7'
const rail = '#cce4e2'

function CurtainWall({ outline, w, h, glass, spacing = 6, vertical = true }: {
  outline: string; w: number; h: number; glass: string; spacing?: number; vertical?: boolean
}) {
  const clip = useId()
  return <>
    <defs><clipPath id={clip}><path d={outline} /></clipPath></defs>
    <path d={outline} fill={glass} />
    <g clipPath={`url(#${clip})`}>
      <path d={`M-4 -${h * .47} ${w + 5} -${h * .94} ${w + 5} -${h * .72} -4 -${h * .31}Z`} fill="#aaedf1" opacity=".22" />
      <path d={`M-6 -11 ${w + 3} -${h * .55} ${w + 3} -${h * .41} -6 -2Z`} fill="#d3eee5" opacity=".13" />
      <path d={`M-2 -4h${w + 5}v4H-2Z`} fill="#f1cc79" opacity=".63" />
      {vertical && Array.from({ length: Math.round(w / 6) }, (_, i) => {
        const x = 3.6 + i * 6
        return <path key={i} d={`M${x} -${h + 5}v${h + 7}`} stroke={rail} strokeWidth=".57" opacity=".83" />
      })}
      {Array.from({ length: Math.ceil(h / spacing) }, (_, i) => <path key={i} d={`M-2 -${4 + i * spacing}h${w + 6}`} stroke={rail} strokeWidth=".6" opacity=".72" />)}
    </g>
  </>
}

function SailTower({ w, d, h, glass, dark }: Glazing) {
  const r = d * .65
  const slope = d * .38
  const front = `M1 -2Q6 -${h * .43} 3 -${h - 9}Q${w * .51} -${h - 13} ${w * .91} -${h}Q${w - 2} -${h * .46} ${w} -2Z`
  return <>
    <path d={`M${w - 1} -2l${r} -${slope}Q${w + r - 4} -${h * .54} ${w * .91 + r} -${h + slope}l-${r} ${slope}Z`} fill={dark} stroke={edge} strokeWidth=".8" />
    <path d={`M3 -${h - 9}q${w * .42} -4 ${w * .91 - 3} -9l${r} -${slope}q-${w * .55} 8 -${w * .91 - 3} 9Z`} fill="#deebe3" stroke={edge} strokeWidth=".7" />
    <CurtainWall outline={front} w={w} h={h} glass={glass} />
    <path d={front} fill="none" stroke={structure} strokeWidth="2.65" />
    <path d={`M${w * .26} -.5C${w * .52} -${h * .29} ${w * .83} -${h * .48} ${w * .84} -${h - 2}`} fill="none" stroke={shadow} strokeWidth="3.6" opacity=".51" />
    <path d={`M${w * .24} -.5C${w * .46} -${h * .28} ${w * .81} -${h * .49} ${w * .83} -${h - 1}`} fill="none" stroke={structure} strokeWidth="2.65" />
    <path d={`M${w + r * .38} -${h + 2}v-13m0 .5h-1.6m-3.2 6.1h7.8`} stroke="#ecf2e6" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx={w + r * .38} cy={-h - 15.2} r="1" fill="#fdbd76" />
    <path d={`M-3 -1.2h${w + 7}l${r} -${slope}v3l-${r} ${slope}H-3Z`} fill="#d7dfd3" stroke={edge} strokeWidth=".6" />
  </>
}

function Atrium({ w, d, h, glass, dark, planted = false }: Glazing & { planted?: boolean }) {
  const r = d * .67
  const slope = d * .44
  const top = -h
  const front = `M1 -1.5V${top + 7}H${w * .22}v-5H${w * .64}v4H${w - 1}v${h - 4.5}Z`
  return <>
    <path d={`M${w} -1.5l${r} -${slope}v${top + 7}l-${r} ${slope}Z`} fill={dark} stroke={edge} strokeWidth=".75" />
    <path d={`M1 ${top + 7}h${w - 1}l${r} -${slope}H${r + 1}Z`} fill="#dbe6de" stroke={edge} strokeWidth=".76" />
    <CurtainWall outline={front} w={w} h={h} glass={glass} spacing={7.6} />
    <path d={`M0 0v${top + 6}h${w * .19}v-3.8h${w * .46}v4h${w * .35}V0Z`} fill="none" stroke={structure} strokeWidth="1.7" />
    <path d={`M${w * .63} -1v${top + 7}l${r * .81} -${slope * .84}M4 -${h * .29}h${w - 3}l${r} -${slope}m-${r} ${slope}v-9.2`} stroke={structure} strokeWidth="1.3" fill="none" />
    <path d={`M2 -1h${w - 2}l${r} -${slope}`} stroke={shadow} strokeWidth="1.9" fill="none" />
    {planted ? <g transform={`translate(${w * .42} ${top + 3})`}>
      <path d="M0 0h8l6-3.5H6Z" fill="#90a37b" stroke="#f0f0cf" strokeWidth=".8" />
      <ellipse cx="8" cy="-1.1" rx="3.6" ry="1.4" fill="#76a481" />
    </g> : <path d={`M${w * .34} ${top + 5}h${w * .39}l6 -3.6h-${w * .39}Z`} fill="#78afbf" stroke="#a6ddd9" strokeWidth=".75" />}
  </>
}

function TerracedTower(props: Glazing) {
  const { w, h, d, glass, dark } = props
  return <>
    <g transform={`translate(${w * .45} -4.5)`}><Atrium w={w * .53} d={d} h={h} glass={glass} dark={dark} /></g>
    <g transform={`translate(0 -.5)`}><Atrium w={w * .75} d={d * .69} h={h * .68} glass={glass} dark={dark} planted /></g>
    <path d={`M2 -2h${w * .52}l3.8 -3H5.8Z`} fill="#f4ebcf" stroke={edge} strokeWidth=".63" />
    <path d={`M${w * .32} -${h * .21}h${w * .41}m-${w * .41} -7.6h${w * .4}`} stroke="#fbf4e1" strokeWidth="2.3" />
  </>
}

function WaveTerminal({ w, d, h, glass, dark }: Glazing) {
  const dx = d * .66
  const dy = d * .42
  const roofLine = `M-2 -${h * .55}C${w * .13} -${h * .79} ${w * .18} -${h * .42} ${w * .33} -${h * .57}S${w * .52} -${h * 1.22} ${w * .65} -${h * 1.02} ${w * .88} -${h * .54} ${w + 2} -${h * .68}`
  const front = `${roofLine}V0H-2Z`
  return <>
    <path d={`M${w} 0l${dx} -${dy}v-${h * .69}l-${dx} ${dy}Z`} fill={dark} stroke={edge} strokeWidth=".95" />
    <path d={`M-2 -${h * .54}l${dx} -${dy}Q${w * .29 + dx} -${h + dy + 2} ${w * .61 + dx} -${h + dy + 6} ${w * .86 + dx} -${h * .79 + dy} ${w + 2 + dx} -${h * .68 + dy}L${w + 2} -${h * .68}Q${w * .89} -${h * .62} ${w * .65} -${h * 1.01} ${w * .54} -${h * 1.22} ${w * .36} -${h * .59} ${w * .18} -${h * .46} -2 -${h * .54}Z`} fill="#ecf1e5" stroke={edge} strokeWidth=".8" />
    <path d={`M${w * .44} -${h * .78}Q${w * .57} -${h * 1.17} ${w * .68} -${h * .96}l${dx * .68} -${dy * .68}Q${w * .64} -${h * 1.31} ${w * .51} -${h * .95}Z`} fill="#77adc1" stroke="#beded9" strokeWidth=".9" />
    <CurtainWall outline={front} w={w} h={h} glass={glass} spacing={8.8} />
    <path d={roofLine} fill="none" stroke="#bed3ce" strokeWidth="5.1" strokeLinecap="round" />
    <path d={roofLine} fill="none" stroke={structure} strokeWidth="3.15" strokeLinecap="round" />
    <path d={`M2 0v-${h * .44}m${w - 4} 0V0H2`} fill="none" stroke={structure} strokeWidth="2.3" />
    <path d={`M${w * .31} -7h${w * .36}l3 3h-${w * .36 + 6}Z`} fill="#e8eddf" stroke={edge} strokeWidth=".62" />
    <path d={`M${w * .32} -4v3m${w * .34} -3v3`} stroke="#fff3d5" strokeWidth="1.55" />
  </>
}

function FlightTower({ w, d, h, glass }: Glazing) {
  const half = w / 2
  return <>
    <ellipse cx={half} cy="-1.3" rx={w * .42} ry={d * .23} fill="#a2b99f" />
    <path d={`M${w * .29} -2q2 -${h * .45} .3 -${h - 11}h${w * .43}q-1.2 ${h * .44} 1.1 ${h - 11}Z`} fill="#e8e7d3" stroke={edge} strokeWidth=".68" />
    <path d={`M${w * .51} -2v-${h - 10}h${w * .18}V-2Z`} fill="#a8c1bb" opacity=".7" />
    <path d={`M${w * .30} -${h - 10} 1 -${h - 2}Q${half} -${h + 7} ${w - 1} -${h - 2}L${w * .71} -${h - 10}Q${half} -${h - 5} ${w * .30} -${h - 10}Z`} fill={glass} stroke={structure} strokeWidth="1.45" />
    <path d={`M${w * .25} -${h - 3}l2.2 5.9m${w * .21} -6v7m${w * .23} -7-2 6.1`} stroke="#d2ede5" strokeWidth=".85" />
    <ellipse cx={half} cy={-h - 1.2} rx={w * .51} ry={d * .27} fill="#f6f1dc" stroke={edge} strokeWidth=".79" />
    <ellipse cx={half} cy={-h - 2.7} rx={w * .28} ry={d * .15} fill="#8db8c5" stroke="#edeecf" strokeWidth=".9" />
    <path d={`M${half} -${h + 5}v-9m-4.4 3.8h8.8`} stroke="#f4efdb" strokeWidth="1.1" strokeLinecap="round" />
  </>
}

function WaterTower({ w, d, h }: Volume) {
  return <g>
    <path d={`M2 -1l2.3 -${h * .61}m${w - 6.3} 0L${w - 1} -1M4 -${h * .45}l${w - 7} 9.1m0 -9.1l-${w - 7} 9.1`} fill="none" stroke="#7c8374" strokeWidth="1.2" />
    <path d={`M1 -${h * .74}v${h * .36}q${w * .48} ${d * .56} ${w - 2} 0v-${h * .36}Z`} fill="#b6bcae" stroke="#718f88" strokeWidth=".73" />
    <ellipse cx={w / 2} cy={-h * .74} rx={w / 2 - .95} ry={d * .25} fill="#d5d8bf" stroke="#849487" strokeWidth=".73" />
    <path d={`M1 -${h * .60}q${w * .5} ${d * .54} ${w - 2} 0m-${w * .69} 1.1v${h * .16}m2.3 -${h * .16}v${h * .16}m3.9 -${h * .14}v${h * .14}`} stroke="#8d9b90" strokeWidth=".63" fill="none" />
  </g>
}

function SolarLab(props: Glazing) {
  const { w, d, h } = props
  return <>
    <Atrium {...props} />
    <g transform={`translate(${w * .46} ${-h + 1.2})`}>
      <path d={`M-2 0h${w * .51}l${d * .55} -7.5H${d * .55 - 2}Z`} fill="#345d7e" stroke="#eef0d9" strokeWidth=".92" />
      <path d={`M2 -3.1h${w * .49}m-${w * .34} 3.1 6-7.5m1.4 7.5 6-7.5`} fill="none" stroke="#86b9cd" strokeWidth=".55" />
    </g>
  </>
}

export function DistrictLandmark({ kind, w, d, h }: Volume & { kind: ModernKind }) {
  const id = useId()
  const glass = `url(#${id}-front)`
  const dark = `url(#${id}-side)`
  const props = { w, d, h, glass, dark }
  if (kind === 'water-tower') return <WaterTower w={w} d={d} h={h} />
  return <>
    <defs>
      <linearGradient id={`${id}-front`} x2=".78" y2="1"><stop stopColor="#71bad3" /><stop offset=".44" stopColor="#397fa6" /><stop offset="1" stopColor="#1d4f6d" /></linearGradient>
      <linearGradient id={`${id}-side`} x2="1" y2=".82"><stop stopColor="#588eaa" /><stop offset="1" stopColor="#264d66" /></linearGradient>
    </defs>
    {kind === 'spire' ? <SailTower {...props} />
      : kind === 'terraced-tower' ? <TerracedTower {...props} />
      : kind === 'wave-terminal' ? <WaveTerminal {...props} />
      : kind === 'flight-tower' ? <FlightTower {...props} />
      : kind === 'solar-lab' ? <SolarLab {...props} /> : <Atrium {...props} />}
  </>
}
