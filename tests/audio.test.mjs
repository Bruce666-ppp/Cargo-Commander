import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { awardTiming, cargoSounds, corridorWarningDue, GameAudio, newCorridorWarning } from '../src/audio.ts'
import { renderMusic } from '../src/music.ts'

class AudioParameter {
  value = 0
  automation = []

  setValueAtTime(value, at) { this.value = value; this.automation.push(['set', value, at]) }
  linearRampToValueAtTime(value, at) { this.automation.push(['linear', value, at]) }
  exponentialRampToValueAtTime(value, at) { this.automation.push(['exp', value, at]) }
  cancelScheduledValues() {}
}

class AudioNode {
  connected = null
  gain = new AudioParameter()
  frequency = new AudioParameter()
  Q = new AudioParameter()

  connect(destination) { this.connected = destination; return destination }
  disconnect() { this.connected = null }
  start(at) { this.startedAt = at }
  stop(at = 0) { this.stoppedAt = at }
}

function audioHarness() {
  const sources = []
  const gains = []
  let contexts = 0
  const values = new Map()
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
  const context = {
    currentTime: 0, state: 'running', sampleRate: 8_000, destination: new AudioNode(),
    createGain: () => { const node = new AudioNode(); gains.push(node); return node },
    createOscillator: () => { const node = new AudioNode(); sources.push(node); return node },
    createBiquadFilter: () => new AudioNode(),
    createBufferSource: () => { const node = new AudioNode(); sources.push(node); return node },
    createBuffer: (_, length, sampleRate) => {
      const data = new Float32Array(length)
      return { getChannelData: () => data, duration: length / sampleRate, sampleRate }
    },
  }
  const audio = new GameAudio(() => { contexts++; return context }, storage)
  return { audio, context, sources, gains, storage, contexts: () => contexts }
}

test('audio is lazy, reuses its context, limits repeated taps and falls back silently', () => {
  const { audio, context, sources, contexts } = audioHarness()
  audio.play('click')
  assert.equal(contexts(), 0)
  audio.unlock()
  audio.unlock()
  assert.equal(contexts(), 1)
  audio.play('click')
  audio.play('click')
  assert.equal(sources.length, 1)
  context.currentTime = .06
  audio.play('click')
  assert.equal(sources.length, 2)
  const unavailable = new GameAudio(() => { throw new Error('Audio cannot start') })
  assert.doesNotThrow(() => { unavailable.unlock(); unavailable.play('clearance'); unavailable.setEngine('takeoff') })
})

test('cargo cues follow real transitions and a corridor departure must persist before warning', () => {
  const unbalanced = { balance: 'aft', ready: false }
  const balanced = { balance: 'balanced', ready: false }
  const ready = { balance: 'balanced', ready: true }
  assert.deepEqual(cargoSounds(unbalanced, ready, 'place'), [['place', 0], ['cg', .12], ['ready', .44]])
  assert.deepEqual(cargoSounds(balanced, ready, 'place'), [['place', 0], ['ready', .12]])
  assert.deepEqual(cargoSounds(ready, ready, 'place'), [['place', 0]])
  assert.deepEqual(cargoSounds(ready, balanced, 'neutral'), [['neutral', 0]])
  const warning = newCorridorWarning()
  const due = (altitude, seconds) => corridorWarningDue(warning, altitude, seconds, [86, 114])
  assert.equal(due(115, 0), false)
  assert.equal(due(117, 1), false)
  assert.equal(due(117, 1.64), false)
  assert.equal(due(117, 1.66), true)
  assert.equal(due(117, 8), false)
  assert.equal(due(111, 8.1), false)
  assert.equal(due(83, 8.6), false)
  assert.equal(due(83, 9.3), true)
  assert.equal(due(100, 9.4), false)
  assert.equal(due(117, 9.5), false)
  assert.equal(due(117, 10.3), false)
})

test('first rewards play sequentially after the mission cue, while replay plays the mission cue alone', () => {
  const first = audioHarness()
  first.audio.unlock()
  first.audio.completeMission(true)
  const groups = [first.sources.slice(0, 11), first.sources.slice(11, 15), first.sources.slice(15, 18), first.sources.slice(18)]
  assert.deepEqual(groups.map(group => group.length), [11, 4, 3, 5])
  assert.ok(groups[0].at(-1).stoppedAt > 2)
  const starts = [0, awardTiming.promotion, awardTiming.route, awardTiming.certification]
  groups.forEach((group, index) => {
    assert.equal(group[0].startedAt, .008 + starts[index])
    if (groups[index + 1]) assert.ok(Math.max(...group.map(note => note.stoppedAt)) < groups[index + 1][0].startedAt)
  })
  first.audio.stop('achievement')
  assert.ok(first.sources.every(note => note.stoppedAt === 0 && !note.connected))

  const replay = audioHarness()
  replay.audio.unlock()
  replay.audio.completeMission(false)
  assert.equal(replay.sources.length, 11)
  const failure = audioHarness()
  failure.audio.unlock()
  failure.audio.play('failure')
  assert.ok(failure.sources.at(-1).stoppedAt >= .6 && failure.sources.at(-1).stoppedAt <= 1)
  assert.deepEqual(failure.sources.slice(0, 3).map(note => note.frequency.value), [440, 349, 294])
})

