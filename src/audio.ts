import { BackgroundMusic, rampGain } from './music.ts'
import type { MusicTrack } from './music.ts'

export type AudioSettings = { muted: boolean; volume: number; music: number; effects: number; engine: number }
type AudioStorage = Pick<Storage, 'getItem' | 'setItem'>
const preferenceKey = 'cargo-commander.audio'
const defaults: AudioSettings = { muted: false, volume: .55, music: .35, effects: 1, engine: 1 }
const volumeLevel = (level: number, fallback: number) => Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : fallback

function readAudioSettings(storage?: AudioStorage): AudioSettings {
  try {
    const saved = JSON.parse((storage ?? window.localStorage).getItem(preferenceKey) ?? 'null')
    if (saved?.version === 1 || saved?.version === 2) return {
      muted: saved.muted === true, volume: volumeLevel(saved.volume, defaults.volume),
      music: volumeLevel(saved.music, defaults.music), effects: volumeLevel(saved.effects, defaults.effects), engine: volumeLevel(saved.engine, defaults.engine),
    }
  } catch { /* Audio settings remain available for this session. */ }
  return { ...defaults }
}

// Each note specifies start, duration, frequency and level, with optional timbre and glide.
type Note = readonly [number, number, number, number, OscillatorType?, number?]
const cues = {
  click: [[0, .028, 820, .07, 'sine', 580]],
  pickup: [[0, .085, 375, .09, 'triangle', 475], [.018, .05, 760, .032]],
  place: [[0, .09, 174, .14, 'triangle', 101], [.008, .052, 315, .045, 'triangle']],
  invalid: [[0, .16, 277, .10, 'sine', 233], [.105, .14, 196, .068]],
  neutral: [[0, .075, 330, .085, 'triangle'], [.07, .105, 294, .061]],
  cg: [[0, .13, 523, .095], [.09, .21, 698, .105], [.10, .16, 1047, .025]],
  ready: [[0, .13, 392, .095], [.105, .14, 494, .10], [.21, .26, 659, .115], [.21, .22, 523, .045]],
  clearance: [[0, .21, 392, .095, 'triangle'], [.15, .21, 587, .105], [.31, .32, 784, .128, 'triangle'], [.31, .32, 494, .055]],
  flightWarning: [[0, .22, 311, .079], [.16, .18, 261, .073]],
  arrival: [[0, .16, 349, .091, 'triangle'], [.11, .19, 440, .085], [.25, .32, 587, .106], [.25, .24, 349, .05]],
  failure: [[0, .25, 440, .088, 'triangle'], [.20, .25, 349, .095], [.39, .40, 294, .092], [.39, .36, 196, .047]],
  success: [
    [0, .29, 392, .104, 'triangle'], [.21, .31, 494, .104, 'triangle'], [.43, .31, 587, .11, 'triangle'], [.65, .37, 784, .115, 'triangle'],
    [.93, .38, 880, .108], [1.21, .43, 988, .10], [1.49, .82, 784, .128, 'triangle'], [1.49, .80, 587, .072],
    [1.49, .72, 494, .062], [1.49, .77, 392, .057], [1.49, .74, 196, .061],
  ],
  promotion: [[0, .19, 392, .11, 'triangle'], [.14, .2, 523, .118, 'triangle'], [.30, .43, 659, .125, 'triangle'], [.30, .36, 392, .051]],
  route: [[0, .095, 554, .086, 'sine', 647], [.09, .095, 740, .083, 'sine', 840], [.20, .23, 932, .079]],
  certification: [[0, .23, 659, .090], [.04, .08, 1497, .032], [.16, .34, 880, .101], [.16, .18, 1320, .045], [.17, .12, 1852, .021]],
  fanfare: [
    [0, .24, 86, .19, 'sine', 38], [0, .44, 196, .105, 'triangle'], [0, .20, 392, .052, 'sawtooth'],
    [.15, .19, 494, .090, 'triangle'], [.31, .20, 587, .098, 'triangle'], [.47, .32, 784, .108, 'triangle'],
    [.47, .30, 587, .062], [.47, .34, 392, .060, 'triangle'], [.47, .19, 90, .18, 'sine', 41],
    [.74, .28, 988, .075, 'triangle'], [.86, .37, 784, .075], [.86, .35, 494, .063, 'triangle'],
  ],
  buildImpact: [[0, .18, 105, .15, 'sine', 41], [.012, .11, 275, .044, 'triangle', 105], [.034, .08, 590, .021, 'sine', 227]],
  districtRise: [[0, .22, 392, .075], [.145, .22, 523, .09, 'triangle'], [.30, .49, 784, .108, 'triangle'], [.30, .44, 523, .07], [.30, .42, 330, .06, 'triangle'], [.30, .21, 94, .11, 'sine', 44]],
  coins: [[0, .13, 1175, .048], [.075, .16, 1568, .049], [.16, .21, 1976, .052], [.16, .14, 988, .036]],
  stemBonus: [[0, .14, 659, .079], [.09, .16, 880, .080, 'triangle'], [.20, .29, 1175, .081], [.23, .15, 1760, .03]],
  finale: [
    [0, .31, 88, .17, 'sine', 40], [0, .3, 523, .106, 'triangle'], [.17, .28, 659, .10, 'triangle'],
    [.34, .35, 784, .11, 'triangle'], [.51, .36, 1047, .087, 'triangle'], [.51, .55, 523, .070, 'sawtooth'],
    [.69, .76, 1047, .092, 'triangle'], [.69, .72, 784, .069], [.69, .76, 659, .072], [.69, .75, 262, .069, 'triangle'],
  ],
} satisfies Record<string, readonly Note[]>

