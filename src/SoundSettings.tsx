import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from './art'
import { gameAudio } from './audio'

const volumeControls = [
  ['volume', 'Master volume'], ['music', 'Background music'], ['effects', 'Sound effects'], ['engine', 'Engine ambience'],
] as const

export function SoundSettings({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [settings, setSettings] = useState(() => gameAudio.preferences)
  const control = useRef<HTMLDetailsElement>(null)
  const trigger = useRef<HTMLElement>(null)
  const volumeId = useId()
  const silent = settings.muted || settings.volume === 0

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      const details = control.current
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) details.open = false
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  return (
    <details className="sound-settings" ref={control} onToggle={event => onOpenChange?.(event.currentTarget.open)} onKeyDown={event => {
      if (event.key === 'Escape' && control.current?.open) {
        control.current.open = false
        trigger.current?.focus()
      }
    }}>
      <summary ref={trigger} className="sound-trigger" aria-label="Sound settings" title="Sound settings">
        <Icon name={silent ? 'muted' : 'speaker'} />
      </summary>
      <div className="sound-options" role="group" aria-label="Audio preferences">
        <button className="sound-toggle" role="switch" type="button" aria-label="Sound" aria-checked={!settings.muted} data-audio-custom=""
          onClick={() => {
            const updated = gameAudio.setPreferences({ ...settings, muted: !settings.muted })
            setSettings(updated)
            if (!updated.muted) gameAudio.play('click')
          }}><span>Sound</span><strong>{settings.muted ? 'Off' : 'On'}</strong></button>
        {volumeControls.map(([key, label]) => {
          const id = `${volumeId}-${key}`
          const level = Math.round(settings[key] * 100)
          return <div key={key} className="sound-level">
            <label htmlFor={id}>{label} <output aria-hidden="true">{level}%</output></label>
            <input id={id} type="range" min="0" max="100" value={level}
              onChange={event => setSettings(gameAudio.setPreferences({ [key]: Number(event.currentTarget.value) / 100 }))} />
          </div>
        })}
      </div>
    </details>
  )
}
