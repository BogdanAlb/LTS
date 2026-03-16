export const REPAIR_FORMS_STORAGE_KEY = "lts_repair_forms";
export const REPAIR_FORMS_UPDATED_EVENT = "lts:repair-forms-updated";

export const INITIAL_REPAIR_FORM = {
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

const VERFAHREN_OPTIONS = [
  ["fv_gerollt", "gerollt"],
  ["fv_gewirbelt", "gewirbelt"],
  ["fv_geschliffen", "geschliffen"],
];

const MUTTERNBAUFORM_OPTIONS = [
  ["mb_EFEM", "EFEM"],
  ["mb_EFDM", "EFDM"],
  ["mb_MFM", "MFM"],
  ["mb_MFDM", "MFDM"],
  ["mb_ZEM", "ZEM"],
  ["mb_ZDM", "ZDM"],
];

const VORSPANNUNG_OPTIONS = [
  ["vp_4pkt", "4-Pkt"],
  ["vp_shift", "Shift"],
  ["vp_scheibe", "Scheibe"],
  ["vp_getriebe", "Getriebe"],
  ["vp_madenstift", "Madenstift"],
];

const MONTAGE_OPTIONS = [
  ["mont_festlager", "Festlager / Langes Ende"],
  ["mont_loslager", "Loslager / Kurzes Ende"],
];

const FOTO_OPTIONS = [
  ["foto_kpl", "Foto kpl."],
  ["foto_links", "Ende links"],
  ["foto_rechts", "Ende rechts"],
  ["foto_beidseitig", "Mutter links und rechts"],
];

const DAMAGE_OPTIONS = [
  ["s_ausbrueche_spindel", "Mat. Ausbrueche Spindel"],
  ["s_ausbrueche_mutter", "Mat. Ausbrueche Mutter"],
  ["s_kugeln_deformiert", "Kugeln deformiert"],
  ["s_kugeleindrucke", "Kugeleindruecke da Endp. ueberfahren"],
  ["s_abstreifer", "Abstreifer beschaedigt oder fehlt"],
  ["s_umlenkstuecke", "Umlenkstuecke deformiert"],
  ["s_ohne_vorspannung", "Mutternsystem ohne Vorspannung"],
  ["s_zu_wenig_kugeln", "Zu wenig Kugeln"],
  ["s_spindel_eingelaufen", "Spindel eingelaufen"],
  ["s_wasserschaden", "Wasserschaden"],
  ["s_loch_spindel", "Loch auf der Spindel"],
  ["s_passungen", "Passungen nicht in Toleranz oder beschaedigt"],
  ["s_laufspurauspr", "Sehr starke Laufspurauspraegung"],
  ["s_fett_verschmutzt", "Fett verschmutzt"],
  ["s_fett_braun", "Fett Braun"],
  ["s_unzureichend_schm", "Unzureichende Schmierung"],
  ["s_wenig_schm", "Wenig Schmierung"],
  ["s_rost", "Rost auf System"],
  ["s_spaene", "Spaene in der Mutter"],
  ["s_mutter_hakt", "Mutter hakt"],
  ["s_spindel_punktuell", "Spindel punktuell eingelaufen"],
  ["s_montage_umlenkung", "Montage ueber Umlenkung/Aussendurchmesser"],
];

const BEARBEITER_OPTIONS = [
  ["b_jheld", "J.Held"],
  ["b_hemus", "Hemus"],
  ["b_alb", "Alb"],
  ["b_ciobanu", "Ciobanu"],
  ["b_mheld", "M.Held"],
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeFields(fields) {
  return {
    ...INITIAL_REPAIR_FORM,
    ...(fields && typeof fields === "object" ? fields : {}),
  };
}

function getSelectedLabels(fields, options) {
  return options
    .filter(([key]) => Boolean(fields[key]))
    .map(([, label]) => label);
}

function formatValue(value) {
  const normalized = normalizeText(value);
  return normalized || "-";
}

function formatJoinedValues(values) {
  return values.length > 0 ? values.join(", ") : "-";
}

function readRepairForms() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(REPAIR_FORMS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRepairForms(forms) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REPAIR_FORMS_STORAGE_KEY, JSON.stringify(forms));
  window.dispatchEvent(new CustomEvent(REPAIR_FORMS_UPDATED_EVENT));
}

function sortRepairForms(forms) {
  return [...forms].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? "") || 0;
    const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? "") || 0;
    return rightTime - leftTime;
  });
}

function normalizeStoredRepairForm(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const fields = normalizeFields(entry.fields);
  const title = normalizeText(entry.title) || getRepairFormTitle(fields);
  if (!title) {
    return null;
  }

  const updatedAt = normalizeText(entry.updatedAt) || normalizeText(entry.createdAt) || new Date().toISOString();
  const createdAt = normalizeText(entry.createdAt) || updatedAt;

  return {
    id: normalizeText(entry.id) || `repair-form-${createdAt}`,
    title: title.slice(0, 120),
    fields,
    createdAt,
    updatedAt,
  };
}

export function getRepairFormTitle(fields) {
  const normalizedFields = normalizeFields(fields);
  const kunde = normalizeText(normalizedFields.kunde);
  const befundNr = normalizeText(normalizedFields.befundNr);

  if (kunde && befundNr) {
    return `${kunde} - ${befundNr}`.slice(0, 120);
  }

  return (kunde || befundNr).slice(0, 120);
}

