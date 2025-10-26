# calibrare_hx711.py
# Rulare: python3 calibrare_hx711.py
import time
import RPi.GPIO as GPIO
from hx711 import HX711

DOUT_PIN = 5   # BCM 5 (adaptează dacă e cazul)
SCK_PIN  = 6   # BCM 6

def clean_exit():
    try:
        GPIO.cleanup()
    except Exception:
        pass

def median_read(hx, samples=15):
    # citim o medie/mediană stabilă
    vals = []
    for _ in range(samples):
        vals.append(hx.get_weight(1))  # cu ref_unit=1 => “conturi brute”
        time.sleep(0.01)
    vals.sort()
    # mediană ca să filtrăm spike-urile
    return vals[len(vals)//2]

try:
    GPIO.setwarnings(False)
    hx = HX711(DOUT_PIN, SCK_PIN)
    hx.set_reading_format("MSB", "MSB")

    # pe durata calibării folosim 1 ca unitate de referință, ca să vedem valorile brute
    hx.set_reference_unit(1)
    hx.reset()
    print("TARE (fără greutate)...")
    hx.tare()
    print("Tare gata.\n")

    input("Pune greutatea etalon pe load cell și apasă Enter...")
    known_grams_str = input("Introdu MASA exactă a etalonului în grame (ex: 206): ").strip()
    known_grams = float(known_grams_str)

    print("Stabilizez citirea...")
    time.sleep(1.0)

    raw = median_read(hx, samples=25)  # “conturi brute” (diferența față de tare)
    if raw == 0:
        print("Citire 0. Verifică conexiunile, alimentarea și că etalonul e pe celulă.")
        clean_exit()
        raise SystemExit

    # Formula din biblioteca tatobari/hx711py:
    # get_weight() = (raw_diff / reference_unit)
    # Dacă reference_unit=1 pe timpul calibării, get_weight() ≈ raw_diff
    # => reference_unit_corect = raw_diff / known_grams
    reference_unit = raw / known_grams

    # Asigurăm semnul pozitiv (depinde de conexiunea A+/A-; dacă semnul e invers, se schimbă)
    if reference_unit < 0:
        reference_unit = -reference_unit

    print("\n=== REZULTAT CALIBRARE ===")
    print(f"Valoare brută medie (raw): {raw:.3f}")
    print(f"Greutate etalon: {known_grams:.3f} g")
    print(f"REFERENCE_UNIT sugerat: {reference_unit:.3f}")

    print("\nTestează rapid cu REFERENCE_UNIT-ul nou:")
    hx.set_reference_unit(reference_unit)
    time.sleep(0.5)
    test_g = hx.get_weight(10)  # acum ar trebui să fie ≈ known_grams
    print(f"Citim acum ≈ {test_g:.1f} g (ar trebui ~ {known_grams:.1f} g)")

    print("\nCopiază valoarea REFERENCE_UNIT în codul tău principal.")
finally:
    clean_exit()