import { Icon } from './art'

export function DeliveryOptions({ ready = true, onAuto, onManual, testing = false }: {
  ready?: boolean; onAuto: () => void; onManual: () => void; testing?: boolean
}) {
  return <section className="delivery-options" aria-label="Delivery options">
    <div className="delivery-option delivery-auto">
      <button type="button" className="start-button" disabled={!ready} onClick={onAuto}><Icon name="auto" />Auto Delivery</button>
      <p>{testing ? 'Test your cargo arrangement automatically, with no manual flight controls.' : 'Complete the delivery automatically using your cargo arrangement. No manual flight controls required.'}</p>
    </div>
    <div className="delivery-option">
      <button type="button" className="secondary-button" data-audio-custom="" disabled={!ready} onClick={onManual}><Icon name="controls" />Manual Delivery</button>
      <p>Fly the aircraft yourself using W/S or touch controls.</p>
    </div>
    <p className="delivery-equality">{testing ? 'Both options test the same cargo arrangement.' : 'Both delivery modes can complete the mission and earn the same rewards.'}</p>
  </section>
}