test('engine spools once, fades on pause, stops immediately on mute or tab hiding, and preferences persist', () => {
  const { audio, context, sources, gains, storage } = audioHarness()
  audio.unlock()
  audio.setEngine('takeoff')
  audio.setEngine('cruise')
  assert.equal(sources.length, 2)
  assert.deepEqual(sources[0].frequency.automation, [['set', 43, 0], ['exp', 62, 1.35]])
  assert.equal(sources[1].loop, true)
  context.currentTime = 2
  audio.setEngine(null)
  assert.equal(sources[1].stoppedAt, 2 + .21 + .025)
  assert.deepEqual(sources[1].connected.connected.connected.gain.automation.at(-1), ['linear', 0, 2 + .21])
  audio.setEngine('cruise')
  assert.equal(sources.length, 4)
  assert.deepEqual(sources[2].frequency.automation, [['set', 62, 2]])
  audio.setPreferences({ muted: true, volume: .32 })
  audio.play('arrival')
  assert.equal(sources.length, 4)
  assert.ok(sources.every(node => !node.connected))
  assert.equal(gains[0].gain.value, 0)
  assert.deepEqual(new GameAudio(() => null, storage).preferences, { muted: true, volume: .32, music: .35, effects: 1, engine: 1 })
  audio.setPreferences({ muted: false, volume: .32 })
  assert.equal(sources.length, 6)
  audio.setVisible(false)
  assert.ok(sources.every(node => !node.connected))
  audio.setVisible(true)
  assert.equal(sources.length, 6)
})

test('original music buffers loop at the intended tempos with bounded, continuous audio', () => {
  const { context } = audioHarness()
  for (const [track, bpm] of [['planning', 92], ['flight', 114]]) {
    const { main, rhythm } = renderMusic(context, track)
    assert.ok(Math.abs(main.duration - 32 * 60 / bpm) < 1 / main.sampleRate)
    const data = main.getChannelData(0)
    let squares = 0
    let peak = 0
    for (const sample of data) {
      squares += sample * sample
      peak = Math.max(peak, Math.abs(sample))
    }
    assert.ok(peak < 1 && Math.sqrt(squares / data.length) > .025)
    assert.ok(Math.abs(data[0] - data.at(-1)) < .04)
    if (track === 'flight') assert.equal(rhythm.duration, main.duration)
    else assert.equal(rhythm, null)
  }
})

test('music shares the unlocked context and reuses synchronized loops across intensity, pause and quick navigation', () => {
  const { audio, context, sources, gains, contexts } = audioHarness()
  audio.setMusic('planning')
  assert.equal(contexts(), 0)
  audio.unlock()
  audio.setMusic('planning')
  assert.equal(sources.length, 1)
  const [planning] = sources
  audio.setMusic('flight')
  assert.equal(sources.length, 3)
  const [, flight, rhythm] = sources
  assert.equal(flight.startedAt, rhythm.startedAt)
  assert.ok(sources.every(source => source.loop))
  context.currentTime = .08
  audio.setMusicIntensity(1)
  assert.equal(rhythm.connected.gain.automation.at(-1)[1], 1)
  audio.setFlightMusicPaused(true)
  assert.equal(flight.connected.gain.automation.at(-1)[1], .22)
  audio.setFlightMusicPaused(false)
  assert.equal(flight.connected.gain.automation.at(-1)[1], 1)
  audio.play('clearance')
  const duck = gains[4].gain.automation
  assert.deepEqual(duck.at(-2), ['set', .22, .08 + .72])
  assert.deepEqual(duck.at(-1), ['linear', 1, .08 + .72 + .32])
  audio.completeMission(true)
  assert.equal(duck.at(-2)[2], .08 + (awardTiming.certification + .59))
  audio.setMusic('planning')
  assert.equal(sources.filter(source => source.loop).length, 3)
  assert.equal(planning.connected.gain.automation.at(-1)[1], 1)
  audio.setVisible(false)
  assert.ok(sources.every(source => !source.connected))
  audio.setVisible(true)
  assert.equal(contexts(), 1)
  assert.deepEqual(sources.filter(source => source.loop && source.connected).map(source => source.buffer.duration), [planning.buffer.duration])
  audio.stop()
})

test('saved master and mute settings migrate and the independent channels stay separate', () => {
  const { audio, storage, sources, gains } = audioHarness()
  storage.setItem('cargo-commander.audio', JSON.stringify({ version: 1, muted: true, volume: .23 }))
  const migrated = new GameAudio(() => null, storage)
  assert.deepEqual(migrated.preferences, { muted: true, volume: .23, music: .35, effects: 1, engine: 1 })
  migrated.setPreferences({ music: .2, effects: .4, engine: .7 })
  assert.deepEqual(new GameAudio(() => null, storage).preferences, { muted: true, volume: .23, music: .2, effects: .4, engine: .7 })

  audio.setMusic('planning')
  audio.unlock()
  audio.setEngine('cruise')
  const [planning, motor, rumble] = sources
  audio.setPreferences({ effects: 0 })
  assert.equal(gains[1].gain.value, 0)
  assert.equal(audio.play('clearance'), false)
  assert.ok(planning.connected && motor.connected && rumble.connected)
  audio.setPreferences({ engine: 0 })
  assert.ok(!motor.connected && !rumble.connected && planning.connected)
  audio.setPreferences({ effects: .6, music: 0 })
  assert.equal(planning.connected, null)
  assert.equal(audio.play('click'), true)
  audio.setPreferences({ music: .2, muted: true })
  assert.ok(sources.every(source => !source.connected))
  audio.setPreferences({ muted: false })
  assert.ok(sources.at(-1).loop && sources.at(-1).connected)
  audio.stop()
})
