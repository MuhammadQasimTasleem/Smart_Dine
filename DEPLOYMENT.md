# Smart Dine deployment runbook

This runbook uses the existing Django/React application. It does not replace
the application with a sample project.

## Local baseline

Run these commands from `Smart_Dine`:

```powershell
python -m venv .venv-local
.\.venv-local\Scripts\python.exe -m pip install -r requirements.txt
.\.venv-local\Scripts\python.exe manage.py check
.\.venv-local\Scripts\python.exe manage.py makemigrations --check --dry-run
```

Run the frontend commands from `Smart_Dine\frontend\frontend`:

```powershell
npm ci
npm run build
```

The old checked-in `.venv` is machine-specific and should not be used on the
EC2 instance.

## Compose verification

Copy `.env.example` to a private deployment file and replace every
`replace-with-*` value. Never copy the real local `.env` into an image or
commit it.

```powershell
docker compose --env-file .env.example config
docker compose --env-file .env.example up -d --build
docker compose --env-file .env.example ps
Invoke-WebRequest http://localhost:8080/healthz/
Invoke-WebRequest http://localhost:8080/
```

The frontend is published on port `8080`, while the `web` and `db` services
remain internal to the Compose network. `web` runs migrations and
`collectstatic` before Gunicorn starts.

To prove named-volume persistence, create a marker, recreate only the database
container, and query the marker again:

```powershell
docker compose --env-file .env.example exec -T db `
  psql -U smartdine -d smartdine `
  -c "CREATE TABLE volume_check (id integer primary key, marker text); INSERT INTO volume_check VALUES (1, 'persistent');"
docker compose --env-file .env.example rm -sf db
docker compose --env-file .env.example up -d db
docker compose --env-file .env.example exec -T db `
  psql -U smartdine -d smartdine -c "SELECT * FROM volume_check;"
```

## Migrating the existing SQLite data

Export from the original local database without exposing the fixture in the
repository:

```powershell
.\.venv-local\Scripts\python.exe manage.py dumpdata `
  --exclude contenttypes --exclude auth.permission `
  --exclude sessions --exclude admin.logentry --indent 2 `
  | Out-File .\smartdine-data.json -Encoding utf8
docker cp .\smartdine-data.json smart_dine-web-1:/tmp/smartdine-data.json
docker exec smart_dine-web-1 python manage.py import_legacy_fixture /tmp/smartdine-data.json
```

Use the repository's `import_legacy_fixture` command rather than plain
`loaddata`: the existing account signals auto-create profiles, which otherwise
causes duplicate one-to-one profile errors. Delete the temporary fixture after
verifying counts.

## Selenium evidence

Install the development requirements in a separate environment and run:

```powershell
.\.venv-local\Scripts\python.exe -m pip install -r requirements-dev.txt
$env:SMOKE_BASE_URL = "http://localhost:8080"
.\.venv-local\Scripts\python.exe selenium_smoke_test.py
```

The test opens the rendered home page and verifies the `Welcome to Smart Dine`
heading. Change `SMOKE_BASE_URL` to the Application Load Balancer DNS name for
the final demonstration.

## Linux and Docker evidence

On each EC2 instance, record commands and output similar to:

```bash
mkdir -p ~/smart-dine
touch ~/smart-dine/deployment.env
chmod 600 ~/smart-dine/deployment.env
ls -ld ~/smart-dine
ls -l ~/smart-dine/deployment.env
docker --version
docker compose version
docker compose --env-file deployment.env up -d
docker compose ps
docker image ls
docker volume ls
```

The private env file must be readable by the deployment user only. Do not open
PostgreSQL or the Django Gunicorn port to the public internet; the ALB should
be the public entry point.

## AWS architecture and cost gate

Do not create AWS resources until the current Free Tier and regional prices are
reviewed and explicitly approved. EC2 instances, an Application Load Balancer,
public IPv4 addresses, EBS storage, and data transfer can incur charges even
for a short demonstration; delete or stop resources after the exam.

The target architecture is:

```text
Internet -> Application Load Balancer -> target group -> EC2 instance 1
                                                     -> EC2 instance 2
                                                        (ASG)
Each instance: frontend Nginx + Django web container
Shared database: PostgreSQL service with durable storage
```

Use a launch template with Docker installed, the Compose files and private
environment file, and a user-data script that starts the stack. Configure the
target group health path as `/healthz/` through the frontend listener. Set the
ASG desired/minimum capacity to two across availability zones, then verify
both targets are healthy before using the ALB DNS name.

For a production-grade design, move PostgreSQL outside the two ephemeral
application instances (for example to a managed database) so both instances
share one authoritative database. For a lab-only Compose demonstration,
document the chosen persistence boundary and do not claim that two independent
SQLite files are shared.
