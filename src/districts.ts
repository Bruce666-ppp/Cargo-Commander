import { campaign } from './mission.ts'
import type { Mission } from './mission.ts'
import type { ModernKind } from './DistrictLandmark'

export type BuildingKind = 'cottage' | 'rowhouse' | 'shop' | 'hall' | 'shed' | 'warehouse' | 'hangar' | 'tower' | 'terminal' | 'hospital' | 'clinic' | 'laboratory' | 'radar' | 'office' | 'civic' | ModernKind
export type Finish = 'clay' | 'cream' | 'sage' | 'blue' | 'ochre' | 'coral' | 'slate' | 'glass'
type Plot = readonly [label: string, kind: BuildingKind, finish: Finish, x: number, y: number, width: number, depth: number, height: number]
type Court = readonly [kind: 'garden' | 'square' | 'loading' | 'apron' | 'energy' | 'plaza', x: number, y: number, width: number, depth: number]
type Tree = readonly [x: number, y: number, size?: number]
type Vehicle = readonly [kind: 'truck' | 'van' | 'ambulance' | 'tug', x: number, y: number]

type DistrictPlan = {
  name: string
  story: string
  yard?: 'workshop' | 'containers'
  airfield?: 'rural' | 'relay' | 'regional'
  road: string
  courts: readonly Court[]
  trees: readonly Tree[]
  vehicles: readonly Vehicle[]
  groups: readonly (readonly Plot[])[]
}

export type District = ReturnType<typeof district>
export type Facility = District['facilities'][number]

function district({ groups, ...site }: DistrictPlan) {
  const facilities = groups.flatMap((plots, wave) =>
    plots.map(([label, kind, finish, x, y, width, depth, height]) => ({ label, kind, finish, x, y, width, depth, height, wave })))
  facilities.sort((a, b) => a.y - b.y)
  return { ...site, facilities }
}

