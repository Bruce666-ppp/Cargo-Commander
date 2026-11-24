import { useId } from 'react'
export { FlightMap } from './CampaignMap'

const icons = {
  auto: <><path d="m12 3 2.1 5.2L19 10l-4.9 1.8L12 17l-2.1-5.2L5 10l4.9-1.8L12 3Z" /><path d="M4 16v5m-2-2.5h4M20 3v4m-2-2h4m-2 11v5m-2-2.5h4" /></>,
  controls: <><path d="M3 8h18m-18 8h18" /><circle cx="8" cy="8" r="2.6" fill="currentColor" /><circle cx="16" cy="16" r="2.6" fill="currentColor" /></>,
  medical: <><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M9 7V4h6v3m-3 3v7m-3.5-3.5h7" /></>,
  puzzle: <path d="M4 5h6a2.4 2.4 0 1 1 4 0h5v5a2.4 2.4 0 1 1 0 4v5h-5a2.4 2.4 0 1 1-4 0H4v-5a2.4 2.4 0 1 0 0-4Z" />,
  wings: <><path d="M9 9H2l2 3h5m-4 1 2 3h3m5-7h7l-2 3h-5m4 1-2 3h-3" /><path d="m12 6 4 4v4q0 3-4 5-4-2-4-5v-4Z" /></>,
  plane: <path d="m12 2 2.2 7.2 7 4.3v2l-7-2.3-.8 5.1 3 2.2V22L12 20.6 7.6 22v-1.5l3-2.2-.8-5.1-7 2.3v-2l7-4.3L12 2Z" />,
  rank: <><path d="M12 3 4 6v5c0 4.5 3.4 7.7 8 10 4.6-2.3 8-5.5 8-10V6l-8-3Z" /><path d="m8 13 4-3 4 3m-7 3 3-2 3 2" /></>,
  crate: <><path d="m12 2.8 8.5 4.8v8.8L12 21.2l-8.5-4.8V7.6L12 2.8Z" /><path d="m3.5 7.6 8.5 5 8.5-5M12 12.6v8.6M8 5.1l8.4 4.9" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v2" /></>,
  pin: <><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  reset: <><path d="M4 10a8 8 0 1 1 1 7m-1-7V4m0 6h6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  scale: <><path d="M12 3v17m-5 0h10M4 7h16M6 7l-3 7h6L6 7Zm12 0-3 7h6l-3-7Z" /><path d="M3 14a3 3 0 0 0 6 0m6 0a3 3 0 0 0 6 0" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  book: <><path d="M5 5a2 2 0 0 1 2-2h12v17H7a2 2 0 0 1-2-2V5Z" /><path d="M5 17h14M9 7h6m-6 4h6" /></>,
  atom: <><ellipse cx="12" cy="12" rx="4" ry="9" /><ellipse cx="12" cy="12" rx="4" ry="9" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="4" ry="9" transform="rotate(-60 12 12)" /><circle cx="12" cy="12" r=".6" /></>,
  tool: <path d="M14.7 6.3 18 3a5.5 5.5 0 0 0-7 7L3.8 17.2a2.1 2.1 0 0 0 3 3L14 13a5.5 5.5 0 0 0 7-7l-3.3 3.3-3-3Z" />,
  flag: <path d="M5 21V4m0 0c4-4 8 4 14 0v11c-6 4-10-4-14 0" />,
  food: <><path d="M3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Zm0 0 2-3h14l2 3m-9-3c0-3 2-4 5-4-1 3-2 4-5 4Z" /><path d="M9 14h6" /></>,
  water: <path d="M12 3c-3 4-6 7.4-6 11a6 6 0 1 0 12 0c0-3.6-3-7-6-11Zm-3 11a3 3 0 0 0 3 3" />,
  warning: <><path d="M10.4 4.6 3 17.4A1.7 1.7 0 0 0 4.5 20h15a1.7 1.7 0 0 0 1.5-2.6L13.6 4.6a1.9 1.9 0 0 0-3.2 0Z" /><path d="M12 9v4m0 3h.01" /></>,
  undo: <path d="M4 11h10a5 5 0 0 1 0 10M4 11l5-5m-5 5 5 5" />,
  speaker: <><path d="M4 9h4l5-4v14l-5-4H4Z" /><path d="M16 9a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10" /></>,
  muted: <><path d="M4 9h4l5-4v14l-5-4H4Z" /><path d="m16 10 4 4m0-4-4 4" /></>,
}

