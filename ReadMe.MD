Mod dezvoltare (manual):
cd ~/LTS/backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000

cd ~/LTS/frontend
npm run dev

Mod productie (systemd):
sudo systemctl restart lts-backend.service
sudo systemctl restart lts-frontend.service
systemctl --user restart lts-kiosk.service

IMPORTANT:
Nu rula manual backend/frontend daca serviciile systemd sunt deja active,
altfel apar erori de tip "address already in use" pe porturile 8000/5173.
