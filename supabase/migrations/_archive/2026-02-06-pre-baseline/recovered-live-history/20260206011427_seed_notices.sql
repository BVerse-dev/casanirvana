-- Recovered from live Casa Nirvana Supabase migration metadata on 2026-05-22.
-- Project: pswnlowvmdgeifhxilao

-- Seed notices with Ghanaian/Nigerian context
INSERT INTO notices (community_id, title, body, category, priority, author_name, tags, status, is_featured, views_count, likes_count)
VALUES 
  -- Casa Nirvana notices
  ('11111111-1111-1111-1111-111111111111', 'Water Supply Maintenance Notice', 
   'Dear Residents, please be informed that there will be scheduled water supply maintenance on Saturday from 6 AM to 12 PM. Kindly store adequate water for your household needs. We apologize for any inconvenience caused. - Estate Management', 
   'maintenance', 'high', 'Kwame Asante', ARRAY['maintenance', 'water', 'urgent'], 'published', true, 245, 32),
  
  ('11111111-1111-1111-1111-111111111111', 'Monthly Community Meeting - February 2026', 
   'We invite all residents to attend our monthly community meeting scheduled for Sunday, 15th February at 4 PM in the Community Hall. Agenda includes: Security updates, Maintenance budget review, and New amenity proposals. Refreshments will be served.', 
   'event', 'medium', 'Adaeze Okonkwo', ARRAY['meeting', 'community', 'event'], 'published', true, 189, 45),
  
  ('11111111-1111-1111-1111-111111111111', 'New Security Measures Implementation', 
   'Starting from 1st March, all visitors must present valid ID at the gate. Residents are requested to pre-register expected guests via the Casa Nirvana app. This measure is to enhance the safety of our community.', 
   'security', 'high', 'Kofi Mensah', ARRAY['security', 'visitors', 'announcement'], 'published', false, 312, 67),
  
  -- Casa Marina notices
  ('22222222-2222-2222-2222-222222222222', 'Swimming Pool Reopening Announcement', 
   'We are pleased to announce that the community swimming pool will reopen on Monday after maintenance work. New operating hours: 6 AM - 9 PM daily. All residents must book slots through the app. Children under 12 must be accompanied by adults.', 
   'amenity', 'medium', 'Amaka Eze', ARRAY['pool', 'amenity', 'announcement'], 'published', true, 278, 89),
  
  ('22222222-2222-2222-2222-222222222222', 'Electricity Bill Payment Reminder', 
   'Kindly note that electricity bill payments for January 2026 are due by 10th February. Late payments will attract a 5% penalty. Payments can be made through the app, bank transfer, or at the estate office.', 
   'payment', 'high', 'Yaw Boateng', ARRAY['payment', 'electricity', 'bills'], 'published', false, 456, 23),
  
  -- Casa Gardens notices
  ('33333333-3333-3333-3333-333333333333', 'Annual General Meeting Notice', 
   'The Annual General Meeting of Casa Gardens Residents Association will hold on Saturday, 22nd February 2026 at 10 AM in the Main Hall. Election of new executive members and presentation of annual accounts. Your attendance is mandatory.', 
   'event', 'high', 'Chinwe Okoro', ARRAY['AGM', 'meeting', 'important'], 'published', true, 534, 102),
  
  ('33333333-3333-3333-3333-333333333333', 'Generator Maintenance Schedule', 
   'The estate backup generator will undergo routine maintenance every Wednesday from 10 AM to 2 PM. During this period, please ensure you have alternative power arrangements. Thank you for your understanding.', 
   'maintenance', 'medium', 'Kwesi Appiah', ARRAY['generator', 'maintenance', 'power'], 'published', false, 198, 15),
  
  ('33333333-3333-3333-3333-333333333333', 'Independence Day Celebration', 
   'Join us for the Independence Day celebration! Date: March 6th, Time: 4 PM onwards. Activities include: Cultural performances, Food festival, Children games, and Fireworks display. All residents and their families are welcome!', 
   'event', 'medium', 'Obinna Nnamdi', ARRAY['celebration', 'event', 'independence'], 'published', true, 623, 156),
  
  ('11111111-1111-1111-1111-111111111111', 'Waste Collection Schedule Update', 
   'Please note the updated waste collection schedule: General waste - Monday & Thursday, Recyclables - Wednesday, Green waste - Saturday. Ensure bins are placed outside by 6 AM on collection days.', 
   'general', 'low', 'Ama Serwaa', ARRAY['waste', 'collection', 'schedule'], 'published', false, 145, 8),
  
  ('22222222-2222-2222-2222-222222222222', 'CCTV System Upgrade', 
   'We are upgrading our CCTV surveillance system next week. Installation of additional cameras at key locations will improve security coverage. Some areas may experience temporary disruption. Thank you for your patience.', 
   'security', 'medium', 'Emeka Obi', ARRAY['security', 'CCTV', 'upgrade'], 'published', false, 267, 41);

