import type { CSSProperties } from 'react'
import type { Facility, Finish } from './districts'
import { DistrictLandmark } from './DistrictLandmark'

const materials = {
  clay: { wall: '#eac291', side: '#c48767', roof: '#c77959', shade: '#aa5b4b', trim: '#f9e8bc' },
  cream: { wall: '#f1dfb3', side: '#c4ab8b', roof: '#ad7054', shade: '#8e594a', trim: '#fff0cf' },
  sage: { wall: '#d4dbac', side: '#93a87f', roof: '#71998a', shade: '#4e776f', trim: '#edf0c8' },
  blue: { wall: '#cbdedf', side: '#91aeb6', roof: '#648ca7', shade: '#466b87', trim: '#eff2da' },
  ochre: { wall: '#ecc78b', side: '#c09963', roof: '#b87752', shade: '#9a5a4a', trim: '#fff0c7' },
  coral: { wall: '#ecc0a0', side: '#c48c80', roof: '#bc6a60', shade: '#9d524e', trim: '#ffebc8' },
  slate: { wall: '#b5c4bd', side: '#829f9b', roof: '#6c8794', shade: '#536f80', trim: '#e2e9d6' },
  glass: { wall: '#bed4d2', side: '#719da9', roof: '#e0e5d8', shade: '#9db9be', trim: '#fff3d4' },
} satisfies Record<Finish, { wall: string; side: string; roof: string; shade: string; trim: string }>

type Material = typeof materials[Finish]
type Dimensions = { w: number; d: number; h: number; paint: Material }
const ink = '#507068'
const windowDark = '#386477'
const windowLight = '#a4cbcb'

function Roof({ w, d, h, paint, pitched = false }: Dimensions & { pitched?: boolean }) {
  const sx = d * .66
  const sy = d * .45
  const rise = Math.min(11, w * .24)
  const top = -h
  return pitched ? <>
    <path d={`M-1 ${top} ${w * .45} ${top - rise} ${w * .45 + sx} ${top - rise - sy} ${sx - 1} ${top - sy}Z`} fill={paint.shade} stroke={ink} strokeWidth=".55" />
    <path d={`M${w * .45} ${top - rise} ${w + 1.5} ${top} ${w + sx + 1.5} ${top - sy} ${w * .45 + sx} ${top - rise - sy}Z`} fill={paint.roof} stroke={ink} strokeWidth=".55" />
    <path d={`M-1 ${top} ${w * .45} ${top - rise} ${w + 1.5} ${top}Z`} fill={paint.wall} stroke={paint.shade} strokeWidth=".62" />
    {[.2, .43, .67, .89].map(part => <path key={part} d={`M${w * .45 + sx * part} ${top - rise - sy * part}l${w * .55} ${rise}`} stroke={paint.shade} strokeWidth=".55" opacity=".54" />)}
    <path d={`M-1 ${top} ${w * .45} ${top - rise} ${w + 1.5} ${top}M${w * .45 + 3} ${top - rise + 1}l${sx - 1} -${sy}`} fill="none" stroke={paint.trim} strokeWidth=".75" opacity=".8" />
  </> : <>
    <path d={`M0 ${top}h${w}l${sx} -${sy}h-${w}Z`} fill={paint.roof} stroke={ink} strokeWidth=".64" />
    <path d={`M3 ${top - 1.2}h${w - 4}l${sx - 3} -${sy - 2.7}H${sx + 2}`} fill="none" stroke={paint.trim} strokeWidth=".7" opacity=".63" />
    <path d={`M.2 ${top}h${w}v2H.2Z`} fill={paint.trim} opacity=".84" />
  </>
}

function Shell({ w, d, h, paint, pitched = false }: Dimensions & { pitched?: boolean }) {
  const sx = d * .66
  const sy = d * .45
  return <>
    <path d={`M${w} 0l${sx} -${sy}v-${h}l-${sx} ${sy}Z`} fill={paint.side} stroke={ink} strokeWidth=".62" />
    <path d={`M0 0h${w}v-${h}H0Z`} fill={paint.wall} stroke={ink} strokeWidth=".62" />
    <path d={`M.2 -1.8h${w - .3}`} stroke={paint.side} strokeWidth="1.45" />
    <path d={`M1 -${h - 2}v${h - 4}`} stroke={paint.trim} strokeWidth=".75" opacity=".66" />
    <Roof w={w} d={d} h={h} paint={paint} pitched={pitched} />
  </>
}

