import { useId } from 'react'
import type { CSSProperties } from 'react'
import { districts } from './districts'

type District = typeof districts[number]
type Structure = District['facilities'][number]

function Building({ facility, index }: { facility: Structure; index: number }) {
  const [name, kind, x, y, width, depth, height, tint] = facility
  const wing = width + depth
  const level = -height
  const windows = Math.max(1, Math.floor(width / 10))
  const rows = Math.min(4, Math.max(1, Math.floor(height / 10)))
  return <g transform={`translate(${x} ${y})`}>
    <g className="district-facility" style={{ '--build-delay': `${.92 + index * .39}s` } as CSSProperties}>
      <title>{name}</title>
      <path d={`M-5 2h${width + 3}l${depth + 10} -${depth * .54}H${depth - 2}Z`} fill="#1f543f" opacity=".2" transform="translate(5 5)" />
      {kind === 'park' ? <>
        <path d={`M0 0h${width}l${depth} -${depth * .55}h-${width}Z`} fill={tint} stroke="#e9ecd3" strokeWidth="1.3" />
        {[.22, .49, .76].map(f => <path key={f} d={`M${width * f} -1l${depth * .78} -${depth * .43}`} stroke="#eff4e0" strokeOpacity=".8" strokeWidth="1" />)}
      </> : <>
        <path d={`M0 0h${width}v${level}H0Z`} fill={tint} stroke="#294855" strokeWidth="1" />
        <path d={`M${width} 0l${depth} -${depth * .55}v${level}l-${depth} ${depth * .55}Z`} fill={tint} stroke="#294855" strokeWidth="1" />
        <path d={`M${width} 0l${depth} -${depth * .55}v${level}l-${depth} ${depth * .55}Z`} fill="#172e50" opacity=".25" />
        <path d={`M0 ${level}h${width}l${depth} -${depth * .55}h-${width}Z`} fill="#dce7dd" stroke="#35596b" strokeWidth="1.1" />
        {kind === 'house' && <><path d={`M-2 ${level}l${width / 2 + 2} -10 ${width / 2 + 2} 10Z`} fill="#b86f52" /><path d={`M${width / 2} ${level - 10}l${depth} -${depth * .55} ${width / 2 + 2} 10 -${depth} ${depth * .55}Z`} fill="#92533c" /></>}
        {kind === 'hangar' ? <rect x={width * .18} y={-height * .66} width={width * .64} height={height * .66} rx="2" fill="#244e63" stroke="#d9e7e5" strokeWidth="1" /> :
          Array.from({ length: windows * rows }, (_, i) => <rect key={i} x={4 + (i % windows) * (width - 5) / windows} y={level + 5 + Math.floor(i / windows) * 8} width={Math.min(6, width / windows - 2)} height="4.4" rx=".6" fill={i % 5 === 0 ? '#f9df9c' : '#e6f4ee'} opacity=".9" />)}
        {kind === 'hospital' && <g transform={`translate(${width * .53} ${level - 3})`}>
          <rect x="-10" y="-10" width="20" height="13" rx="2" fill="#fff9ee" stroke="#b34e49" />
          <path d="M-4-4h8m-4-4v8" stroke="#c95249" strokeWidth="2.6" />
        </g>}
        {kind === 'tower' && <><path d={`M${width * .62} ${level - 4}v-18m-6 7h12`} stroke="#365367" strokeWidth="1.7" /><circle cx={width * .62} cy={level - 23} r="2" fill="#ef9b5e" /></>}
        {kind === 'dome' && <path d={`M${width * .22} ${level - 4}q3-24 ${width * .72} 0Z`} fill="#ecf6ef" stroke="#7ba7af" strokeWidth="1.4" />}
        {kind === 'solar' && <path d={`M5 ${level - 1}h${wing - 15}l8 -6H13Z`} fill="#315f89" stroke="#9ac9d6" />}
      </>}
    </g>
  </g>
}

