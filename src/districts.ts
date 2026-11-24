import { campaign } from './mission.ts'
import type { Mission } from './mission.ts'

type FacilityKind = 'hall' | 'hangar' | 'house' | 'tower' | 'hospital' | 'dome' | 'solar' | 'park'
type Facility = readonly [name: string, kind: FacilityKind, x: number, y: number, width: number, depth: number, height: number, colour: string]

export const districts = [
  { name: 'Pinehaven Essential Supply District', story: 'The supply delivery helps Pinehaven establish a warehouse and a community distribution centre.', map: [333, 100, .235],
    facilities: [
      ['Essential supply warehouse', 'hangar', 67, 80, 59, 20, 27, '#688eb4'],
      ['Food distribution centre', 'hall', 140, 88, 54, 20, 38, '#719f86'],
      ['Community hall', 'hall', 214, 89, 35, 16, 26, '#d7a966'],
      ['Homes', 'house', 241, 137, 26, 16, 15, '#bc805d'],
      ['Loading court', 'park', 82, 136, 42, 17, 1, '#e8d2a3'],
    ] },
  { name: 'Sundrift Logistics District', story: 'Replacement equipment keeps the logistics hub running and supports new warehouses and cargo yards.', map: [370, 383, .25],
    facilities: [
      ['Logistics centre', 'hall', 107, 75, 59, 22, 42, '#487da9'],
      ['North cargo warehouse', 'hangar', 50, 111, 46, 19, 24, '#729ba8'],
      ['South cargo warehouse', 'hangar', 190, 96, 57, 20, 27, '#6899ac'],
      ['Container storage yard', 'park', 181, 139, 63, 17, 1, '#ddc49b'],
      ['Ground service station', 'hall', 248, 125, 27, 14, 17, '#cd975c'],
    ] },
  { name: 'Inter-Island Aviation Relay District', story: 'Relay equipment supports a second Pinehaven district with communications and airside services.', map: [400, 102, .225],
    facilities: [
      ['Relay tower', 'tower', 176, 73, 25, 14, 54, '#87adbc'],
      ['Cargo hangar', 'hangar', 59, 98, 68, 19, 28, '#5892a9'],
      ['Regional terminal', 'hall', 122, 108, 51, 17, 33, '#c4a675'],
      ['Ground service depot', 'hall', 228, 96, 39, 18, 23, '#699aa5'],
      ['Aircraft apron', 'park', 201, 144, 68, 14, 1, '#b9c9c6'],
    ] },
  { name: 'Mercy Cay Medical Complex', story: 'Powered medical supplies support a healthcare campus with emergency care, a pharmacy and storage.', map: [644, 431, .245],
    facilities: [
      ['Main hospital', 'hospital', 127, 79, 62, 27, 61, '#75aaaf'],
      ['Emergency care centre', 'hospital', 70, 111, 50, 23, 32, '#87b8bb'],
      ['Pharmacy', 'hall', 216, 96, 41, 17, 25, '#77a780'],
      ['Medical storage', 'hangar', 239, 131, 47, 17, 21, '#7a9db2'],
      ['Ambulance and visitor parking', 'park', 128, 143, 64, 21, 1, '#bfcbca'],
      ['Patient garden', 'park', 200, 156, 35, 14, 1, '#8cb47c'],
    ] },
  { name: 'Stormwatch Emergency and Weather Operations District', story: 'Weather instruments and shelter supplies expand forecasting and emergency response on the island.', map: [763, 234, .245],
    facilities: [
      ['Meteorological station', 'dome', 132, 83, 47, 23, 40, '#79a5b1'],
      ['Emergency coordination centre', 'hall', 79, 101, 47, 18, 30, '#ba8157'],
      ['Rescue depot', 'hangar', 192, 111, 52, 18, 30, '#7699a9'],
      ['Backup power station', 'solar', 225, 139, 33, 15, 13, '#507d9f'],
      ['Supply storage', 'hangar', 94, 143, 27, 12, 16, '#c19c68'],
      ['Communications tower', 'tower', 245, 83, 12, 8, 36, '#82999e'],
    ] },
  { name: 'Northstar Regional Development District', story: 'The final route connects the regional hub, services and housing to the island-wide network.', map: [675, 55, .25],
    facilities: [
      ['Regional transport hub', 'tower', 156, 82, 34, 18, 59, '#6796b2'],
      ['Cargo terminal', 'hangar', 57, 105, 69, 21, 30, '#5a91a7'],
      ['Public services', 'hall', 120, 120, 44, 17, 33, '#cb9c69'],
      ['Community centre', 'hall', 213, 103, 39, 20, 29, '#80a89a'],
      ['Residential buildings', 'house', 255, 125, 31, 15, 21, '#b97c56'],
      ['Public square', 'park', 162, 150, 48, 16, 1, '#9fbc83'],
    ] },
] as const satisfies readonly { name: string; story: string; map: readonly [number, number, number]; facilities: readonly Facility[] }[]

export function districtFor(mission: Mission) {
  return districts[campaign.findIndex(entry => entry.id === mission.id)]
}
