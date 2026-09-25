-- Optional reference schema for the Insurance Claim Verification System.
-- Normally Spring Data JPA/Hibernate creates/updates these tables automatically
-- because spring.jpa.hibernate.ddl-auto=update.
-- Run this in Supabase SQL Editor only if you prefer to create the tables manually.

create table if not exists users (
    id bigserial primary key,
    username varchar(255) not null unique,
    password varchar(255) not null,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    role varchar(50) not null,
    email_verified boolean not null default false,
    enabled boolean not null default true,
    otp_hash varchar(255),
    otp_expiry timestamp,
    otp_attempts integer not null default 0,
    auth_token varchar(80)
);

create table if not exists claims (
    id bigserial primary key,
    claimant_username varchar(255) not null,
    claimant_name varchar(255) not null,
    policy_number varchar(255) not null,
    amount numeric(14,2) not null,
    description varchar(1000) not null,
    document_original_name varchar(255),
    document_stored_name varchar(255),
    status varchar(50) not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    last_updated_by varchar(255),
    payment_method varchar(50),
    transaction_reference varchar(120),
    settlement_amount numeric(14,2),
    settlement_date timestamp
);

create table if not exists claim_events (
    id bigserial primary key,
    claim_id bigint not null,
    action varchar(255) not null,
    status varchar(255) not null,
    actor varchar(255) not null,
    note varchar(1000),
    event_time timestamp not null
);

create index if not exists idx_claims_claimant_username on claims(claimant_username);
create index if not exists idx_claim_events_claim_id on claim_events(claim_id);

-- If the claims table already exists, add the settlement columns once.
alter table claims add column if not exists payment_method varchar(50);
alter table claims add column if not exists transaction_reference varchar(120);
alter table claims add column if not exists settlement_amount numeric(14,2);
alter table claims add column if not exists settlement_date timestamp;

-- Password reset OTP fields (Hibernate also adds these with ddl-auto=update).
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_otp_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_otp_expiry TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_otp_attempts INTEGER NOT NULL DEFAULT 0;

-- Safe migration for existing users: initialize the new reset-attempt counter.
UPDATE users SET password_reset_otp_attempts = 0 WHERE password_reset_otp_attempts IS NULL;
ALTER TABLE users ALTER COLUMN password_reset_otp_attempts SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN password_reset_otp_attempts SET NOT NULL;
