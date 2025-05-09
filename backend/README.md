# 🏡 SubletMatch Backend
## 📦 1. Running PostgreSQL Locally (Docker Compose)

We use Docker to run a local instance of Postgres 15.

### ▶️ Start the database

From the repo root:

```bash
docker-compose up -d
```

This will:
- Spin up a container named `local_postgres`
- Create a `sublet` database
- Expose it on `localhost:5432`

---

## 🐘 2. Accessing the Local Database

You can open a `psql` session into the local DB like this:

```bash
docker exec -it local_postgres psql -U postgres -d sublet
```

This gives you an interactive PostgreSQL prompt where you can inspect tables, run queries, etc.

---

## 🔁 3. Syncing Production → Local
```bash
cd backend
chmod +x migrate_from_prod.sh
./migrate_from_prod.sh
```

This copies prod database into your local one

## 🐍 4. Python Backend Setup

### 🧱 Create and activate a virtual environment

From the repo root:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🚀 5. Running the Backend Manually

Once you're in the `backend/` directory and your virtual environment is activated:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```




