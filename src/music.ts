export type MusicTrack = 'planning' | 'flight'

const sampleRate = 22_050
const crossfade = .38
const tau = Math.PI * 2
type Phrase = readonly (readonly [beat: number, length: number, midi: number])[]

// Original eight-bar arrangements. Melody entries are beat, duration in beats, and MIDI note.
const windwardAdventures = {
  bpm: 92,
  roots: [38, 35, 43, 45, 38, 42, 43, 45],
  chords: [[54, 57, 61, 64], [54, 57, 59, 62], [55, 59, 62, 66], [55, 57, 61, 64], [54, 57, 62, 64], [54, 57, 61, 64], [55, 59, 62, 64], [55, 57, 61, 64]],
  melody: [
    [[.5, .75, 69], [1.5, .6, 66], [2.5, 1, 71]], [[0, 1.2, 73], [1.75, .75, 69], [3, .7, 66]],
    [[.5, .55, 67], [1.25, .6, 69], [2, 1.3, 74]], [[0, .75, 73], [1.25, 1.9, 71]],
    [[.5, .6, 69], [1.25, .7, 73], [2.25, 1, 76]], [[.25, .7, 78], [1.5, .6, 76], [2.5, 1, 73]],
    [[.5, 1.1, 74], [2, .65, 71], [3, .65, 67]], [[0, 1.1, 64], [1.75, 1.4, 66]],
  ] as readonly Phrase[],
}

const aboveTheIslands = {
  bpm: 114,
  roots: [35, 43, 38, 45, 40, 43, 38, 45],
  chords: [[54, 57, 59, 62], [55, 59, 62, 66], [54, 57, 61, 64], [55, 57, 62, 64], [52, 55, 59, 62], [55, 59, 62, 66], [54, 57, 62, 64], [55, 57, 61, 64]],
  melody: [
    [[0, .7, 66], [1, .45, 71], [1.75, .7, 73], [3, .5, 69]], [[0, 1, 74], [1.5, .45, 78], [2.25, .75, 76], [3.5, .45, 71]],
    [[.25, .5, 69], [1, .7, 73], [2, .5, 76], [2.75, 1.1, 81]], [[0, .75, 79], [1.25, .6, 76], [2.25, 1, 73]],
    [[.25, .55, 71], [1, .5, 74], [1.75, .55, 76], [2.75, .95, 79]], [[0, 1.1, 78], [1.5, .5, 74], [2.25, .7, 71], [3.25, .5, 69]],
    [[0, .65, 66], [1, .5, 69], [2, .65, 76], [3.05, .7, 78]], [[0, .7, 76], [1, .5, 73], [2, 1.2, 69], [3.5, .38, 64]],
  ] as readonly Phrase[],
}

type Instrument = 'piano' | 'pad' | 'bass'

function renderNote(data: Float32Array, beat: number, start: number, length: number, midi: number, level: number, instrument: Instrument) {
  const offset = Math.round(start * beat * sampleRate)
  const count = Math.round(length * beat * sampleRate)
  const step = tau * 440 * 2 ** ((midi - 69) / 12) / sampleRate
  const attack = sampleRate * (instrument === 'pad' ? .20 : .013)
  const release = sampleRate * (instrument === 'pad' ? .28 : .13)
  for (let sample = 0; sample < count; sample++) {
    const progress = sample / count
    const envelope = Math.min(1, sample / attack, (count - sample) / release)
    const phase = step * sample
    const wave = instrument === 'piano'
      ? (Math.sin(phase) * .72 + Math.sin(phase * 2.004) * .22 * (1 - progress) + Math.sin(phase * 3.012) * .065) * (1 - progress * .72)
      : instrument === 'pad'
        ? Math.sin(phase) * .62 + Math.sin(phase * 1.003) * .24 + Math.sin(2 * phase) * .1
        : Math.sin(phase) * .83 + Math.sin(2 * phase) * .16
    data[(offset + sample) % data.length] += wave * envelope * level
  }
}

function renderBeat(data: Float32Array, beat: number, start: number, level: number, brush = false) {
  const offset = Math.round(start * beat * sampleRate)
  const count = Math.round(sampleRate * (brush ? .12 : .20))
  let seed = offset + 1
  let previous = 0
  for (let sample = 0; sample < count; sample++) {
    const time = sample / sampleRate
    const envelope = Math.min(1, sample / 80) * (1 - sample / count) ** 3
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
    const noise = (seed >>> 0) / 2 ** 31 - 1
    const wave = brush ? (noise - previous) * .38 : Math.sin(tau * (49 * time + 1.2 * (1 - Math.exp(-30 * time))))
    previous = noise
    data[(offset + sample) % data.length] += wave * envelope * level
  }
}