type Cue = keyof typeof cues
type Group = 'effect' | 'engine' | 'achievement'
type Voice = { source: AudioScheduledSourceNode; group: Group; release: () => void }
type Engine = { level: GainNode; sources: AudioScheduledSourceNode[] }
const minimumGap: Partial<Record<Cue, number>> = { click: .055, pickup: .075, place: .08, neutral: .09, invalid: .3, flightWarning: 1, cg: .25, ready: .42 }

// Keep these offsets in sync with the corresponding badge accents on the results screen.
export const awardTiming = { promotion: 2.55, route: 3.48, certification: 4.12 } as const

function createBrowserContext() {
  const Context = globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  return Context ? new Context() : null
}

export class GameAudio {
  private settings: AudioSettings
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private effectBus: GainNode | null = null
  private engineBus: GainNode | null = null
  private background: BackgroundMusic | null = null
  private musicTrack: MusicTrack | null = null
  private flightMusicPaused = false
  private musicIntensity = 0
  private noise: AudioBuffer | null = null
  private visible = true
  private unavailable = false
  private resuming = false
  private engineWanted = false
  private engine: Engine | null = null
  private voices = new Set<Voice>()
  private lastCue = new Map<Cue, number>()
  private createContext: () => AudioContext | null
  private storage?: AudioStorage

  constructor(createContext = createBrowserContext, storage?: AudioStorage) {
    this.createContext = createContext
    this.storage = storage
    this.settings = readAudioSettings(storage)
  }

  get preferences() { return this.settings }

  private get audible() { return this.visible && !this.settings.muted && this.settings.volume > 0 }

  unlock() {
    if (!this.audible || this.unavailable) return
    try {
      if (!this.context) {
        this.context = this.createContext()
        if (!this.context) { this.unavailable = true; return }
        this.master = this.context.createGain()
        this.master.connect(this.context.destination)
        this.master.gain.value = this.settings.volume * .62
        this.effectBus = this.context.createGain()
        this.effectBus.gain.value = this.settings.effects
        this.effectBus.connect(this.master)
        this.engineBus = this.context.createGain()
        this.engineBus.gain.value = this.settings.engine
        this.engineBus.connect(this.master)
      }
      if (this.context.state === 'running') {
        this.syncMusic()
        if (this.engineWanted) this.startEngine(false)
      } else if (!this.resuming) {
        this.resuming = true
        this.context.resume().then(() => {
          this.resuming = false
          this.syncMusic()
          if (this.engineWanted && this.audible) this.startEngine(false)
        }).catch(() => { this.resuming = false; this.stop() })
      }
    } catch { this.unavailable = true }
  }

