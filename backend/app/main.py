from fastapi import FastAPI
from app.core.init_dbse import init_db
from app.api import auth, events, dashboard, admin, prayers, bible, payment, scanner,feedback
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FFT Church API")

# ✅ CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],         # allow all methods
    allow_headers=["*"],         # allow all headers
)

# ✅ Include routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(prayers.router)
app.include_router(bible.router)
app.include_router(payment.router)
app.include_router(scanner.router)
app.include_router(feedback.router)  # Include feedback router

# 🔹 Initialize database on startup
# @app.on_event("startup")
# def startup_event():
#     init_db()
#     print("Database initialized successfully ✅")