export function renderMusic(context: AudioContext, track: MusicTrack) {
  const planning = track === 'planning'
  const song = planning ? windwardAdventures : aboveTheIslands
  const beat = 60 / song.bpm
  const samples = Math.round(song.chords.length * 4 * beat * sampleRate)
  const main = context.createBuffer(1, samples, sampleRate)
  const rhythm = planning ? null : context.createBuffer(1, samples, sampleRate)
  const data = main.getChannelData(0)
  const extra = rhythm?.getChannelData(0)
  for (const [bar, chord] of song.chords.entries()) {
    const at = bar * 4
    for (const [index, midi] of chord.entries()) {
      renderNote(data, beat, at, 4.25, midi, planning ? .031 : .028, 'pad')
      renderNote(data, beat, at + index * (planning ? .5 : .375) + .15, 1.45, midi + (index % 2 ? 12 : 0), planning ? .076 : .051, 'piano')
    }
    const root = song.roots[bar]
    for (const [start, length, pitch] of (planning ? [[0, 1.7, root], [2.25, 1.05, root + 12]] : [[0, .78, root], [1.5, .48, root + 12], [2.4, .7, root], [3.5, .43, root + 12]])) {
      renderNote(data, beat, at + start, length, pitch, planning ? .119 : .139, 'bass')
    }
    for (const [start, length, midi] of song.melody[bar]) renderNote(data, beat, at + start, length + .28, midi, planning ? .17 : .18, 'piano')
    renderBeat(data, beat, at + 1.5, planning ? .016 : .038, true)
    renderBeat(data, beat, at + 3.5, planning ? .014 : .032, true)
    if (extra) {
      renderBeat(data, beat, at, .067)
      renderBeat(extra, beat, at + 2.5, .105)
      for (const offset of [.5, 1, 2, 3, 3.75]) renderBeat(extra, beat, at + offset, .058, true)
    }
  }
  // Notes can wrap into the first samples, keeping chord tails continuous across the loop.
  return { main, rhythm }
}

export function rampGain(parameter: AudioParam, target: number, at: number, seconds: number) {
  if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(at)
  else {
    const current = parameter.value
    parameter.cancelScheduledValues(at)
    parameter.setValueAtTime(current, at)
  }
  parameter.linearRampToValueAtTime(target, at + seconds)
}

type PlayingMusic = { gain: GainNode; sources: AudioBufferSourceNode[]; rhythm?: GainNode; cutoff?: ReturnType<typeof setTimeout> }

export class BackgroundMusic {
  private tracks = new Map<MusicTrack, PlayingMusic>()
  private buffers = new Map<MusicTrack, ReturnType<typeof renderMusic>>()
  private current: MusicTrack | null = null
  private paused = false
  private intensity = 0
  private duckUntil = 0
  private level: GainNode
  private duckGain: GainNode
  private context: AudioContext

  constructor(context: AudioContext, destination: AudioNode, volume: number) {
    this.context = context
    this.level = context.createGain()
    this.duckGain = context.createGain()
    this.level.gain.value = volume * .5
    this.level.connect(this.duckGain).connect(destination)
  }

  setVolume(volume: number) { rampGain(this.level.gain, volume * .5, this.context.currentTime, .05) }

  setTrack(track: MusicTrack | null) {
    if (track === this.current) return
    this.current = track
    const playing = track ? this.tracks.get(track) ?? this.start(track) : null
    const now = this.context.currentTime
    for (const [name, playing] of this.tracks) {
      if (name === track || playing.cutoff !== undefined) continue
      rampGain(playing.gain.gain, 0, now, crossfade)
      playing.cutoff = setTimeout(() => this.dispose(name, playing), (crossfade + .06) * 1000)
    }
    if (!playing) return
    clearTimeout(playing.cutoff)
    playing.cutoff = undefined
    rampGain(playing.gain.gain, track === 'flight' && this.paused ? .22 : 1, now, crossfade)
  }

  setPaused(paused: boolean) {
    if (this.paused === paused) return
    this.paused = paused
    const playing = this.current === 'flight' && this.tracks.get('flight')
    if (playing) rampGain(playing.gain.gain, paused ? .22 : 1, this.context.currentTime, .25)
  }

  setIntensity(value: number) {
    this.intensity = value
    const rhythm = this.tracks.get('flight')?.rhythm
    if (rhythm) rampGain(rhythm.gain, value, this.context.currentTime, .4)
  }

  duck(seconds: number) {
    const at = this.context.currentTime
    this.duckUntil = Math.max(this.duckUntil, at + seconds)
    const gain = this.duckGain.gain
    rampGain(gain, .22, at, .075)
    gain.setValueAtTime(.22, this.duckUntil)
    gain.linearRampToValueAtTime(1, this.duckUntil + .32)
  }

  restore() {
    this.duckUntil = 0
    rampGain(this.duckGain.gain, 1, this.context.currentTime, .22)
  }

  stop() {
    for (const [track, playing] of this.tracks) this.dispose(track, playing)
    this.current = null
    this.restore()
  }

  private start(track: MusicTrack) {
    let buffers = this.buffers.get(track)
    if (!buffers) {
      buffers = renderMusic(this.context, track)
      this.buffers.set(track, buffers)
    }
    const gain = this.context.createGain()
    gain.gain.value = 0
    gain.connect(this.level)
    const playing: PlayingMusic = { gain, sources: [] }
    this.tracks.set(track, playing)
    const at = this.context.currentTime + .012
    const addLoop = (buffer: AudioBuffer, destination: AudioNode) => {
      const source = this.context.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(destination)
      source.start(at)
      playing.sources.push(source)
    }
    addLoop(buffers.main, gain)
    if (buffers.rhythm) {
      playing.rhythm = this.context.createGain()
      playing.rhythm.gain.value = this.intensity
      playing.rhythm.connect(gain)
      addLoop(buffers.rhythm, playing.rhythm)
    }
    return playing
  }

  private dispose(track: MusicTrack, playing: PlayingMusic) {
    clearTimeout(playing.cutoff)
    for (const source of playing.sources) {
      source.stop()
      source.disconnect()
    }
    playing.rhythm?.disconnect()
    playing.gain.disconnect()
    this.tracks.delete(track)
  }
}
