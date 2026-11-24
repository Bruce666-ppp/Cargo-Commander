import { campaign } from './mission.ts'
import type { Mission } from './mission.ts'

type Kind = 'hall' | 'hangar' | 'house' | 'tower' | 'hospital' | 'radar' | 'solar' | 'shop'
type Block = readonly [name: string, kind: Kind, height: number]
type DistrictPlan = {
  name: string
  story: string
  palette: readonly string[]
  blocks: readonly (readonly Block[])[]
  grounds: 'harbor' | 'community' | 'cargo' | 'aviation' | 'medical' | 'weather' | 'regional'
}

export type District = ReturnType<typeof planDistrict>

function planDistrict({ name, story, palette, blocks, grounds }: DistrictPlan) {
  const plotWidth = grounds === 'harbor' ? 190 : 252
  const facilities = blocks.flatMap((row, section) => row.map(([label, kind, height], index) => {
    const step = plotWidth / row.length
    const width = Math.min(kind === 'hangar' ? 48 : 38, step - 9)
    const depth = Math.min(18, step * .27)
    const x = 160 - plotWidth / 2 + step * index + (step - width - depth * .75) / 2
    const y = [57, 88, 121][section] + (index % 3 === 0 ? -2 : 1)
    return { label, kind, x, y, width, depth, height, tint: palette[(index + section) % palette.length], section }
  }))
  return { name, story, grounds, facilities }
}

export const harborSettlement = planDistrict({
  name: 'Harbor Base Aviation Settlement',
  story: 'Small warehouses and a basic control tower serve the first flights from Harbor Base.',
  grounds: 'harbor', palette: ['#638886', '#ac906c', '#7f9981'],
  blocks: [
    [['Staff cottage', 'house', 12], ['Service hut', 'house', 11]],
    [['Cargo shed', 'hangar', 13], ['Control tower', 'tower', 22], ['Workshop', 'hall', 12]],
    [['Aircraft hangar', 'hangar', 17], ['Operations office', 'hall', 13]],
  ],
})

