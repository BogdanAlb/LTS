import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page not-found">
      <h2 className="page-title">Pagina negasita</h2>
      <p className="page-subtitle">Ruta ceruta nu exista in structura curenta.</p>
      <Link to="/" className="back-link">
        Intoarcere la pagina principala
      </Link>
    </section>
  );
}
