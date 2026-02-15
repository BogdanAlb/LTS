export default function ControlPanel({ onTare, onStart, onStop }) {
  return (
    <div className="button-row">
      <button type="button" onClick={onTare} className="tare">
        Tare
      </button>
      <button type="button" onClick={onStart} className="start">
        Start
      </button>
      <button type="button" onClick={onStop} className="stop">
        Stop
      </button>
    </div>
  );
}
