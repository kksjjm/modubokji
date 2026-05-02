-- 알림 구독자 테이블
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  profile jsonb not null,                          -- UserProfile JSON
  kakao_channel_user_id text,                      -- 카카오톡 채널 사용자 ID
  email text,                                      -- 이메일 (대체 수단)
  notify_kakao boolean default false,
  notify_web boolean default true,
  created_at timestamptz default now(),
  last_notified_at timestamptz
);

-- 신규 지원사업 테이블
create table if not exists programs (
  id text primary key,
  name text not null,
  category text not null,
  description text not null,
  organization text not null,                      -- 주관 기관
  eligibility_rules jsonb not null default '[]',
  benefits text not null,
  estimated_amount text,
  application_url text,
  start_date date not null,
  end_date date not null,
  source_url text,
  created_at timestamptz default now(),
  notified boolean default false                   -- 알림 발송 여부
);

-- 알림 발송 이력 테이블
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  subscriber_id uuid references subscribers(id) on delete cascade,
  program_id text references programs(id) on delete cascade,
  channel text not null,                           -- 'kakao', 'web', 'email'
  status text not null default 'pending',          -- 'pending', 'sent', 'failed'
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_programs_end_date on programs(end_date);
create index if not exists idx_programs_notified on programs(notified) where notified = false;
create index if not exists idx_subscribers_notify on subscribers(notify_kakao, notify_web);
