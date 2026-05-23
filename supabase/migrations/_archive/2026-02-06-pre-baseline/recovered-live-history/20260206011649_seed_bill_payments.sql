-- Recovered from live Casa Nirvana Supabase migration metadata on 2026-05-22.
-- Project: pswnlowvmdgeifhxilao

-- Seed bill payments with Nigerian/Ghanaian context
INSERT INTO bill_payments (profile_id, bill_type, provider, account_number, customer_name, amount, fee, total_amount, status, created_at)
SELECT 
  p.id as profile_id,
  (ARRAY['electricity', 'water', 'cable_tv', 'internet', 'waste_management'])[floor(random() * 5 + 1)::int] as bill_type,
  (ARRAY['IKEDC Lagos', 'EKEDC Lagos', 'ECG Ghana', 'DSTV Nigeria', 'GOtv', 'StarTimes', 'Spectranet', 'Swift Networks', 'Lagos Water Corp', 'Ghana Water'])[floor(random() * 10 + 1)::int] as provider,
  lpad((floor(random() * 10000000000)::bigint)::text, 10, '0') as account_number,
  (ARRAY['Kwame Asante', 'Adaeze Okonkwo', 'Kofi Mensah', 'Amaka Eze', 'Yaw Boateng', 'Chinwe Okoro', 'Obinna Nnamdi', 'Ama Serwaa', 'Emeka Obi', 'Abena Owusu'])[floor(random() * 10 + 1)::int] as customer_name,
  (ARRAY[5000, 10000, 15000, 20000, 25000, 35000, 50000])[floor(random() * 7 + 1)::int]::numeric as amount,
  100::numeric as fee,
  (ARRAY[5100, 10100, 15100, 20100, 25100, 35100, 50100])[floor(random() * 7 + 1)::int]::numeric as total_amount,
  (ARRAY['completed', 'completed', 'completed', 'completed', 'pending', 'failed'])[floor(random() * 6 + 1)::int] as status,
  NOW() - (random() * interval '60 days') as created_at
FROM 
  (SELECT id FROM profiles ORDER BY random() LIMIT 10) p
CROSS JOIN generate_series(1, 3);

-- Seed money transfers with Nigerian/Ghanaian bank names
INSERT INTO money_transfers (profile_id, recipient_name, recipient_phone, recipient_bank, recipient_account, amount, fee, total_amount, status, kyc_verified, risk_score, created_at)
SELECT 
  p.id as profile_id,
  (ARRAY['Kwabena Osei', 'Ngozi Uchenna', 'Kofi Appiah', 'Funke Akindele', 'Yaw Mensah', 'Adaobi Nwosu', 'Kwesi Boateng', 'Chioma Eze', 'Akwasi Owusu', 'Emeka Ogbonna'])[floor(random() * 10 + 1)::int] as recipient_name,
  CASE (random() * 1)::int
    WHEN 0 THEN '+234801' || lpad((floor(random() * 10000000)::int)::text, 7, '0')
    ELSE '+233244' || lpad((floor(random() * 1000000)::int)::text, 6, '0')
  END as recipient_phone,
  (ARRAY['GTBank', 'First Bank Nigeria', 'Access Bank', 'Zenith Bank', 'UBA', 'Fidelity Bank', 'GCB Bank Ghana', 'Ecobank Ghana', 'Standard Chartered Ghana', 'Absa Ghana'])[floor(random() * 10 + 1)::int] as recipient_bank,
  lpad((floor(random() * 10000000000)::bigint)::text, 10, '0') as recipient_account,
  (ARRAY[5000, 10000, 25000, 50000, 100000, 200000, 500000])[floor(random() * 7 + 1)::int]::numeric as amount,
  (ARRAY[50, 100, 150, 200, 350, 500])[floor(random() * 6 + 1)::int]::numeric as fee,
  (ARRAY[5050, 10100, 25150, 50200, 100350, 200500, 500500])[floor(random() * 7 + 1)::int]::numeric as total_amount,
  (ARRAY['completed', 'completed', 'completed', 'completed', 'pending', 'failed'])[floor(random() * 6 + 1)::int] as status,
  true as kyc_verified,
  floor(random() * 30 + 10)::int as risk_score,
  NOW() - (random() * interval '60 days') as created_at
FROM 
  (SELECT id FROM profiles ORDER BY random() LIMIT 10) p
CROSS JOIN generate_series(1, 3);