  setPreferences(changes: Partial<AudioSettings>) {
    const settings = { ...this.settings, ...changes }
    this.settings = {
      muted: settings.muted, volume: volumeLevel(settings.volume, defaults.volume), music: volumeLevel(settings.music, defaults.music),
      effects: volumeLevel(settings.effects, defaults.effects), engine: volumeLevel(settings.engine, defaults.engine),
    }
    try {
      (this.storage ?? window.localStorage).setItem(preferenceKey, JSON.stringify({ version: 2, ...this.settings }))
    } catch { /* A disabled local store does not prevent volume changes. */ }
    if (this.master && this.context) {
      const now = this.context.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(this.audible ? this.settings.volume * .62 : 0, now)
      this.effectBus?.gain.setValueAtTime(this.settings.effects, now)
      this.engineBus?.gain.setValueAtTime(this.settings.engine, now)
    }
    this.background?.setVolume(this.settings.music)
    if (this.settings.music === 0) this.background?.stop()
    if (this.settings.effects === 0) { this.stop('effect'); this.stop('achievement') }
    if (this.settings.engine === 0) this.stop('engine')
    if (this.audible) this.unlock()
    else this.stop()
    return this.settings
  }

  setVisible(visible: boolean) {
    this.visible = visible
    if (!visible) {
      this.engineWanted = false
      this.stop()
    } else if (this.context && this.master) {
      this.master.gain.setValueAtTime(this.audible ? this.settings.volume * .62 : 0, this.context.currentTime)
      this.syncMusic()
    }
  }

  setMusic(track: MusicTrack | null) {
    this.musicTrack = track
    this.syncMusic()
  }

  setFlightMusicPaused(paused: boolean) {
    this.flightMusicPaused = paused
    this.background?.setPaused(paused)
  }

  setMusicIntensity(intensity: number) {
    this.musicIntensity = intensity
    this.background?.setIntensity(intensity)
  }

  private syncMusic() {
    const { context, master } = this
    if (!context || !master || !this.audible || this.settings.music === 0 || context.state !== 'running') return
    if (!this.background && this.musicTrack) {
      this.background = new BackgroundMusic(context, master, this.settings.music)
      this.background.setPaused(this.flightMusicPaused)
      this.background.setIntensity(this.musicIntensity)
    }
    this.background?.setTrack(this.musicTrack)
  }

  private track(source: AudioScheduledSourceNode, group: Group, nodes: AudioNode[], onEnd?: () => void) {
    const voice: Voice = { source, group, release: () => {
      if (!this.voices.delete(voice)) return
      source.disconnect()
      for (const node of nodes) node.disconnect()
      onEnd?.()
    } }
    this.voices.add(voice)
    source.onended = voice.release
  }

  stop(group?: Group) {
    for (const voice of this.voices) {
      if (group && voice.group !== group) continue
      try { voice.source.stop() } catch { /* The source can already be finished. */ }
      voice.release()
    }
    if (!group || group === 'engine') this.engine = null
    if (group === 'achievement') this.background?.restore()
    if (!group) {
      this.lastCue.clear()
      this.background?.stop()
    }
  }

  private buffer(context: AudioContext) {
    if (!this.noise) {
      const buffer = context.createBuffer(1, Math.round(context.sampleRate * 2), context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1
      this.noise = buffer
    }
    return this.noise
  }

  private tone(context: AudioContext, master: GainNode, note: Note, start: number, group: Group) {
    const [offset, duration, frequency, amplitude, wave = 'sine', glide] = note
    const at = start + offset
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = wave
    oscillator.frequency.setValueAtTime(frequency, at)
    if (glide) oscillator.frequency.exponentialRampToValueAtTime(glide, at + duration)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(amplitude, at + Math.min(.024, duration * .2))
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration)
    oscillator.connect(gain).connect(master)
    oscillator.start(at)
    oscillator.stop(at + duration + .01)
    this.track(oscillator, group, [gain])
  }

  play(cue: Cue, delay = 0, group: Group = 'effect') {
    const { context, effectBus } = this
    if (!context || !effectBus || !this.audible || this.settings.effects === 0 || (context.state !== 'running' && !this.resuming)) return false
    const start = context.currentTime + .008 + delay
    const gap = minimumGap[cue] ?? .15
    if (start - (this.lastCue.get(cue) ?? -Infinity) < gap) return false
    this.lastCue.set(cue, start)
    if (cue === 'clearance' || cue === 'failure') this.background?.duck(cue === 'clearance' ? .72 : .91)
    for (const note of cues[cue]) this.tone(context, effectBus, note, start, group)
    if (cue === 'place') {
      const noise = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const tap = context.createGain()
      noise.buffer = this.buffer(context)
      filter.type = 'bandpass'
      filter.frequency.value = 530
      filter.Q.value = .8
      tap.gain.setValueAtTime(.17, start)
      tap.gain.exponentialRampToValueAtTime(.0001, start + .078)
      noise.connect(filter).connect(tap).connect(effectBus)
      noise.start(start, .35)
      noise.stop(start + .083)
      this.track(noise, group, [filter, tap])
    }
    return true
  }

