import { campaign } from './mission.ts'

export const mapWidth = 1136
export const mapHeight = 790
export const islandScale = .85

export const islandSites = [
  { airport: campaign[0].origin, label: 'Harbor Base', x: 29, y: 514, shape: 0, grass: '#a3b87b', accent: '#689273' },
  { airport: campaign[0].destination, label: 'Pinehaven', x: 408, y: 549, shape: 1, grass: '#bdd396', accent: '#81a46d' },
  { airport: campaign[1].destination, label: 'Sundrift', x: 822, y: 502, shape: 2, grass: '#cacf9a', accent: '#95a97a' },
  { airport: campaign[2].destination, label: 'Coral Point', x: 814, y: 269, shape: 3, grass: '#b4cfaa', accent: '#69988d' },
  { airport: campaign[3].destination, label: 'Mercy Cay', x: 435, y: 268, shape: 4, grass: '#b5d49c', accent: '#79a384' },
  { airport: campaign[4].destination, label: 'Stormwatch', x: 142, y: 38, shape: 5, grass: '#a5bdac', accent: '#647f7c' },
  { airport: campaign[5].destination, label: 'Northstar', x: 661, y: 25, shape: 6, grass: '#afd0a9', accent: '#79a58b' },
] as const

export type IslandSite = Omit<typeof islandSites[number], 'x' | 'y'> & { x: number; y: number }

const wideBends = [[12, 13], [9, -63], [130, -9], [-11, -39], [-67, 13], [1, -48]] as const
const narrowBends = [[-4, -40], [63, -9], [4, 19], [-94, 13], [-4, -36], [44, 14]] as const
const narrowPositions = [[19, 24], [306, 123], [306, 373], [18, 409], [14, 667], [308, 718], [115, 965]] as const

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
export const narrowMap = { sites: narrowSites, routeLines: lines(narrowSites, narrowBends), width: 594, height: 1190 }
