class RepairForm {
  // --- identity ---
  final int? id;          // null = not yet synced to server
  final String? localId;  // UUID used before server assigns an id
  final String title;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool pendingSync;

  // --- Basis ---
  final String kunde;
  final String befundNr;
  final String kommission;
  final String ltsNummer;
  final String durchmesser;
  final String steigung;
  final String gesamtlaenge;
  final String seite;

  // --- Fertigungsverfahren ---
  final bool fvGerollt;
  final bool fvGewirbelt;
  final bool fvGeschliffen;

  // --- Mutternbauform ---
  final bool mbEFEM;
  final bool mbEFDM;
  final bool mbMFM;
  final bool mbMFDM;
  final bool mbZEM;
  final bool mbZDM;

  // --- i / Vorspannung ---
  final String iWert;
  final String vorsp;
  final bool vp4pkt;
  final bool vpShift;
  final bool vpScheibe;
  final bool vpGetriebe;
  final bool vpMadenstift;

  // --- Montage / Foto ---
  final bool montFestlager;
  final bool montLoslager;
  final bool fotoKpl;
  final bool fotoLinks;
  final bool fotoRechts;
  final bool fotoBeidseitig;

  // --- Kugelgroesse ---
  final String flanschEingebaut;
  final String flanschErsetzt;
  final String flanschVorspannung;
  final String zylinderEingebaut;
  final String zylinderErsetzt;
  final String zylinderVorspannung;

  // --- Schadensbild ---
  final bool sAusbrueche_spindel;
  final bool sAusbrue_mutter;
  final bool sKugelnDeformiert;
  final bool sKugeleindrucke;
  final bool sAbstreifer;
  final bool sUmlenkstuecke;
  final bool sOhneVorspannung;
  final bool sZuWenigKugeln;
  final bool sSpindelEingelaufen;
  final bool sWasserschaden;
  final bool sLochSpindel;
  final bool sPassungen;
  final bool sLaufspurauspr;
  final bool sFettVerschmutzt;
  final bool sFettBraun;
  final bool sUnzureichendSchm;
  final bool sWenigSchm;
  final bool sRost;
  final bool sSpaene;
  final bool sMutterHakt;
  final bool sSpindelPunktuell;
  final bool sMontageUmlenkung;

  // --- Intern ---
  final String kgtReparabel;
  final String zeichnung;
  final String mutternrichtung;

  // --- Bearbeiter ---
  final bool bJheld;
  final bool bHemus;
  final bool bAlb;
  final bool bCiobanu;
  final bool bMheld;

  // --- Notiz ---
  final String freinotiz;

  const RepairForm({
    this.id,
    this.localId,
    required this.title,
    required this.createdAt,
    required this.updatedAt,
    this.pendingSync = false,
    this.kunde = '',
    this.befundNr = '',
    this.kommission = '',
    this.ltsNummer = '',
    this.durchmesser = '',
    this.steigung = '',
    this.gesamtlaenge = '',
    this.seite = '',
    this.fvGerollt = false,
    this.fvGewirbelt = false,
    this.fvGeschliffen = false,
    this.mbEFEM = false,
    this.mbEFDM = false,
    this.mbMFM = false,
    this.mbMFDM = false,
    this.mbZEM = false,
    this.mbZDM = false,
    this.iWert = '',
    this.vorsp = '',
    this.vp4pkt = false,
    this.vpShift = false,
    this.vpScheibe = false,
    this.vpGetriebe = false,
    this.vpMadenstift = false,
    this.montFestlager = false,
    this.montLoslager = false,
    this.fotoKpl = false,
    this.fotoLinks = false,
    this.fotoRechts = false,
    this.fotoBeidseitig = false,
    this.flanschEingebaut = '',
    this.flanschErsetzt = '',
    this.flanschVorspannung = '',
    this.zylinderEingebaut = '',
    this.zylinderErsetzt = '',
    this.zylinderVorspannung = '',
    this.sAusbrueche_spindel = false,
    this.sAusbrue_mutter = false,
    this.sKugelnDeformiert = false,
    this.sKugeleindrucke = false,
    this.sAbstreifer = false,
    this.sUmlenkstuecke = false,
    this.sOhneVorspannung = false,
    this.sZuWenigKugeln = false,
    this.sSpindelEingelaufen = false,
    this.sWasserschaden = false,
    this.sLochSpindel = false,
    this.sPassungen = false,
    this.sLaufspurauspr = false,
    this.sFettVerschmutzt = false,
    this.sFettBraun = false,
    this.sUnzureichendSchm = false,
    this.sWenigSchm = false,
    this.sRost = false,
    this.sSpaene = false,
    this.sMutterHakt = false,
    this.sSpindelPunktuell = false,
    this.sMontageUmlenkung = false,
    this.kgtReparabel = '',
    this.zeichnung = '',
    this.mutternrichtung = '',
    this.bJheld = false,
    this.bHemus = false,
    this.bAlb = false,
    this.bCiobanu = false,
    this.bMheld = false,
    this.freinotiz = '',
  });

