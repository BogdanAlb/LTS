import React from "react";

export default function ControlPanel({ onTare, onStart, onStop }) {
  return (
    <div className="flex gap-4 justify-center mt-6">
      <button onClick={onTare} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg">
        Tare
      </button>
      <button onClick={onStart} className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg">
        Start
      </button>
      <button onClick={onStop} className="px-6 py-3 bg-red-600 text-white rounded-lg text-lg">
        Stop
      </button>
    </div>
  );
}
