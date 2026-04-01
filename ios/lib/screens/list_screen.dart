import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/repair_form.dart';
import '../services/sync_service.dart';
import 'form_screen.dart';

class ListScreen extends StatefulWidget {
  const ListScreen({super.key});

  @override
  State<ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends State<ListScreen> {
  List<RepairForm> _forms = [];
  bool _loading = true;
  String? _error;
  bool _syncing = false;

  @override
  void initState() {
    super.initState();
    _loadLocal();
    _syncFromServer();
  }

  Future<void> _loadLocal() async {
    try {
      final forms = await SyncService.instance.loadAll();
      if (mounted) setState(() { _forms = forms; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _syncFromServer() async {
    setState(() => _syncing = true);
    try {
      await SyncService.instance.pushPending();
      final forms = await SyncService.instance.syncFromServer();
      if (mounted) setState(() { _forms = forms; _error = null; });
    } catch (e) {
      print('Sync error: $e');
      // Offline — show local data with pending badges
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }

  Future<void> _openForm({RepairForm? form}) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => FormScreen(initial: form)),
    );
    _loadLocal();
    _syncFromServer();
  }

  Future<void> _deleteForm(RepairForm form) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Formular loeschen?'),
        content: Text(form.title),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Abbrechen')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Loeschen', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    if (form.localId != null) {
      await SyncService.instance.deleteLocally(int.parse(form.localId!));
    }
    if (form.id != null) {
      // Best-effort server delete
      try {
        await SyncService.instance.pushPending();
      } catch (_) {}
    }
    _loadLocal();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LTS Reparatur'),
        actions: [
          if (_syncing)
            const Padding(
              padding: EdgeInsets.all(14),
              child: SizedBox(
                width: 20, height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.sync),
              tooltip: 'Mit Server synchronisieren',
              onPressed: _syncFromServer,
            ),
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Einstellungen',
            onPressed: () async {
              await Navigator.pushNamed(context, '/settings');
              _syncFromServer();
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null && _forms.isEmpty
              ? _ErrorView(message: _error!, onRetry: _syncFromServer)
              : _forms.isEmpty
                  ? const _EmptyView()
                  : RefreshIndicator(
                      onRefresh: _syncFromServer,
                      child: ListView.builder(
                        itemCount: _forms.length,
                        itemBuilder: (_, i) => _FormTile(
                          form: _forms[i],
                          onTap: () => _openForm(form: _forms[i]),
                          onDelete: () => _deleteForm(_forms[i]),
                        ),
                      ),
                    ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add),
        label: const Text('Neues Formular'),
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _FormTile extends StatelessWidget {
  const _FormTile({
    required this.form,
    required this.onTap,
    required this.onDelete,
  });

  final RepairForm form;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('dd.MM.yyyy HH:mm').format(form.updatedAt.toLocal());
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: form.pendingSync
              ? Colors.orange.shade100
              : Colors.blue.shade100,
          child: Icon(
            form.pendingSync ? Icons.cloud_upload_outlined : Icons.description_outlined,
            color: form.pendingSync ? Colors.orange : Colors.blue,
          ),
        ),
        title: Text(form.title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          '${form.pendingSync ? "Ausstehend · " : ""}$dateStr',
          style: TextStyle(
            color: form.pendingSync ? Colors.orange : Colors.grey,
            fontSize: 12,
          ),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline, color: Colors.red),
          onPressed: onDelete,
        ),
        onTap: onTap,
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
          SizedBox(height: 12),
          Text('Keine Formulare vorhanden', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Erneut versuchen'),
            ),
          ],
        ),
      ),
    );
  }
}
