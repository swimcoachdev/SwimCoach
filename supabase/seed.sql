-- ============================================================
-- Local demo seed — auto-applied by `supabase db reset`.
-- Login:  coach@swimcoach.test  /  swimcoach
-- Written against the ACTUAL schema (the repo's demo_*.sql drifted and won't load).
-- ============================================================
DO $$
DECLARE
  v_uid    uuid := '11111111-1111-1111-1111-111111111111';
  v_club   uuid;
  v_coach  uuid;
  v_group  uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
  c1 uuid; c2 uuid;
BEGIN
  -- ── Auth user (coach) ───────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
    'coach@swimcoach.test', crypt('swimcoach', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_uid, v_uid::text,
    jsonb_build_object('sub', v_uid::text, 'email', 'coach@swimcoach.test'),
    'email', now(), now(), now()
  );

  -- ── Club / coach ────────────────────────────────────────────────────
  INSERT INTO clubs (name, slug, city) VALUES ('Helsingin Uimaseura', 'hel-uinti', 'Helsinki')
    RETURNING id INTO v_club;
  INSERT INTO users (id, club_id, role, full_name, email)
    VALUES (v_uid, v_club, 'coach', 'Kristian Kuismin', 'coach@swimcoach.test');
  INSERT INTO coaches (user_id, club_id, bio) VALUES (v_uid, v_club, 'Päävalmentaja')
    RETURNING id INTO v_coach;
  INSERT INTO training_groups (club_id, coach_id, name, description)
    VALUES (v_club, v_coach, 'Kilpa A', 'Kilpauimarit A-ryhmä') RETURNING id INTO v_group;

  -- ── Swimmers ────────────────────────────────────────────────────────
  INSERT INTO swimmers (club_id, coach_id, full_name, birth_date, gender, onboarding_done)
    VALUES (v_club, v_coach, 'Emilia Mäkinen',  '2006-03-14', 'F', true) RETURNING id INTO s1;
  INSERT INTO swimmers (club_id, coach_id, full_name, birth_date, gender, onboarding_done)
    VALUES (v_club, v_coach, 'Mikael Virtanen', '2005-08-22', 'M', true) RETURNING id INTO s2;
  INSERT INTO swimmers (club_id, coach_id, full_name, birth_date, gender, onboarding_done)
    VALUES (v_club, v_coach, 'Sanna Korhonen',  '2007-01-05', 'F', true) RETURNING id INTO s3;
  INSERT INTO swimmers (club_id, coach_id, full_name, birth_date, gender, onboarding_done)
    VALUES (v_club, v_coach, 'Aleksi Leinonen', '2004-11-30', 'M', true) RETURNING id INTO s4;
  INSERT INTO swimmers (club_id, coach_id, full_name, birth_date, gender, onboarding_done)
    VALUES (v_club, v_coach, 'Venla Nieminen',  '2006-06-09', 'F', true) RETURNING id INTO s5;

  INSERT INTO group_members (group_id, swimmer_id)
    VALUES (v_group,s1),(v_group,s2),(v_group,s3),(v_group,s4),(v_group,s5);

  -- ── Yearly goals 2026 (target % split sums to 100) ──────────────────
  INSERT INTO yearly_goals (swimmer_id, season_year, target_pool_km, target_dryland_hours,
      target_workouts, target_pct_pk, target_pct_vk, target_pct_mk, target_pct_mak,
      target_stroke, target_distance, target_time_ms) VALUES
    (s1, 2026, 550, 35, 90, 60, 20, 15, 5, 'vapaa', '100', 58000),
    (s2, 2026, 500, 30, 85, 65, 20, 12, 3, 'selka', '100', 62000),
    (s3, 2026, 520, 32, 88, 60, 22, 13, 5, 'perho', '100', 65000),
    (s4, 2026, 600, 40, 95, 70, 15, 12, 3, 'vapaa', '400', 245000),
    (s5, 2026, 540, 34, 90, 62, 20, 13, 5, 'vapaa', '200', 130000);

  -- ── Workouts: every 3 days Jan→mid-Jun 2026 (~54 sessions) ──────────
  INSERT INTO workouts (club_id, coach_id, group_id, workout_date, workout_type, title)
  SELECT v_club, v_coach, v_group, d::date, 'uinti', 'Allasharjoitus'
  FROM generate_series('2026-01-06'::date, '2026-06-15'::date, interval '3 days') d;

  -- Each session rotates (by date order) through one of three zone profiles, so a
  -- swimmer's actual split depends on *which* sessions they attend — not a constant:
  --   p0 perus (PK-painotteinen) · p1 kynnys (VK/MK) · p2 vauhti (MAK)
  -- Sets: 1 PK · 2 VK · 3 MK · 4 MAK   (totals: p0 4800 / p1 5000 / p2 4800 m)
  WITH w AS (SELECT id, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone)
  SELECT id, 1, CASE p WHEN 0 THEN 12 WHEN 1 THEN 13 ELSE 11 END,
                CASE p WHEN 0 THEN 300 ELSE 200 END, 'vapaa', 'pk' FROM w;
  WITH w AS (SELECT id, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone)
  SELECT id, 2, CASE p WHEN 0 THEN 6 WHEN 1 THEN 13 ELSE 8 END, 100, 'vapaa', 'vk' FROM w;
  WITH w AS (SELECT id, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone)
  SELECT id, 3, CASE p WHEN 0 THEN 4 WHEN 1 THEN 9 ELSE 8 END, 100, 'sekauinti', 'mk' FROM w;
  WITH w AS (SELECT id, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone)
  SELECT id, 4, CASE p WHEN 0 THEN 4 WHEN 1 THEN 4 ELSE 20 END, 50, 'vapaa', 'mak' FROM w;

  -- ── Attendance: each swimmer favours different session types, so their actual
  -- zone mix diverges (not just their volume). LIMIT drives the goal-% spread;
  -- the profile filter drives the zone-mix skew.
  --   Emilia: all types, high volume → ahead of pace, balanced mix
  --   Aleksi: perus + kynnys        → PK-heavy, little MAK
  --   Sanna:  kynnys + vauhti       → quality-heavy, low PK
  --   Venla:  perus + vauhti        → MAK-heavy
  --   Mikael: perus only, few       → at risk, very PK-heavy
  WITH w AS (SELECT id, workout_date, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m, felt_scale)
    SELECT id, s1, 5400, 7 FROM w ORDER BY workout_date LIMIT 54;
  WITH w AS (SELECT id, workout_date, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m, felt_scale)
    SELECT id, s4, 5400, 6 FROM w WHERE p IN (0,1) ORDER BY workout_date LIMIT 36;
  WITH w AS (SELECT id, workout_date, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m, felt_scale)
    SELECT id, s3, 5000, 8 FROM w WHERE p IN (1,2) ORDER BY workout_date LIMIT 34;
  WITH w AS (SELECT id, workout_date, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m, felt_scale)
    SELECT id, s5, 4800, 7 FROM w WHERE p IN (0,2) ORDER BY workout_date LIMIT 30;
  WITH w AS (SELECT id, workout_date, (row_number() OVER (ORDER BY workout_date)) % 3 AS p FROM workouts WHERE club_id = v_club)
  INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m, felt_scale)
    SELECT id, s2, 4200, 5 FROM w WHERE p = 0 ORDER BY workout_date LIMIT 18;

  -- ── Competitions + results + baseline PRs (shows improvement) ───────
  INSERT INTO competitions (club_id, name, competition_date, location, level)
    VALUES (v_club, 'Talvi-SM 2026', '2026-02-15', 'Tampere', 'SM') RETURNING id INTO c1;
  INSERT INTO competitions (club_id, name, competition_date, location, level)
    VALUES (v_club, 'Kevätkisat 2026', '2026-05-24', 'Helsinki', 'piiri') RETURNING id INTO c2;

  INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at) VALUES
    (s1,'vapaa','100', 60200,true,'2026-01-01'),
    (s2,'selka','100', 65400,true,'2026-01-01'),
    (s3,'perho','100', 68900,true,'2026-01-01'),
    (s4,'vapaa','400',252000,true,'2026-01-01'),
    (s5,'vapaa','200',132500,true,'2026-01-01');

  INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms, is_personal_best) VALUES
    (c1,s1,'vapaa','100', 60200,false),(c2,s1,'vapaa','100', 58800,true),
    (c1,s2,'selka','100', 65400,false),(c2,s2,'selka','100', 64100,true),
    (c1,s3,'perho','100', 68900,false),(c2,s3,'perho','100', 67300,true),
    (c1,s4,'vapaa','400',252000,false),(c2,s4,'vapaa','400',247500,true),
    (c1,s5,'vapaa','200',132500,false),(c2,s5,'vapaa','200',129900,true);

  RAISE NOTICE 'SwimCoach demo seed OK: club=% coach=% swimmers=5', v_club, v_coach;
END $$;
