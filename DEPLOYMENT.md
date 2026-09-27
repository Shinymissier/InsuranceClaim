# Deployment Guide - Insurance Claim Verification System

This application is packaged as an **All-in-One Web Application** where Spring Boot builds and serves both the **Frontend UI** and the **REST API** seamlessly from a single deployable unit on **Render**, connected to **Supabase PostgreSQL**.

---

## Architecture Overview

```
Browser (User)
      │
      ▼
Render Web Service (Port 8080)
┌───────────────────────────────────────────────┐
│ Spring Boot 3.3.5                             │
│ ├─ Static Web Assets (/index.html, /script.js)│
│ └─ REST API Endpoints (/api/*)                │
└───────────────────────┬───────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
Supabase PostgreSQL             Gmail SMTP Server
(Database & Auditing)           (Email OTPs)
```

---

## Prerequisites Checklist

Before deploying, ensure you have:

1. **GitHub Account**: `shinymissier@gmail.com`
2. **GitHub Repository**: [Shinymissier/InsuranceClaim](https://github.com/Shinymissier/InsuranceClaim)
3. **Supabase Account & Project**: [supabase.com](https://supabase.com)
4. **Gmail Account with App Password** (for OTP sending)
5. **Render Account**: [render.com](https://render.com) (Sign up with GitHub for 1-click linking)

---

## Step 1: Get Supabase Database Connection Details

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Click the **Connect** button at the top (or go to **Project Settings -> Database**).
4. Under **Connection string**, select **URI** or **JDBC**.
   - If using the **Session / Transaction Pooler (Port 6543 or 5432)** (Recommended for cloud deployments):
     ```
     jdbc:postgresql://aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - If using the **Direct connection (Port 5432)**:
     ```
     jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
     ```
5. Note down:
   - `SUPABASE_DB_URL`: The JDBC URL with `?sslmode=require` at the end
   - `SUPABASE_DB_USERNAME`: `postgres` (or `postgres.<project-ref>` if using pooler)
   - `SUPABASE_DB_PASSWORD`: Your Supabase database password

> [!TIP]
> Make sure `?sslmode=require` is appended to the JDBC URL so that the cloud connection is encrypted.

---

## Step 2: Generate Gmail App Password for OTP Emails

To allow the backend to send OTP verification emails:

1. Go to [Google Account Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top, search for **App passwords**.
4. Create a new app password:
   - App Name: `Insurance Claim App`
   - Click **Create**.
5. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).
6. Note down:
   - `MAIL_USERNAME`: Your Gmail address (e.g., `shinymissier@gmail.com`)
   - `MAIL_PASSWORD`: The 16-character App Password (without spaces)

---

## Step 3: Push Changes to GitHub

In your project terminal, stage, commit, and push the prepared files to your GitHub repository:

```bash
git add .
git commit -m "Configure all-in-one deployment with Docker and Render blueprint"
git push origin main
```

---

## Step 4: Deploy on Render

### Method A: Deploy via Blueprint (Fastest & Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository: `Shinymissier/InsuranceClaim`.
4. Render will automatically detect `render.yaml` and prompt you to fill in the required environment variables:

| Variable | Value / Description |
|---|---|
| `PORT` | `8080` (pre-filled) |
| `SUPABASE_DB_URL` | `jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require` |
| `SUPABASE_DB_USERNAME` | `postgres.evsmqptouoayfdhceagy` |
| `SUPABASE_DB_PASSWORD` | `#Shiny@2006$` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `insuranceclmvrfctn@gmail.com` |
| `MAIL_PASSWORD` | `diytuypengdfifmf` |
| `BOOTSTRAP_ADMIN_USERNAME` | `admin` |
| `BOOTSTRAP_ADMIN_PASSWORD` | `Admin@123` |
| `BOOTSTRAP_ADMIN_NAME` | `Admin` |
| `BOOTSTRAP_ADMIN_EMAIL` | `insuranceclmvrfctn@gmail.com` |

5. Click **Apply**.
6. Render will automatically build the multi-stage Docker container and deploy the service.

---

### Method B: Deploy Manually as a Web Service

If you prefer setting it up manually:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose `Shinymissier/InsuranceClaim`.
4. Configure settings:
   - **Name**: `insurance-claim-app`
   - **Region**: Select closest to your database (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty)*
   - **Runtime**: **Docker**
   - **Instance Type**: **Free**
5. Scroll down to **Environment Variables** and add all the variables from the table above.
6. Click **Create Web Service**.

---

## Step 5: Verify Your Live Deployment

1. Once the deployment finishes, Render will provide your public URL:
   `https://insurance-claim-app-xxxx.onrender.com`
2. Open the URL in your browser:
   - You should see the teal executive Insurance Claim Verification portal.
3. Sign in as Admin:
   - Username: `admin`
   - Password: `<your BOOTSTRAP_ADMIN_PASSWORD>`
4. Test Claimant registration:
   - Click **Create Account**
   - Enter name, email, username, and password
   - Verify that the OTP email arrives and enter the OTP to activate the account.

---

## Important Notes & Troubleshooting

- **Render Free Tier Sleep**: On the free plan, Render spins down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to boot up.
- **Supabase SSL**: Always ensure `?sslmode=require` is present in `SUPABASE_DB_URL`.
- **Database Tables**: Spring Boot will automatically create all tables (`users`, `claims`, `claim_events`) on first startup (`spring.jpa.hibernate.ddl-auto=update`).
- **File Uploads**: Files uploaded to the app are stored in `/app/uploads` inside the container.
