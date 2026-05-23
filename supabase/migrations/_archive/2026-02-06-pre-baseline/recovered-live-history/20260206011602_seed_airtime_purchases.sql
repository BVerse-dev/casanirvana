-- Recovered from live Casa Nirvana Supabase migration metadata on 2026-05-22.
-- Project: pswnlowvmdgeifhxilao

-- Seed airtime purchases with Nigerian/Ghanaian phone numbers
INSERT INTO airtime_purchases (profile_id, provider, phone_number, description, amount, status, created_at)
SELECT 
  p.id as profile_id,
  (ARRAY['MTN Nigeria', 'Airtel Nigeria', 'Glo Mobile', 'MTN Ghana', 'Vodafone Ghana'])[floor(random() * 5 + 1)::int] as provider,
  CASE (random() * 3)::int
    WHEN 0 THEN '+234801' || lpad((floor(random() * 10000000)::int)::text, 7, '0')
    WHEN 1 THEN '+234803' || lpad((floor(random() * 10000000)::int)::text, 7, '0')
    WHEN 2 THEN '+233244' || lpad((floor(random() * 1000000)::int)::text, 6, '0')
    ELSE '+233277' || lpad((floor(random() * 1000000)::int)::text, 6, '0')
  END as phone_number,
  'Airtime top-up for ' || (ARRAY['personal use', 'family member', 'business line', 'data bundle', 'voice calls'])[floor(random() * 5 + 1)::int] as description,
  (ARRAY[100, 200, 500, 1000, 2000, 5000])[floor(random() * 6 + 1)::int]::numeric as amount,
  (ARRAY['completed', 'completed', 'completed', 'completed', 'pending', 'failed'])[floor(random() * 6 + 1)::int] as status,
  NOW() - (random() * interval '60 days') as created_at
FROM 
  (SELECT id FROM profiles ORDER BY random() LIMIT 10) p
CROSS JOIN generate_series(1, 3);

-- Seed data purchases with Nigerian/Ghanaian phone numbers
INSERT INTO data_purchases (profile_id, provider, phone_number, description, package_name, data_amount, validity_days, amount, status, created_at)
SELECT 
  p.id as profile_id,
  (ARRAY['MTN Nigeria', 'Airtel Nigeria', 'Glo Mobile', 'MTN Ghana', 'Vodafone Ghana'])[floor(random() * 5 + 1)::int] as provider,
  CASE (random() * 3)::int
    WHEN 0 THEN '+234801' || lpad((floor(random() * 10000000)::int)::text, 7, '0')
    WHEN 1 THEN '+234803' || lpad((floor(random() * 10000000)::int)::text, 7, '0')
    WHEN 2 THEN '+233244' || lpad((floor(random() * 1000000)::int)::text, 6, '0')
    ELSE '+233277' || lpad((floor(random() * 1000000)::int)::text, 6, '0')
  END as phone_number,
  'Data bundle purchase' as description,
  (ARRAY['Daily Bundle', 'Weekly Bundle', 'Monthly Bundle', 'SME Bundle', 'YouTube Bundle'])[floor(random() * 5 + 1)::int] as package_name,
  (ARRAY['500MB', '1GB', '2GB', '5GB', '10GB', '25GB'])[floor(random() * 6 + 1)::int] as data_amount,
  (ARRAY[1, 7, 14, 30, 60])[floor(random() * 5 + 1)::int] as validity_days,
  (ARRAY[500, 1000, 1500, 2000, 3000, 5000])[floor(random() * 6 + 1)::int]::numeric as amount,
  (ARRAY['completed', 'completed', 'completed', 'completed', 'pending', 'failed'])[floor(random() * 6 + 1)::int] as status,
  NOW() - (random() * interval '60 days') as created_at
FROM 
  (SELECT id FROM profiles ORDER BY random() LIMIT 10) p
CROSS JOIN generate_series(1, 3);