  static RepairForm empty() => RepairForm(
        title: '',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

  RepairForm copyWith({
    int? id,
    String? localId,
    String? title,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? pendingSync,
    String? kunde,
    String? befundNr,
    String? kommission,
    String? ltsNummer,
    String? durchmesser,
    String? steigung,
    String? gesamtlaenge,
    String? seite,
    bool? fvGerollt,
    bool? fvGewirbelt,
    bool? fvGeschliffen,
    bool? mbEFEM,
    bool? mbEFDM,
    bool? mbMFM,
    bool? mbMFDM,
    bool? mbZEM,
    bool? mbZDM,
    String? iWert,
    String? vorsp,
    bool? vp4pkt,
    bool? vpShift,
    bool? vpScheibe,
    bool? vpGetriebe,
    bool? vpMadenstift,
    bool? montFestlager,
    bool? montLoslager,
    bool? fotoKpl,
    bool? fotoLinks,
    bool? fotoRechts,
    bool? fotoBeidseitig,
    String? flanschEingebaut,
    String? flanschErsetzt,
    String? flanschVorspannung,
    String? zylinderEingebaut,
    String? zylinderErsetzt,
    String? zylinderVorspannung,
    bool? sAusbrueche_spindel,
    bool? sAusbrue_mutter,
    bool? sKugelnDeformiert,
    bool? sKugeleindrucke,
    bool? sAbstreifer,
    bool? sUmlenkstuecke,
    bool? sOhneVorspannung,
    bool? sZuWenigKugeln,
    bool? sSpindelEingelaufen,
    bool? sWasserschaden,
    bool? sLochSpindel,
    bool? sPassungen,
    bool? sLaufspurauspr,
    bool? sFettVerschmutzt,
    bool? sFettBraun,
    bool? sUnzureichendSchm,
    bool? sWenigSchm,
    bool? sRost,
    bool? sSpaene,
    bool? sMutterHakt,
    bool? sSpindelPunktuell,
    bool? sMontageUmlenkung,
    String? kgtReparabel,
    String? zeichnung,
    String? mutternrichtung,
    bool? bJheld,
    bool? bHemus,
    bool? bAlb,
    bool? bCiobanu,
    bool? bMheld,
    String? freinotiz,
  }) {
    return RepairForm(
      id: id ?? this.id,
      localId: localId ?? this.localId,
      title: title ?? this.title,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      pendingSync: pendingSync ?? this.pendingSync,
      kunde: kunde ?? this.kunde,
      befundNr: befundNr ?? this.befundNr,
      kommission: kommission ?? this.kommission,
      ltsNummer: ltsNummer ?? this.ltsNummer,
      durchmesser: durchmesser ?? this.durchmesser,
      steigung: steigung ?? this.steigung,
      gesamtlaenge: gesamtlaenge ?? this.gesamtlaenge,
      seite: seite ?? this.seite,
      fvGerollt: fvGerollt ?? this.fvGerollt,
      fvGewirbelt: fvGewirbelt ?? this.fvGewirbelt,
      fvGeschliffen: fvGeschliffen ?? this.fvGeschliffen,
      mbEFEM: mbEFEM ?? this.mbEFEM,
      mbEFDM: mbEFDM ?? this.mbEFDM,
      mbMFM: mbMFM ?? this.mbMFM,
      mbMFDM: mbMFDM ?? this.mbMFDM,
      mbZEM: mbZEM ?? this.mbZEM,
      mbZDM: mbZDM ?? this.mbZDM,
      iWert: iWert ?? this.iWert,
      vorsp: vorsp ?? this.vorsp,
      vp4pkt: vp4pkt ?? this.vp4pkt,
      vpShift: vpShift ?? this.vpShift,
      vpScheibe: vpScheibe ?? this.vpScheibe,
      vpGetriebe: vpGetriebe ?? this.vpGetriebe,
      vpMadenstift: vpMadenstift ?? this.vpMadenstift,
      montFestlager: montFestlager ?? this.montFestlager,
      montLoslager: montLoslager ?? this.montLoslager,
      fotoKpl: fotoKpl ?? this.fotoKpl,
      fotoLinks: fotoLinks ?? this.fotoLinks,
      fotoRechts: fotoRechts ?? this.fotoRechts,
      fotoBeidseitig: fotoBeidseitig ?? this.fotoBeidseitig,
      flanschEingebaut: flanschEingebaut ?? this.flanschEingebaut,
      flanschErsetzt: flanschErsetzt ?? this.flanschErsetzt,
      flanschVorspannung: flanschVorspannung ?? this.flanschVorspannung,
      zylinderEingebaut: zylinderEingebaut ?? this.zylinderEingebaut,
      zylinderErsetzt: zylinderErsetzt ?? this.zylinderErsetzt,
      zylinderVorspannung: zylinderVorspannung ?? this.zylinderVorspannung,
      sAusbrueche_spindel: sAusbrueche_spindel ?? this.sAusbrueche_spindel,
      sAusbrue_mutter: sAusbrue_mutter ?? this.sAusbrue_mutter,
      sKugelnDeformiert: sKugelnDeformiert ?? this.sKugelnDeformiert,
      sKugeleindrucke: sKugeleindrucke ?? this.sKugeleindrucke,
      sAbstreifer: sAbstreifer ?? this.sAbstreifer,
      sUmlenkstuecke: sUmlenkstuecke ?? this.sUmlenkstuecke,
      sOhneVorspannung: sOhneVorspannung ?? this.sOhneVorspannung,
      sZuWenigKugeln: sZuWenigKugeln ?? this.sZuWenigKugeln,
      sSpindelEingelaufen: sSpindelEingelaufen ?? this.sSpindelEingelaufen,
      sWasserschaden: sWasserschaden ?? this.sWasserschaden,
      sLochSpindel: sLochSpindel ?? this.sLochSpindel,
      sPassungen: sPassungen ?? this.sPassungen,
      sLaufspurauspr: sLaufspurauspr ?? this.sLaufspurauspr,
      sFettVerschmutzt: sFettVerschmutzt ?? this.sFettVerschmutzt,
      sFettBraun: sFettBraun ?? this.sFettBraun,
      sUnzureichendSchm: sUnzureichendSchm ?? this.sUnzureichendSchm,
      sWenigSchm: sWenigSchm ?? this.sWenigSchm,
      sRost: sRost ?? this.sRost,
      sSpaene: sSpaene ?? this.sSpaene,
      sMutterHakt: sMutterHakt ?? this.sMutterHakt,
      sSpindelPunktuell: sSpindelPunktuell ?? this.sSpindelPunktuell,
      sMontageUmlenkung: sMontageUmlenkung ?? this.sMontageUmlenkung,
      kgtReparabel: kgtReparabel ?? this.kgtReparabel,
      zeichnung: zeichnung ?? this.zeichnung,
      mutternrichtung: mutternrichtung ?? this.mutternrichtung,
      bJheld: bJheld ?? this.bJheld,
      bHemus: bHemus ?? this.bHemus,
      bAlb: bAlb ?? this.bAlb,
      bCiobanu: bCiobanu ?? this.bCiobanu,
      bMheld: bMheld ?? this.bMheld,
      freinotiz: freinotiz ?? this.freinotiz,
    );
  }

  /// Convert to the JSON shape the backend /reparatur/ endpoint expects.
  Map<String, dynamic> toApiFields() => {
        'kunde': kunde,
        'befundNr': befundNr,
        'kommission': kommission,
        'ltsNummer': ltsNummer,
        'durchmesser': durchmesser,
        'steigung': steigung,
        'gesamtlaenge': gesamtlaenge,
        'seite': seite,
        'fv_gerollt': fvGerollt,
        'fv_gewirbelt': fvGewirbelt,
        'fv_geschliffen': fvGeschliffen,
        'mb_EFEM': mbEFEM,
        'mb_EFDM': mbEFDM,
        'mb_MFM': mbMFM,
        'mb_MFDM': mbMFDM,
        'mb_ZEM': mbZEM,
        'mb_ZDM': mbZDM,
        'i_wert': iWert,
        'vorsp': vorsp,
        'vp_4pkt': vp4pkt,
        'vp_shift': vpShift,
        'vp_scheibe': vpScheibe,
        'vp_getriebe': vpGetriebe,
        'vp_madenstift': vpMadenstift,
        'mont_festlager': montFestlager,
        'mont_loslager': montLoslager,
        'foto_kpl': fotoKpl,
        'foto_links': fotoLinks,
        'foto_rechts': fotoRechts,
        'foto_beidseitig': fotoBeidseitig,
        'flansch_eingebaut': flanschEingebaut,
        'flansch_ersetzt': flanschErsetzt,
        'flansch_vorspannung': flanschVorspannung,
        'zylinder_eingebaut': zylinderEingebaut,
        'zylinder_ersetzt': zylinderErsetzt,
        'zylinder_vorspannung': zylinderVorspannung,
        's_ausbrueche_spindel': sAusbrueche_spindel,
        's_ausbrueche_mutter': sAusbrue_mutter,
        's_kugeln_deformiert': sKugelnDeformiert,
        's_kugeleindrucke': sKugeleindrucke,
        's_abstreifer': sAbstreifer,
        's_umlenkstuecke': sUmlenkstuecke,
        's_ohne_vorspannung': sOhneVorspannung,
        's_zu_wenig_kugeln': sZuWenigKugeln,
        's_spindel_eingelaufen': sSpindelEingelaufen,
        's_wasserschaden': sWasserschaden,
        's_loch_spindel': sLochSpindel,
        's_passungen': sPassungen,
        's_laufspurauspr': sLaufspurauspr,
        's_fett_verschmutzt': sFettVerschmutzt,
        's_fett_braun': sFettBraun,
        's_unzureichend_schm': sUnzureichendSchm,
        's_wenig_schm': sWenigSchm,
        's_rost': sRost,
        's_spaene': sSpaene,
        's_mutter_hakt': sMutterHakt,
        's_spindel_punktuell': sSpindelPunktuell,
        's_montage_umlenkung': sMontageUmlenkung,
        'kgt_reparabel': kgtReparabel,
        'zeichnung': zeichnung,
        'mutternrichtung': mutternrichtung,
        'b_jheld': bJheld,
        'b_hemus': bHemus,
        'b_alb': bAlb,
        'b_ciobanu': bCiobanu,
        'b_mheld': bMheld,
        'freinotiz': freinotiz,
      };

  /// Build a RepairForm from the API response JSON.
  factory RepairForm.fromApi(Map<String, dynamic> json) {
    final f = (json['fields'] as Map<String, dynamic>?) ?? {};
    bool b(String k) => f[k] == true;
    String s(String k) => (f[k] ?? '').toString();

    return RepairForm(
      id: json['id'] as int?,
      title: (json['title'] ?? '').toString(),
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
      pendingSync: false,
      kunde: s('kunde'),
      befundNr: s('befundNr'),
      kommission: s('kommission'),
      ltsNummer: s('ltsNummer'),
      durchmesser: s('durchmesser'),
      steigung: s('steigung'),
      gesamtlaenge: s('gesamtlaenge'),
      seite: s('seite'),
      fvGerollt: b('fv_gerollt'),
      fvGewirbelt: b('fv_gewirbelt'),
      fvGeschliffen: b('fv_geschliffen'),
      mbEFEM: b('mb_EFEM'),
      mbEFDM: b('mb_EFDM'),
      mbMFM: b('mb_MFM'),
      mbMFDM: b('mb_MFDM'),
      mbZEM: b('mb_ZEM'),
      mbZDM: b('mb_ZDM'),
      iWert: s('i_wert'),
      vorsp: s('vorsp'),
      vp4pkt: b('vp_4pkt'),
      vpShift: b('vp_shift'),
      vpScheibe: b('vp_scheibe'),
      vpGetriebe: b('vp_getriebe'),
      vpMadenstift: b('vp_madenstift'),
      montFestlager: b('mont_festlager'),
      montLoslager: b('mont_loslager'),
      fotoKpl: b('foto_kpl'),
      fotoLinks: b('foto_links'),
      fotoRechts: b('foto_rechts'),
      fotoBeidseitig: b('foto_beidseitig'),
      flanschEingebaut: s('flansch_eingebaut'),
      flanschErsetzt: s('flansch_ersetzt'),
      flanschVorspannung: s('flansch_vorspannung'),
      zylinderEingebaut: s('zylinder_eingebaut'),
      zylinderErsetzt: s('zylinder_ersetzt'),
      zylinderVorspannung: s('zylinder_vorspannung'),
      sAusbrueche_spindel: b('s_ausbrueche_spindel'),
      sAusbrue_mutter: b('s_ausbrueche_mutter'),
      sKugelnDeformiert: b('s_kugeln_deformiert'),
      sKugeleindrucke: b('s_kugeleindrucke'),
      sAbstreifer: b('s_abstreifer'),
      sUmlenkstuecke: b('s_umlenkstuecke'),
      sOhneVorspannung: b('s_ohne_vorspannung'),
      sZuWenigKugeln: b('s_zu_wenig_kugeln'),
      sSpindelEingelaufen: b('s_spindel_eingelaufen'),
      sWasserschaden: b('s_wasserschaden'),
      sLochSpindel: b('s_loch_spindel'),
      sPassungen: b('s_passungen'),
      sLaufspurauspr: b('s_laufspurauspr'),
      sFettVerschmutzt: b('s_fett_verschmutzt'),
      sFettBraun: b('s_fett_braun'),
      sUnzureichendSchm: b('s_unzureichend_schm'),
      sWenigSchm: b('s_wenig_schm'),
      sRost: b('s_rost'),
      sSpaene: b('s_spaene'),
      sMutterHakt: b('s_mutter_hakt'),
      sSpindelPunktuell: b('s_spindel_punktuell'),
      sMontageUmlenkung: b('s_montage_umlenkung'),
      kgtReparabel: s('kgt_reparabel'),
      zeichnung: s('zeichnung'),
      mutternrichtung: s('mutternrichtung'),
      bJheld: b('b_jheld'),
      bHemus: b('b_hemus'),
      bAlb: b('b_alb'),
      bCiobanu: b('b_ciobanu'),
      bMheld: b('b_mheld'),
      freinotiz: s('freinotiz'),
    );
  }
}
