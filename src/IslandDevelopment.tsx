import { useId } from 'react'
import { Building } from './Architecture'
import type { District } from './districts'
import type { IslandSite } from './map-layout'

const islands = [
  { coast: 'M17 104Q9 82 29 60l22-9q18-22 38-25l35 3q22-17 46-12l32 17q20-8 43 2l27 21q31 10 34 35l-7 33q5 27-16 43l-27 2q-24 26-62 28l-31-4-32 8q-26 7-50-9l-27-7q-26-4-37-24l4-37Z', ridge: 'M30 84q16-23 43-34l34-6 16-12 23 11 26-20 24 19 26-4 27 15q-45-1-59 10-37 8-65 5-48-3-95 16Z', runway: [59, 196] },
  { coast: 'M14 98q-5-27 26-49l32-8q18-23 56-24l25 9q31-7 56 0l25 15 30 4q31 8 42 42l1 25q10 29-10 52l-30 12q-16 22-48 21l-37-6-26 10q-30 8-57-6l-24-3q-32-2-42-24l-3-30q-18-20-16-40Z', ridge: 'M29 76q17-17 47-24 20-22 42-24l33 11 29-9q38 5 69 26-38-5-55 1-51 16-74 10-46-10-91 9Z', runway: [53, 213] },
  { coast: 'M14 99q-5-35 28-43l28-6q22-21 39-20l37-7q35-19 64-2l30 19q27 1 43 14 26 17 24 45l-7 24 9 18q4 21-20 34l-43 6q-27 25-53 20l-37-12q-22 8-58 8l-28-14q-27 3-43-15-15-22-7-44Z', ridge: 'M35 76q29-13 47-21 18-17 52-18l38-16 28 6 30 21q24 3 40 17-31-9-74-3-48-9-79 1-34 8-82 13Z', runway: [43, 233] },
  { coast: 'M16 92q-5-25 28-35l24-14q24-21 50-15l28 5q34-18 59-13l27 14 35 11q29 2 37 38 7 15-4 33l5 25q2 25-26 39l-40 6q-18 18-47 15l-42-12-28 9q-33 9-54-13l-30-8q-25-10-25-37l7-25Z', ridge: 'M29 78q17-13 43-25 21-20 48-14l24 6 37-14 27 5 21 13q35 5 50 19-33-12-68-5-42-7-72 0-44-6-110 15Z', runway: [42, 237] },
  { coast: 'M14 101q-3-32 28-51l31-12q26-18 56-13l32 4 28-15q29-8 57 16l28 14q28 14 32 43l-5 22 8 28q-3 28-28 40l-39 8q-24 18-52 16l-36-10-35 10q-28 1-50-14l-27-4q-30-4-37-28l8-29Z', ridge: 'M28 81q22-23 51-30 28-19 56-14l30 8 32-18 27 7 28 19 32 16q-34-7-64-9-36 7-64-3-59 7-128 24Z', runway: [45, 230] },
  { coast: 'M13 95q-2-29 32-51l25-8 24-14q23-15 47-6l32 11 29-15q31-7 52 19l21 19q27 9 31 32l-6 32 6 25q-8 28-33 39l-37 7q-33 20-60 11l-26-8-35 13q-34 3-60-14l-23-7q-27-13-19-45Z', ridge: 'M25 92 58 61l20-18 23 6 29-30 31 26 20-12 14 4 22-22 37 41 24 17q-37-5-58-3-52-14-89 1-50-2-106 21Z', runway: [46, 229] },
  { coast: 'M12 99q-5-34 25-48l25-2q23-24 55-20l31-7q24-15 47-7l29 14q31-2 51 21 26 10 30 38l-5 20q13 24 1 44l-24 22-29 4-19 19q-28 10-51-2l-20-5-41 13q-22 1-45-14l-28-4q-28-13-28-37l2-26Z', ridge: 'M25 85q11-21 41-25 29-22 53-17l34-9q32-12 52-5l22 14q35 2 52 21-28-5-52-5-33 3-57-4-40 9-66 9-52-1-79 21Z', runway: [35, 250] },
] as const

