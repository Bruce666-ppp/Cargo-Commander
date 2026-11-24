import { useEffect, useId, useState } from 'react'
import { discoveredAirports, nextAvailableMission } from './career'
import type { CareerProgress, MapDiscovery } from './career'
import { campaign } from './mission'
import { districts, harborSettlement } from './districts'
import { IslandTerrain } from './IslandDevelopment'
import { islandScale, narrowMap, wideMap } from './map-layout'

const narrowQuery = '(max-width: 620px)'

export function FlightMap({ progress, discovery }: { progress: CareerProgress; discovery?: MapDiscovery | null }) {
  const id = useId()
  const [narrow, setNarrow] = useState(() => window.matchMedia(narrowQuery).matches)
  useEffect(() => {
    const media = window.matchMedia(narrowQuery)
    const resize = () => setNarrow(media.matches)
    media.addEventListener('change', resize)
    return () => media.removeEventListener('change', resize)
  }, [])
  const { sites, routeLines, width, height } = narrow ? narrowMap : wideMap
  const discovered = discoveredAirports(progress)
  const available = nextAvailableMission(progress)
  const completed = new Set(progress.completedMissionIds)
  const established = new Set(progress.routeIds)
  const activeLine = available && routeLines[campaign.indexOf(available)]
  return <svg className="flight-map campaign-map" viewBox={`0 0 ${width} ${height}`} role="img"
    aria-label={`Map of the Windward Isles. Harbor Base is operational. Discovered airports: ${[...discovered].join(', ')}. ${established.size} established routes. ${completed.size} developed districts.`}>
    <defs>
      <linearGradient id={`${id}-sea`} x2=".82" y2="1"><stop stopColor="#bee7ef" /><stop offset="1" stopColor="#78b9d5" /></linearGradient>
      <pattern id={`${id}-grid`} width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0v44" fill="none" stroke="#e9fbfd" strokeOpacity=".4" /><circle r="1.4" fill="#effdff" opacity=".63" /></pattern>
      <linearGradient id={`${id}-cloud`} x2="0" y2="1"><stop stopColor="#fffefa" /><stop offset="1" stopColor="#d2eaf2" /></linearGradient>
      <g id={`${id}-bank`}>
        <path d="M-111 21q-16-27 16-43 12-30 45-27 14 0 28 10 23-32 56-27 27 3 37 26 43-8 58 21 20 40-43 48Z" fill="#d6eff3" opacity=".77" transform="translate(3 18)" />
        <path d="M-116 20q-18-27 18-48 13-40 69-26 35-47 77-10 17 5 21 27 41-19 63 16 25 44-33 54H-73q-30-2-43-13Z" fill={`url(#${id}-cloud)`} stroke="#f6fdfb" strokeWidth="2" />
        <path d="M-120 42q18-5 38 2 35-12 74-3m37 3q55-7 87-2" stroke="#e9f8fa" strokeWidth="8" opacity=".72" strokeLinecap="round" fill="none" />
      </g>
      <g id={`${id}-plane`}>
        <circle r="19" fill="#235575" stroke="#ebfcf8" strokeWidth="2.4" />
        <path d="m-12-2 8 .5-4-9 3-.3L4-2l7 .5q6 1.5 0 3L4 2l-9 8.8-3-.3 4-9-8 .5-3 3h-2l2-5-2-5h2Z" fill="#fffbee" />
      </g>
    </defs>
    <rect width={width} height={height} fill={`url(#${id}-sea)`} />
    <rect width={width} height={height} fill={`url(#${id}-grid)`} />
    <g fill="none" stroke="#e8f9f5" strokeWidth="2" strokeLinecap="round" opacity=".75">
      <path d="M156 83q12-7 23 0m2 10q13-7 25 0M277 170q12-6 24 0M193 520q10-6 21 0m1 9q12-6 23 0M301 617q11-5 21 0M656 107q11-6 22 0M688 249q12-7 24 0m3 10q11-6 21 0M1023 247q12-7 25 0M1106 537q10-4 20 0M774 706q8-5 18 0m-53 23q12-6 24 0" />
      <path d="M120 623q18-12 39 3m-30 13q22-12 42 3M617 497q18-8 34 0m-18 13q20-8 36 0" opacity=".55" />
    </g>
    {campaign.map((mission, index) => {
      const complete = established.has(mission.career.routeId)
      if (!complete && mission.id !== available?.id) return null
      const { d } = routeLines[index]
      return <g key={mission.id} data-map-route={mission.id} data-route-status={complete ? 'established' : 'available'}>
        <path d={d} fill="none" stroke="#eafaf7" strokeWidth="9" strokeOpacity=".67" />
        <path d={d} pathLength={complete ? 100 : undefined} fill="none" stroke={complete ? '#398568' : '#245d7e'} strokeWidth={complete ? 5.5 : 4.7}
          strokeDasharray={complete ? undefined : '2 12'} strokeLinecap="round"
          className={discovery?.routeId === mission.career.routeId ? 'route-draw' : discovery && !complete ? 'route-discovery' : undefined} />
      </g>
    })}
    {sites.map((site, index) => {
      const home = index === 0
      const mission = campaign[index - 1]
      const built = !home && completed.has(mission.id)
      const unlocked = discovered.has(site.airport)
      const isNew = discovery?.airport === site.airport
      const ready = site.airport === available?.destination
      const width = site.label.length * 12 + 52
      return <g key={site.airport} data-island={site.airport} data-island-state={home ? 'base' : built ? 'developed' : unlocked ? 'available' : 'undiscovered'} transform={`translate(${site.x} ${site.y})`}>
        <g transform={`scale(${islandScale})`} className={isNew ? 'island-reveal' : undefined}
          data-district={built ? mission.id : undefined} data-harbor-settlement={home ? '' : undefined}>
          <title>{home ? harborSettlement.name : built ? districts[index - 1].name : site.label}</title>
          <IslandTerrain site={site} district={home ? harborSettlement : built ? districts[index - 1] : undefined} />
        </g>
        {(!unlocked || isNew) && <g transform="translate(130 84)">
          <use href={`#${id}-bank`} className={isNew ? 'cloud-parting' : undefined} />
          {!unlocked && <use href={`#${id}-bank`} opacity=".84" transform="translate(17 28) scale(.82)" />}
        </g>}
        {unlocked && <g className="airport-label" transform={`translate(${160 * islandScale - width / 2} 177)`}>
          <rect width={width} height="40" rx="10" fill={home ? '#214a67' : built ? '#dcf1cc' : '#fff8df'} stroke={ready ? '#a27b3c' : '#d7ede2'} strokeWidth="2" />
          {built || home ? <path d="m13 20 4 4 8-9" fill="none" stroke={home ? '#d4eab4' : '#397652'} strokeWidth="2.7" strokeLinecap="round" />
            : <circle cx="18" cy="20" r="4" fill="#a67c33" />}
          <text x="32" y="27" fontSize="21" fill={home ? '#fff9e9' : '#244d65'}>{site.label}</text>
        </g>}
      </g>
    })}
    {activeLine && <>
      <g key={available.id} className="map-plane-moving">
        <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={activeLine.d} keyPoints=".36;.65" keyTimes="0;1" calcMode="linear" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.18;.81;1" dur="7s" repeatCount="indefinite" />
        <use href={`#${id}-plane`} />
      </g>
      <use className="map-plane-still" href={`#${id}-plane`} transform={`translate(${activeLine.marker})`} />
    </>}
    <g transform="translate(73 89)" fill="#285773">
      <circle r="23" fill="#d8f2f3" fillOpacity=".5" stroke="#82b5ca" />
      <path d="m0-14 7 20-7-4-7 4Z" /><path d="M0 2v-16l7 20Z" fill="#68a7be" />
      <text y="-32" textAnchor="middle" fontSize="18" fontWeight="800">N</text>
    </g>
  </svg>
}