export const harborSettlement = district({
  name: 'Harbor Base Aviation Settlement',
  story: 'Two hillside cottages and a small airport share a quiet road above the coast.',
  yard: 'workshop',
  airfield: 'rural',
  road: 'M44 116q21-11 52-9 21 0 33-16 15-28-2-39l-19 4q-22 19-58 16m77-20 28 5m-60 49q25 16 62 14',
  courts: [['loading', 52, 116, 45, 19], ['garden', 38, 77, 48, 15], ['garden', 100, 65, 28, 13]],
  trees: [[47, 89, 1.1], [82, 69, .84], [134, 67, .89], [152, 87, .77], [194, 69, 1.25], [246, 83, 1.17], [271, 103, .9]],
  vehicles: [['tug', 102, 127], ['truck', 188, 132]],
  groups: [
    [['Hillside cottage', 'cottage', 'cream', 49, 71, 26, 15, 14], ['Caretaker’s house', 'cottage', 'cream', 99, 59, 28, 14, 13], ['Water tank', 'water-tower', 'slate', 146, 61, 16, 13, 28]],
    [['Blue-roofed hangar', 'hangar', 'blue', 209, 113, 55, 28, 23], ['Control tower', 'tower', 'cream', 168, 89, 24, 19, 31], ['Operations bungalow', 'hall', 'ochre', 111, 105, 42, 21, 17]],
    [['Cargo warehouse', 'warehouse', 'slate', 46, 110, 41, 20, 19]],
  ],
})
export const districts = [
  district({ name: 'Pinehaven Essential Supply District',
    story: 'Food shops, gardens and terracotta-roofed cottages surround the square and a shared supply depot.',
    road: 'M42 118q30-3 49-16 25-18 56-9 19 7 43 1 31-8 72 14M87 105q-6-14 7-27 11-13 24-17m62 35q-3 18 22 28l35 5m-35-5 4 19',
    courts: [['square', 133, 112, 44, 24], ['garden', 57, 98, 25, 19], ['garden', 217, 132, 43, 19], ['loading', 246, 100, 32, 12]],
    trees: [[44, 91, .86], [65, 72, .75], [79, 113, .6], [112, 96, .84], [130, 116, .74], [160, 103, .66], [194, 126, .82], [236, 66, .92], [264, 121, 1.08], [275, 101, .77]],
    vehicles: [['van', 106, 111], ['truck', 252, 97]],
    groups: [
      [['Orchard cottage', 'cottage', 'cream', 51, 72, 23, 15, 13], ['Blue roof cottage', 'cottage', 'blue', 100, 67, 22, 13, 13], ['Hillside houses', 'rowhouse', 'clay', 145, 69, 34, 15, 16], ['North garden house', 'cottage', 'sage', 196, 68, 22, 14, 13]],
      [['Pinehaven community hall', 'hall', 'ochre', 115, 93, 42, 25, 26], ['Fresh food market', 'shop', 'coral', 72, 101, 30, 17, 18], ['Bakery and flats', 'shop', 'blue', 179, 91, 26, 14, 17], ['Community supply depot', 'shed', 'sage', 234, 89, 43, 23, 21]],
      [['Garden lane terrace', 'rowhouse', 'cream', 48, 133, 40, 17, 16], ['Corner grocer', 'shop', 'ochre', 101, 129, 25, 11, 15], ['Square-side cottage', 'cottage', 'coral', 181, 132, 24, 14, 15], ['East lane cottages', 'rowhouse', 'sage', 233, 124, 29, 13, 13]],
    ],
  }),
  district({ name: 'Sundrift Logistics District',
    story: 'High-roofed warehouses, dispatch offices and a marked container yard line Sundrift’s service road.',
    yard: 'containers',
    road: 'M43 122q18-18 48-20l46 3q23 0 44-11 25-13 50-7l47 6m-98 1q12 20 39 27m-109-18-11-27q-2-9 8-17m112 62 9 21',
    courts: [['loading', 95, 101, 55, 27], ['loading', 217, 110, 53, 29], ['apron', 236, 133, 41, 15], ['garden', 45, 126, 25, 13]],
    trees: [[43, 108, .95], [55, 65, .75], [88, 86, .86], [148, 127, .64], [173, 83, .62], [225, 64, .79], [266, 124, .75]],
    vehicles: [['truck', 102, 103], ['truck', 223, 115], ['tug', 249, 129]],
    groups: [
      [['Turbine workshop', 'shed', 'ochre', 58, 74, 32, 18, 16], ['Ridge freight store', 'warehouse', 'blue', 102, 65, 48, 23, 19], ['Dispatch headquarters', 'atrium', 'glass', 161, 78, 41, 23, 32], ['Service garage', 'shed', 'sage', 225, 69, 30, 19, 16]],
      [['Main distribution shed', 'warehouse', 'cream', 47, 99, 51, 23, 27], ['Logistics exchange', 'office', 'glass', 120, 98, 39, 21, 29], ['High-bay warehouse', 'warehouse', 'slate', 198, 91, 59, 27, 24]],
      [['Fleet service block', 'shed', 'sage', 153, 125, 35, 18, 14], ['Freight amenity block', 'hall', 'ochre', 68, 131, 29, 14, 16], ['Container yard gatehouse', 'cottage', 'clay', 262, 113, 16, 11, 10], ['Airside dispatch', 'shop', 'blue', 256, 134, 20, 12, 13]],
    ],
  }),
  district({ name: 'Coral Point Aviation Relay District',
    story: 'A glass-fronted terminal, rounded hangars and a control tower give Coral Point a distinctive airside skyline.',
    airfield: 'relay',
    road: 'M35 117q25-18 48-18 36 0 54 11 24 14 57 2 18-6 44-4l36 7m-54-6q12-18 7-34l-13-18m-76 55 17 13v17',
    courts: [['apron', 44, 114, 57, 26], ['apron', 190, 127, 69, 24], ['square', 124, 123, 30, 12], ['garden', 248, 101, 27, 18]],
    trees: [[41, 91, .96], [85, 68, .77], [112, 95, .65], [114, 131, .68], [174, 103, .66], [247, 66, .83], [273, 118, .88]],
    vehicles: [['tug', 65, 116], ['tug', 230, 121], ['van', 176, 125]],
    groups: [
      [['North maintenance hangar', 'hangar', 'blue', 53, 82, 47, 25, 23], ['Technical stores', 'shed', 'cream', 107, 65, 28, 16, 15], ['Air traffic control tower', 'flight-tower', 'blue', 177, 79, 24, 20, 42], ['Radar workshop', 'laboratory', 'sage', 225, 78, 38, 16, 19]],
      [['Passenger and relay terminal', 'terminal', 'glass', 112, 104, 65, 27, 24], ['East aircraft hangar', 'hangar', 'ochre', 208, 105, 48, 23, 21], ['Flight operations', 'atrium', 'cream', 73, 100, 33, 18, 28]],
      [['Ground equipment shed', 'shed', 'slate', 42, 130, 31, 17, 14], ['Airside café', 'shop', 'coral', 118, 129, 24, 14, 14], ['Airside fire station', 'shed', 'clay', 182, 133, 36, 18, 15], ['Apron office', 'hall', 'sage', 251, 128, 27, 15, 13]],
    ],
  }),
  district({ name: 'Mercy Cay Medical Campus',
    story: 'A stepped hospital, emergency wing, pharmacy and research facilities frame a landscaped patient courtyard.',
    road: 'M42 116q27-20 51-17l26 9q22 10 47 8 23-1 40-12 23-13 68-3m-169 3q0-16 12-27 12-9 36-12m47 44 17 18v15',
    courts: [['garden', 121, 123, 67, 23], ['square', 146, 102, 37, 16], ['apron', 53, 116, 40, 24], ['garden', 232, 116, 53, 25]],
    trees: [[42, 102, .92], [75, 73, .86], [107, 83, .91], [115, 130, .74], [149, 120, .7], [176, 126, .78], [207, 83, .94], [223, 119, .81], [263, 120, 1.12], [279, 93, .8]],
    vehicles: [['ambulance', 69, 117], ['ambulance', 101, 115], ['van', 215, 130]],
    groups: [
      [['Medical research pavilion', 'atrium', 'glass', 56, 85, 40, 20, 29], ['Staff residence', 'rowhouse', 'cream', 107, 62, 34, 15, 16], ['Imaging centre', 'clinic', 'blue', 203, 68, 32, 19, 19], ['Medical support store', 'shed', 'ochre', 241, 80, 29, 18, 15]],
      [['Mercy Cay main hospital', 'hospital', 'blue', 119, 96, 70, 29, 47], ['Emergency and ambulance wing', 'clinic', 'coral', 62, 102, 44, 21, 24], ['Outpatient centre', 'clinic', 'cream', 205, 98, 39, 20, 23], ['Medical supply warehouse', 'warehouse', 'sage', 246, 101, 31, 17, 15]],
      [['Visitors’ pavilion', 'hall', 'sage', 85, 134, 27, 14, 16], ['Campus pharmacy', 'shop', 'ochre', 187, 129, 30, 15, 17], ['Rehabilitation centre', 'clinic', 'blue', 227, 132, 31, 17, 17], ['Patient garden lodge', 'cottage', 'cream', 268, 126, 15, 11, 10]],
    ],
  }),
  district({ name: 'Stormwatch Emergency and Weather Operations District',
    story: 'A radar dome and meteorological tower rise above the research campus, rescue sheds and backup power yard.',
    road: 'M43 126q33-13 56-12 22 2 38-11 24-19 65-16 30 5 68 23m-168 4-11-24 8-17m105 14q-8 18 2 38l12 18',
    courts: [['energy', 217, 113, 57, 25], ['apron', 45, 125, 46, 17], ['garden', 110, 110, 28, 17], ['square', 145, 127, 46, 21]],
    trees: [[47, 103, .9], [64, 70, .86], [98, 101, .7], [133, 130, .77], [173, 85, .67], [201, 120, .7], [241, 68, .78], [278, 122, .83]],
    vehicles: [['truck', 100, 122], ['van', 159, 123], ['tug', 209, 116]],
    groups: [
      [['Meteorological instrument shelter', 'shed', 'slate', 66, 71, 35, 18, 17], ['Meteorological observation tower', 'flight-tower', 'ochre', 129, 82, 24, 19, 49], ['Communications lab', 'atrium', 'glass', 171, 76, 41, 24, 37], ['Backup generator house', 'shed', 'sage', 237, 83, 28, 16, 15]],
      [['Weather radar observatory', 'radar', 'blue', 76, 92, 43, 23, 27], ['Rescue aircraft hangar', 'hangar', 'coral', 51, 108, 55, 23, 25], ['Emergency coordination centre', 'solar-lab', 'slate', 183, 104, 49, 24, 36], ['Forecast operations', 'laboratory', 'cream', 239, 99, 33, 17, 20]],
      [['Response team quarters', 'rowhouse', 'ochre', 120, 134, 29, 14, 15], ['Technical support depot', 'warehouse', 'sage', 189, 132, 32, 17, 17]],
    ],
  }),
  district({ name: 'Northstar Regional Development District',
    story: 'A wave-roof terminal connects an airside campus with a landscaped civic plaza and a curved glass landmark.',
    airfield: 'regional',
    road: 'M33 119q18-9 32-19 18-19 55-17 23 1 42 12 17 11 40 6 23-6 40-15 19-8 36 4m-28 13q20 7 20 22l-13 19m-94-8q12-9 14-26 1-14 9-22',
    courts: [['garden', 43, 95, 43, 17], ['garden', 97, 83, 32, 15], ['plaza', 161, 124, 54, 33], ['garden', 244, 123, 27, 16]],
    trees: [[34, 107, .86], [54, 80, 1.03], [116, 80, .77], [123, 95, .84], [145, 107, .79], [164, 113, .72], [177, 124, .67], [211, 122, .83], [232, 118, .9], [268, 102, .92], [277, 86, .75]],
    vehicles: [['tug', 60, 135], ['truck', 81, 130], ['tug', 225, 135]],
    groups: [
      [['Harbour View terraces', 'terraced-tower', 'glass', 72, 83, 46, 23, 50], ['Northstar Spire', 'spire', 'glass', 147, 89, 40, 24, 70], ['East commercial terraces', 'terraced-tower', 'glass', 211, 81, 39, 20, 40]],
      [['Northstar control tower', 'flight-tower', 'blue', 32, 111, 26, 22, 53], ['Windward regional terminal', 'wave-terminal', 'blue', 51, 111, 102, 29, 29], ['East public services pavilion', 'solar-lab', 'glass', 222, 110, 48, 24, 31]],
      [['Northstar Exchange', 'atrium', 'glass', 188, 101, 30, 17, 28], ['Regional cargo hangar', 'hangar', 'blue', 242, 135, 34, 17, 16]],
    ],
  }),
]

export function districtFor(mission: Mission) {
  return districts[campaign.findIndex(entry => entry.id === mission.id)]
}
