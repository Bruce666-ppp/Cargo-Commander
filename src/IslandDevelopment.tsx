import { useId } from 'react'
import type { CSSProperties } from 'react'
import type { District } from './districts'
import type { IslandSite } from './map-layout'

type Facility = District['facilities'][number]

const coastlines = [
  'M16 109Q5 84 27 55T84 32Q105 11 138 18l35 10q31-15 58-4l28 25q34 9 44 32 14 20 2 42-10 13-11 30-1 18-24 31l-30 5-19 12q-25 12-58-2-24 5-42 2l-43-8q-25 3-43-17l-9-21q-9-20-10-46Z',
  'M13 98q0-31 34-47l33-9 19-20q24-16 56 0l17 8 43-8q27-1 47 25l24 15q25 18 22 47l-6 24q5 29-22 46l-39 10q-33 18-58 11l-27-8-45 10q-32 4-51-20-34-3-42-25Z',
  'M14 98Q8 73 41 51l25-6q24-28 70-22l18 6 22-10q30-10 52 10l25 13q42 11 52 45l-2 31q13 29-18 52l-31 7q-21 24-58 23l-30-9-36 10q-27 8-48-12l-25-1q-33-3-44-36Z',
] as const

const grove = [[26, 89], [28, 111], [36, 66], [47, 42], [59, 42], [73, 40], [92, 36], [112, 40], [237, 39], [251, 53], [280, 75], [295, 100], [284, 122], [37, 170], [49, 179], [81, 183], [252, 172], [272, 170], [283, 155]]

