# Faith Fellowship Temple Web Application

**Developed by Karun Kumar**

---

## Project Overview

Faith Fellowship Temple is a fullstack web application designed for church/ministry management.  
It covers membership, events, donations, live streaming, and more.

- **Backend**: FastAPI (Python) - RESTful APIs, authentication, and database operations.
- **Frontend**: React + Vite - Modern, responsive web UI.
- **Authentication**: OTP and/or password login.
- **Features**: Admin panel, event manager, donations, prayer requests, Bible tools, and user-friendly navigation.

---

## Folders & Source Code Structure

```
root/
├── backend/
│   ├── app/
│   │   ├── core/         # Configuration, security, database setup
│   │   ├── models/       # SQLAlchemy ORM models (users, chr, events, etc.)
│   │   ├── schemas/      # Pydantic schemas (data validation for API)
│   │   ├── api/          # FastAPI routers (auth, admin, events, donations, ...)
│   │   ├── services/     # Business logic: OTP, email, payment services
│   │   ├── templates/    # HTML/email templates (OTP mail, etc)
│   │   └── main.py       # FastAPI app startup
│   ├── .env              # Environment configurations
│   ├── requirements.txt  # Python dependencies
│   └── run.py            # Entrypoint script (optional)
│
├── frontend/
│   ├── public/           # Static files/images (logo.png etc.)
│   └── src/
│       ├── components/   # UI components (Sidebar, Navbar, Layout, Modals, etc.)
│       ├── pages/        # React page views (Dashboard, Events, Login, etc.)
│       ├── context/      # React Context (state management, e.g., AuthContext)
│       ├── services/     # API client (api.js)
│       ├── App.jsx       # Main App component
│       ├── main.jsx      # Entry point
│       └── theme.js      # (UI theme/styling)
│   ├── package.json      # Frontend NPM dependencies & scripts
│   └── vite.config.js    # Vite configuration
└── README.md             # (This file)
```

---

## Prerequisites

- **Python**: 3.9 or newer (**You have 3.14.3, which is perfect**)
- **Node.js and npm**: Recommended Node.js 18+  
  (Use [nodejs.org](https://nodejs.org/) to install if you don't have it.)

---

## 1️⃣ Backend Setup (FastAPI REST API)

### Install dependencies

```bash
cd backend
python -m venv venv        # Create virtual environment
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Configure `.env`

Create a `.env` file in the `backend/` directory. Example:

```
SECRET_KEY=your-very-strong-secret-key
DATABASE_URL=sqlite:///./db.sqlite3               # For SQLite (default, dev use)
# For PostgreSQL (recommended in prod):
# DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-email-password
EMAIL_FROM=your.email@gmail.com
```

> **Note:**  
> - If using Gmail, you may need to generate an "App Password" ([learn more](https://support.google.com/accounts/answer/185833?hl=en)).
> - For Postgres, you need to install and run PostgreSQL DB and configure accordingly.

### Run the backend server

```bash
# Ensure you are in backend/ and venv is activated
uvicorn app.main:app --reload
```

- Default port: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

---

## 2️⃣ Frontend Setup (React + Vite)

### Install Node dependencies

```bash
cd frontend
npm install
```

### Run the frontend development server

```bash
npm run dev
```

- App runs on: `http://localhost:5173` (or similar, see terminal output)

### Configure Frontend → Backend connection

- The frontend expects API at `http://localhost:8000`
- If running backend elsewhere, edit base URL in:  
  `frontend/src/services/api.js`

Example for `api.js`:
```js
const API_BASE_URL = "http://localhost:8000";
```

---

## 3️⃣ Running Together

> Open two terminals:  
> - One for backend (`cd backend`, activate venv, run uvicorn ...)  
> - One for frontend (`cd frontend`, `npm run dev`)  

---

## 4️⃣ Usage & Features

- Visit the frontend URL in your browser.
- **Sidebar** gives access to features (dashboard/events/donations etc.).
  - Wants to access private features? Login/signup first.
  - Login supports both OTP and password login.
- **Admin-only pages** are hidden unless logged as admin.
- All backend APIs are tested and browsable at `/docs`.

---

## 5️⃣ Installations Summary

- **Python packages**: Installed from `backend/requirements.txt`
- **Node packages**: Installed from `frontend/package.json`

---

## 6️⃣ Customization

- Titles/logos: Swap out `/frontend/public/logo.png` and update text in `Sidebar.jsx` as needed.
- Theme: Tweak `frontend/src/theme.js` for UI hues.

---

## 7️⃣ For Production

- Set `DEBUG=False` and use production-grade DB (PostgreSQL)
- Use a WSGI server (gunicorn/uvicorn with workers) and serve frontend via CDN or proper static hosting.
- Always secure your `.env` and credentials.

---

## Troubleshooting

- Make sure ports (8000 and 5173) are not blocked/firewalled.
- Use `pip freeze` to check Python dependencies, `npm ls` for Node.
- For database errors, verify your `DATABASE_URL` in `.env`.

---

## Author

**Developed by Karun Kumar**

If you use or
