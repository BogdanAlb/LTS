# hx711_reader.py
# Cititor simplu pentru HX711 bazat pe driverul de mai sus.
# Necesita: hx711.py in acelasi folder si RPi.GPIO instalat.

import time
from hx711 import HX711


# Ajusteaza dupa calibrarea ta. 1.14 ~ grame (exemplu).
REFERENCE_UNIT = 1.14

class HX711Reader:
    def __init__(self, dout_pin: int, sck_pin: int, reference_unit: float = REFERENCE_UNIT):
        self.hx = HX711(dout_pin, sck_pin)
        self.hx.set_reference_unit(reference_unit)

        # Ne fixam pe canalul A @128x (standard) si facem tare pe acelasi canal:
        self.hx.set_gain(128)
        self.hx.tare()
        print("[HX711] Init OK. Canal A @128x. Tare complet.")

    def read_grams(self, samples: int = 7):
        """Returneaza greutatea in grame (rotunjita la 2 zecimale)."""
        try:
            value_g = self.hx.get_weight_A(samples)
            return round(value_g, 2)
        except Exception as e:
            print(f"[HX711Reader] Eroare la citire: {e}")
            return None

    def read_kilograms(self, samples: int = 7):
        g = self.read_grams(samples)
        return None if g is None else round(g / 1000.0, 4)

    def zero(self, samples: int = 15):
        """Realizeaza o noua 'tare' pe canalul A @128x."""
        self.hx.set_gain(128)
        self.hx.tare(samples)
        print("[HX711Reader] Tare realizat.")

    def close(self):
        """Optional, curata pinii cand inchizi aplicatia."""
        try:
            self.hx.cleanup()
        except Exception:
            pass


# Exemplu de utilizare directa:
if __name__ == "__main__":
    # Inlocuieste cu pinii tai BCM (de ex. DOUT=5, SCK=6)
    DOUT_PIN = 5
    SCK_PIN = 6

    reader = HX711Reader(DOUT_PIN, SCK_PIN, reference_unit=REFERENCE_UNIT)

    try:
        while True:
            grams = reader.read_grams(samples=7)
            if grams is not None:
                print(f"Greutate: {grams} g")
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nIesire.")
    finally:
        reader.close()
