import 'package:flutter/material.dart';

import '../models/repair_form.dart';
import '../services/sync_service.dart';

class FormScreen extends StatefulWidget {
  const FormScreen({super.key, this.initial});
  final RepairForm? initial;

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  late RepairForm _form;
  bool _saving = false;

  // Text controllers for fields that need them
  late final Map<String, TextEditingController> _ctrl;

  @override
  void initState() {
    super.initState();
    _form = widget.initial ?? RepairForm.empty();
    _ctrl = {
      'kunde': TextEditingController(text: _form.kunde),
      'befundNr': TextEditingController(text: _form.befundNr),
      'kommission': TextEditingController(text: _form.kommission),
      'ltsNummer': TextEditingController(text: _form.ltsNummer),
      'durchmesser': TextEditingController(text: _form.durchmesser),
      'steigung': TextEditingController(text: _form.steigung),
      'gesamtlaenge': TextEditingController(text: _form.gesamtlaenge),
      'iWert': TextEditingController(text: _form.iWert),
      'vorsp': TextEditingController(text: _form.vorsp),
      'flanschEingebaut': TextEditingController(text: _form.flanschEingebaut),
      'flanschErsetzt': TextEditingController(text: _form.flanschErsetzt),
      'flanschVorspannung': TextEditingController(text: _form.flanschVorspannung),
      'zylinderEingebaut': TextEditingController(text: _form.zylinderEingebaut),
      'zylinderErsetzt': TextEditingController(text: _form.zylinderErsetzt),
      'zylinderVorspannung': TextEditingController(text: _form.zylinderVorspannung),
      'freinotiz': TextEditingController(text: _form.freinotiz),
    };
  }

