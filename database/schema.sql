create extension if not exists pgcrypto;

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text,
    phone text,
    company text,
    title text,
    source text,
    status text default 'new',
    notes text,
    background_summary text,
    company_summary text,
    role_summary text,
    pain_points text,
    needs text,
    budget text,
    decision_authority text,
    intelligence_status text default 'pending',
    lead_score integer default 35,
    revenue numeric default 0,
    created_at timestamp default now()
);

create table if not exists calls (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade,
    vapi_call_id text,
    call_status text,
    transcript text,
    ai_summary text,
    sentiment text,
    interest_level text,
    meeting_recommended boolean,
    next_action text,
    lead_score integer,
    duration integer,
    recording_url text,
    call_started_at timestamp,
    call_ended_at timestamp,
    created_at timestamp default now()
);

create table if not exists meetings (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references customers(id) on delete cascade,
    source_call_id uuid references calls(id) on delete set null,
    meeting_title text,
    meeting_time timestamp,
    meeting_status text default 'booked',
    meeting_notes text,
    meeting_reason text,
    customer_intent text,
    confirmation_status text,
    calendar_event_url text,
    follow_up_action text,
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
    customer_id uuid references customers(id) on delete set null,
    call_id uuid references calls(id) on delete set null,
    business_name text,
    contact_name text,
    title text,
    phone text,
    email text,
    website text,
    source_url text,
    summary text,
    role_summary text,
    source_notes text,
    status text default 'new',
    created_at timestamp default now()
);

alter table customers add column if not exists title text;
alter table customers add column if not exists background_summary text;
alter table customers add column if not exists company_summary text;
alter table customers add column if not exists role_summary text;
alter table customers add column if not exists pain_points text;
alter table customers add column if not exists needs text;
alter table customers add column if not exists budget text;
alter table customers add column if not exists decision_authority text;
alter table customers add column if not exists intelligence_status text default 'pending';
alter table calls add column if not exists vapi_call_id text;
alter table calls add column if not exists interest_level text;
alter table calls add column if not exists meeting_recommended boolean;
alter table calls add column if not exists lead_score integer;
alter table calls add column if not exists call_started_at timestamp;
alter table calls add column if not exists call_ended_at timestamp;
alter table meetings add column if not exists source_call_id uuid references calls(id) on delete set null;
alter table meetings add column if not exists meeting_title text;
alter table meetings add column if not exists meeting_reason text;
alter table meetings add column if not exists customer_intent text;
alter table meetings add column if not exists confirmation_status text;
alter table meetings add column if not exists calendar_event_url text;
alter table meetings add column if not exists follow_up_action text;
alter table scraped_data add column if not exists customer_id uuid references customers(id) on delete set null;
alter table scraped_data add column if not exists call_id uuid references calls(id) on delete set null;
alter table scraped_data add column if not exists contact_name text;
alter table scraped_data add column if not exists title text;
alter table scraped_data add column if not exists summary text;
alter table scraped_data add column if not exists role_summary text;
alter table scraped_data add column if not exists source_notes text;
alter table scraped_data add column if not exists status text default 'new';
