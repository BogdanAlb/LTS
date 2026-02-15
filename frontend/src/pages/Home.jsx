import { Link } from "react-router-dom";

const branches = [
  {
    title: "Dashboard",
    description: "Citire live pentru greutate, cu comenzi Start, Stop si Tare.",
    to: "/dashboard",
  },
  {
    title: "Status",
    description: "Monitorizare conexiune Wi-Fi si timp de actualizare.",
    to: "/status",
  },
  {
    title: "Setari",
    description: "Mapare rute si puncte de configurare pentru frontend/API.",
    to: "/settings",
  },
];

export default function Home() {
  return (
    <section className="page">
      <h2 className="page-title">Pagina Principala</h2>
      <p className="page-subtitle">
        Frontend-ul este organizat pe o pagina centrala si ramuri clare de navigatie.
      </p>

      <div className="feature-grid">
        {branches.map((branch) => (
          <Link key={branch.to} to={branch.to} className="feature-card">
            <h3>{branch.title}</h3>
            <p>{branch.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
