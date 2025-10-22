import React from "react";

export default function GaugeDisplay({ value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl mb-2">Live Weight</h2>
      <div className="text-6xl font-bold text-green-400">{value ?? "--"} g</div>
    </div>
  );
}
