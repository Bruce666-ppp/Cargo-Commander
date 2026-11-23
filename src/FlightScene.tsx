import { useId } from 'react'
import type { FlightSettings } from './mission'

export function SideAircraft({ className }: { className?: string }) {
  return (
    <svg className={className} x="-94" y="-47" width="188" height="86" viewBox="-94 -47 188 86" aria-hidden="true">
      <path d="M-91 6-77 0-69-30l13 1 15 28h93q17 0 28 8l12 9q-6 10-29 11H-57q-22-3-34-16Z" fill="#f6f4e7" stroke="#315972" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-68-29h11l6 11h-14Z" fill="#73a7bb" />
      <path d="M-74 12h160l-8 7H-66Z" fill="#74a5bb" />
      <path d="m52 3 15 3 9 6H55Z" fill="#315b73" />
      <path d="M-26 15h35l-15 21h-25l8-16Z" fill="#afcdd5" stroke="#315972" strokeWidth="2" strokeLinejoin="round" />
      <rect x="-10" y="24" width="27" height="10" rx="4" fill="#e0ebe5" stroke="#315972" strokeWidth="1.5" />
      <path d="M-46 5h18v14h-18z" fill="none" stroke="#5c8698" strokeWidth="1.5" />
      <path d="M-84 2h18m2 3h12" stroke="#315972" strokeWidth="3" strokeLinecap="round" />
      <circle cx="-6" cy="31" r="2" fill="#daaf70" />
    </svg>
  )
}

const yForAltitude = (altitude: number, limits: readonly [number, number]) => Math.max(28, Math.min(300, 273 - (altitude - limits[0]) / (limits[1] - limits[0]) * 235))

type SceneProps = { destination: string; settings: FlightSettings; altitude: number; pitch: number; fraction: number; disturbance?: number; arrival?: boolean }

export function FlightScene({ destination, settings, altitude, pitch, fraction, disturbance = 1, arrival }: SceneProps) {
  const id = useId()
  const ceiling = yForAltitude(settings.corridor[1], settings.boundary)
  const floor = yForAltitude(settings.corridor[0], settings.boundary)
  const runway = arrival ? 596 : 1136 - fraction * 480

  return (
    <svg className="flight-landscape" viewBox="0 0 1000 398" role="img" aria-label={arrival ? `Side view of the aircraft making a scripted arrival at ${destination}` : `Side-view aircraft flying towards ${destination} with a marked altitude corridor`}>
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#a6d5e9" /><stop offset="1" stopColor="#e0f1ed" /></linearGradient>
        <pattern id={`${id}-waves`} width="88" height="32" patternUnits="userSpaceOnUse"><path d="M4 16q7-5 14 0m13 11q7-5 14 0" fill="none" stroke="#c5e4e5" strokeWidth="1.8" opacity=".62" /></pattern>
        <g id={`${id}-cloud`}><path d="M2 37q3-14 23-14Q32 2 53 4q21 0 29 20 23-1 28 13Z" fill="#f4faf5" opacity=".75" /></g>
        <g id={`${id}-island`}>
          <path d="M0 46q25-21 64-22 15-12 35-15 18-5 40 9 28 6 45 28Z" fill="#7fac9c" />
          <path d="M22 42 61 12l18 10 26-22 42 37Z" fill="#609689" />
          <path d="m61 12 10 5-19 9m53-26 15 13-18-5-11 8" fill="#a9ccc1" />
          <path d="M0 46h184q-18 9-56 10H39Q15 55 0 46Z" fill="#e5e7c3" />
        </g>
      </defs>
      <path d="M0 0h1000v398H0z" fill={`url(#${id}-sky)`} />
      <g className="scenery-drift" transform={`translate(${-fraction * 108} 0)`}>
        <use href={`#${id}-cloud`} transform="translate(65 31) scale(1.2)" /><use href={`#${id}-cloud`} transform="translate(408 61) scale(.83)" /><use href={`#${id}-cloud`} transform="translate(678 28) scale(1.35)" /><use href={`#${id}-cloud`} transform="translate(1030 80) scale(.85)" />
      </g>
      <path d="M0 287h1000v111H0z" fill="#83bace" />
      <path d="M0 300h1000v98H0z" fill={`url(#${id}-waves)`} />
      <g className="scenery-drift" transform={`translate(${-fraction * 290} 0)`}>
        <use href={`#${id}-island`} transform="translate(46 249) scale(.90)" /><use href={`#${id}-island`} transform="translate(460 268) scale(.61)" /><use href={`#${id}-island`} transform="translate(1020 243) scale(1.1)" />
      </g>
      <g transform={`translate(${runway} 0)`}>
        <path d="M-53 325q25-30 88-22l68-22 32 16 65-8 65 24 110 12q-12 28-81 29H17q-48-3-70-29Z" fill="#a8be92" stroke="#e4e5c7" strokeWidth="5" />
        <path d="M-2 309h304v21H-2z" fill="#466475" stroke="#f5f4df" strokeWidth="3" />
        <path d="M12 320h275" stroke="#e4eee6" strokeWidth="1.7" strokeDasharray="14 10" />
        <path d="M5 313v14m285-14v14" stroke="#e4eee6" strokeWidth="3" />
        <path d="M191 299h55v-23h-55zM244 299h17v-42h-17z" fill="#e5eee2" stroke="#5d8792" strokeWidth="2" />
        <path d="M250 259h7v8h-7m-52 17h10m4 0h10m4 0h10" fill="none" stroke="#5d8792" strokeWidth="3" />
      </g>
      {!arrival && <g>
        <rect x="0" y={ceiling} width="1000" height={floor - ceiling} fill="#bfe49d" opacity=".56" />
        <path d={`M0 ${ceiling}H1000M0 ${floor}H1000`} fill="none" stroke="#629361" strokeWidth="2" strokeDasharray="11 8" />
        <path d="M0 38h1000M0 273h1000" stroke="#658b9c" opacity=".62" strokeDasharray="4 10" />
        <g transform={`translate(23 ${ceiling + 12})`}><rect width="180" height="32" rx="7" fill="#e6f5cf" stroke="#94bd83" /><text x="14" y="21" className="corridor-label">TARGET CORRIDOR</text></g>
      </g>}
      {!arrival && disturbance > 1.01 && <g className="flight-wind-streaks" opacity={(disturbance - 1) * .44} stroke="#effcf7" strokeWidth="2.2" strokeLinecap="round" fill="none" aria-hidden="true">
        {[0, 1].map(tile => <path key={tile} transform={`translate(${tile * 1000 - (fraction * 5000) % 1000} 0)`} d="M225 61h59m380 19h84m-441 29h52m390 61h35m-570 58h63m430-19h108m-385 51h50m219-14h45" />)}
      </g>}
      {arrival
        ? <g className="landing-aircraft" style={{ animationDuration: `${settings.arrivalSeconds}s` }}><SideAircraft /></g>
        : <g transform={`translate(290 ${yForAltitude(altitude, settings.boundary)}) rotate(${-pitch})`}><SideAircraft /></g>}
    </svg>
  )
}