export function Icon({ name }: { name: keyof typeof icons }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

export function CargoAircraft() {
  const id = useId()
  return (
    <svg className="aircraft" viewBox="0 0 780 416" role="img" aria-label="Top-down cargo aircraft with the nose on the left and the tail on the right">
      <defs>
        <linearGradient id={`${id}-wing`} x2="0" y2="1"><stop stopColor="#f4f9f4" /><stop offset="1" stopColor="#a9c9d8" /></linearGradient>
        <linearGradient id={`${id}-fuselage`} x2="0" y2="1"><stop stopColor="#fffdf4" /><stop offset=".58" stopColor="#edf4ed" /><stop offset="1" stopColor="#b9d4db" /></linearGradient>
      </defs>
      <path className="aircraft-centreline" d="M29 208h722" stroke="#93b5c7" strokeWidth="1.3" strokeDasharray="5 7" />
      <g transform="translate(3 10)" fill="#6999af" opacity=".17">
        <path d="m269 178 66-131q6-12 18-12h29l-7 138h193l42-79h24l-9 86q56 12 77 28-21 16-77 28l9 86h-24l-42-79H375l7 138h-29q-12 0-18-12l-66-131H132q-46 0-67-30 21-30 67-30Z" />
      </g>
      <g fill={`url(#${id}-wing)`} stroke="#466d85" strokeWidth="2.3" strokeLinejoin="round">
        <path d="m260 177 73-130q7-12 20-12h30l-4 147Zm0 62 73 130q7 12 20 12h30l-4-147Z" />
        <path d="m555 185 53-83q5-7 12-7h20l-15 98Zm0 46 53 83q5 7 12 7h20l-15-98Z" />
      </g>
      <g fill="#73a7bb" stroke="#466d85" strokeWidth="2">
        <path d="M347 37q2-2 8-2h28l-1 17h-45Z" /><path d="M347 379q2 2 8 2h28l-1-17h-45Z" />
        <path d="M617 96q2-1 5-1h18l-2 13h-33Z" /><path d="M617 320q2 1 5 1h18l-2-13h-33Z" />
      </g>
      <g fill="none" stroke="#608ba1" strokeWidth="1.6" opacity=".85">
        <path d="m373 61-5 107m5 187-5-107m262-132-11 64m11 120-11-64M352 65l-42 80m42 206-42-80" />
        <path d="M351 82h17m-30 27h29m-16 225h17m-30-27h29" opacity=".6" />
      </g>
      <g fill="#d9e9e7" stroke="#466d85" strokeWidth="2.2">
        <path d="M269 91h58l24 11v16l-24 10h-58q-16 0-16-18t16-19Z" />
        <path d="M269 288h58l24 10v16l-24 11h-58q-16 0-16-18t16-19Z" />
      </g>
      <g fill="#507990"><path d="M268 92v35h-4q-11-2-11-17t11-18Zm0 197v35h-4q-11-2-11-17t11-18Z" /></g>
      <g stroke="#7da4b5" strokeWidth="2"><path d="M277 98h48m-48 22h48m-48 175h48m-48 22h48" /></g>
      <path d="M62 208c13-23 43-43 80-43h409q46 0 97 23l49 20-49 20q-51 23-97 23H142c-37 0-67-20-80-43Z" fill={`url(#${id}-fuselage)`} stroke="#3e6581" strokeWidth="2.8" />
      <path d="M107 181q16-7 43-7h393q37 0 80 16m-516 45q16 7 43 7h393q37 0 80-16" fill="none" stroke="#71a5b6" strokeWidth="2" />
      <path d="M97 191q13-9 24-10l-5 16-14 7Zm0 34q13 9 24 10l-5-16-14-7Zm7-18 12-5v12l-12-5Z" fill="#244d6b" />
      <path d="M135 189h25v38h-25z" fill="#dbe9e8" stroke="#789eae" strokeWidth="1.7" />
      <path d="M145 199h6m-6 18h6M175 180v56m407-57v58" stroke="#7da4b5" strokeWidth="1.7" />
      <path d="M605 194q26 0 77 14-51 14-77 14l12-14Z" fill="#6396ac" stroke="#466d85" strokeWidth="2" />
      <circle cx="365" cy="40" r="3.4" fill="#efc582" /><circle cx="365" cy="376" r="3.4" fill="#68a68e" />
    </svg>
  )
}

export function HomeFlightScene() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="hero-airspace" viewBox="0 0 660 380" fill="none">
        <defs>
          <pattern id="airspace-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0v26" stroke="#bbdfe8" strokeOpacity=".18" /></pattern>
          <clipPath id="airspace-clip"><circle cx="343" cy="183" r="153" /></clipPath>
          <g id="hero-island">
            <path d="M8 49Q-5 29 22 18l24-4q21-19 52-10l13 9q22 2 30 15 10 24-23 34l-27 1-14 9q-20 9-40-4L17 64Z" fill="#729eac" stroke="#a8d1d1" strokeWidth="5" />
            <path d="M9 44Q-4 25 23 14l23-5Q67-7 97 1l14 9q22 2 30 16 9 20-23 30l-27 1-14 9q-20 8-40-4L17 58Z" fill="#9fbe99" stroke="#d6e3bf" strokeWidth="3" />
            <path d="M17 35q7-12 32-13m42 20q14 4 29-5" stroke="#729d84" strokeWidth="1.5" strokeLinecap="round" />
            <path d="m31 28 4-7 4 7Zm8 2 5-9 5 9Zm55-13 4-7 5 7Z" fill="#5d896f" />
            <g transform="translate(70 39) rotate(-13)"><rect x="-31" y="-5" width="62" height="10" rx="2" fill="#345766" stroke="#e6ecd4" strokeWidth="1.4" /><path d="M-24 0h48" stroke="#e6ecd4" strokeDasharray="4 4" /></g>
          </g>
          <g id="hero-crate">
            <path d="m0 13 24-13 43 11-24 13Z" fill="currentColor" stroke="#39586a" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m0 13 43 11v36L0 48Z" fill="currentColor" stroke="#39586a" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m43 24 24-13v36L43 60Z" fill="currentColor" stroke="#39586a" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="m43 24 24-13v36L43 60Z" fill="#172f48" fillOpacity=".18" />
            <path d="m0 13 24-13 43 11-24 13Z" fill="#fffdf4" fillOpacity=".35" />
            <path d="m9 15 24-13m-6 18 24-13m-45 35 30 9m13-3 13-7" stroke="#39586a" strokeOpacity=".48" />
          </g>
        </defs>
        <circle cx="343" cy="183" r="152" fill="#49849d" opacity=".46" />
        <path d="M176 26h336v312H176z" fill="url(#airspace-grid)" clipPath="url(#airspace-clip)" />
        <g stroke="#9ed1dd" opacity=".43"><circle cx="343" cy="183" r="152" /><circle cx="343" cy="183" r="112" /><circle cx="343" cy="183" r="70" /><path d="M343 31v304M191 183h304" strokeDasharray="4 7" /></g>
        <g fill="#cdebf0" opacity=".24"><path d="M67 113q4-13 21-14 6-22 26-19 20 1 25 18 21 0 24 15Z" /><path d="M505 77q7-12 21-12 6-20 26-17 17 1 24 16 18-2 26 13Z" /><path d="M181 245q7-11 15-11 6-12 19-10 13 1 17 11 14 0 17 10Z" /></g>
        <path d="M173 286C251 328 422 312 473 232S500 113 567 101" stroke="#cdebf0" strokeOpacity=".78" strokeWidth="2.5" strokeDasharray="2 10" strokeLinecap="round" />
        <use href="#hero-island" transform="translate(85 263) rotate(-7) scale(.93)" /><use href="#hero-island" transform="translate(530 91) rotate(10) scale(.62)" />
        <path d="m77 233 6-2 6 2m20 4 6-2 6 2m343 87 6-2 6 2m57-144 6-2 6 2" stroke="#9ed1dd" strokeOpacity=".65" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="hero-plane"><CargoAircraft /></div>
      <svg className="hero-crates" viewBox="0 0 204 110">
        <ellipse cx="108" cy="90" rx="92" ry="16" fill="#0d283b" opacity=".32" />
        <g className="hero-crate-label" transform="translate(113 5)"><use href="#hero-crate" style={{ color: '#e7cca0' }} /><text x="21" y="38">30 kg</text></g>
        <g className="hero-crate-label" transform="translate(20 28)"><use href="#hero-crate" style={{ color: '#bfdfd2' }} /><text x="21" y="38">10 kg</text></g>
        <g className="hero-crate-label" transform="translate(78 41)"><use href="#hero-crate" style={{ color: '#b9d9ea' }} /><text x="21" y="38">20 kg</text></g>
      </svg>
    </div>
  )
}