export function canSaveRepairForm(fields) {
  const normalizedFields = normalizeFields(fields);
  return Boolean(
    normalizeText(normalizedFields.kunde) &&
    normalizeText(normalizedFields.befundNr),
  );
}

export function listRepairForms() {
  return sortRepairForms(
    readRepairForms()
      .map(normalizeStoredRepairForm)
      .filter(Boolean),
  );
}

export function saveRepairForm(fields) {
  const normalizedFields = normalizeFields(fields);
  const title = getRepairFormTitle(normalizedFields);

  if (!canSaveRepairForm(normalizedFields) || !title) {
    throw new Error("Bitte Kunde und Befund-Nr. ausfuellen.");
  }

  const forms = listRepairForms();
  const existingIndex = forms.findIndex(
    (item) => item.title.toLowerCase() === title.toLowerCase(),
  );
  const timestamp = new Date().toISOString();
  const nextItem = existingIndex >= 0
    ? {
        ...forms[existingIndex],
        title,
        fields: normalizedFields,
        updatedAt: timestamp,
      }
    : {
        id: `repair-form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        fields: normalizedFields,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

  if (existingIndex >= 0) {
    forms.splice(existingIndex, 1, nextItem);
  } else {
    forms.unshift(nextItem);
  }

  writeRepairForms(sortRepairForms(forms));
  return nextItem;
}

export function buildRepairFormSummary(fields) {
  const normalizedFields = normalizeFields(fields);
  const damageItems = getSelectedLabels(normalizedFields, DAMAGE_OPTIONS);
  const verfahrenItems = getSelectedLabels(normalizedFields, VERFAHREN_OPTIONS);
  const mutternbauformItems = getSelectedLabels(normalizedFields, MUTTERNBAUFORM_OPTIONS);
  const vorspannungItems = getSelectedLabels(normalizedFields, VORSPANNUNG_OPTIONS);
  const montageItems = getSelectedLabels(normalizedFields, MONTAGE_OPTIONS);
  const fotoItems = getSelectedLabels(normalizedFields, FOTO_OPTIONS);
  const bearbeiterItems = getSelectedLabels(normalizedFields, BEARBEITER_OPTIONS);

  return [
    {
      heading: "Basis",
      lines: [
        `Kunde: ${formatValue(normalizedFields.kunde)}`,
        `Befund-Nr.: ${formatValue(normalizedFields.befundNr)}`,
        `Kommission: ${formatValue(normalizedFields.kommission)}`,
        `LTS Nummer: ${formatValue(normalizedFields.ltsNummer)}`,
        `Durchmesser: ${formatValue(normalizedFields.durchmesser)}`,
        `Steigung: ${formatValue(normalizedFields.steigung)}`,
        `Gesamtlaenge: ${formatValue(normalizedFields.gesamtlaenge)}`,
        `Seite: ${formatValue(normalizedFields.seite)}`,
      ],
    },
    {
      heading: "Fertigung / Vorspannung",
      lines: [
        `Fertigungsverfahren: ${formatJoinedValues(verfahrenItems)}`,
        `Mutternbauform: ${formatJoinedValues(mutternbauformItems)}`,
        `i / Vorspannung: i=${formatValue(normalizedFields.i_wert)}, Vorsp.=${formatValue(normalizedFields.vorsp)}`,
        `Vorspannungsoptionen: ${formatJoinedValues(vorspannungItems)}`,
      ],
    },
    {
      heading: "Montage / Foto",
      lines: [
        `Montagerichtung: ${formatJoinedValues(montageItems)}`,
        `Fotos: ${formatJoinedValues(fotoItems)}`,
      ],
    },
    {
      heading: "Kugelgroesse",
      lines: [
        `Flansch: Eingebaut=${formatValue(normalizedFields.flansch_eingebaut)}, Ersetzt=${formatValue(normalizedFields.flansch_ersetzt)}, Vorspannung=${formatValue(normalizedFields.flansch_vorspannung)}`,
        `Zylinder: Eingebaut=${formatValue(normalizedFields.zylinder_eingebaut)}, Ersetzt=${formatValue(normalizedFields.zylinder_ersetzt)}, Vorspannung=${formatValue(normalizedFields.zylinder_vorspannung)}`,
      ],
    },
    {
      heading: "Schadensbild",
      lines: [
        `Ausgewaehlte Punkte: ${formatJoinedValues(damageItems)}`,
      ],
    },
    {
      heading: "Intern",
      lines: [
        `KGT reparabel: ${formatValue(normalizedFields.kgt_reparabel)}`,
        `Zeichnung erstellen: ${formatValue(normalizedFields.zeichnung)}`,
        `Mutternrichtung kontrolliert: ${formatValue(normalizedFields.mutternrichtung)}`,
      ],
    },
    {
      heading: "Freie Notiz / Anbauteile",
      lines: [
        formatValue(normalizedFields.freinotiz),
      ],
    },
    {
      heading: "Bearbeiter",
      lines: [
        formatJoinedValues(bearbeiterItems),
      ],
    },
  ];
}
