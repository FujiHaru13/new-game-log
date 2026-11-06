-- Read-only application views. security_invoker makes underlying-table RLS
-- apply to the caller instead of turning the view into a data bypass.

create or replace view public.watch_record_costs
with (security_invoker = true)
as
select
  w.id as watch_record_id,
  w.owner_id,
  w.total_price,
  w.my_expense,
  coalesce(sum(p.amount) filter (where p.ticket_id is null), 0)::numeric(12,2) as direct_payment_total,
  coalesce(sum(p.amount), 0)::numeric(12,2) as payment_detail_total,
  coalesce(sum(p.refund_amount), 0)::numeric(12,2) as payment_refund_total
from public.watch_records w
left join public.payments p on p.watch_record_id = w.id
group by w.id, w.owner_id, w.total_price, w.my_expense;

create or replace view public.dashboard_match_facts
with (security_invoker = true)
as
select
  m.id as match_id,
  m.owner_id,
  m.match_date,
  m.date_unknown,
  m.start_time,
  m.home_team_id,
  m.away_team_id,
  m.stadium_id,
  m.stadium_custom_name,
  m.match_type,
  m.match_status,
  m.home_score,
  m.away_score,
  m.score_confirmed,
  w.id as watch_record_id,
  w.watch_status,
  w.cheer_team_id,
  case
    when m.match_status = 'cancelled' or w.watch_status = 'cancelled' then 'cancelled'
    when m.match_status <> 'finished' or m.home_score is null or m.away_score is null then 'scheduled'
    when w.cheer_team_id = m.home_team_id and m.home_score > m.away_score then 'win'
    when w.cheer_team_id = m.home_team_id and m.home_score < m.away_score then 'loss'
    when w.cheer_team_id = m.away_team_id and m.away_score > m.home_score then 'win'
    when w.cheer_team_id = m.away_team_id and m.away_score < m.home_score then 'loss'
    when m.home_score > m.away_score then 'win'
    when m.home_score < m.away_score then 'loss'
    else 'draw'
  end as watch_result,
  w.my_expense
from public.matches m
join public.watch_records w on w.match_id = m.id;

create or replace view public.category_statistics
with (security_invoker = true)
as
select
  c.id as category_id,
  c.label,
  f.owner_id,
  count(*) filter (where f.match_status = 'finished') as finished_matches,
  count(*) filter (where f.watch_result = 'win') as wins,
  count(*) filter (where f.watch_result = 'loss') as losses,
  count(*) filter (where f.watch_result = 'draw') as draws,
  count(*) filter (where f.watch_result in ('win', 'loss')) as decisions,
  case when count(*) filter (where f.watch_result in ('win', 'loss')) = 0 then null
       else count(*) filter (where f.watch_result = 'win')::numeric
          / count(*) filter (where f.watch_result in ('win', 'loss')) end as win_rate
from public.categories c
join public.watch_record_categories wc on wc.category_id = c.id
join public.dashboard_match_facts f on f.watch_record_id = wc.watch_record_id
group by c.id, c.label, f.owner_id;

revoke all on public.watch_record_costs, public.dashboard_match_facts, public.category_statistics from anon;
grant select on public.watch_record_costs, public.dashboard_match_facts, public.category_statistics to authenticated;
