1. Porneste backendul cu comanda:
  cd ~/LTS/backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000

2. Porneste frontendul cu comanda:
  cd ~/LTS/frontend
  npm run dev

Update rulare backend + frontend (systemd):
sudo systemctl restart lts-backend.service
sudo systemctl restart lts-frontend.service
systemctl --user restart lts-kiosk.service
