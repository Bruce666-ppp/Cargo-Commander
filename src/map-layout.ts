import { campaign } from './mission.ts'

export const mapWidth = 1136
export const mapHeight = 786
export const islandScale = .85

export const islandSites = [
  { airport: campaign[0].origin, label: 'Harbor Base', x: 25, y: 222, shape: 0, grass: '#a2bd8a', accent: '#658e71' },
  { airport: campaign[0].destination, label: 'Pinehaven', x: 361, y: 27, shape: 1, grass: '#a2c38e', accent: '#6f9d73' },
  { airport: campaign[1].destination, label: 'Sundrift', x: 363, y: 279, shape: 2, grass: '#bbc78c', accent: '#9da878' },
  { airport: campaign[2].destination, label: 'Coral Point', x: 741, y: 43, shape: 2, grass: '#a5c49e', accent: '#648f7d' },
  { airport: campaign[3].destination, label: 'Mercy Cay', x: 758, y: 295, shape: 1, grass: '#a7ca96', accent: '#719d7d' },
  { airport: campaign[4].destination, label: 'Stormwatch', x: 409, y: 549, shape: 0, grass: '#91b29c', accent: '#588777' },
  { airport: campaign[5].destination, label: 'Northstar', x: 824, y: 554, shape: 2, grass: '#9fbfaa', accent: '#6b9b90' },
] as const

export type IslandSite = Omit<typeof islandSites[number], 'x' | 'y'> & { x: number; y: number }

const wideBends = [[-20, -10], [10, 38], [3, -39], [8, -29], [104, 65], [-12, -39]] as const
const narrowBends = [[-30, -13], [-92, 12], [84, 0], [22, -19], [59, 48], [8, -22]] as const
const narrowPositions = [[14, 133], [306, 10], [14, 375], [306, 240], [306, 470], [14, 631], [306, 715]] as const

function lines(sites: readonly IslandSite[], bends: readonly (readonly [number, number])[]) {
  return campaign.map((mission, index) => {
    const from = sites.find(island => island.airport === mission.origin)!
    const to = sites.find(island => island.airport === mission.destination)!
    const [bendX, bendY] = bends[index]
    const x = (from.x + to.x) / 2 + 160 * islandScale
    const y = (from.y + to.y) / 2 + 154 * islandScale
    return {
      d: `M${from.x + 160 * islandScale} ${from.y + 154 * islandScale} Q${x + bendX} ${y + bendY} ${to.x + 160 * islandScale} ${to.y + 154 * islandScale}`,
      marker: `${x + bendX / 2} ${y + bendY / 2}`,
    }
  })
}

const narrowSites: IslandSite[] = islandSites.map((site, index) => ({ ...site, x: narrowPositions[index][0], y: narrowPositions[index][1] }))
export const wideMap = { sites: islandSites, routeLines: lines(islandSites, wideBends), width: mapWidth, height: mapHeight }
export const narrowMap = { sites: narrowSites, routeLines: lines(narrowSites, narrowBends), width: 594, height: 951 }