function Windows({ x, y, span, rows, columns, shape = 'square' }: {
  x: number; y: number; span: number; rows: number; columns: number; shape?: 'tall' | 'square'
}) {
  const cell = span / columns
  const pane = Math.max(1.7, cell * .58)
  const size = shape === 'tall' ? 5.1 : 3.6
  return Array.from({ length: rows * columns }, (_, index) => {
    const left = x + index % columns * cell + (cell - pane) / 2
    const top = y + Math.floor(index / columns) * (size + 2.8)
    return <g key={index}>
      <rect x={left} y={top} width={pane} height={size} rx=".5" fill={index % 6 === 2 ? '#e4b97d' : windowDark} />
      <path d={`M${left + .35} ${top + 1}h${pane - .7}m-${pane / 2} 0v${size - 1.65}`} stroke={windowLight} strokeWidth=".53" opacity=".74" />
      <path d={`M${left - .55} ${top + size + .3}h${pane + 1.1}`} stroke="#fff1ce" strokeWidth=".62" opacity=".86" />
    </g>
  })
}

function Door({ x, width = 5.8, colour = '#7d594b', awning = false }: { x: number; width?: number; colour?: string; awning?: boolean }) {
  return <g>
    <path d={`M${x - 1.1} -.35h${width + 2.2}v-1.1h-${width + 2.2}Z`} fill="#a39479" />
    <path d={`M${x} -1v-5.9q0-1 .9-1h${width - 1.8}q.9 0 .9 1V-1Z`} fill={colour} stroke="#634d48" strokeWidth=".5" />
    <path d={`M${x + 1.05} -5.8h${width - 2.1}v2.55h-${width - 2.1}Z`} fill="#8db3b5" opacity=".77" />
    {awning && <path d={`M${x - 2} -10h${width + 4}l1.4 2h-${width + 6.8}Z`} fill="#f2ecd1" stroke="#a28a72" strokeWidth=".55" />}
  </g>
}

function House({ w, d, h, paint, terrace }: Dimensions & { terrace: boolean }) {
  const units = terrace ? 2 : 1
  return Array.from({ length: units }, (_, unit) => {
    const part = w / units
    const height = h - unit * 2.2
    return <g key={unit} transform={`translate(${part * unit} ${unit * 2})`}>
      <Shell w={part} d={d - unit * 1.6} h={height} paint={paint} pitched />
      <path d={`M${part * .55} -${height + 4}h3.1v-5.2h-3.1Z`} fill={paint.side} stroke={paint.shade} strokeWidth=".5" />
      <Windows x={1.9} y={-height + 2.2} span={part - 3.8} rows={1} columns={2} shape="tall" />
      <Door x={part / 2 - 2.3} width={4.6} />
      <path d={`M${part + 2} -8l3.6 -1.6v3.5l-3.6 1.6Z`} fill={windowDark} opacity=".85" />
      <rect x={2.3} y="-.6" width="3.7" height="1.25" rx=".6" fill="#548567" />
    </g>
  })
}

function Hangar({ w, d, h, paint }: Dimensions) {
  const sx = d * .66
  const sy = d * .45
  const shoulder = -h + 6
  return <>
    <path d={`M${w} 0l${sx} -${sy}v${shoulder}l-${sx} ${sy}Z`} fill={paint.side} stroke={ink} strokeWidth=".65" />
    <path d={`M0 ${shoulder}Q${w / 2} ${-h - 13} ${w} ${shoulder}l${sx} -${sy}Q${w / 2 + sx} ${-h - 13 - sy} ${sx} ${shoulder - sy}Z`} fill={paint.roof} stroke={ink} strokeWidth=".7" />
    {[.22, .51, .8].map(part => <path key={part} d={`M${w * part} ${shoulder - 14 * Math.sin(Math.PI * part)}l${sx} -${sy}`} stroke={paint.trim} strokeWidth=".75" opacity=".55" />)}
    <path d={`M0 0V${shoulder}Q${w / 2} ${-h - 13} ${w} ${shoulder}V0Z`} fill={paint.wall} stroke={ink} strokeWidth=".75" />
    <path d={`M${w * .12} -.55V${-h * .51}Q${w / 2} ${-h - 3} ${w * .88} ${-h * .51}V-.55Z`} fill="#355c66" stroke={paint.trim} strokeWidth="1.15" />
    <path d={`M${w * .25} -1v-${h * .57}m${w * .12} 0v${h * .57}m${w * .13} 0v-${h * .64}m${w * .13} 0v${h * .64}m${w * .12} 0v-${h * .57}`} stroke="#85a5aa" strokeWidth=".72" />
  </>
}

