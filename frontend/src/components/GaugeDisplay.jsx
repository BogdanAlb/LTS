export default function GaugeDisplay({ value }) {
  const hasValue = typeof value === "number";

  return (
    <div className="gauge-display">
      <h2>Live Weight</h2>
      <div className={`weight-display ${hasValue ? "" : "small"}`}>
        {hasValue ? `${value} g` : "-- g"}
      </div>
    </div>
  );
}
