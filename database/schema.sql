create extension if not exists pgcrypto;

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text,
    phone text,
    company text,
    source text,
    status text default 'new',
    notes text,
    lead_score integer default 35,
    revenue numeric default 0,
    created_at timestamp default now()
);

create table if not exists calls (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade,
    call_status text,
    transcript text,
    ai_summary text,
    sentiment text,
    next_action text,
    duration integer,
    recording_url text,
    created_at timestamp default now()
);

create table if not exists meetings (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade,
    meeting_time timestamp,
    meeting_status text default 'booked',
    meeting_notes text,
    created_at timestamp default now()
);

create table if not exists activity_logs (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete set null,
    activity_type text,
    description text,
    created_at timestamp default now()
);

create table if not exists scraped_data (
    id uuid primary key default gen_random_uuid(),
    business_name text,
    phone text,
    email text,
    website text,
    source_url text,
    summary text,
    status text default 'new',
    created_at timestamp default now()
);

alter table scraped_data add column if not exists summary text;
alter table scraped_data add column if not exists status text default 'new';
