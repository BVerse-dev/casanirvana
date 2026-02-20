-- Casa Nirvana Module Settings - Seed Data
-- Populates initial modules for Residents and Guards

-- ============================================================================
-- RESIDENT MODULES - Community Hub
-- ============================================================================

INSERT INTO module_settings (slug, name, hub_type, user_type, status, description, icon, display_order)
VALUES
    ('members_directory', 'Members Directory', 'community_hub', 'RESIDENT', 1, 
     'View and connect with community members', 'ri:group-line', 1),
    ('visitors_management', 'Visitors Management', 'community_hub', 'RESIDENT', 1, 
     'Pre-approve and manage visitor entries', 'ri:contacts-book-3-line', 2),
    ('notice_board', 'Notice Board', 'community_hub', 'RESIDENT', 1, 
     'View community announcements and notices', 'ri:news-line', 3),
    ('payment', 'Payment', 'community_hub', 'RESIDENT', 1, 
     'Pay maintenance and utility bills', 'ri:money-dollar-circle-line', 4),
    ('book_amenities', 'Book Amenities', 'community_hub', 'RESIDENT', 1, 
     'Reserve community facilities and amenities', 'ri:building-2-line', 5),
    ('help_desk', 'Help Desk', 'community_hub', 'RESIDENT', 1, 
     'Get support and assistance', 'ri:customer-service-2-line', 6),
    ('complaints', 'Complaints', 'community_hub', 'RESIDENT', 1, 
     'Submit and track complaints', 'ri:feedback-line', 7),
    ('maintenance_requests', 'Maintenance Requests', 'community_hub', 'RESIDENT', 1, 
     'Request maintenance and repairs', 'ri:tools-line', 8)
ON CONFLICT (slug, user_type) DO NOTHING;

-- ============================================================================
-- RESIDENT MODULES - Personal Hub
-- ============================================================================

INSERT INTO module_settings (slug, name, hub_type, user_type, status, description, icon, display_order)
VALUES
    ('buy_airtime', 'Buy Airtime', 'personal_hub', 'RESIDENT', 1, 
     'Purchase mobile airtime top-up', 'ri:phone-line', 1),
    ('buy_data', 'Buy Data', 'personal_hub', 'RESIDENT', 1, 
     'Purchase internet data bundles', 'ri:wifi-line', 2),
    ('send_money', 'Send Money', 'personal_hub', 'RESIDENT', 1, 
     'Transfer money to others', 'ri:send-plane-line', 3),
    ('pay_bills', 'Pay Bills', 'personal_hub', 'RESIDENT', 1, 
     'Pay utilities and subscription bills', 'ri:file-list-line', 4),
    ('insurance', 'Insurance', 'personal_hub', 'RESIDENT', 1, 
     'View and manage insurance policies', 'ri:shield-check-line', 5),
    ('marketplace', 'Marketplace', 'personal_hub', 'RESIDENT', 1, 
     'Shop for products and services', 'ri:store-2-line', 6),
    ('services', 'Services', 'personal_hub', 'RESIDENT', 1, 
     'Book personal workers and service providers', 'ri:user-settings-line', 7)
ON CONFLICT (slug, user_type) DO NOTHING;

-- ============================================================================
-- GUARD MODULES - Guard Hub
-- ============================================================================

INSERT INTO module_settings (slug, name, hub_type, user_type, status, description, icon, display_order)
VALUES
    ('visitor_entry', 'Visitor Entry', 'guard_hub', 'GUARD', 1, 
     'Process guest and visitor check-ins', 'ri:user-add-line', 1),
    ('delivery_entry', 'Delivery Entry', 'guard_hub', 'GUARD', 1, 
     'Process delivery personnel entries', 'ri:truck-line', 2),
    ('cab_entry', 'Cab Entry', 'guard_hub', 'GUARD', 1, 
     'Process cab and ride-share entries', 'ri:taxi-line', 3),
    ('service_entry', 'Service Entry', 'guard_hub', 'GUARD', 1, 
     'Process service provider entries', 'ri:briefcase-line', 4),
    ('emergency_alerts', 'Emergency Alerts', 'guard_hub', 'GUARD', 1, 
     'View and respond to emergency situations', 'ri:alarm-warning-line', 5),
    ('resident_directory', 'Resident Directory', 'guard_hub', 'GUARD', 1, 
     'Look up resident information for verification', 'ri:contacts-book-line', 6)
ON CONFLICT (slug, user_type) DO NOTHING;