function Warehousing({ w, d, h, paint, shed }: Dimensions & { shed: boolean }) {
  const bay = w / (shed ? 1 : 2)
  const sx = d * .66
  const sy = d * .45
  return <>
    <Shell w={w} d={d} h={h - 1} paint={paint} pitched={shed} />
    {!shed && [0, 1, 2].map(index => {
      const x = index * w / 3
      return <path key={index} d={`M${x} -${h}l${w / 6} -5 ${w / 6} 5 ${sx} -${sy} -${w / 6} -5 -${w / 6} 5Z`} fill={index % 2 ? paint.shade : paint.roof} stroke={ink} strokeWidth=".5" />
    })}
    {!shed && <path d={`M3 -${h - 4}h${w - 6}`} stroke={windowDark} strokeWidth="2.9" strokeDasharray="4 1.2" />}
    {Array.from({ length: shed ? 1 : 2 }, (_, i) => <g key={i} transform={`translate(${i * bay} 0)`}>
      <rect x={4} y={-h * .6} width={bay - 8} height={h * .57} rx="1" fill="#506d74" stroke={paint.trim} strokeWidth=".95" />
      <path d={`M5 -${h * .46}h${bay - 10}m0 2.6H5m0 2.6h${bay - 10}`} fill="none" stroke="#9db5b0" strokeWidth=".6" />
    </g>)}
  </>
}

function Tower({ w, d, h, paint }: Dimensions) {
  const shaft = w * .52
  const y = -h + 10
  const sx = d * .66
  return <>
    <g transform={`translate(${w * .22} 0)`}><Shell w={shaft} d={d * .65} h={h - 6} paint={paint} />
      <Windows x={1.5} y={-h + 15} span={shaft - 3} rows={Math.max(1, h > 40 ? 3 : 2)} columns={1} shape="tall" />
      <Door x={shaft * .31} width={4.2} /></g>
    <g transform={`translate(0 ${y})`}>
      <Shell w={w} d={d} h={12} paint={paint} />
      <rect x="1.6" y="-9.8" width={w - 3.2} height="6.8" rx="1" fill={windowDark} />
      <path d={`M${w} -9l${sx - 1} -${d * .45}v6L${w} -3Z`} fill="#547a8a" />
      {[.24, .5, .76].map(part => <path key={part} d={`M${w * part} -9v6`} stroke="#c1d9d7" strokeWidth="1" />)}
      <path d={`M-1 -12.5h${w + 2}l${sx} -${d * .45}m-${sx * .45} -1.3v-10.5m-3.6 3.4h7.2`} fill="none" stroke={paint.trim} strokeWidth="1.35" strokeLinecap="round" />
      <circle cx={w + sx * .55} cy={-23.8 - d * .45} r="1.4" fill="#e89b69" />
    </g>
  </>
}

function Civic({ w, d, h, paint }: Dimensions) {
  return <>
    <Shell w={w} d={d} h={h} paint={paint} pitched />
    <path d={`M${w * .19} -1h${w * .62}l2 3.2h-${w * .62 + 4}Z`} fill="#b4a281" stroke="#e9d4af" strokeWidth=".7" />
    <rect x={w * .22} y={-h * .70} width={w * .56} height={h * .67} fill={paint.side} />
    {[.25, .43, .57, .75].map(part => <path key={part} d={`M${w * part} -1.5v-${h * .66}`} stroke={paint.trim} strokeWidth="2" />)}
    <path d={`M${w * .16} -${h * .68}l${w * .34} -5 ${w * .34} 5Z`} fill={paint.roof} stroke={ink} strokeWidth=".54" />
    <Windows x={.5} y={-h + 4} span={w * .20} rows={1} columns={1} shape="tall" />
    <Windows x={w * .79} y={-h + 4} span={w * .20} rows={1} columns={1} shape="tall" />
    <Door x={w / 2 - 2.1} width={4.2} />
  </>
}

