# Policy Smell Report

Flags policies where `qual` or `with_check` contain `true`, `auth.uid() IS NOT NULL`, or `auth.role() = 'authenticated'`.

Total flagged policies: 158

| table | policy | cmd | roles | smells |
| --- | --- | --- | --- | --- |
| activity_logs | activity_logs_insert | INSERT | {authenticated} | with_check:true |
| admin_onboarding_requests | admin_onboarding_requests_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| agency_profiles | Allow all operations on agency_profiles | ALL | {authenticated} | qual:true, with_check:true |
| agency_staff | Allow read for all | SELECT | {authenticated} | qual:true |
| amenities | allow_anon_read_amenities | SELECT | {authenticated} | qual:true |
| amenities | allow_authenticated_all_amenities | ALL | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| amenity_bookings | service_role_full_access | ALL | {authenticated} | with_check:true |
| amenity_bookings | user_update_pending | UPDATE | {authenticated} | with_check:true |
| app_languages | Allow read access to app languages | SELECT | {public} | qual:true |
| app_settings | Allow all operations on app_settings | ALL | {authenticated} | qual:true, with_check:true |
| app_settings | Allow read access to app settings | SELECT | {authenticated} | qual:true |
| app_static_content | select_policy | SELECT | {public} | qual:true |
| bill_payments | Service role full access bill payments | ALL | {service_role} | qual:true, with_check:true |
| calls | Guards can insert calls | INSERT | {authenticated} | with_check:true |
| calls | guards_can_insert_calls | INSERT | {authenticated} | with_check:true |
| calls | guards_can_update_own_calls | UPDATE | {authenticated} | qual:true, with_check:true |
| chat_messages | Allow all chat message operations | ALL | {authenticated} | qual:true, with_check:true |
| chat_participants | Allow all chat participants operations | ALL | {authenticated} | qual:true, with_check:true |
| chat_participants | Users can insert chat participants | INSERT | {authenticated} | with_check:true |
| chat_participants | Users can update their own participation | UPDATE | {authenticated} | with_check:true |
| chat_settings | Users can update their own settings | UPDATE | {authenticated} | with_check:true |
| chats | Allow all chat operations | ALL | {authenticated} | qual:true, with_check:true |
| chats | Users can create chats | INSERT | {authenticated} | with_check:true |
| comments | Authenticated users can insert comments | INSERT | {authenticated} | with_check:true |
| comments | Comments are viewable by everyone | SELECT | {authenticated} | qual:true |
| comments | Users can delete their own comments | DELETE | {authenticated} | qual:true |
| comments | Users can update their own comments | UPDATE | {authenticated} | qual:true, with_check:true |
| communities | Societies are viewable by everyone | SELECT | {authenticated} | qual:true |
| communities | Super admin access | ALL | {authenticated} | with_check:true |
| communities | authenticated_read_societies | SELECT | {authenticated} | qual:true |
| community_admins | Society admin relationships viewable by all users | SELECT | {authenticated} | qual:true |
| community_budget_items | Enable anonymous read access for budget items | SELECT | {authenticated} | qual:true |
| community_budget_items | Enable delete for authenticated users | DELETE | {authenticated} | qual:auth.role() = authenticated |
| community_budget_items | Enable insert for authenticated users | INSERT | {authenticated} | with_check:auth.role() = authenticated |
| community_budget_items | Enable read access for authenticated users | SELECT | {authenticated} | qual:auth.role() = authenticated |
| community_budget_items | Enable update for authenticated users | UPDATE | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| community_configurations | Anonymous read access to society_configurations | SELECT | {authenticated} | qual:true |
| community_configurations | Authenticated full access to society_configurations | ALL | {authenticated} | qual:true, with_check:true |
| community_documents | Anonymous read access to society_documents | SELECT | {authenticated} | qual:true |
| community_documents | Authenticated full access to society_documents | ALL | {authenticated} | qual:true, with_check:true |
| community_financial_records | Enable anonymous read access for financial records | SELECT | {authenticated} | qual:true |
| community_financial_records | Enable delete for authenticated users | DELETE | {authenticated} | qual:auth.role() = authenticated |
| community_financial_records | Enable insert for authenticated users | INSERT | {authenticated} | with_check:auth.role() = authenticated |
| community_financial_records | Enable read access for authenticated users | SELECT | {authenticated} | qual:auth.role() = authenticated |
| community_financial_records | Enable update for authenticated users | UPDATE | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| community_module_overrides | community_overrides_read_policy | SELECT | {authenticated} | qual:true |
| community_services | Allow all operations for authenticated users | ALL | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| community_services | Allow anonymous read access to society services | SELECT | {authenticated} | qual:true |
| community_staff | Enable anonymous read access for society_staff | SELECT | {authenticated} | qual:true |
| complaint_comments | Users can read all complaint comments | SELECT | {authenticated} | qual:true |
| complaints | Allow users to update own complaints | UPDATE | {authenticated} | with_check:true |
| complaints | allow_users_insert_complaints | INSERT | {authenticated} | with_check:auth.uid() IS NOT NULL |
| complaints | authenticated_read_complaints | SELECT | {authenticated} | qual:true |
| email_notification_settings | Allow all operations for authenticated users | ALL | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| emergency_alerts | Enable delete for authenticated users | DELETE | {authenticated} | qual:auth.role() = authenticated |
| emergency_alerts | Enable insert for authenticated users | INSERT | {authenticated} | with_check:auth.role() = authenticated |
| emergency_alerts | Enable read access for all users | SELECT | {authenticated} | qual:true |
| emergency_alerts | Enable update for authenticated users | UPDATE | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| emergency_types | Allow read access to emergency types | SELECT | {public} | qual:true |
| group_members | group_members_select_policy | SELECT | {authenticated} | qual:true |
| guards | Allow guard profile creation during registration | INSERT | {authenticated} | with_check:true |
| guards | Guards are viewable by society members | SELECT | {authenticated} | qual:true |
| in_app_notification_metrics | in_app_notification_metrics_insert | INSERT | {authenticated} | with_check:true |
| in_app_notification_metrics | in_app_notification_metrics_select | SELECT | {authenticated} | qual:true |
| in_app_notification_recipients | in_app_notification_recipients_insert | INSERT | {authenticated} | with_check:true |
| in_app_notification_recipients | in_app_notification_recipients_select | SELECT | {authenticated} | qual:true |
| in_app_notification_settings | Allow all operations for authenticated users | ALL | {authenticated} | qual:auth.role() = authenticated, with_check:true |
| in_app_notifications | in_app_notifications_delete | DELETE | {authenticated} | qual:true |
| in_app_notifications | in_app_notifications_insert | INSERT | {authenticated} | with_check:true |
| in_app_notifications | in_app_notifications_select | SELECT | {authenticated} | qual:true |
| in_app_notifications | in_app_notifications_update | UPDATE | {authenticated} | qual:true, with_check:true |
| inquiries | Users can update their own inquiries | UPDATE | {authenticated} | with_check:true |
| join_request_email_queue | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| join_request_sms_queue | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| maintenance_requests | Users can resolve maintenance requests | UPDATE | {authenticated} | qual:true, with_check:true |
| maintenance_requests | maintenance_requests_update | UPDATE | {authenticated} | with_check:true |
| marketplace_cart_items | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_categories | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_favorites | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_order_items | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_orders | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_products | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_reviews | marketplace_reviews_owner_update | UPDATE | {authenticated} | with_check:true |
| marketplace_reviews | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_search_history | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| marketplace_vendors | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| module_settings | module_settings_read_policy | SELECT | {authenticated} | qual:true |
| notices | anon_read_notices | SELECT | {authenticated} | qual:true |
| notices | authenticated_read_notices | SELECT | {authenticated} | qual:true |
| notification_analytics | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| notification_campaigns | notification_campaigns_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| notification_channel_configs | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| notification_logs | Service role can manage all notification logs | ALL | {authenticated} | with_check:true |
| notification_metrics | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| notification_rules | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| notification_templates | Public access for development | ALL | {authenticated} | qual:true, with_check:true |
| notification_templates | Super admin access | ALL | {authenticated} | with_check:true |
| notifications | System can insert notifications | INSERT | {authenticated} | with_check:true |
| payment_settings | Super admin access | ALL | {authenticated} | with_check:true |
| payment_statements | Public read access to payment_statements | SELECT | {authenticated} | qual:true |
| payments | Public read access to payments | SELECT | {authenticated} | qual:true |
| payments | Users can update payments for their unit | UPDATE | {authenticated} | qual:true, with_check:true |
| payments | authenticated_read_payments | SELECT | {authenticated} | qual:true |
| payments | user can create payments | ALL | {authenticated} | qual:true |
| permissions | Allow authenticated users to read permissions | SELECT | {authenticated} | qual:true |
| preference_categories | preference_categories_read_policy | SELECT | {authenticated} | qual:true |
| preference_categories | preference_categories_superadmin_policy | ALL | {authenticated} | with_check:true |
| preference_categories | user_read_preference_categories | SELECT | {authenticated} | qual:true |
| preference_settings | preference_settings_read_policy | SELECT | {authenticated} | qual:true |
| preference_settings | preference_settings_superadmin_policy | ALL | {authenticated} | with_check:true |
| preference_settings | user_read_preference_settings | SELECT | {authenticated} | qual:true |
| profiles | Authenticated users can view all profiles for messaging | SELECT | {authenticated} | qual:true |
| profiles | Enable insert for authenticated users only | INSERT | {authenticated} | with_check:true |
| profiles | Public profiles are viewable by everyone | SELECT | {authenticated} | qual:true |
| profiles | Service role full access | ALL | {service_role} | qual:true, with_check:true |
| push_notification_audiences | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| push_notification_devices | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| push_notification_templates | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| push_notifications | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| role_permissions | Allow authenticated users to read role permissions | SELECT | {authenticated} | qual:true |
| service_bookings | Enable insert for authenticated users only | ALL | {authenticated} | qual:true |
| service_requests | Super admin access | ALL | {authenticated} | with_check:true |
| service_requests | authenticated_read_service_requests | SELECT | {authenticated} | qual:true |
| service_requests | public_read_service_requests | SELECT | {authenticated} | qual:true |
| services | authenticated_read_services | SELECT | {authenticated} | qual:true |
| services | public_read_services | SELECT | {authenticated} | qual:true |
| settings | Super admin access | ALL | {authenticated} | with_check:true |
| settings | Users update own settings | UPDATE | {authenticated} | with_check:true |
| settings | authenticated_read_settings | SELECT | {authenticated} | qual:true |
| shift_patterns | Shift patterns are viewable by everyone | SELECT | {authenticated} | qual:true |
| sms_analytics | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| sms_credits | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| sms_notification_recipients | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| sms_notifications | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| sms_recipient_groups | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| sms_templates | service_role_all | ALL | {service_role} | qual:true, with_check:true |
| system_activities | system_activities_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| system_alerts | system_alerts_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| system_components | system_components_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| system_overview | system_overview_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| system_performance | system_performance_service_role_all | ALL | {service_role} | qual:true, with_check:true |
| units | Allow insert for all authenticated users | INSERT | {authenticated} | with_check:true |
| units | Allow read access for all authenticated users | SELECT | {authenticated} | qual:true |
| units | Super admin access | ALL | {authenticated} | with_check:true |
| units | Units are viewable by everyone | SELECT | {authenticated} | qual:true |
| units | authenticated_read_units | SELECT | {authenticated} | qual:true |
| user_groups | user_groups_select_policy | SELECT | {authenticated} | qual:true |
| user_groups | user_groups_update_policy | UPDATE | {authenticated} | with_check:true |
| user_payment_methods | Users can update their own payment methods | UPDATE | {authenticated} | with_check:true |
| user_preference_values | user_preference_values_superadmin_policy | ALL | {authenticated} | with_check:true |
| user_roles | user_roles_read_policy | SELECT | {authenticated} | qual:true |
| users | Admin can manage users | ALL | {supabase_admin} | qual:true, with_check:true |
| users | Allow profile access for auth users | SELECT | {authenticated} | qual:auth.uid() IS NOT NULL |
| users | Allow viewing user roles for complaints | SELECT | {authenticated} | qual:auth.uid() IS NOT NULL |
| users | Service role can manage users | ALL | {service_role} | qual:true, with_check:true |
| visitor_passes | Guards can create visitor passes for their assigned society | INSERT | {authenticated} | with_check:true |
| visitor_passes | Guards can update visitor pass status | UPDATE | {authenticated} | qual:true, with_check:true |
| visitor_passes | authenticated_read_visitor_passes | SELECT | {authenticated} | qual:true |