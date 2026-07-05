# backend/run.py

import argparse
import uvicorn
import sys
import os

# ✅ Add backend folder to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    parser = argparse.ArgumentParser(description="Run FFT Church Backend")
    parser.add_argument("--env", type=str, default="dev", help="dev or prod")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    print(f"Running in {args.env.upper()} mode on port {args.port}")

    os.environ["ENV"] = args.env

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=args.port,
        reload=True if args.env == "dev" else False
    )

if __name__ == "__main__":
    main()