function Tree({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <ellipse cx="2.7" cy="2" rx="7" ry="3" fill="#294c49" opacity=".23" />
    <path d="M0 3v-6" stroke="#685941" strokeWidth="1.3" />
    <path d="m-5-2 5-10 5 10-2 2h-7Z" fill="#47795f" />
    <path d="m-3.8-5 3.8-7 3.6 7Z" fill="#75ab78" />
  </g>
}

function Building({ facility, index, animate }: { facility: Facility; index: number; animate: boolean }) {
  const { label, kind, x, y, width: w, depth: d, height: h, tint, section } = facility
  const columns = Math.max(2, Math.floor(w / 7))
  const floors = Math.min(5, Math.max(1, Math.floor(h / 6)))
  const roof = kind === 'house' ? '#be7857' : kind === 'hangar' ? '#cae0d9' : kind === 'hospital' ? '#fff0dd' : '#dcebe0'
  return <g transform={`translate(${x} ${y})`}>
    <g data-facility={label} className="district-facility"
      style={animate ? { '--build-delay': `${.92 + section * .61 + (index % 4) * .045}s` } as CSSProperties : undefined}>
      <path d={`M-3 3h${w + 9}l${d} -${d * .5}H${d - 3}Z`} fill="#274c43" opacity=".22" />
      <path d={`M0 0h${w}v-${h}H0Z`} fill={tint} stroke="#2a5058" strokeWidth=".76" />
      <path d={`M${w} 0l${d} -${d * .55}v-${h}l-${d} ${d * .55}Z`} fill={tint} stroke="#2a5058" strokeWidth=".76" />
      <path d={`M${w} 0l${d} -${d * .55}v-${h}l-${d} ${d * .55}Z`} fill="#1d4353" opacity=".34" />
      <path d={`M0 -${h}h${w}l${d} -${d * .55}h-${w}Z`} fill={roof} stroke="#325563" strokeWidth=".74" />
      {kind === 'house' ? <path d={`M-1 -${h} ${w / 2} -${h + 6} ${w + 1} -${h}Z`} fill="#a46047" />
        : kind === 'hangar' ? <><path d={`M${w * .19} 0v-${h * .58}h${w * .62}V0`} fill="#284f61" stroke="#f2eccf" strokeWidth=".9" /><path d={`M${w * .29} -2v-${h * .43}m4 0v${h * .43}`} stroke="#8ab2b4" strokeWidth=".7" /></>
        : Array.from({ length: columns * floors }, (_, i) => <rect key={i} x={2.1 + i % columns * (w - 3) / columns} y={-h + 2.8 + Math.floor(i / columns) * 5}
          width={Math.min(4.3, w / columns - 1.4)} height="2.8" rx=".35" fill={i % 5 === 0 ? '#fae5a8' : '#e8f7ef'} opacity=".89" />)}
      {kind === 'shop' && <path d={`M2 -${h * .43}h${w - 4}l2 4H0Z`} fill="#ecb669" stroke="#faf0d7" strokeDasharray="2 1" strokeWidth="1.1" />}
      {kind === 'tower' && <><rect x="-2" y={-h + 1} width={w + 4} height="7" rx="1.3" fill="#264c63" stroke="#c9e4de" /><path d={`M${w * .6} -${h + 3}v-9m-3 3h6`} stroke="#3f6571" strokeWidth="1.1" /><circle cx={w * .6} cy={-h - 12} r="1.2" fill="#ef9553" /></>}
      {kind === 'hospital' && <g transform={`translate(${w * .5} ${-h - 4})`}><rect x="-5.2" y="-4.7" width="10.4" height="8.2" rx="1.2" fill="#fff8e8" stroke="#bc685e" strokeWidth=".8" /><path d="M-2.8-.7h5.6m-2.8-2.7v5.4" stroke="#c7514f" strokeWidth="1.7" /></g>}
      {kind === 'radar' && <g transform={`translate(${w * .62} ${-h - 2})`}><path d="M-9 0a9 10 0 0 1 18 0Z" fill="#edf6ef" stroke="#638e9a" /><path d="M0-10v10m-5-7h10" stroke="#98bcc5" strokeWidth=".7" /></g>}
      {kind === 'solar' && <path d={`M3 -${h}h${w - 1}l5 -4H8Z`} fill="#4676a0" stroke="#abd2d2" strokeDasharray="4 1" strokeWidth=".9" />}
    </g>
  </g>
}

function Vehicle({ x, y, tint, medical = false }: { x: number; y: number; tint: string; medical?: boolean }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="-.4" y="1.5" width="12" height="5" rx="1" fill="#274953" opacity=".48" />
    <rect width="8" height="4.5" rx=".9" fill={tint} /><path d="M8 1h2l1.6 1.7v1.8H8Z" fill="#e6efdb" />
    {medical && <path d="M2 2.1h3m-1.5-1.4v2.8" stroke="#c5514c" strokeWidth="1" />}
    <path d="M2 4.4h1.7m4.9 0h1.7" stroke="#304653" strokeWidth="1.5" />
  </g>
}

function Development({ district, animate }: { district: District; animate: boolean }) {
  const { grounds, facilities } = district
  const modest = grounds === 'harbor'
  const medical = grounds === 'medical'
  const civic = grounds === 'regional' || medical || grounds === 'community'
  const roads = modest
    ? 'M55 131H261m-180 0V90h158m-83 0v-29'
    : 'M31 132H283M42 132V64H277v68M42 94H277m-115-30v68'
  return <g className={animate ? 'district-building-sequence' : undefined}>
    {animate && <g className="district-foundations" fill="#f0d49c" fillOpacity=".48" stroke="#f7edcf" strokeWidth="1">
      {facilities.map(({ label, x, y, width, depth }) => <path key={label} d={`M${x} ${y}h${width}l${depth} -${depth * .55}h-${width}Z`} />)}
    </g>}
    <g className="district-infrastructure">
      <path d={roads} fill="none" stroke="#648d77" strokeWidth="7.5" strokeLinejoin="round" opacity=".35" />
      <path d={roads} fill="none" stroke={modest ? '#d5c8a1' : '#f0e3bc'} strokeWidth={modest ? 4 : 5.3} strokeLinejoin="round" />
      <path d={roads} fill="none" stroke="#f9f4d9" strokeWidth=".65" strokeDasharray="4 4" />
    </g>
    {facilities.map((facility, index) => <Building key={facility.label} facility={facility} index={index} animate={animate} />)}
    <g className="district-amenities">
      {civic ? <><rect x="145" y="124" width="32" height="12" rx="2" fill="#a6c182" stroke="#f4edc7" strokeWidth=".8" /><path d="M160 124v12m-15-6h32" stroke="#f0ebcb" strokeWidth="1.6" /><circle cx="161" cy="130" r={medical ? 2 : 3} fill="#89b9bd" /><Tree x={148} y={132} size={.52} /><Tree x={173} y={131} size={.62} /></>
        : <g fill="#baa073" stroke="#775d4d" strokeWidth=".52">{[0, 1, 2, 3, 4].map(i => <rect key={i} x={129 + 9 * i} y={125 - i % 2 * 4} width="7" height="4" rx=".6" fill={['#d4a567', '#89aeb1', '#a9846e'][i % 3]} />)}</g>}
      <Vehicle x={modest ? 78 : 58} y={128} tint={medical ? '#f5eee2' : '#c5814e'} medical={medical} />
      {!modest && <><Vehicle x={211} y={128} tint={medical ? '#faf1df' : '#79a9a9'} medical={medical} /><Vehicle x={235} y={63} tint="#d69862" /><Tree x={118} y={133} size={.67} /><Tree x={190} y={134} size={.62} /></>}
    </g>
  </g>
}

export function IslandTerrain({ site, district, animate = false }: { site: IslandSite; district?: District; animate?: boolean }) {
  const id = useId()
  const outline = coastlines[site.shape]
  return <>
    <defs>
      <linearGradient id={`${id}-island`} x2=".2" y2="1"><stop stopColor={site.grass} /><stop offset="1" stopColor={site.accent} /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#ffe090" stopOpacity=".74" /><stop offset="1" stopColor="#ffe090" stopOpacity="0" /></radialGradient>
    </defs>
    <path d={outline} fill="#bde5dc" stroke="#c2eddf" strokeWidth="14" opacity=".55" />
    <path d={outline} transform="translate(0 4)" fill="#678e84" stroke="#87b4a0" strokeWidth="5" />
    <path d={outline} fill={`url(#${id}-island)`} stroke="#ebdfb2" strokeWidth="4.7" />
    <path d="M48 53q29-13 43-19l22 5 23-14 21 11 30-10 30 5 32 17-24-3-38 2-33-4-35 9-26-3Z" fill={site.accent} opacity=".9" />
    {site.shape === 0 || site.label === 'Northstar' ? <path d="m76 41 21-17 12 6 24-19 19 11 21-7 35 23-35-12-20 4-22-4-22 13-13-6Z" fill="#6f9b85" /> : null}
    <path d="M25 119q6 35 26 48m201 15q25-6 34-23m-192 30q21 9 43 4" fill="none" stroke="#e3ebba" strokeOpacity=".45" strokeWidth="1.4" strokeDasharray="3 3" />
    {grove.map(([x, y], i) => <Tree key={i} x={x} y={y} size={.68 + i % 3 * .14} />)}
    {!district && <g fill="none" stroke="#dcd0a0" strokeWidth="3" strokeLinecap="round" opacity=".72"><path d="M43 119q34-25 83-22t75-16q29-22 61-14" /><path d="M132 99q18 12 25 28" /></g>}
    {animate && <><ellipse className="district-glow" cx="160" cy="97" rx="142" ry="93" fill={`url(#${id}-glow)`} />
      <path className="district-survey" d="M37 127 45 62l63-16h127l48 18 6 62-45 13H66Z" fill="none" stroke="#fff0af" strokeWidth="2.6" strokeDasharray="5 4" /></>}
    {district && <Development district={district} animate={animate} />}
    <g aria-hidden="true">
      <path d="M45 155h233v12H45Z" fill="#687e73" opacity=".24" />
      <rect x="42" y="146" width="236" height="20" rx="4" fill="#edeace" stroke="#74978b" strokeWidth="1.4" />
      <rect x="46" y="149" width="228" height="14" rx="2" fill="#365d66" />
      <path d="M62 156h196" stroke="#edf5e9" strokeWidth="1.1" strokeDasharray="7 4" />
      <path d="M53 152v8m3-8v8m208-8v8m3-8v8m-63 4v11h37v-11" fill="none" stroke="#f6f2da" strokeWidth="1.4" />
      <rect x="200" y="174" width="45" height="10" rx="2" fill="#c6dcd1" stroke="#789b98" strokeWidth="1.1" />
      <path d="M204 179h8m4 0h8m4 0h8" stroke="#799ca0" strokeWidth="1.2" />
    </g>
    {animate && <g className="district-sparks">{Array.from({ length: 21 }, (_, i) => <rect key={i} x={30 + (i * 37) % 262} y={23 + (i * 19) % 114} width="2.7" height="5.1" rx="1" fill={i % 2 ? '#ffedaa' : '#eefbf2'} transform={`rotate(${i * 13} 160 95)`} />)}</g>}
  </>
}

export function DistrictScene({ site, district, developed, animate = false }: { site: IslandSite; district: District; developed: boolean; animate?: boolean }) {
  const id = useId()
  return <svg className={`district-scene${animate ? ' district-construction' : ''}`} viewBox="0 0 320 214" role="img"
    aria-label={developed ? `${district.name}. ${district.facilities.length} buildings.` : `${site.label} before development, with a runway and coastal paths.`}>
    <defs><linearGradient id={id} x2=".7" y2="1"><stop stopColor="#a5dce9" /><stop offset="1" stopColor="#4591ae" /></linearGradient></defs>
    <rect width="320" height="214" fill={`url(#${id})`} />
    <path d="M12 37q11-5 21 0m3 12q10-5 19 0M266 33q14-5 26 0M49 194q11-4 23 0m196-1q12-6 24 0m-94 10q12-4 20 0" fill="none" stroke="#e0f8ec" strokeOpacity=".55" strokeLinecap="round" />
    <IslandTerrain site={site} district={developed ? district : undefined} animate={animate} />
  </svg>
}
