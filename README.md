# Insurance Claim Verification - Supabase Edition

This version uses **Supabase PostgreSQL** as the application's persistent database.

## Architecture

Frontend (HTML/CSS/JS) -> Spring Boot REST API -> Spring Data JPA/Hibernate -> Supabase PostgreSQL

## 1. Create the Supabase database

Create a Supabase project at https://supabase.com/.

In Supabase Dashboard:

1. Open **Project Settings -> Database**.
2. Copy a PostgreSQL connection string.
3. For a local IntelliJ application, the direct connection or Supavisor session/pooler connection can be used.
4. Make sure SSL is enabled. The JDBC URL should include `sslmode=require`.

Example format (replace placeholders with your real values):

`jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require`

For a pooler connection, use the host/port/username shown by Supabase, for example port 6543.

## 2. IntelliJ environment variables

Do NOT put the Supabase password in source code.

Set these in **Run -> Edit Configurations -> Environment variables**:

```text
SUPABASE_DB_URL=jdbc:postgresql://<supabase-host>:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=<your-supabase-database-password>

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<project-gmail-address>
MAIL_PASSWORD=<gmail-app-password>

BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=<admin-login-password>
BOOTSTRAP_ADMIN_NAME=<admin-display-name>
BOOTSTRAP_ADMIN_EMAIL=<admin-email>
```

If you use Supabase's pooler, copy the exact host, port and username from the Supabase **Connect** panel rather than guessing them.

## 3. Database tables

The application uses Spring Data JPA/Hibernate with `ddl-auto=update`. On the first successful startup, Hibernate creates/updates these tables in Supabase:

- `users` - claimant, claim officer, surveyor, finance officer and admin accounts
- `claims` - insurance claims
- `claim_events` - workflow/audit history

The database is therefore persistent in Supabase rather than local H2.

You can see the tables in **Supabase Dashboard -> Table Editor**.

## 4. Start the backend

Open the `backend` folder as a Maven project in IntelliJ.

Use **JDK 17**.

Run:

`com.insurance.claim.InsuranceClaimApplication`

The API starts on:

`http://localhost:8080`

Open the frontend:

`frontend/index.html`

## 5. Claim workflow

The action buttons are deliberately separate:

- Verify -> `POST /api/claims/{id}/verify`
- Reject -> `POST /api/claims/{id}/reject`
- Survey -> `POST /api/claims/{id}/survey`
- Approve -> `POST /api/claims/{id}/approve`
- Settle -> `POST /api/claims/{id}/settle`

Each action has its own confirmation popup. A Verify click cannot call the Reject endpoint, and a missing document causes a verification error rather than an automatic rejection.

## 6. Important: Supabase password

The password required by `SUPABASE_DB_PASSWORD` is the **database password for the Supabase project**, not the Gmail App Password and not the Insurance Claim Admin password.

## 7. Email OTP

`MAIL_PASSWORD` is only the Gmail App Password used to send OTP emails.

It is unrelated to the Supabase database password.

## 8. Files

Uploaded claim documents are stored in the local `uploads` directory by the current backend. The database stores the original/stored file names. If you want documents themselves stored in Supabase Storage, that can be added separately.

## Creative dashboard UI

The frontend has been redesigned with a modern teal/mint executive dashboard. The overview is data-driven: KPI cards, claim-status donut, seven-day claim activity bars, recent activity, and quick actions are populated from the backend claims response. Existing login, OTP, claimant registration, role-based navigation, claim workflow, confirmation modals, SSE real-time updates, and Supabase database configuration are preserved.

Open `frontend/index.html` after starting the Spring Boot backend. The frontend continues to call `http://localhost:8080/api`.

## Finance Officer Payment Settlement
For an APPROVED claim, the Finance Officer uses the Settle Payment action. The settlement popup requires a payment method (Bank Transfer, UPI, or Cheque), settlement amount, and transaction/reference number. The backend validates these fields, stores them on the claim, records the settlement timestamp, creates a CLAIM_SETTLED audit event, and changes the claim status to SETTLED.

The existing Supabase setup uses `spring.jpa.hibernate.ddl-auto=update`, so restarting the backend will add the new payment columns to the `claims` table automatically. The included `database/supabase_schema.sql` also contains `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements for manual schema updates.


## Password Management
- **Forgot Password:** Login screen -> Forgot password -> registered email -> password reset OTP -> new password.
- **Change Password:** Logged-in users -> Change Password -> current password + new password -> forced re-login.
- Reset/change invalidates the existing authentication token.
- Password reset OTPs are stored as BCrypt hashes and expire after the configured OTP expiry period.
- Password reset OTP attempts are limited to 5.
- SMTP settings continue to use `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, and `MAIL_PASSWORD` environment variables.

## Dashboard and password management update

The staff dashboard now uses a compact teal/green enterprise insurance layout. Claim Officer, Surveyor, Finance Officer and Admin users open directly to the Claims workspace, while Claimants retain the simpler overview dashboard.

Password management includes:
- Forgot Password -> email OTP -> reset password
- Change Password -> current password + new password
- Password reset invalidates the existing login token

### Existing Supabase database migration
If the project was already running before password reset was added, run:
`database/users_password_reset_migration.sql`
in the Supabase SQL Editor once. This initializes `password_reset_otp_attempts` to 0 for existing users before applying NOT NULL.