export function DistrictFootprint({ district, animate = false }: { district: District; animate?: boolean }) {
  const order = [...district.facilities].sort((a, b) => a[3] - b[3])
  return <g className={animate ? 'district-building-sequence' : undefined}>
    <g className="district-services">
      <path d="M38 128 115 114 153 128 208 126 279 116m-170 3 8 33 76 8 45-19" stroke="#487c6b" strokeWidth="12" strokeLinejoin="round" fill="none" opacity=".25" />
      <path d="M38 125 115 110 153 125 208 123 279 113m-170 3 8 33 76 8 45-19" stroke="#e5debe" strokeWidth="8" strokeLinejoin="round" fill="none" />
      <path d="M38 125 115 110 153 125 208 123 279 113m-170 3 8 33 76 8 45-19" stroke="#f6f3dc" strokeWidth="1.4" strokeDasharray="5 4" fill="none" />
      <rect x="48" y="127" width="17" height="7" rx="2" fill="#d99053" /><rect x="57" y="128" width="7" height="4" rx="1" fill="#f3ddaa" />
      <rect x="200" y="144" width="16" height="6" rx="2" fill="#eaf3e2" /><rect x="205" y="145" width="5" height="3" fill="#b8544b" />
      <g fill="#cfaa66" stroke="#8b7051" strokeWidth=".8"><rect x="78" y="125" width="8" height="5" rx="1" /><rect x="87" y="123" width="7" height="5" rx="1" /><rect x="97" y="124" width="7" height="6" rx="1" /></g>
    </g>
    {order.map((facility, index) => <Building key={facility[0]} facility={facility} index={index} />)}
  </g>
}

export function DistrictScene({ district, developed, animate = false }: { district: District; developed: boolean; animate?: boolean }) {
  const id = useId()
  return <svg className={`district-scene${animate ? ' district-construction' : ''}`} viewBox="0 0 320 190" role="img"
    aria-label={developed ? `${district.name}. ${district.facilities.map(item => item[0]).join(', ')}.` : 'Island site before development, with coastal paths and trees.'}>
    <defs>
      <linearGradient id={id} x2="1" y2="1"><stop stopColor="#94d2df" /><stop offset="1" stopColor="#31839f" /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#ffdb7d" stopOpacity=".83" /><stop offset="1" stopColor="#ffdb7d" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width="320" height="190" fill={`url(#${id})`} />
    <g fill="none" stroke="#d4f1e9" strokeOpacity=".55"><path d="M6 150q14-5 27 0m236-12q13-5 24 0M20 76q9-4 17 0m222 99q12-4 23 0m-110-7q10-5 22 0" /></g>
    <path d="M22 118q-10-26 18-48l36-12q19-26 49-24l35 3 37-9q30-2 55 21l31 12q25 15 22 42-5 36-44 48l-28 3q-27 23-85 21-21-5-44-3-28 1-45-18-30-4-37-38Z" fill="#93cfbf" stroke="#cdf0d3" strokeWidth="8" />
    <path d="M28 114q-7-25 17-43l38-12q14-24 44-23l33 4 39-10q28-1 51 22l31 12q26 16 16 44-5 29-44 42l-22 1q-31 22-78 18l-47-1q-28 0-43-19-25-1-35-35Z" fill="#a8bf8c" stroke="#e2d8a5" strokeWidth="4" />
    <path d="M36 94 75 58l21 11 28-30 26 27 26-16 57 16-27-19-21-12-25 7-35-6-43 25Z" fill="#6d9d83" />
    <path d="M41 130q43-26 89-25t67-11q20-12 65-11" fill="none" stroke="#cfca9d" strokeWidth="4" opacity=".78" />
    {[[46, 94], [62, 66], [79, 84], [113, 62], [150, 55], [210, 59], [251, 58], [274, 89], [271, 140], [116, 163], [61, 141]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>
      <ellipse cx="3" cy="3" rx="7" ry="3" fill="#3e6a58" opacity=".22" /><path d="M0 3v-8" stroke="#785e45" strokeWidth="1.4" /><path d="m-5-3 5-9 6 9-2 2h-7Z" fill="#54896b" /><path d="m-4-6 4-7 4 7Z" fill="#6aa87d" />
    </g>)}
    {animate && <><ellipse className="district-glow" cx="165" cy="94" rx="145" ry="87" fill={`url(#${id}-glow)`} />
      <g className="district-survey" fill="none" stroke="#f7df91" strokeWidth="2" strokeDasharray="5 4"><path d="M52 112 123 75l145 15-17 49-129 23Z" /><path d="M67 109v-28m0 2h38l-9-9m-9 9v13" strokeDasharray="none" /></g></>}
    {developed && <DistrictFootprint district={district} animate={animate} />}
    {animate && <g className="district-sparks">{Array.from({ length: 18 }, (_, i) => <rect key={i} x={38 + (i * 37) % 243} y={40 + (i * 19) % 96} width="3.5" height="5" rx="1" fill={i % 2 ? '#ffedaa' : '#f2fff0'} transform={`rotate(${i * 13} 160 95)`} />)}</g>}
  </svg>
}