  @override
  void dispose() {
    for (final c in _ctrl.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _syncFromControllers() {
    _form = _form.copyWith(
      kunde: _ctrl['kunde']!.text,
      befundNr: _ctrl['befundNr']!.text,
      kommission: _ctrl['kommission']!.text,
      ltsNummer: _ctrl['ltsNummer']!.text,
      durchmesser: _ctrl['durchmesser']!.text,
      steigung: _ctrl['steigung']!.text,
      gesamtlaenge: _ctrl['gesamtlaenge']!.text,
      iWert: _ctrl['iWert']!.text,
      vorsp: _ctrl['vorsp']!.text,
      flanschEingebaut: _ctrl['flanschEingebaut']!.text,
      flanschErsetzt: _ctrl['flanschErsetzt']!.text,
      flanschVorspannung: _ctrl['flanschVorspannung']!.text,
      zylinderEingebaut: _ctrl['zylinderEingebaut']!.text,
      zylinderErsetzt: _ctrl['zylinderErsetzt']!.text,
      zylinderVorspannung: _ctrl['zylinderVorspannung']!.text,
      freinotiz: _ctrl['freinotiz']!.text,
    );
  }

  bool get _canSave =>
      _ctrl['kunde']!.text.trim().isNotEmpty &&
      _ctrl['befundNr']!.text.trim().isNotEmpty;

  Future<void> _save() async {
    _syncFromControllers();
    if (!_canSave) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bitte Kunde und Befund-Nr. ausfuellen.')),
      );
      return;
    }
    setState(() => _saving = true);
    try {
      await SyncService.instance.saveLocally(_form);
      // Immediately try to push to server
      try {
        await SyncService.instance.pushPending();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gespeichert und synchronisiert.')),
          );
        }
      } catch (_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lokal gespeichert. Server nicht erreichbar.')),
          );
        }
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Fehler: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  Widget _section(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _field(String label, String ctrlKey, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: TextField(
        controller: _ctrl[ctrlKey],
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label),
        onChanged: (_) => setState(() {}),
      ),
    );
  }

  Widget _chk(String label, bool value, ValueChanged<bool> onChanged) {
    return CheckboxListTile(
      title: Text(label, style: const TextStyle(fontSize: 13)),
      value: value,
      dense: true,
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
      onChanged: (v) => onChanged(v ?? false),
    );
  }

  Widget _radio(String label, String groupValue, String value,
      ValueChanged<String> onChanged) {
    return RadioListTile<String>(
      title: Text(label, style: const TextStyle(fontSize: 13)),
      value: value,
      groupValue: groupValue,
      dense: true,
      contentPadding: EdgeInsets.zero,
      onChanged: (v) => onChanged(v ?? ''),
    );
  }

  Widget _dropdown(String label, String value, List<String> options,
      ValueChanged<String> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: DropdownButtonFormField<String>(
        value: options.contains(value) ? value : null,
        decoration: InputDecoration(labelText: label),
        items: options
            .map((o) => DropdownMenuItem(value: o, child: Text(o)))
            .toList(),
        onChanged: (v) => onChanged(v ?? ''),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.initial == null ? 'Neues Formular' : 'Formular bearbeiten'),
        actions: [
          TextButton.icon(
            onPressed: _saving ? null : _save,
            icon: _saving
                ? const SizedBox(
                    width: 16, height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.save, color: Colors.white),
            label: const Text('Speichern', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 80),
        children: [
          // ── Basis ──────────────────────────────────────────────────────────
          _section('Basis', [
            _field('Kunde *', 'kunde'),
            _field('Befund-Nr. *', 'befundNr'),
            _field('Kommission', 'kommission'),
            _field('LTS Nummer', 'ltsNummer'),
            _field('Durchmesser', 'durchmesser'),
            _field('Steigung', 'steigung'),
            _field('Gesamtlaenge', 'gesamtlaenge'),
            const Text('Seite', style: TextStyle(fontSize: 13, color: Colors.grey)),
            Row(children: [
              Expanded(child: _radio('R', _form.seite, 'R', (v) => setState(() => _form = _form.copyWith(seite: v)))),
              Expanded(child: _radio('L', _form.seite, 'L', (v) => setState(() => _form = _form.copyWith(seite: v)))),
            ]),
          ]),

          // ── Fertigungsverfahren ────────────────────────────────────────────
          _section('Fertigungsverfahren', [
            _chk('gerollt', _form.fvGerollt, (v) => setState(() => _form = _form.copyWith(fvGerollt: v))),
            _chk('gewirbelt', _form.fvGewirbelt, (v) => setState(() => _form = _form.copyWith(fvGewirbelt: v))),
            _chk('geschliffen', _form.fvGeschliffen, (v) => setState(() => _form = _form.copyWith(fvGeschliffen: v))),
          ]),

          // ── Mutternbauform ────────────────────────────────────────────────
          _section('Mutternbauform', [
            _chk('EFEM', _form.mbEFEM, (v) => setState(() => _form = _form.copyWith(mbEFEM: v))),
            _chk('EFDM', _form.mbEFDM, (v) => setState(() => _form = _form.copyWith(mbEFDM: v))),
            _chk('MFM', _form.mbMFM, (v) => setState(() => _form = _form.copyWith(mbMFM: v))),
            _chk('MFDM', _form.mbMFDM, (v) => setState(() => _form = _form.copyWith(mbMFDM: v))),
            _chk('ZEM', _form.mbZEM, (v) => setState(() => _form = _form.copyWith(mbZEM: v))),
            _chk('ZDM', _form.mbZDM, (v) => setState(() => _form = _form.copyWith(mbZDM: v))),
          ]),

          // ── i / Vorspannung ───────────────────────────────────────────────
          _section('i / Vorspannung', [
            _field('i-Wert', 'iWert'),
            _field('Vorspannung', 'vorsp'),
            _chk('4-Pkt', _form.vp4pkt, (v) => setState(() => _form = _form.copyWith(vp4pkt: v))),
            _chk('Shift', _form.vpShift, (v) => setState(() => _form = _form.copyWith(vpShift: v))),
            _chk('Scheibe', _form.vpScheibe, (v) => setState(() => _form = _form.copyWith(vpScheibe: v))),
            _chk('Getriebe', _form.vpGetriebe, (v) => setState(() => _form = _form.copyWith(vpGetriebe: v))),
            _chk('Madenstift', _form.vpMadenstift, (v) => setState(() => _form = _form.copyWith(vpMadenstift: v))),
          ]),

          // ── Montage / Foto ────────────────────────────────────────────────
          _section('Montage / Foto', [
            _chk('Festlager / Langes Ende', _form.montFestlager, (v) => setState(() => _form = _form.copyWith(montFestlager: v))),
            _chk('Loslager / Kurzes Ende', _form.montLoslager, (v) => setState(() => _form = _form.copyWith(montLoslager: v))),
            const Divider(),
            _chk('Foto kpl.', _form.fotoKpl, (v) => setState(() => _form = _form.copyWith(fotoKpl: v))),
            _chk('Ende links', _form.fotoLinks, (v) => setState(() => _form = _form.copyWith(fotoLinks: v))),
            _chk('Ende rechts', _form.fotoRechts, (v) => setState(() => _form = _form.copyWith(fotoRechts: v))),
            _chk('Mutter links und rechts', _form.fotoBeidseitig, (v) => setState(() => _form = _form.copyWith(fotoBeidseitig: v))),
          ]),

          // ── Kugelgroesse ──────────────────────────────────────────────────
          _section('Kugelgroesse', [
            const Text('Flansch', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            _field('Eingebaut', 'flanschEingebaut'),
            _field('Ersetzt', 'flanschErsetzt'),
            _field('Vorspannung (kg)', 'flanschVorspannung'),
            const Divider(),
            const Text('Zylinder', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            _field('Eingebaut', 'zylinderEingebaut'),
            _field('Ersetzt', 'zylinderErsetzt'),
            _field('Vorspannung (kg)', 'zylinderVorspannung'),
          ]),

          // ── Schadensbild ──────────────────────────────────────────────────
          _section('Schadensbild', [
            _chk('Mat. Ausbrueche Spindel', _form.sAusbrueche_spindel, (v) => setState(() => _form = _form.copyWith(sAusbrueche_spindel: v))),
            _chk('Mat. Ausbrueche Mutter', _form.sAusbrue_mutter, (v) => setState(() => _form = _form.copyWith(sAusbrue_mutter: v))),
            _chk('Kugeln deformiert', _form.sKugelnDeformiert, (v) => setState(() => _form = _form.copyWith(sKugelnDeformiert: v))),
            _chk('Kugeleindruecke (Endp. ueberfahren)', _form.sKugeleindrucke, (v) => setState(() => _form = _form.copyWith(sKugeleindrucke: v))),
            _chk('Abstreifer beschaedigt oder fehlt', _form.sAbstreifer, (v) => setState(() => _form = _form.copyWith(sAbstreifer: v))),
            _chk('Umlenkstuecke deformiert', _form.sUmlenkstuecke, (v) => setState(() => _form = _form.copyWith(sUmlenkstuecke: v))),
            _chk('Mutternsystem ohne Vorspannung', _form.sOhneVorspannung, (v) => setState(() => _form = _form.copyWith(sOhneVorspannung: v))),
            _chk('Zu wenig Kugeln', _form.sZuWenigKugeln, (v) => setState(() => _form = _form.copyWith(sZuWenigKugeln: v))),
            _chk('Spindel eingelaufen', _form.sSpindelEingelaufen, (v) => setState(() => _form = _form.copyWith(sSpindelEingelaufen: v))),
            _chk('Wasserschaden', _form.sWasserschaden, (v) => setState(() => _form = _form.copyWith(sWasserschaden: v))),
            _chk('Loch auf der Spindel', _form.sLochSpindel, (v) => setState(() => _form = _form.copyWith(sLochSpindel: v))),
            _chk('Passungen nicht in Toleranz', _form.sPassungen, (v) => setState(() => _form = _form.copyWith(sPassungen: v))),
            _chk('Sehr starke Laufspurauspraegung', _form.sLaufspurauspr, (v) => setState(() => _form = _form.copyWith(sLaufspurauspr: v))),
            _chk('Fett verschmutzt', _form.sFettVerschmutzt, (v) => setState(() => _form = _form.copyWith(sFettVerschmutzt: v))),
            _chk('Fett braun', _form.sFettBraun, (v) => setState(() => _form = _form.copyWith(sFettBraun: v))),
            _chk('Unzureichende Schmierung', _form.sUnzureichendSchm, (v) => setState(() => _form = _form.copyWith(sUnzureichendSchm: v))),
            _chk('Wenig Schmierung', _form.sWenigSchm, (v) => setState(() => _form = _form.copyWith(sWenigSchm: v))),
            _chk('Rost auf System', _form.sRost, (v) => setState(() => _form = _form.copyWith(sRost: v))),
            _chk('Spaene in der Mutter', _form.sSpaene, (v) => setState(() => _form = _form.copyWith(sSpaene: v))),
            _chk('Mutter hakt', _form.sMutterHakt, (v) => setState(() => _form = _form.copyWith(sMutterHakt: v))),
            _chk('Spindel punktuell eingelaufen', _form.sSpindelPunktuell, (v) => setState(() => _form = _form.copyWith(sSpindelPunktuell: v))),
            _chk('Montage ueber Umlenkung/Aussendurchmesser', _form.sMontageUmlenkung, (v) => setState(() => _form = _form.copyWith(sMontageUmlenkung: v))),
          ]),

          // ── Intern ────────────────────────────────────────────────────────
          _section('NUR INTERN', [
            _dropdown('KGT reparabel?', _form.kgtReparabel, ['', 'Ja', 'Nein', 'Nicht-Rep'],
                (v) => setState(() => _form = _form.copyWith(kgtReparabel: v))),
            _dropdown('Zeichnung erstellen?', _form.zeichnung, ['', 'Ja', 'Nein'],
                (v) => setState(() => _form = _form.copyWith(zeichnung: v))),
            _dropdown('Mutternrichtung kontrolliert?', _form.mutternrichtung, ['', 'Ja', 'Nein'],
                (v) => setState(() => _form = _form.copyWith(mutternrichtung: v))),
          ]),

          // ── Bearbeiter ────────────────────────────────────────────────────
          _section('Bearbeiter', [
            _chk('J.Held', _form.bJheld, (v) => setState(() => _form = _form.copyWith(bJheld: v))),
            _chk('Hemus', _form.bHemus, (v) => setState(() => _form = _form.copyWith(bHemus: v))),
            _chk('Alb', _form.bAlb, (v) => setState(() => _form = _form.copyWith(bAlb: v))),
            _chk('Ciobanu', _form.bCiobanu, (v) => setState(() => _form = _form.copyWith(bCiobanu: v))),
            _chk('M.Held', _form.bMheld, (v) => setState(() => _form = _form.copyWith(bMheld: v))),
          ]),

          // ── Freie Notiz ───────────────────────────────────────────────────
          _section('Freie Notiz / Anbauteile', [
            _field('Notiz...', 'freinotiz', maxLines: 4),
          ]),
        ],
      ),
    );
  }
}
