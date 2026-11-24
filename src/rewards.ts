import { campaign } from './mission.ts'
import type { CareerProgress } from './career.ts'
import type { Mission } from './mission.ts'

export const creativeReward = 2000
export const growthMilestones = [
  { amount: 500, name: 'First Revenue' },
  { amount: 2000, name: 'Growing Airline' },
  { amount: 4500, name: 'Island Supporter' },
  { amount: 7500, name: 'Regional Carrier' },
  { amount: 12000, name: 'Windward Enterprise' },
  { amount: 14000, name: 'Creative Enterprise' },
] as const

const payments = [[400, 100], [600, 200], [900, 300], [1500, 500], [2200, 800], [3400, 1100]] as const

export function missionPayment(mission: Mission) {
  const [income, bonus] = payments[campaign.findIndex(entry => entry.id === mission.id)] ?? [0, 0]
  return { income, bonus }
}

export function earnings(progress: CareerProgress, architect: boolean) {
  let base = 0
  let stem = 0
  for (const mission of campaign) {
    if (!progress.completedMissionIds.includes(mission.id)) continue
    const { income, bonus } = missionPayment(mission)
    base += income
    if (progress.stemBonusIds.includes(mission.id)) stem += bonus
  }
  const creative = architect ? creativeReward : 0
  return { base, stem, creative, total: base + stem + creative }
}

const amounts = new Intl.NumberFormat('en-GB')
export const money = (amount: number) => '$' + amounts.format(amount)
export const earnedGrowth = (total: number) => growthMilestones.filter(milestone => milestone.amount <= total).at(-1)