function Shop({ w, d, h, paint }: Dimensions) {
  return <>
    <Shell w={w} d={d} h={h} paint={paint} pitched={h < 18} />
    <Windows x={2} y={-h + 2.5} span={w - 4} rows={1} columns={2} />
    <path d={`M2 -9h${w - 4}v7H2Z`} fill={windowDark} stroke={paint.trim} strokeWidth="1" />
    <path d={`M3 -8v5m${w * .22} 0v-5m${w * .45} 0v5`} stroke="#b5d8ce" strokeWidth=".8" />
    <path d={`M1 -10.4h${w - 2}l1.4 3.2H-.4Z`} fill={paint.roof} stroke={paint.shade} strokeWidth=".5" />
    <path d={`M1.6 -8.9h${w - 3.2}`} stroke={paint.trim} strokeWidth="2.6" strokeDasharray="2.1 2.2" />
    <Door x={w / 2 - 2.2} width={4.4} />
  </>
}

function GlassBand({ w, h, wide = false }: { w: number; h: number; wide?: boolean }) {
  const inset = wide ? 3 : 4.5
  const height = wide ? 7.4 : 5.2
  const columns = Math.max(3, Math.floor(w / (wide ? 9 : 7)))
  return <g>
    <rect x={inset} y={-h} width={w - inset * 2} height={height} rx=".8" fill={windowDark} stroke="#f1edda" strokeWidth=".6" />
    <path d={`M${inset + 1.1} -${h - 1.28}h${w - inset * 2 - 2.2}`} stroke="#a9ced2" strokeWidth=".95" opacity=".7" />
    {Array.from({ length: columns - 1 }, (_, index) => <path key={index} d={`M${inset + (w - inset * 2) * (index + 1) / columns} -${h}v${height}`} stroke="#b0c8c5" strokeWidth=".6" />)}
  </g>
}

function Terminal({ w, d, h, paint }: Dimensions) {
  const sx = d * .66
  return <>
    <Shell w={w} d={d} h={h - 4} paint={paint} />
    <GlassBand w={w} h={h - 7} wide />
    <GlassBand w={w} h={9} wide />
    <path d={`M-3 -${h - 3}Q${w * .18} -${h + 6} ${w * .43} -${h + 5}T${w + 2} -${h - 1}l${sx} -${d * .45}Q${w * .58 + sx} -${h + 8} ${w * .4 + sx} -${h + 7}T${sx - 3} -${h + d * .45 - 3}Z`} fill="#eff0db" stroke={ink} strokeWidth=".78" />
    <path d={`M${w * .28} -${h + 2}h${w * .39}l${sx * .63} -${d * .29}h-${w * .39}Z`} fill="#76a8b7" stroke="#c6e1dd" strokeWidth="1" />
    <path d={`M${w * .28} -7h${w * .49}l3 3.2H${w * .28 - 3}Z`} fill="#eff0dc" stroke={ink} strokeWidth=".52" />
    <path d={`M${w * .34} -4v3m${w * .36} 0v-3`} stroke="#e4dfc1" strokeWidth="1.4" />
  </>
}

