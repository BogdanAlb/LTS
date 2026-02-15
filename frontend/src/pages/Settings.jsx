const routes = [
  { path: "/", description: "Pagina principala" },
  { path: "/dashboard", description: "Citire live + comenzi cantar" },
  { path: "/status", description: "Indicatori sistem si conectivitate" },
  { path: "/settings", description: "Setari frontend si organizare rute" },
];

export default function Settings() {
  return (
    <section className="page">
      <h2 className="page-title">Setari si Structura</h2>
      <p className="page-subtitle">
        Pentru backend configurabil, poti seta variabila de mediu <code>VITE_API_BASE_URL</code>.
      </p>

      <div className="info-card">
        <p className="info-label">Ramuri frontend</p>
        <ul className="route-list">
          {routes.map((route) => (
            <li key={route.path}>
              <code>{route.path}</code> - {route.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
