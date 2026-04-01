import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/repair_form.dart';

class ReparaturApi {
  ReparaturApi._();
  static final ReparaturApi instance = ReparaturApi._();

  late Dio _dio;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    final prefs = await SharedPreferences.getInstance();
    final base = prefs.getString('api_base_url') ?? 'http://raspberrypi.local:8000';
    _dio = Dio(BaseOptions(
      baseUrl: '$base/reparatur',
      connectTimeout: const Duration(seconds: 8),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));
    _initialized = true;
  }

  /// Reinitialize with updated URL from settings.
  Future<void> reload() async {
    _initialized = false;
    await init();
  }

  Future<List<RepairForm>> listForms() async {
    await init();
    final res = await _dio.get<List>('/');
    return (res.data ?? [])
        .cast<Map<String, dynamic>>()
        .map((e) => RepairForm.fromApi({
              'id': e['id'],
              'title': e['title'],
              'created_at': e['created_at'],
              'updated_at': e['updated_at'],
              'fields': {},
            }))
        .toList();
  }

  Future<RepairForm> saveForm(RepairForm form) async {
    await init();
    final res = await _dio.post<Map<String, dynamic>>(
      '/',
      data: {'fields': form.toApiFields()},
    );
    return RepairForm.fromApi(res.data!);
  }

  Future<RepairForm> updateForm(int id, RepairForm form) async {
    await init();
    final res = await _dio.put<Map<String, dynamic>>(
      '/$id',
      data: {'fields': form.toApiFields()},
    );
    return RepairForm.fromApi(res.data!);
  }

  Future<void> deleteForm(int id) async {
    await init();
    await _dio.delete('/$id');
  }
}