function Cross({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-4.4" y="-4.4" width="8.8" height="8.8" rx="1.4" fill="#fff7e8" stroke="#b88672" strokeWidth=".55" />
    <path d="M-2.8 0h5.6M0-2.8v5.6" stroke="#c35457" strokeWidth="1.7" />
  </g>
}

function Hospital({ w, d, h, paint }: Dimensions) {
  const tower = w * .62
  return <>
    <g transform={`translate(${w * .21} -1)`}>
      <Shell w={tower} d={d * .83} h={h} paint={materials.cream} />
      <GlassBand w={tower} h={h - 8} />
      <GlassBand w={tower} h={h - 16.7} />
      <GlassBand w={tower} h={h - 25.4} />
      <GlassBand w={tower} h={h - 34} />
      <path d={`M5 -${h - 4}v31M${tower - 5} -${h - 4}v31`} stroke="#faf4df" strokeWidth="1.65" />
      <path d={`M${tower * .87} -1l${d * .46} -${d * .31}v-${h - 9}l-${d * .46} ${d * .31}Z`} fill="#3f7c98" stroke="#efefe0" strokeWidth="1.2" />
      <path d={`M${tower * .9} -${h - 10}v${h - 12}m4.8-3.2v-${h - 12}m4.5-2v${h - 12}`} stroke="#9bc4d0" strokeWidth=".58" />
      <Cross x={tower * .53} y={-h - 3} />
    </g>
    <Shell w={w} d={d * .63} h={13.6} paint={paint} />
    <GlassBand w={w} h={10} />
    <path d={`M${w * .32} -7.6h${w * .36}l2.5 3.3h-${w * .36 + 5}Z`} fill="#fff2d5" stroke={ink} strokeWidth=".65" />
    <Door x={w * .52 - 3.2} width={6.4} />
  </>
}

function Modern({ w, d, h, paint, kind }: Dimensions & { kind: 'office' | 'clinic' | 'laboratory' | 'radar' }) {
  return <>
    <Shell w={w} d={d} h={h} paint={paint} />
    {kind === 'office' ? <>
      <GlassBand w={w} h={h - 4.3} />
      {h >= 26 && <GlassBand w={w} h={h - 12} />}
      {h >= 31 && <GlassBand w={w} h={h - 20} />}
      <path d={`M2 -${h - 3}V-3m${w - 4} 0v-${h - 6}`} stroke={paint.trim} strokeWidth="1.25" />
      <g transform={`translate(${w * .58} ${-h - 1.3})`}><Shell w={w * .22} d={d * .37} h={3.5} paint={paint} /></g>
    </> : <>
      <GlassBand w={w} h={h - 3.5} />
      <Windows x={2} y={-h + 11} span={w - 4} rows={h > 21 ? 2 : 1} columns={Math.max(2, Math.floor(w / 8))} />
    </>}
    {kind === 'radar' && <g transform={`translate(${w * .57} ${-h - 2.9}) scale(1.3 1.45)`}>
      <path d="M-12 1a12 12 0 0 1 24 0q-12 4-24 0Z" fill="#f1f3df" stroke="#628c98" strokeWidth=".7" />
      <path d="M-8-6q8 3 16 0m-4-4v10m-8-10v10" fill="none" stroke="#9dbcc4" strokeWidth=".83" />
      <path d="M-6-7q2-2 5-2" fill="none" stroke="#fffceb" strokeWidth="1.6" strokeLinecap="round" />
    </g>}
    {kind === 'clinic' && <Cross x={w * .74} y={-h - 1.8} />}
    {kind === 'laboratory' && <path d={`M${w * .33} -${h}h${w * .35}l5 -3.8h-${w * .35}Z`} fill="#82a8b4" stroke="#e4ebd9" strokeWidth=".7" />}
    <Door x={w * .46 - 2.9} awning={kind === 'clinic'} />
  </>
}

export function Building({ facility, animate }: { facility: Facility; animate: boolean }) {
  const { x, y, width: w, depth: d, height: h, wave, label, kind, finish } = facility
  const paint = materials[finish]
  const props = { w, d, h, paint }
  return <g transform={`translate(${x} ${y})`}>
    <g data-facility={label} data-building-kind={kind} data-build-wave={wave} className="district-facility"
      style={animate ? { '--build-delay': `${.92 + wave * .58 + (x % 5) * .019}s` } as CSSProperties : undefined}>
      <path d={`M-3 2h${w + 6}l${d * .66 + h * .15} -${d * .37}H${d * .45}Z`} fill="#32554b" opacity=".21" />
      {kind === 'cottage' || kind === 'rowhouse' ? <House {...props} terrace={kind === 'rowhouse'} />
        : kind === 'shop' ? <Shop {...props} />
        : kind === 'hall' || kind === 'civic' ? <Civic {...props} />
        : kind === 'hangar' ? <Hangar {...props} />
        : kind === 'shed' || kind === 'warehouse' ? <Warehousing {...props} shed={kind === 'shed'} />
        : kind === 'tower' ? <Tower {...props} />
        : kind === 'terminal' ? <Terminal {...props} />
        : kind === 'hospital' ? <Hospital {...props} />
        : kind === 'office' || kind === 'clinic' || kind === 'laboratory' || kind === 'radar'
        ? <Modern {...props} kind={kind} /> : <DistrictLandmark {...props} kind={kind} />}
    </g>
  </g>
}