export const districts = [
  planDistrict({ name: 'Pinehaven Essential Supply District', grounds: 'community',
    story: 'Supply warehouses, food shops and a community centre link Pinehaven’s homes to regular deliveries.',
    palette: ['#7094a7', '#79a88b', '#d2a16b', '#ae795e'],
    blocks: [
      [['Hillside home', 'house', 13], ['Local grocer', 'shop', 13], ['Staff home', 'house', 13]],
      [['North supply warehouse', 'hangar', 18], ['Distribution centre', 'hall', 25], ['Community hall', 'hall', 20], ['East food shop', 'shop', 15]],
      [['Cold store', 'hangar', 17], ['Market office', 'shop', 15], ['Roadside home', 'house', 12], ['Delivery depot', 'hangar', 16]],
    ],
  }),
  planDistrict({ name: 'Sundrift Logistics District', grounds: 'cargo',
    story: 'A working turbine keeps a busy logistics network of warehouses and container yards running.',
    palette: ['#638eac', '#89a4a0', '#c69965', '#6f8e9a'],
    blocks: [
      [['North warehouse', 'hangar', 17], ['Dispatch office', 'hall', 15], ['Refrigerated warehouse', 'hangar', 19], ['Service workshop', 'hangar', 17]],
      [['Logistics centre', 'hall', 30], ['Bulk warehouse', 'hangar', 24], ['Administration', 'hall', 21], ['Container depot', 'hangar', 18]],
      [['Equipment garage', 'hangar', 15], ['Parcel depot', 'hangar', 16], ['Freight office', 'hall', 18], ['Parts store', 'shop', 15], ['South warehouse', 'hangar', 17]],
    ],
  }),
  planDistrict({ name: 'Coral Point Aviation Relay District', grounds: 'aviation',
    story: 'The relay equipment helps Coral Point open a cargo terminal, service hangars and a communications tower.',
    palette: ['#588a9e', '#789fb1', '#cb9c6e', '#79a891'],
    blocks: [
      [['Tool store', 'hall', 14], ['West maintenance hangar', 'hangar', 17], ['Reserve hangar', 'hangar', 16], ['Ground crew office', 'hall', 14], ['Parts workshop', 'hangar', 16]],
      [['Cargo terminal', 'hall', 25], ['Regional communications tower', 'tower', 34], ['Relay operations centre', 'hall', 25], ['Aircraft maintenance centre', 'hangar', 21], ['Service hangar', 'hangar', 21]],
      [['Equipment bay', 'hangar', 16], ['Airside security', 'hall', 17], ['Control annex', 'hall', 18], ['Service depot', 'hangar', 18], ['Eastern hangar', 'hangar', 19]],
    ],
  }),
  planDistrict({ name: 'Mercy Cay Medical Campus', grounds: 'medical',
    story: 'Temperature-controlled deliveries support a full campus, from emergency care to the pharmacy and patient services.',
    palette: ['#80afb2', '#6ca3a9', '#8eb3a0', '#d8ac88', '#72a3bc'],
    blocks: [
      [['Staff accommodation west', 'house', 14], ['Research laboratory', 'hall', 20], ['Campus services', 'hall', 16], ['Staff accommodation east', 'house', 15], ['Waste management', 'hall', 14], ['Equipment warehouse', 'hangar', 16]],
      [['Medical supplies depot', 'hangar', 19], ['Emergency care centre', 'hospital', 28], ['Main hospital', 'hospital', 42], ['Diagnostic centre', 'hall', 26], ['Campus pharmacy', 'shop', 21], ['Cold-chain warehouse', 'hangar', 19]],
      [['Patient services', 'hall', 19], ['Ambulance station', 'hangar', 17], ['Outpatient clinic', 'hospital', 22], ['Visitor centre', 'shop', 16], ['Rehabilitation centre', 'hall', 21], ['Medical administration', 'hall', 19]],
    ],
  }),
  planDistrict({ name: 'Stormwatch Emergency and Weather Operations District', grounds: 'weather',
    story: 'Weather instruments, rescue crews and backup power make the island a regional emergency operations centre.',
    palette: ['#6d95a9', '#849f9c', '#bf885e', '#637ea1', '#b29c7a'],
    blocks: [
      [['Shelter store', 'hangar', 16], ['West power unit', 'solar', 14], ['Weather laboratory', 'hall', 19], ['Radio workshop', 'hall', 16], ['East power unit', 'solar', 14], ['Utility shed', 'hangar', 15]],
      [['Regional supply warehouse', 'hangar', 19], ['Communications tower', 'tower', 37], ['Weather radar', 'radar', 28], ['Meteorological station', 'hall', 30], ['Emergency coordination centre', 'hall', 28], ['Rescue hangar', 'hangar', 22], ['Shelter depot', 'hangar', 19]],
      [['Fleet garage', 'hangar', 17], ['Rescue offices', 'hall', 21], ['Ambulance depot', 'hangar', 18], ['Emergency stores', 'hangar', 21], ['Crew accommodation', 'house', 17], ['Field operations', 'hall', 21], ['Generator building', 'solar', 17]],
    ],
  }),
  planDistrict({ name: 'Northstar Regional Development District', grounds: 'regional',
    story: 'The last connection opens a regional transport hub, busy commercial blocks, homes and new public services.',
    palette: ['#6e9db7', '#7aada6', '#d8ad73', '#a77e71', '#6196a4', '#8c9eb7'],
    blocks: [
      [['West flats', 'house', 17], ['North neighbourhood', 'house', 17], ['East flats', 'hall', 22], ['Community library', 'hall', 18], ['Regional hotel', 'hall', 23], ['Market arcade', 'shop', 19], ['Visitor flats', 'house', 18], ['East neighbourhood', 'house', 19]],
      [['Cargo terminal west', 'hangar', 23], ['Cargo terminal east', 'hangar', 24], ['Transport concourse', 'hall', 32], ['Regional control tower', 'tower', 42], ['Regional passenger hub', 'hall', 33], ['Civic offices', 'hall', 31], ['Commercial centre', 'shop', 26], ['Public-service centre', 'hall', 27]],
      [['Bus interchange', 'hall', 17], ['Delivery depot', 'hangar', 20], ['Shopping hall', 'shop', 22], ['Community centre', 'hall', 25], ['Town hall', 'hall', 24], ['Public square café', 'shop', 17], ['South flats', 'hall', 20], ['Station shops', 'shop', 19]],
    ],
  }),
]

export function districtFor(mission: Mission) {
  return districts[campaign.findIndex(entry => entry.id === mission.id)]
}
