import { useState } from "react";
import { submitKioskOrder } from "../api/kioskOrders";

const BEARBEITER = [
  ["b_jheld", "J.Held"],
  ["b_hemus", "Hemus"],
  ["b_alb", "Alb"],
  ["b_ciobanu", "Ciobanu"],
  ["b_mheld", "M.Held"],
];

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="rf-checkbox">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="rf-checkbox__box" />
      <span>{label}</span>
    </label>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="rf-radio-group">
      {options.map((opt) => (
        <label key={opt} className="rf-checkbox">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span className="rf-checkbox__box rf-checkbox__box--round" />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

const INITIAL = {
  kunde: "",
  befundNr: "",
  kommission: "",
  ltsNummer: "",
  durchmesser: "",
  steigung: "",
  gesamtlaenge: "",
  seite: "",
  fv_gerollt: false,
  fv_gewirbelt: false,
  fv_geschliffen: false,
  mb_EFEM: false,
  mb_EFDM: false,
  mb_MFM: false,
  mb_MFDM: false,
  mb_ZEM: false,
  mb_ZDM: false,
  i_wert: "",
  vorsp: "",
  vp_4pkt: false,
  vp_shift: false,
  vp_scheibe: false,
  vp_getriebe: false,
  vp_madenstift: false,
  mont_festlager: false,
  mont_loslager: false,
  foto_kpl: false,
  foto_links: false,
  foto_rechts: false,
  foto_beidseitig: false,
  flansch_eingebaut: "",
  flansch_ersetzt: "",
  flansch_vorspannung: "",
  zylinder_eingebaut: "",
  zylinder_ersetzt: "",
  zylinder_vorspannung: "",
  s_ausbrueche_spindel: false,
  s_ausbrueche_mutter: false,
  s_kugeln_deformiert: false,
  s_kugeleindrucke: false,
  s_abstreifer: false,
  s_umlenkstuecke: false,
  s_ohne_vorspannung: false,
  s_zu_wenig_kugeln: false,
  s_spindel_eingelaufen: false,
  s_wasserschaden: false,
  s_loch_spindel: false,
  s_passungen: false,
  s_laufspurauspr: false,
  s_fett_verschmutzt: false,
  s_fett_braun: false,
  s_unzureichend_schm: false,
  s_wenig_schm: false,
  s_rost: false,
  s_spaene: false,
  s_mutter_hakt: false,
  s_spindel_punktuell: false,
  s_montage_umlenkung: false,
  kgt_reparabel: "",
  zeichnung: "",
  mutternrichtung: "",
  freinotiz: "",
  b_jheld: false,
  b_hemus: false,
  b_alb: false,
  b_ciobanu: false,
  b_mheld: false,
};

function getSubmissionTitle(form) {
  const summary = [form.kunde, form.befundNr, form.ltsNummer]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" | ");
  const title = summary ? `Reparatur: ${summary}` : "Reparaturformular";
  return title.slice(0, 120);
}

function getSubmittedBy(form) {
  const selected = BEARBEITER
    .filter(([key]) => form[key])
    .map(([, label]) => label);
  if (selected.length === 0) {
    return null;
  }
  return selected.join(", ").slice(0, 120);
}

export default function ReparaturFormular() {
  const [form, setForm] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const set = (key) => (val) => setForm((current) => ({ ...current, [key]: val }));
  const chk = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.checked }));

  async function handleSave(event) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setSaved(false);
    setIsSubmitting(true);

    try {
      await submitKioskOrder({
        title: getSubmissionTitle(form),
        submitted_by: getSubmittedBy(form),
        fields: {
          form_type: "reparatur",
          ...form,
        },
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setErrorMessage(error.message ?? "Formularul nu a putut fi trimis catre kiosk.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    if (window.confirm("Resetezi toate campurile?")) {
      setForm(INITIAL);
      setSaved(false);
      setErrorMessage("");
    }
  }

  return (
    <section className="page">
      <style>{CSS}</style>

      <div className="rf-toolbar">
        <div>
          <h2 className="page-title">Ablauf Reparatur</h2>
          <p className="page-subtitle">
            Formularul este trimis in aplicatia kiosk prin endpoint-ul generic de comenzi.
          </p>
        </div>
        <button
          type="submit"
          form="reparatur-form"
          className="btn btn--primary rf-toolbar__send"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Form to Kiosk"}
        </button>
      </div>

      {saved ? <p className="rf-feedback rf-feedback--success">Formular trimis catre kiosk.</p> : null}
      {errorMessage ? <p className="rf-feedback rf-feedback--error">{errorMessage}</p> : null}

      <form id="reparatur-form" onSubmit={handleSave}>
        <div className="rf-page">
          <div className="rf-header">
            <div className="rf-logo">
              <div className="rf-logo__title">LINEARTECHNIK</div>
              <div className="rf-logo__sub">STUTTGART GMBH</div>
              <div className="rf-logo__stripe" />
            </div>
          </div>

          <table className="rf-table rf-table--header">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Befund-Nr.</th>
                <th>Kommission</th>
                <th>LTS Nummer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input className="rf-table__input" value={form.kunde} onChange={(event) => set("kunde")(event.target.value)} placeholder="Kunde" /></td>
                <td><input className="rf-table__input" value={form.befundNr} onChange={(event) => set("befundNr")(event.target.value)} placeholder="00-00" /></td>
                <td><input className="rf-table__input" value={form.kommission} onChange={(event) => set("kommission")(event.target.value)} placeholder="Kommission" /></td>
                <td><input className="rf-table__input" value={form.ltsNummer} onChange={(event) => set("ltsNummer")(event.target.value)} placeholder="B000000" /></td>
              </tr>
              <tr>
                <td><input className="rf-table__input" value={form.durchmesser} onChange={(event) => set("durchmesser")(event.target.value)} placeholder="Durchmesser" /></td>
                <td><input className="rf-table__input" value={form.steigung} onChange={(event) => set("steigung")(event.target.value)} placeholder="Steigung" /></td>
                <td><input className="rf-table__input" value={form.gesamtlaenge} onChange={(event) => set("gesamtlaenge")(event.target.value)} placeholder="Gesamtlaenge" /></td>
                <td className="rf-table__rl">
                  <label className="rf-checkbox rf-checkbox--inline">
                    <input
                      type="checkbox"
                      checked={form.seite === "R"}
                      onChange={() => setForm((current) => ({ ...current, seite: current.seite === "R" ? "" : "R" }))}
                    />
                    <span className="rf-checkbox__box" /> R
                  </label>
                  <label className="rf-checkbox rf-checkbox--inline">
                    <input
                      type="checkbox"
                      checked={form.seite === "L"}
                      onChange={() => setForm((current) => ({ ...current, seite: current.seite === "L" ? "" : "L" }))}
                    />
                    <span className="rf-checkbox__box" /> L
                  </label>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="rf-table rf-table--section">
            <thead>
              <tr>
                <th>Fertigungsverfahren</th>
                <th>Mutternbauform</th>
                <th>i / Vorspannung</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Checkbox label="gerollt" checked={form.fv_gerollt} onChange={chk("fv_gerollt")} />
                  <Checkbox label="gewirbelt" checked={form.fv_gewirbelt} onChange={chk("fv_gewirbelt")} />
                  <Checkbox label="geschliffen" checked={form.fv_geschliffen} onChange={chk("fv_geschliffen")} />
                </td>
                <td>
                  <div className="rf-pair">
                    <Checkbox label="EFEM" checked={form.mb_EFEM} onChange={chk("mb_EFEM")} />
                    <Checkbox label="EFDM" checked={form.mb_EFDM} onChange={chk("mb_EFDM")} />
                  </div>
                  <div className="rf-pair">
                    <Checkbox label="MFM" checked={form.mb_MFM} onChange={chk("mb_MFM")} />
                    <Checkbox label="MFDM" checked={form.mb_MFDM} onChange={chk("mb_MFDM")} />
                  </div>
                  <div className="rf-pair">
                    <Checkbox label="ZEM" checked={form.mb_ZEM} onChange={chk("mb_ZEM")} />
                    <Checkbox label="ZDM" checked={form.mb_ZDM} onChange={chk("mb_ZDM")} />
                  </div>
                </td>
                <td>
                  <div className="rf-vorsp-row">
                    <span>i:</span>
                    <input className="rf-inline-input rf-inline-input--sm" value={form.i_wert} onChange={(event) => set("i_wert")(event.target.value)} placeholder="___" />
                    <span>Vorsp.:</span>
                    <input className="rf-inline-input" value={form.vorsp} onChange={(event) => set("vorsp")(event.target.value)} placeholder="___" />
                  </div>
                  <div className="rf-pair">
                    <Checkbox label="4-Pkt" checked={form.vp_4pkt} onChange={chk("vp_4pkt")} />
                    <Checkbox label="Shift" checked={form.vp_shift} onChange={chk("vp_shift")} />
                  </div>
                  <Checkbox label="Scheibe" checked={form.vp_scheibe} onChange={chk("vp_scheibe")} />
                  <Checkbox label="Getriebe" checked={form.vp_getriebe} onChange={chk("vp_getriebe")} />
                  <Checkbox label="Madenstift" checked={form.vp_madenstift} onChange={chk("vp_madenstift")} />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="rf-section">
            <div className="rf-section__title rf-section__title--underline">
              Montagerichtung der Mutter:
            </div>
            <div className="rf-mont-row">
              <Checkbox label="Festlager / Langes Ende" checked={form.mont_festlager} onChange={chk("mont_festlager")} />
              <Checkbox label="Loslager / Kurzes Ende" checked={form.mont_loslager} onChange={chk("mont_loslager")} />
            </div>
            <div className="rf-mont-row">
              <Checkbox label="Foto kpl." checked={form.foto_kpl} onChange={chk("foto_kpl")} />
              <Checkbox label="Ende links" checked={form.foto_links} onChange={chk("foto_links")} />
              <Checkbox label="Ende rechts" checked={form.foto_rechts} onChange={chk("foto_rechts")} />
              <Checkbox label="Mutter links und rechts" checked={form.foto_beidseitig} onChange={chk("foto_beidseitig")} />
            </div>
          </div>

          <div className="rf-section">
            <table className="rf-table rf-table--kugel">
              <thead>
                <tr>
                  <th>Kugelgroesse</th>
                  <th>Eingebaut / gemessen</th>
                  <th>Ersetzt</th>
                  <th>Vorspannung in KG</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Flansch:</td>
                  <td><input className="rf-table__input" value={form.flansch_eingebaut} onChange={(event) => set("flansch_eingebaut")(event.target.value)} /></td>
                  <td><input className="rf-table__input" value={form.flansch_ersetzt} onChange={(event) => set("flansch_ersetzt")(event.target.value)} /></td>
                  <td><input className="rf-table__input" value={form.flansch_vorspannung} onChange={(event) => set("flansch_vorspannung")(event.target.value)} /></td>
                </tr>
                <tr>
                  <td>Zylinder:</td>
                  <td><input className="rf-table__input" value={form.zylinder_eingebaut} onChange={(event) => set("zylinder_eingebaut")(event.target.value)} /></td>
                  <td><input className="rf-table__input" value={form.zylinder_ersetzt} onChange={(event) => set("zylinder_ersetzt")(event.target.value)} /></td>
                  <td><input className="rf-table__input" value={form.zylinder_vorspannung} onChange={(event) => set("zylinder_vorspannung")(event.target.value)} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rf-section rf-section--damage">
            <div className="rf-damage-grid">
              <div className="rf-damage-col">
                <Checkbox label="Mat. Ausbrueche Spindel" checked={form.s_ausbrueche_spindel} onChange={chk("s_ausbrueche_spindel")} />
                <Checkbox label="Mat. Ausbrueche Mutter" checked={form.s_ausbrueche_mutter} onChange={chk("s_ausbrueche_mutter")} />
                <Checkbox label="Kugeln deformiert" checked={form.s_kugeln_deformiert} onChange={chk("s_kugeln_deformiert")} />
                <Checkbox label="Kugeleindruecke da Endp. ueberfahren" checked={form.s_kugeleindrucke} onChange={chk("s_kugeleindrucke")} />
                <Checkbox label="Abstreifer beschaedigt oder fehlt" checked={form.s_abstreifer} onChange={chk("s_abstreifer")} />
                <Checkbox label="Umlenkstuecke deformiert" checked={form.s_umlenkstuecke} onChange={chk("s_umlenkstuecke")} />
                <Checkbox label="Mutternsystem ohne Vorspannung" checked={form.s_ohne_vorspannung} onChange={chk("s_ohne_vorspannung")} />
                <Checkbox label="Zu wenig Kugeln" checked={form.s_zu_wenig_kugeln} onChange={chk("s_zu_wenig_kugeln")} />
                <Checkbox label="Spindel eingelaufen" checked={form.s_spindel_eingelaufen} onChange={chk("s_spindel_eingelaufen")} />
                <Checkbox label="Wasserschaden" checked={form.s_wasserschaden} onChange={chk("s_wasserschaden")} />
                <Checkbox label="Loch auf der Spindel" checked={form.s_loch_spindel} onChange={chk("s_loch_spindel")} />
              </div>
              <div className="rf-damage-col">
                <Checkbox label="Passungen nicht in Toleranz oder beschaedigt" checked={form.s_passungen} onChange={chk("s_passungen")} />
                <Checkbox label="Sehr starke Laufspurauspraegung" checked={form.s_laufspurauspr} onChange={chk("s_laufspurauspr")} />
                <Checkbox label="Fett verschmutzt" checked={form.s_fett_verschmutzt} onChange={chk("s_fett_verschmutzt")} />
                <Checkbox label="Fett Braun" checked={form.s_fett_braun} onChange={chk("s_fett_braun")} />
                <Checkbox label="Unzureichende Schmierung" checked={form.s_unzureichend_schm} onChange={chk("s_unzureichend_schm")} />
                <Checkbox label="Wenig Schmierung" checked={form.s_wenig_schm} onChange={chk("s_wenig_schm")} />
                <Checkbox label="Rost auf System" checked={form.s_rost} onChange={chk("s_rost")} />
                <Checkbox label="Spaene in der Mutter" checked={form.s_spaene} onChange={chk("s_spaene")} />
                <Checkbox label="Mutter hakt" checked={form.s_mutter_hakt} onChange={chk("s_mutter_hakt")} />
                <Checkbox label="Spindel punktuell eingelaufen" checked={form.s_spindel_punktuell} onChange={chk("s_spindel_punktuell")} />
                <Checkbox label="Montage ueber Umlenkung/Aussendurchmesser" checked={form.s_montage_umlenkung} onChange={chk("s_montage_umlenkung")} />
              </div>
            </div>
          </div>

          <div className="rf-section">
            <div className="rf-intern-title">NUR INTERN</div>
            <table className="rf-table rf-table--intern">
              <tbody>
                <tr>
                  <td><strong>KGT reparabel:</strong></td>
                  <td>
                    <RadioGroup name="kgt" options={["Ja", "Nein", "Not-Rep"]} value={form.kgt_reparabel} onChange={set("kgt_reparabel")} />
                  </td>
                </tr>
                <tr>
                  <td><strong>Zeichnung erstellen?</strong></td>
                  <td>
                    <RadioGroup name="zeichnung" options={["Ja", "Nein"]} value={form.zeichnung} onChange={set("zeichnung")} />
                  </td>
                </tr>
                <tr>
                  <td><strong>Mutternrichtung kontrolliert?</strong></td>
                  <td>
                    <RadioGroup name="mutternrichtung" options={["Ja", "Nein"]} value={form.mutternrichtung} onChange={set("mutternrichtung")} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rf-section">
            <div className="rf-section__title"><strong>Freie Notiz / Anbauteile:</strong></div>
            <textarea
              className="rf-textarea"
              rows={3}
              value={form.freinotiz}
              onChange={(event) => set("freinotiz")(event.target.value)}
              placeholder="Notizen hier eingeben..."
            />
          </div>

          <div className="rf-section rf-bearbeiter">
            <strong>Bearbeiter:</strong>
            <Checkbox label="J.Held" checked={form.b_jheld} onChange={chk("b_jheld")} />
            <Checkbox label="Hemus" checked={form.b_hemus} onChange={chk("b_hemus")} />
            <Checkbox label="Alb" checked={form.b_alb} onChange={chk("b_alb")} />
            <Checkbox label="Ciobanu" checked={form.b_ciobanu} onChange={chk("b_ciobanu")} />
            <Checkbox label="M.Held" checked={form.b_mheld} onChange={chk("b_mheld")} />
          </div>

          <div className="rf-footer">
            <div className="rf-footer__datum">
              Datum: {new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="rf-footer__web">www.lineartechnik-stuttgart.de</div>
          </div>

          <div className="rf-actions">
            <button type="button" className="btn btn--danger btn--sm" onClick={handleReset}>
              Zuruecksetzen
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {saved ? "✓ Gespeichert" : isSubmitting ? "Sending..." : "Speichern"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

const CSS = `
.rf-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.rf-toolbar__send {
  min-width: 240px;
}

.rf-feedback {
  margin: 0 0 1rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-weight: 600;
}

.rf-feedback--success {
  color: #064e3b;
  background: rgba(16, 185, 129, 0.22);
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.rf-feedback--error {
  color: #7f1d1d;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.45);
}

.rf-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: var(--text);
  background: var(--panel-soft-bg);
  border: 1px solid var(--line);
  border-radius: 18px;
}

.rf-header {
  text-align: center;
  margin-bottom: 1rem;
}

.rf-logo__title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
}

.rf-logo__sub {
  font-size: 13px;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.rf-logo__stripe {
  height: 6px;
  background: repeating-linear-gradient(
    90deg,
    #1a1a1a 0 18px,
    transparent 18px 22px,
    #c00 22px 40px,
    transparent 40px 44px
  );
  margin: 6px auto;
  width: 260px;
}

.rf-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.rf-table th,
.rf-table td {
  border: 1px solid rgba(148, 163, 184, 0.45);
  padding: 5px 8px;
  vertical-align: top;
}

.rf-table th {
  background: rgba(148, 163, 184, 0.12);
  font-weight: 600;
  text-align: center;
  font-size: 12px;
}

.rf-table--header td {
  text-align: center;
}

.rf-table__input {
  width: 100%;
  border: none;
  background: transparent;
  color: inherit;
  font-size: 13px;
  text-align: center;
  outline: none;
}

.rf-table__input:focus {
  background: rgba(148, 163, 184, 0.14);
  border-radius: 3px;
}

.rf-table__rl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rf-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 3px;
  user-select: none;
  font-size: 13px;
}

.rf-checkbox input[type="checkbox"],
.rf-checkbox input[type="radio"] {
  display: none;
}

.rf-checkbox__box {
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(148, 163, 184, 0.75);
  border-radius: 2px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.1s, border-color 0.1s;
}

.rf-checkbox__box--round {
  border-radius: 50%;
}

.rf-checkbox input:checked + .rf-checkbox__box {
  background: var(--text);
  border-color: var(--text);
}

.rf-checkbox input:checked + .rf-checkbox__box::after {
  content: "";
  width: 7px;
  height: 5px;
  border-left: 2px solid var(--panel-soft-bg);
  border-bottom: 2px solid var(--panel-soft-bg);
  transform: rotate(-45deg) translateY(-1px);
  display: block;
}

.rf-checkbox input:checked + .rf-checkbox__box--round::after {
  width: 6px;
  height: 6px;
  border: none;
  border-radius: 50%;
  background: var(--panel-soft-bg);
  transform: none;
}

.rf-checkbox--inline {
  display: inline-flex;
  margin-right: 12px;
}

.rf-pair {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.rf-vorsp-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.rf-inline-input {
  border: none;
  border-bottom: 1px solid rgba(148, 163, 184, 0.75);
  background: transparent;
  color: inherit;
  font-size: 13px;
  width: 80px;
  outline: none;
  padding: 1px 2px;
}

.rf-inline-input--sm {
  width: 44px;
}

.rf-section {
  margin-bottom: 1rem;
}

.rf-section__title {
  margin-bottom: 6px;
  font-size: 13px;
}

.rf-section__title--underline {
  text-decoration: underline;
  font-weight: 600;
}

.rf-mont-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.rf-section--damage {
  border: 1px solid rgba(148, 163, 184, 0.45);
  padding: 8px 10px;
  border-radius: 4px;
}

.rf-damage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.rf-damage-col {
  display: flex;
  flex-direction: column;
}

.rf-intern-title {
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.rf-table--intern td {
  padding: 6px 12px;
}

.rf-table--intern td:first-child {
  width: 200px;
}

.rf-radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.rf-textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 4px;
  resize: vertical;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.rf-bearbeiter {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rf-footer {
  text-align: center;
  margin-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
  padding-top: 6px;
}

.rf-footer__datum {
  font-weight: 600;
  font-size: 14px;
}

.rf-footer__web {
  font-size: 11px;
  color: var(--muted);
}

.rf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
}

.btn {
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  color: #f8fafc;
  padding: 0.8rem 1.4rem;
  min-height: 46px;
  min-width: 150px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: linear-gradient(130deg, #0284c7, #10b981);
}

.btn--danger {
  background: linear-gradient(130deg, #b91c1c, #ef4444);
}

.btn--sm {
  min-width: 0;
}

@media (max-width: 600px) {
  .rf-toolbar {
    flex-direction: column;
  }

  .rf-toolbar__send {
    width: 100%;
  }

  .rf-damage-grid {
    grid-template-columns: 1fr;
  }

  .rf-mont-row {
    flex-direction: column;
    gap: 4px;
  }

  .rf-bearbeiter {
    flex-direction: column;
    align-items: flex-start;
  }

  .rf-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
`;
