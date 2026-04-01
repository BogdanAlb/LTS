import 'dart:convert';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../api/reparatur_api.dart';
import '../models/repair_form.dart';

/// Manages a local SQLite cache of repair forms.
/// Forms saved while offline are marked pending_sync=1 and
/// flushed to the server on the next successful connection.
class SyncService {
  SyncService._();
  static final SyncService instance = SyncService._();

  late Database _db;

  Future<void> init() async {
    _db = await openDatabase(
      join(await getDatabasesPath(), 'lts_reparatur.db'),
      version: 1,
      onCreate: (db, _) async {
        await db.execute('''
          CREATE TABLE repair_forms (
            local_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id   INTEGER,
            title       TEXT    NOT NULL,
            fields_json TEXT    NOT NULL DEFAULT '{}',
            created_at  TEXT    NOT NULL,
            updated_at  TEXT    NOT NULL,
            pending_sync INTEGER NOT NULL DEFAULT 1
          )
        ''');
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Local CRUD
  // ---------------------------------------------------------------------------

  Future<List<RepairForm>> loadAll() async {
    final rows = await _db.query(
      'repair_forms',
      orderBy: 'updated_at DESC',
    );
    return rows.map(_rowToForm).toList();
  }

  /// Insert or replace by title (same upsert logic as the backend).
  Future<RepairForm> saveLocally(RepairForm form) async {
    final now = DateTime.now().toIso8601String();
    final title = _makeTitle(form);
    final fieldsJson = jsonEncode(form.toApiFields());

    final existing = await _db.query(
      'repair_forms',
      where: 'lower(title) = lower(?)',
      whereArgs: [title],
      limit: 1,
    );

    if (existing.isNotEmpty) {
      final localId = existing.first['local_id'] as int;
      await _db.update(
        'repair_forms',
        {
          'title': title,
          'fields_json': fieldsJson,
          'updated_at': now,
          'pending_sync': 1,
        },
        where: 'local_id = ?',
        whereArgs: [localId],
      );
      final updated = await _db.query(
        'repair_forms',
        where: 'local_id = ?',
        whereArgs: [localId],
        limit: 1,
      );
      return _rowToForm(updated.first);
    } else {
      final localId = await _db.insert('repair_forms', {
        'server_id': form.id,
        'title': title,
        'fields_json': fieldsJson,
        'created_at': now,
        'updated_at': now,
        'pending_sync': 1,
      });
      final inserted = await _db.query(
        'repair_forms',
        where: 'local_id = ?',
        whereArgs: [localId],
        limit: 1,
      );
      return _rowToForm(inserted.first);
    }
  }

  Future<void> deleteLocally(int localId) async {
    await _db.delete(
      'repair_forms',
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }

  // ---------------------------------------------------------------------------
  // Sync with server
  // ---------------------------------------------------------------------------

  /// Pull all forms from server and replace local cache.
  /// Returns the refreshed list.
  Future<List<RepairForm>> syncFromServer() async {
    final serverForms = await ReparaturApi.instance.listForms();

    await _db.transaction((txn) async {
      // Remove rows that have a server_id (they came from server before)
      // but keep pending-only rows (created offline, not yet pushed)
      await txn.delete(
        'repair_forms',
        where: 'server_id IS NOT NULL AND pending_sync = 0',
      );
      for (final form in serverForms) {
        final fieldsJson = jsonEncode(form.toApiFields());
        final existing = await txn.query(
          'repair_forms',
          where: 'server_id = ?',
          whereArgs: [form.id],
          limit: 1,
        );
        if (existing.isEmpty) {
          await txn.insert('repair_forms', {
            'server_id': form.id,
            'title': form.title,
            'fields_json': fieldsJson,
            'created_at': form.createdAt.toIso8601String(),
            'updated_at': form.updatedAt.toIso8601String(),
            'pending_sync': 0,
          });
        }
      }
    });

    return loadAll();
  }

  /// Push all pending local forms to the server.
  Future<void> pushPending() async {
    final pending = await _db.query(
      'repair_forms',
      where: 'pending_sync = 1',
    );

    for (final row in pending) {
      final localId = row['local_id'] as int;
      final form = _rowToForm(row);
      try {
        RepairForm saved;
        if (form.id != null) {
          saved = await ReparaturApi.instance.updateForm(form.id!, form);
        } else {
          saved = await ReparaturApi.instance.saveForm(form);
        }
        await _db.update(
          'repair_forms',
          {
            'server_id': saved.id,
            'title': saved.title,
            'updated_at': saved.updatedAt.toIso8601String(),
            'pending_sync': 0,
          },
          where: 'local_id = ?',
          whereArgs: [localId],
        );
      } catch (e) {
        // Keep pending — will retry next time
        print('SyncService.pushPending error for localId=$localId: $e');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  RepairForm _rowToForm(Map<String, dynamic> row) {
    final fields = jsonDecode(row['fields_json'] as String) as Map<String, dynamic>;
    return RepairForm.fromApi({
      'id': row['server_id'],
      'title': row['title'],
      'created_at': row['created_at'],
      'updated_at': row['updated_at'],
      'fields': fields,
    }).copyWith(
      localId: (row['local_id'] as int).toString(),
      pendingSync: (row['pending_sync'] as int) == 1,
    );
  }

  String _makeTitle(RepairForm f) {
    final kunde = f.kunde.trim();
    final befund = f.befundNr.trim();
    if (kunde.isNotEmpty && befund.isNotEmpty) {
      return '$kunde - $befund'.substring(
          0, '$kunde - $befund'.length.clamp(0, 120));
    }
    return (kunde.isNotEmpty ? kunde : befund).substring(
        0, (kunde.isNotEmpty ? kunde : befund).length.clamp(0, 120));
  }
}