  completeMission(firstDelivery: boolean) {
    if (!this.play('success', 0, 'achievement')) return
    this.background?.duck(firstDelivery ? awardTiming.certification + .59 : 2.40)
    if (firstDelivery) {
      this.play('promotion', awardTiming.promotion, 'achievement')
      this.play('route', awardTiming.route, 'achievement')
      this.play('certification', awardTiming.certification, 'achievement')
    }
  }

  celebrateDistrict({ buildings, bonus, final, reduced }: { buildings: number; bonus: boolean; final: boolean; reduced: boolean }) {
    this.stop('achievement')
    if (!this.play(final ? 'finale' : 'fanfare', 0, 'achievement')) return
    this.background?.duck(reduced ? 1.6 : 4.82)
    if (!reduced) {
      for (let index = 0; index < buildings; index++) this.play('buildImpact', .92 + index * .39, 'achievement')
      this.play('districtRise', 3.08, 'achievement')
    }
    this.play('coins', reduced ? .66 : 3.61, 'achievement')
    if (bonus) this.play('stemBonus', reduced ? .89 : 3.94, 'achievement')
    this.play('certification', reduced ? 1.10 : 4.25, 'achievement')
  }

  setEngine(phase: 'takeoff' | 'cruise' | null, fade = .21) {
    this.engineWanted = phase !== null
    if (phase) { this.startEngine(phase === 'takeoff'); return }
    const { engine, context } = this
    if (!engine || !context) return
    this.engine = null
    const at = context.currentTime
    rampGain(engine.level.gain, 0, at, fade)
    for (const source of engine.sources) source.stop(at + fade + .025)
  }

  private startEngine(takeoff: boolean) {
    const { context, engineBus } = this
    if (this.engine || !context || !engineBus || !this.audible || this.settings.engine === 0 || (context.state !== 'running' && !this.resuming)) return
    const at = context.currentTime
    const level = context.createGain()
    const propeller = context.createOscillator()
    const rumble = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const motorLevel = context.createGain()
    const airLevel = context.createGain()
    level.gain.setValueAtTime(0, at)
    level.gain.linearRampToValueAtTime(.21, at + (takeoff ? 1.35 : .28))
    propeller.type = 'triangle'
    propeller.frequency.setValueAtTime(takeoff ? 43 : 62, at)
    if (takeoff) propeller.frequency.exponentialRampToValueAtTime(62, at + 1.35)
    motorLevel.gain.value = .15
    rumble.buffer = this.buffer(context)
    rumble.loop = true
    filter.type = 'lowpass'
    filter.frequency.value = 225
    airLevel.gain.value = .38
    propeller.connect(motorLevel).connect(level)
    rumble.connect(filter).connect(airLevel).connect(level)
    level.connect(engineBus)
    propeller.start(at)
    rumble.start(at)
    const sources = [propeller, rumble]
    this.engine = { level, sources }
    let remaining = sources.length
    function disconnectLevel() { if (--remaining === 0) level.disconnect() }
    this.track(propeller, 'engine', [motorLevel], disconnectLevel)
    this.track(rumble, 'engine', [filter, airLevel], disconnectLevel)
  }
}

type CargoSafety = { balance: 'forward' | 'balanced' | 'aft'; ready: boolean }

export function cargoSounds(before: CargoSafety, after: CargoSafety, action: 'place' | 'neutral') {
  const sequence: [Cue, number][] = [[action, 0]]
  if (before.balance !== 'balanced' && after.balance === 'balanced') sequence.push(['cg', .12])
  if (!before.ready && after.ready) sequence.push(['ready', sequence.length > 1 ? .44 : .12])
  return sequence
}

export function newCorridorWarning() {
  return { since: null as number | null, last: -Infinity, announced: false }
}

export function corridorWarningDue(warning: ReturnType<typeof newCorridorWarning>, altitude: number, seconds: number, [low, high]: readonly [number, number]) {
  if (altitude >= low - .5 && altitude <= high + .5) warning.announced = false
  if (altitude >= low - 2 && altitude <= high + 2) {
    warning.since = null
    return false
  }
  warning.since ??= seconds
  if (warning.announced || seconds - warning.since < .65 || seconds - warning.last < 6) return false
  warning.announced = true
  warning.last = seconds
  return true
}

export const gameAudio = new GameAudio()
