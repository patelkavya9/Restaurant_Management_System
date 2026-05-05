# Restaurant Management

This project includes a FastAPI backend and a Vite React frontend for a simple restaurant management system with admin dashboard and a customer-facing menu. It supports per-table QR codes that open the menu with the table pre-selected.

## Prerequisites

- Python 3.10+
- Node.js 18+

## Backend (FastAPI)

Install dependencies:

```powershell
pip install -r requirements.txt
```

Run the server:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Environment variables (optional):

- FRONTEND_BASE_URL: Base URL of the frontend for redirect after scanning QR (default http://localhost:5173)
- FRONTEND_MENU_PATH: Path to the menu page (default /menu.html)
- BACKEND_BASE_URL: Base URL encoded into QR images (default http://localhost:8000)

## Frontend (Vite + React)

From `admin_UI/project`:

```powershell
npm install
npm run dev
```

Create a `.env` file in `admin_UI/project` (optional) to configure API base:

```
VITE_API_BASE=http://localhost:8000
```

Open Admin: http://localhost:5173/admin.html

Open Menu: http://localhost:5173/menu.html

## Admin Tables & QR workflow

1. In Admin, select the "Tables" tab.
2. Add a table number. The backend stores it and exposes a QR at `/api/generate-qr/{table}`.
3. The QR encodes a backend redirect `/api/qr/{table}` which marks the table occupied then redirects to the frontend `menu.html?table={n}`.
4. On the Menu page, the table is auto-detected from the URL (and persisted to localStorage as `currentTable`) so customers don't need to enter it.

## Notes

- Orders on the Menu are stored locally for now (localStorage). The backend exposes order endpoints and can be wired up later.
- CORS is configured for ports 3000 and 5173 by default.