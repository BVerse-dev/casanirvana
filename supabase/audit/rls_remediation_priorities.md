# RLS Remediation Priorities

Prioritized by financial then PII exposure, using table-name heuristics.

| priority | category | table |
| --- | --- | --- |
| 1 | financial | agency_billing |
| 2 | financial | agency_transactions |
| 3 | financial | airtime_purchases |
| 4 | financial | data_purchases |
| 5 | financial | insurance_payments |
| 6 | financial | marketplace_cart_items |
| 7 | financial | marketplace_order_items |
| 8 | financial | marketplace_orders |
| 9 | financial | money_transfers |
| 10 | financial | payment_fees |
| 11 | financial | shopping_payments |
| 12 | pii | agency_configurations |
| 13 | pii | agency_documents |
| 14 | pii | agency_services |
| 15 | pii | community_amenities |
| 16 | pii | email_notifications |
| 17 | pii | group_messages |
| 18 | pii | guard_certifications |
| 19 | pii | guard_equipment |
| 20 | pii | guard_id_mapping |
| 21 | pii | guard_performance |
| 22 | pii | guard_schedules |
| 23 | pii | guard_shifts |
| 24 | pii | guard_training |
| 25 | pii | guard_trainings |
| 26 | other | app_extensions |
| 27 | other | application_settings |
| 28 | other | document_categories |
| 29 | other | equipment_assignments |
| 30 | other | equipment_id_mapping |
| 31 | other | equipment_maintenance |
| 32 | other | groups |
| 33 | other | marketplace_categories |
| 34 | other | marketplace_favorites |
| 35 | other | marketplace_products |
| 36 | other | marketplace_reviews |
| 37 | other | marketplace_search_history |
| 38 | other | marketplace_vendors |
| 39 | other | training_programs |
| 40 | other | translations |