const coastalTrees = [[23, 98], [31, 109], [34, 76], [44, 63], [56, 49], [74, 44], [99, 34], [144, 36], [205, 36], [241, 47], [273, 62], [286, 76], [293, 99], [289, 128], [38, 169], [55, 179], [74, 185], [117, 190], [183, 187], [245, 176], [275, 169], [289, 154]] as const
const plainTrees = [[55, 96], [85, 81], [104, 75], [122, 94], [150, 79], [185, 110], [219, 73], [242, 95], [257, 117]] as const
const shoreRocks = [[20, 145, .8], [33, 168, .74], [56, 180, .8], [88, 187, .91], [107, 192, .83], [140, 195, .63], [192, 191, .95], [211, 189, .86], [255, 179, .73], [274, 172, .86], [298, 151, .66]] as const

function Rock({ x, y, size }: { x: number; y: number; size: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M-9 2-7-4-1-10 5-11l6 6 2 7-7 4-12-1Z" fill="#c0ad89" />
    <path d="m-9 2 3 3 12 1 7-4-2-7-7 3-4-6-4 6Z" fill="#9d947d" />
    <path d="m-7-4 6-6 6-1 6 6-7 3-4-6-4 6Z" fill="#e1cc9e" />
    <path d="m4-2 2 8-6-.6-1-4Z" fill="#b0a080" />
  </g>
}

function Tree({ x, y, size = 1, pine = false }: { x: number; y: number; size?: number; pine?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <ellipse cx="3.7" cy="1.2" rx="7.6" ry="2.45" fill="#315f51" opacity=".21" />
    <path d="M0 2v-6" stroke="#725f49" strokeWidth="1.25" strokeLinecap="round" />
    {pine ? <><path d="M-5.6-.6 0-12 5.3-.6 0 1Z" fill="#4b7b66" /><path d="m-4-5 4-7.4 3.9 7.6Z" fill="#83a878" /></>
      : <><path d="M-4.5-2q-3-1-2.8-4 .2-3 3.4-3.7 1.1-3.6 5.2-3.2 3.8.5 4.5 4.1 2.8 1.9 1 4.9-1.5 2.8-6.8 2.9Z" fill="#5c916f" /><path d="M-5.5-6q.6-2.8 3.6-3 1.3-2.4 4-2 2.5.4 3.4 3.5-4.1 4.3-11 1.5Z" fill="#95b47b" /></>}
  </g>
}

function Palm({ x, y, size }: { x: number; y: number; size: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <ellipse cx="3.7" cy=".9" rx="7" ry="2" fill="#3d6454" opacity=".26" />
    <path d="M0 1q3-7 1-14" fill="none" stroke="#8d7554" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M1-12q-7-8-12-1 7-3 11 2-7-3-9 4 5-5 9-3 3-6 9-2-4 0-7 2 7-3 9 4-5-4-9-3 0-7 4-9-4 1-5 5Z" fill="#557f59" />
    <path d="M1-13q-7-7-12 0 7-4 12 0 4-5 8 1-5-3-8-1Z" fill="#a5b976" />
  </g>
}

function Container({ x, y, colour }: { x: number; y: number; colour: string }) {
  return <g transform={`translate(${x} ${y})`} aria-hidden="true">
    <path d="M-.8 1.2h11l4.1-2.3H4Z" fill="#3c6157" opacity=".28" />
    <path d="M0 0h9.3v-4.8H0Z" fill={colour} stroke="#5c6760" strokeWidth=".45" />
    <path d="M9.3 0l3.7-2.05v-4.8L9.3-4.8Z" fill={colour} stroke="#566861" strokeWidth=".45" />
    <path d="M9.3 0 13-2.05v-4.8L9.3-4.8Z" fill="#233944" opacity=".24" />
    <path d="M0-4.8h9.3L13-6.85H3.7Z" fill={colour} stroke="#68796a" strokeWidth=".45" />
    <path d="M1-4h7.4M1.3-3.4v2.8m1.2-2.8v2.8m1.2-2.8v2.8m1.2-2.8v2.8m1.2-2.8v2.8m1.2-2.8v2.8" stroke="#f4edd6" strokeWidth=".35" opacity=".65" />
  </g>
}

function Vehicle({ kind, x, y }: { kind: District['vehicles'][number][0]; x: number; y: number }) {
  const longer = kind === 'truck'
  const back = longer ? 10 : 7.5
  const front = back + 5
  const colour = kind === 'ambulance' ? '#fff2d9' : kind === 'tug' ? '#daa968' : kind === 'van' ? '#83adad' : '#c98759'
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx={front / 2 + 1.5} cy="1.4" rx={front / 2 + .8} ry="2.2" fill="#285247" opacity=".23" />
    <rect x=".2" y="-4.3" width={back} height="3.8" rx=".8" fill={colour} stroke="#52665e" strokeWidth=".5" />
    <path d={`M0 -4.1h${back}l1.9 -1.2H1.9Z`} fill="#e6e1bc" opacity=".72" />
    <path d={`M${back} -.45v-4.05h2.5l2.5 2.1v1.95Z`} fill="#e4eddb" stroke="#57716c" strokeWidth=".45" />
    <path d={`M${back + .75} -3.95h1.4l1.4 1.38h-2.8Z`} fill="#508092" />
    {kind === 'ambulance' && <path d="M2.2-2.55h3.8m-1.9-1.5v3" stroke="#b74b48" strokeWidth=".95" />}
    <circle cx="3.3" cy="-.65" r="1.15" fill="#3b5151" /><circle cx={front - 2} cy="-.65" r="1.15" fill="#3b5151" />
    <path d={`M${front - .5} -1.95h1`} stroke="#fee8a1" />
  </g>
}

function Court({ court }: { court: District['courts'][number] }) {
  const [kind, x, y, width, depth] = court
  const sx = depth * .7
  const sy = depth * .55
  const edging = kind === 'garden' ? '#e8e3ac' : '#e1d7be'
  const tone = { garden: '#89ae70', square: '#ddc69c', loading: '#b9b7a0', apron: '#a7b7aa', energy: '#a4bb99', plaza: '#d1c8ae' }[kind]
  return <g transform={`translate(${x} ${y})`}>
    <path d={`M0 0h${width}l${sx} -${sy}h-${width}Z`} fill={tone} stroke={edging} strokeWidth="1.1" />
    {kind === 'garden' && <>
      <path d={`M${width * .45} 0l${sx} -${sy}M${sx * .5} -${sy * .5}h${width}`} stroke="#e6d7a5" strokeWidth="1.55" />
      {[.2, .72, .89].map((position, index) => <g key={position}><Tree x={width * position + index * .75} y={-sy * .47 + index % 2 * 2.4} size={.43 + index * .08} /><ellipse cx={width * position + 4.3} cy={-sy * .25} rx="2.8" ry="1.2" fill="#d7a291" /></g>)}
    </>}
    {kind === 'square' && <>
      <path d={`M2 -2h${width - 2}m5 -3h-${width - 2}m0 0l${sx} -${sy * .43}`} fill="none" stroke="#efdfb5" strokeWidth=".65" />
      <ellipse cx={width * .55} cy={-sy * .52} rx={Math.min(6, width * .17)} ry="2.65" fill="#8bb5b6" stroke="#f5e9c0" strokeWidth="1.4" />
      <path d={`M${width * .55} -${sy * .52 + .5}v-2.8`} stroke="#eef1d6" strokeWidth=".9" />
    </>}
    {kind === 'plaza' && <g transform={`translate(${width * .66} ${-sy * .49})`}>
      <path d="M-26 4 16-4m-23 12 13-15" stroke="#f2e9ce" strokeWidth=".7" />
      <ellipse rx="15" ry="6.5" fill="#d9e3d1" stroke="#faf2d6" strokeWidth="1.15" />
      <ellipse rx="10" ry="4.2" fill="#5eb1ca" stroke="#577f89" strokeWidth=".75" />
      <ellipse rx="5.8" ry="2.1" fill="none" stroke="#dbf6ef" strokeWidth=".64" />
      <path d="M0-.2c-2-3 1-11 1-13 1 5 2 11-.6 13m-1.4-.7q-3-5-6-4m8.7 4q3-5 6-4" stroke="#f2f9e8" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <ellipse cx="-22" cy="3" rx="4.4" ry="1.8" fill="#7aa779" />
      <ellipse cx="20" cy="2" rx="4.7" ry="2" fill="#7aa779" />
      <Tree x={-22} y={3} size={.61} /><Tree x={20} y={2} size={.68} />
    </g>}
    {kind === 'apron' && [0.12, .32, .52, .72].map(part => <path key={part} d={`M${width * part} -1l${sx * .78} -${sy * .78}`} stroke="#ede9c7" strokeWidth=".65" strokeDasharray="2 1.5" />)}
    {kind === 'energy' && [.06, .29, .52, .75].map(part => <g key={part} transform={`translate(${width * part} -2)`}><path d="M0 0h11l5-6H5Z" fill="#4d8090" stroke="#d5e3d0" strokeWidth=".75" /><path d="m3-3 11 0m-5 3 5-6" stroke="#9dc8c8" strokeWidth=".5" /></g>)}
    {kind === 'loading' && <path d={`M3 -1h${width - 5}l${sx * .8} -${sy * .82}`} fill="none" stroke="#f1e3b5" strokeWidth=".78" strokeDasharray="3 2" />}
  </g>
}

function Apron({ airfield }: { airfield: NonNullable<District['airfield']> }) {
  const regional = airfield === 'regional'
  const perimeter = regional ? 'M43 136 54 107H145l15 16 34 3h75l-8 14h-110v8h-15v-11Z'
    : airfield === 'rural' ? 'M55 133 77 109h149l22 10-17 19h-57v10h-12v-12Z'
    : 'M63 135 87 113h141l21 9-6 16h-59v10h-12v-13Z'
  return <g>
    <path d={perimeter} transform="translate(1 1.5)" fill="#37584c" opacity=".27" />
    <path d={perimeter} fill={regional ? '#c7c3ac' : '#bbbfa7'} stroke="#ece7c5" strokeWidth="1.35" strokeLinejoin="round" />
    {(regional ? [56, 87, 118, 213, 240] : [79, 109, 140, 184, 214]).map((x, i) =>
      <path key={x} d={`M${x} 133l${i > 2 ? 3 : 6} -${i === 3 && regional ? 5 : 16}h17`} fill="none" stroke={regional ? '#efda91' : '#e1cd91'} strokeWidth={regional ? 1.05 : .7} />)}
    <path d={regional ? 'M96 134h40q7 0 7 6v7m7-8h104' : airfield === 'rural' ? 'M113 132h48q7 0 7 7v8' : 'M120 132h51q7 0 7 7v8'} stroke="#e8cc7e" strokeWidth="1.15" fill="none" />
    <path d="M208 131h12m-10 2h8m-7.5 2h5.4" stroke="#eee7d0" strokeWidth=".8" />
  </g>
}

function ParkedAircraft({ x, y, size }: { x: number; y: number; size: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`} aria-hidden="true">
    <path d="M-1 2q17-3 31-.5l10 2-20 1-4 4-4-1 2-3Q2 5-1 2Z" fill="#42606a" opacity=".3" />
    <path d="M21-5 15-13l-5-1 3 8m16 0 5-10 4-.9-2 12" fill="#a4c3cf" stroke="#3e6c82" strokeWidth=".53" />
    <path d="M-3-3.8q2.7-3.3 7.9-3.5L31-6.4l7 1-3.5 2.7-31 1.4q-7 0-6.5-2.5Z" fill="#f6f5e8" stroke="#426e80" strokeWidth=".68" />
    <path d="m-1-2.6 33-2.2 3.1 1.5L3.5-1.25Z" fill="#3885ad" />
    <path d="m1.3-5.9 4.4-.9-.8 1.7-4.2.4m9-1.2h12.5" stroke="#244c64" strokeWidth=".82" strokeDasharray="1.15 .95" />
    <path d="m18-4.1 10 5.5-8 1.2-8-6.2Z" fill="#d6e6df" stroke="#719fa7" strokeWidth=".65" />
    <path d="M4-.8v1.9m15-.8v1.7" stroke="#315261" strokeWidth=".84" />
    <circle cx="3.9" cy="1.2" r=".83" fill="#244c60" /><circle cx="19" cy="2.2" r=".95" fill="#244c60" />
  </g>
}

function Development({ district, animate }: { district: District; animate: boolean }) {
  const { road, facilities, courts, trees, vehicles, airfield } = district
  const basic = district.yard === 'workshop'
  const skyline = [
    ...facilities.map(facility => ({ y: facility.y, art: <Building key={facility.label} facility={facility} animate={animate} /> })),
    ...trees.map(([x, y, size], i) => ({ y, art: <g className="district-amenities" key={`tree-${i}`}><Tree x={x} y={y} size={size} pine={i % 4 === 0} /></g> })),
  ].sort((a, b) => a.y - b.y)
  return <g className={animate ? 'district-building-sequence' : undefined}>
    {animate && <g className="district-foundations" fill="#f1cf95" fillOpacity=".58" stroke="#f7edcf" strokeWidth="1">
      {facilities.map(({ label, x, y, width, depth }) => <path key={label} d={`M${x} ${y}h${width}l${depth * .66} -${depth * .45}h-${width}Z`} />)}
    </g>}
    <g className="district-infrastructure" fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d={road} stroke="#527b62" strokeWidth={basic ? 7.7 : 9} opacity=".23" transform="translate(.9 1)" />
      <path d={road} stroke={basic ? '#dec998' : '#f1dfb7'} strokeWidth={basic ? 5.8 : 7.3} />
      <path d={road} stroke="#978c76" strokeWidth={basic ? 2.3 : 4.4} opacity=".55" />
      {!basic && <path d={road} stroke="#fbefc2" strokeWidth=".55" strokeDasharray="3 3.8" opacity=".84" />}
      {airfield && <Apron airfield={airfield} />}
    </g>
    <g className="district-amenities">{courts.map(court => <Court key={court[1] + ',' + court[2]} court={court} />)}</g>
    {skyline.map(({ art }) => art)}
    <g className="district-amenities">
      {vehicles.map(([kind, x, y]) => <Vehicle key={x} kind={kind} x={x} y={y} />)}
      {district.yard === 'containers' && <g>
        <Container x={241} y={112} colour="#b9785d" /><Container x={255} y={110} colour="#71969a" /><Container x={256} y={116} colour="#9cab80" />
        <Container x={108} y={95} colour="#b39660" /><Container x={122} y={98} colour="#74979a" />
      </g>}
      {basic && <>
        <path d="M45 80q12 2 31-3m-30-1v5m7-4v5m8-6v5m7-6v5m8-8v5" fill="none" stroke="#ab875d" strokeWidth=".83" />
        <path d="M59 115h5v4h-5Zm5-2h4v4h-4Zm4 4h4v3h-4Zm14-2h4v4h-4Z" fill="#b28664" stroke="#f0d69d" strokeWidth=".62" />
        <path d="M203 82v13m.5-13 9 1-2 2.1-7.3-1Z" stroke="#f5e9c9" fill="#d99662" strokeWidth=".75" />
      </>}
      {airfield && <ParkedAircraft x={airfield === 'regional' ? 119 : airfield === 'rural' ? 138 : 147} y={airfield === 'regional' ? 130 : 129} size={airfield === 'regional' ? 1.08 : .88} />}
    </g>
  </g>
}

function Runway({ start, width, airfield }: { start: number; width: number; airfield?: District['airfield'] }) {
  const east = start + width
  return <g aria-hidden="true">
    <path d={`M${start - 2} 154h${width + 4}v13H${start - 2}Z`} fill="#58786b" opacity=".31" />
    <path d={`M${east - 74} 161v15h53v-15`} fill="#9cb4a7" stroke="#e5dcbc" strokeWidth="2.3" strokeLinejoin="round" />
    <rect x={east - 79} y="171.5" width="64" height="12" rx="3.2" fill="#b6cdc0" stroke="#759e94" strokeWidth=".9" />
    <path d={`M${east - 73} 178h53`} stroke="#e9e6c5" strokeWidth="1.25" strokeDasharray="7 3.5" />
    <rect x={start} y="145" width={width} height="20" rx="4.5" fill="#ece5c3" stroke="#67968b" strokeWidth="1.2" />
    <rect x={start + 4} y="148.2" width={width - 8} height="13.4" rx="2.7" fill={airfield === 'regional' ? '#354e5c' : '#355d67'} />
    <path d={`M${start + 16} 154.9h${width - 32}`} stroke="#eff3dc" strokeWidth="1.05" strokeDasharray="7 4" />
    <path d={`M${start + 9} 151.5v7m3-7v7m${width - 24} -7v7m3-7v7`} fill="none" stroke="#f6f2df" strokeWidth=".91" />
    <path d={`M${start + 6} 163h${width - 12}`} stroke="#d1cbaf" strokeWidth="1.05" opacity=".7" />
    {airfield && [.04, .16, .28, .4, .52, .64, .76, .88, .96].map(part => <path key={part} d={`M${start + part * width} 146.6v.6m0 15.2v.6`} stroke="#ffe5a0" strokeWidth="1.3" strokeLinecap="round" />)}
  </g>
}

export function IslandTerrain({ site, district, animate = false }: { site: IslandSite; district?: District; animate?: boolean }) {
  const id = useId()
  const { coast, ridge, runway } = islands[site.shape]
  return <>
    <defs>
      <linearGradient id={`${id}-island`} x1=".2" y1="0" x2=".62" y2="1"><stop stopColor={site.grass} /><stop offset=".68" stopColor={site.grass} /><stop offset="1" stopColor={site.accent} /></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#ffe39a" stopOpacity=".65" /><stop offset="1" stopColor="#ffe39a" stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-land`}><path d={coast} /></clipPath>
    </defs>
    <path d={coast} transform="translate(1 3.6)" fill="#6fafad" stroke="#c9ebdb" strokeWidth="17" opacity=".51" />
    <path d={coast} transform="translate(0 4)" fill="#82b0a4" stroke="#e9f7e1" strokeWidth="6.6" strokeOpacity=".62" />
    <path d={coast} transform="translate(0 3.5)" fill="#9c9f84" stroke="#9caa90" strokeWidth="4" />
    <path d={coast} fill={`url(#${id}-island)`} stroke="#e8deb2" strokeWidth="4.5" />
    <g clipPath={`url(#${id}-land)`}>
      <path d={ridge} fill={site.accent} opacity=".89" />
      <path d={ridge} transform="translate(5.5 10) scale(.93 .86)" fill="#5c886d" opacity=".27" />
      <path d="M18 177q43-25 89-20 40 4 83 8 57-5 112-22v61H18Z" fill="#658f72" opacity=".36" />
      <path d="M32 116q16-11 35-12 14-12 29-16 26-4 39 .5-27 2-44 10-21 17-59 17Zm161-46q27-14 57-7 14 1 29 16-17-5-28-6-25-5-58-3Z" fill="#d6e2ac" opacity=".55" />
      {site.shape === 5 && <path d="m74 49 17-8 11 4 28-26 30 26 30-12 5 4 22-22 32 36-25-13-12 2-4-8-8 12-16 2-10 6-15-2-25-18-19 16Z" fill="#b6cfc1" opacity=".88" />}
      <path d="M25 123q10 32 28 45m49 19q17 8 36 2m114-6q22-5 35-21m6-31 7-15" fill="none" stroke="#eef0c6" strokeWidth="1.4" strokeDasharray="2 3.5" opacity=".69" />
      <g opacity={site.shape === 5 ? .68 : .92}>{shoreRocks.map(([x, y, size], i) => <Rock key={x} x={x + (site.shape * 13 + i * 7) % 12 - 6} y={y + (site.shape + i) % 5 - 2} size={size} />)}</g>
      {coastalTrees.map(([x, y], i) => <Tree key={i} x={x} y={y} size={.58 + i % 3 * .16} pine={site.shape === 5 || i % 3 === 0} />)}
      {site.shape !== 5 && <><Palm x={34} y={137} size={1} /><Palm x={95 + site.shape * 6} y={180} size={1.06} /><Palm x={280 - site.shape} y={133} size={1.11} /></>}
      {!district && <>
        <path d="M43 120q32-23 75-22 25 0 42 10 19 11 27 32m-29-32q30-31 89-35" fill="none" stroke="#dfd0a1" strokeWidth="3.3" strokeLinecap="round" opacity=".83" />
        {plainTrees.map(([x, y], i) => <Tree key={i} x={x} y={y} size={.69 + i % 3 * .20} pine={i % 3 === 0} />)}
      </>}
      {animate && <><ellipse className="district-glow" cx="161" cy="91" rx="147" ry="92" fill={`url(#${id}-glow)`} /><path className="district-survey" d="M38 127 49 71l58-31 66-10 71 26 39 33 5 43-55 7-129 4Z" fill="none" stroke="#fff0b5" strokeWidth="2.15" strokeDasharray="4.5 4" /></>}
    </g>
    {district && <Development district={district} animate={animate} />}
    <Runway start={runway[0]} width={runway[1]} airfield={district?.airfield} />
    {animate && <g className="district-sparks">{Array.from({ length: 19 }, (_, i) => <rect key={i} x={32 + (i * 37) % 261} y={22 + (i * 19) % 113} width="2.8" height="4.5" rx="1" fill={i % 2 ? '#ffdfa1' : '#f4faf0'} transform={`rotate(${i * 13} 160 93)`} />)}</g>}
  </>
}

export function DistrictScene({ site, district, developed, animate = false }: { site: IslandSite; district: District; developed: boolean; animate?: boolean }) {
  const id = useId()
  return <svg className={`district-scene${animate ? ' district-construction' : ''}`} viewBox="0 0 320 214" role="img"
    aria-label={developed ? district.name : `${site.label} before development, with a runway and coastal paths.`}>
    <defs><linearGradient id={id} x1=".15" y1="0" x2=".9" y2="1"><stop stopColor="#81c7d6" /><stop offset="1" stopColor="#397f9e" /></linearGradient></defs>
    <rect width="320" height="214" fill={`url(#${id})`} />
    <path d="M12 37q11-5 21 0m3 12q10-5 19 0M266 33q14-5 26 0M26 188q11-4 23 0m219 5q12-6 24 0m-94 10q12-4 20 0" fill="none" stroke="#e0f8ec" strokeOpacity=".58" strokeLinecap="round" />
    <path d="M24 29q11-4 21 0m235 12q12-5 24 0M10 182q10-4 21 0m222 22q13-5 25 0" fill="none" stroke="#e6f9e8" strokeOpacity=".26" strokeLinecap="round" />
    <IslandTerrain site={site} district={developed ? district : undefined} animate={animate} />
  </svg>
}
