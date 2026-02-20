Universal Professional Application Architecture Guide
Purpose: A comprehensive, language-agnostic implementation guide for building or restructuring applications to follow industry-standard patterns used by leading professional applications. Based on deep analysis of production-grade fintech architecture.

Table of Contents
Core Architecture Principles
Project Organization Standard
Modular Feature System
API-First Architecture
Security Architecture
Configuration & Settings Management
Multi-Role Access Control
State Management Patterns
Data Layer Architecture
Notification & Communication System
Scalability Patterns
Implementation Checklist
1. Core Architecture Principles
1.1 Separation of Concerns
Professional applications maintain strict boundaries between:

Layer	Responsibility	Examples
Presentation	UI/Views only, no business logic	Screens, Components, Widgets
Controller/ViewModel	Orchestrates data flow, handles user actions	Controllers, ViewModels, Presenters
Service/Business Logic	Core business rules, validation	Services, Use Cases, Interactors
Data Access	Database queries, API calls	Repositories, DAOs, API Clients
Infrastructure	External integrations	Payment gateways, Email providers
IMPORTANT

Never mix layers. A view should never directly access the database. A repository should never contain UI logic.

1.2 Dependency Direction
Presentation → Controller → Service → Repository → Database/API
      ↓              ↓           ↓            ↓
   Depends on    Depends on   Depends on   Implements
   lower layers  lower layers lower layers interfaces
1.3 Single Responsibility Principle
Each module, class, and function should have ONE clear purpose:

❌ BAD: UserController handles authentication, profile, payments, and notifications
✅ GOOD: Separate controllers for Auth, Profile, Payment, Notification
2. Project Organization Standard
2.1 Backend/Admin Panel Structure
project/
├── app/                          # Application core
│   ├── Constants/                # Status codes, enums
│   │   └── Status.php           # Centralized status definitions
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Admin-specific controllers
│   │   │   │   ├── Auth/        # Admin authentication
│   │   │   │   ├── ManageUsersController.php
│   │   │   │   ├── ModuleSettingController.php
│   │   │   │   └── GeneralSettingController.php
│   │   │   ├── Api/             # Mobile/external API controllers
│   │   │   │   ├── Auth/
│   │   │   │   ├── AppController.php
│   │   │   │   └── UserController.php
│   │   │   ├── User/            # Web user controllers
│   │   │   └── Gateway/         # Payment gateway handlers
│   │   ├── Middleware/          # Request interceptors
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckStatus.php
│   │   │   ├── KycMiddleware.php
│   │   │   ├── Module.php       # Feature flag checker
│   │   │   └── TokenPermission.php
│   │   └── Helpers/
│   │       └── helpers.php      # Global utility functions
│   ├── Models/                  # Database models
│   │   ├── User.php
│   │   ├── GeneralSetting.php   # App-wide settings
│   │   └── ModuleSetting.php    # Feature toggles
│   ├── Providers/               # Service providers
│   ├── Services/                # Business logic services
│   ├── Traits/                  # Reusable model behaviors
│   └── Notify/                  # Notification handlers
├── config/                      # Configuration files
│   ├── app.php
│   ├── permission.php           # Role/permission definitions
│   └── services.php             # Third-party service configs
├── database/
│   ├── migrations/              # Schema changes
│   ├── seeders/                 # Initial data
│   └── factories/               # Test data generators
├── routes/
│   ├── admin.php               # Admin panel routes
│   ├── api/
│   │   └── api.php             # Mobile app API routes
│   ├── user.php                # Web user routes
│   └── web.php                 # Public web routes
└── resources/
    └── views/
        ├── admin/              # Admin panel views
        └── templates/          # User-facing templates
2.2 Mobile/Frontend App Structure
lib/                             # or src/ for web frameworks
├── main.dart                    # Entry point
├── environment.dart             # Environment configuration
├── app/
│   ├── components/              # Reusable UI components
│   │   ├── buttons/
│   │   ├── cards/
│   │   ├── forms/
│   │   └── snack_bar/
│   ├── packages/                # Feature packages
│   │   └── payment/
│   └── screens/                 # Screen modules (by feature)
│       ├── auth/
│       │   ├── login_screen.dart
│       │   ├── register_screen.dart
│       │   └── controller/
│       ├── dashboard/
│       │   ├── dashboard_screen.dart
│       │   └── widgets/
│       ├── profile/
│       └── [feature_name]/
└── core/
    ├── data/
    │   ├── controller/          # State management controllers
    │   │   └── general_settings/
    │   ├── middleware/          # API interceptors
    │   ├── models/              # Data models (mirror API responses)
    │   │   ├── auth/
    │   │   ├── global/
    │   │   └── modules/
    │   ├── repositories/        # Data access layer
    │   │   ├── auth/
    │   │   └── modules/
    │   └── services/            # API clients, storage, etc.
    ├── di_service/              # Dependency injection
    ├── helper/                  # Utility functions
    ├── route/                   # Navigation/routing
    └── utils/                   # Constants, themes, extensions
2.3 Naming Conventions
Type	Convention	Example
Files	snake_case	user_controller.dart, 
ModuleSettingController.php
Classes	PascalCase	UserController, 
GeneralSetting
Functions	camelCase	getUserProfile(), validatePin()
Constants	UPPER_SNAKE_CASE	STATUS_ACTIVE, MAX_RETRY
Database Tables	plural snake_case	users, module_settings
Folders	snake_case	profile_screen/, auth/
3. Modular Feature System
3.1 Feature Toggle Architecture
Professional applications implement features as toggleable modules:

┌─────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Module Settings Table                           │   │
│  │  ┌────────────┬──────────┬────────────────────┐ │   │
│  │  │ module_slug│ user_type│ status             │ │   │
│  │  ├────────────┼──────────┼────────────────────┤ │   │
│  │  │ send_money │ USER     │ enabled (1)        │ │   │
│  │  │ send_money │ AGENT    │ disabled (0)       │ │   │
│  │  │ virtual    │ USER     │ enabled (1)        │ │   │
│  │  │ _card      │          │                    │ │   │
│  │  └────────────┴──────────┴────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ API Endpoint
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    USER APP                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  On App Launch:                                  │   │
│  │  1. Fetch /api/module-setting                   │   │
│  │  2. Store in local state                        │   │
│  │  3. Conditionally render features               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
3.2 Module Setting Model
-- Database Schema
CREATE TABLE module_settings (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    slug        VARCHAR(100) NOT NULL,      -- e.g., 'send_money', 'cash_out'
    name        VARCHAR(255) NOT NULL,      -- e.g., 'Send Money'
    user_type   ENUM('USER', 'AGENT', 'MERCHANT', 'ADMIN'),
    status      TINYINT DEFAULT 1,          -- 0 = disabled, 1 = enabled
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP,
    
    UNIQUE KEY unique_module_user (slug, user_type)
);
3.3 Module Middleware Pattern
// Pseudo-code (applicable to any backend framework)
class ModuleMiddleware:
    function handle(request, next, moduleSlug):
        // 1. Get current user type (USER, AGENT, MERCHANT)
        userType = determineUserType(request)
        
        // 2. Query module status
        module = ModuleSetting.findBy(slug: moduleSlug, user_type: userType)
        
        // 3. Check if enabled
        if module.status == DISABLED:
            if request.isApiRequest():
                return JsonResponse(
                    status: "error",
                    message: "This module is currently disabled"
                )
            else:
                return NotFoundPage()
        
        // 4. Proceed to controller
        return next(request)
3.4 Route-Level Module Protection
// Example route definitions with module middleware
// API Routes
Route.group(prefix: '/api', middleware: ['auth:sanctum']):
    
    // Send Money - protected by module flag
    Route.group(prefix: '/send-money', middleware: ['module:send_money', 'kyc']):
        Route.get('/', SendMoneyController.create)
        Route.post('/store', SendMoneyController.store)
        Route.get('/history', SendMoneyController.history)
    
    // Cash Out - protected by module flag
    Route.group(prefix: '/cash-out', middleware: ['module:cash_out', 'kyc']):
        Route.get('/create', CashOutController.create)
        Route.post('/store', CashOutController.store)
    
    // Virtual Card - protected by module flag
    Route.group(prefix: '/virtual-card', middleware: ['module:virtual_card']):
        Route.get('/list', VirtualCardController.list)
3.5 Frontend Module Integration
// Fetch and cache module settings on app initialization
class ModuleSettingService:
    moduleSettings = {}
    
    async function fetchModuleSettings():
        response = await API.get('/module-setting')
        moduleSettings = response.data.module_setting
        localStorage.set('modules', moduleSettings)
    
    function isModuleEnabled(slug):
        userModules = moduleSettings['user'] ?? []
        module = userModules.find(m => m.slug == slug)
        return module?.status == 1
// In UI Components
if (ModuleSettingService.isModuleEnabled('send_money')):
    showSendMoneyButton()
else:
    hideOrDisableFeature()
4. API-First Architecture
4.1 Standard API Response Format
All API responses should follow a consistent structure:

{
    "remark": "operation_identifier",
    "status": "success|error",
    "message": ["Human-readable message"],
    "data": {
        // Response payload
    }
}
4.2 Helper Function for Responses
function apiResponse(remark, status, message = [], data = [], statusCode = 200):
    response = {
        "remark": remark,
        "status": status
    }
    
    if message.length > 0:
        response["message"] = message
    
    if data.length > 0:
        response["data"] = data
    
    return JsonResponse(response, statusCode)
// Usage examples:
return apiResponse("user_created", "success", ["Account created successfully"], {user: userData})
return apiResponse("validation_failed", "error", ["Invalid email address"], [], 422)
4.3 API Versioning Strategy
routes/
├── api/
│   ├── v1/
│   │   └── api.php
│   └── v2/
│       └── api.php
// Route registration
Route.group(prefix: '/api/v1', middleware: ['api']):
    include('routes/api/v1/api.php')
Route.group(prefix: '/api/v2', middleware: ['api']):
    include('routes/api/v2/api.php')
4.4 Endpoint Naming Conventions
Action	HTTP Method	Endpoint	Example
List all	GET	/resource	GET /users
Get one	GET	/resource/{id}	GET /users/123
Create	POST	/resource	POST /users
Update	PUT/PATCH	/resource/{id}	PUT /users/123
Delete	DELETE	/resource/{id}	DELETE /users/123
Custom action	POST	/resource/{id}/action	POST /users/123/activate
5. Security Architecture
5.1 Multi-Layer Security Model
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Transport Security                                │
│  ├── Force HTTPS/SSL                                       │
│  ├── HSTS Headers                                          │
│  └── Certificate Pinning (mobile)                          │
├────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication                                    │
│  ├── Token-based (JWT, Bearer, Sanctum)                    │
│  ├── Refresh token rotation                                │
│  ├── Device fingerprinting                                 │
│  └── Session management                                    │
├────────────────────────────────────────────────────────────┤
│  Layer 3: Authorization                                     │
│  ├── Role-based access control (RBAC)                      │
│  ├── Permission middleware                                 │
│  ├── Resource-level authorization                          │
│  └── Module-level access control                           │
├────────────────────────────────────────────────────────────┤
│  Layer 4: Verification                                      │
│  ├── Email verification                                    │
│  ├── Mobile verification                                   │
│  ├── KYC verification                                      │
│  ├── Two-factor authentication (2FA/G2FA)                  │
│  └── PIN verification for sensitive actions                │
├────────────────────────────────────────────────────────────┤
│  Layer 5: Input Validation                                  │
│  ├── Request validation                                    │
│  ├── Sanitization                                          │
│  ├── Rate limiting                                         │
│  └── CAPTCHA for public forms                              │
├────────────────────────────────────────────────────────────┤
│  Layer 6: Audit & Monitoring                                │
│  ├── Login history tracking                                │
│  ├── Action audit logs                                     │
│  ├── IP tracking                                           │
│  └── Anomaly detection                                     │
└────────────────────────────────────────────────────────────┘
5.2 Middleware Chain Example
// Route with full security chain
Route.group(
    prefix: '/api',
    middleware: [
        'auth:sanctum',              // Layer 2: Authentication
        'token.permission:user',     // Layer 3: Token type check
        'mobile.verify',             // Layer 4: Phone verified
        'registration.complete',     // Layer 4: Profile complete
        'check.status',              // Layer 3: Account not banned
    ]
):
    Route.group(middleware: ['kyc']): // Layer 3: KYC verified
        Route.post('/send-money', SendMoneyController.store)
5.3 General Settings Security Flags
-- Settings table with security-related flags
CREATE TABLE general_settings (
    id                    BIGINT PRIMARY KEY,
    
    -- Security toggles (0 = off, 1 = on)
    force_ssl            TINYINT DEFAULT 1,
    secure_password      TINYINT DEFAULT 1,
    registration         TINYINT DEFAULT 1,       -- Allow new registrations
    otp_verification     TINYINT DEFAULT 1,
    maintenance_mode     TINYINT DEFAULT 0,
    
    -- Verification requirements
    kv                   TINYINT DEFAULT 0,       -- User KYC required
    ev                   TINYINT DEFAULT 1,       -- Email verification
    sv                   TINYINT DEFAULT 0,       -- SMS verification
    
    -- Notifications enabled
    en                   TINYINT DEFAULT 1,       -- Email notifications
    sn                   TINYINT DEFAULT 1,       -- SMS notifications
    pn                   TINYINT DEFAULT 1,       -- Push notifications
    
    -- OTP settings
    otp_expiration       INT DEFAULT 300,         -- Seconds
    supported_otp_type   JSON,                    -- ['email', 'sms', 'both']
    
    -- PIN settings
    user_pin_digits      TINYINT DEFAULT 4
);
5.4 Input Validation Pattern
// Request validation class
class StoreSendMoneyRequest extends FormRequest:
    rules():
        return {
            'recipient':    'required|exists:users,username',
            'amount':       'required|numeric|min:1|max:100000',
            'pin':          'required|digits:4',
            'note':         'nullable|string|max:255'
        }
    
    messages():
        return {
            'recipient.required': 'Please enter recipient username',
            'amount.min': 'Minimum amount is 1',
        }
// Controller usage
class SendMoneyController:
    function store(StoreSendMoneyRequest request):
        // Validation already passed, safe to proceed
        validated = request.validated()
        // Process send money...
5.5 Rate Limiting Configuration
// Rate limit definitions
RateLimiter.define('api', function(request):
    return Limit.perMinute(60).by(request.user()?.id or request.ip())
)
RateLimiter.define('authentication', function(request):
    return Limit.perMinute(5).by(request.ip())
)
RateLimiter.define('otp', function(request):
    return Limit.perMinute(3).by(request.user()?.id or request.ip())
)
// Apply to routes
Route.post('/login', AuthController.login).middleware('throttle:authentication')
Route.post('/resend-otp', OtpController.resend).middleware('throttle:otp')
6. Configuration & Settings Management
6.1 Centralized Settings Pattern
// Global settings helper function
function gs(key = null):
    // Try cache first
    settings = Cache.get('GeneralSetting')
    
    if not settings:
        settings = GeneralSetting.first()
        Cache.put('GeneralSetting', settings)
    
    if key:
        return settings[key]
    
    return settings
// Usage throughout application
siteName = gs('site_name')
currencySymbol = gs('cur_sym')
isMaintenanceMode = gs('maintenance_mode')
6.2 Settings Cache Invalidation
// Model boot method - auto-clear cache on save
class GeneralSetting extends Model:
    static boot():
        parent.boot()
        
        static.saved(function():
            Cache.forget('GeneralSetting')
        )
6.3 Environment-Based Configuration
# .env file structure
APP_NAME="My Application"
APP_ENV=production
APP_DEBUG=false
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=secret
# API Keys (NEVER commit to version control)
PAYMENT_API_KEY=xxxxx
SMS_API_KEY=xxxxx
PUSH_NOTIFICATION_KEY=xxxxx
# Feature Flags
FEATURE_NEW_DASHBOARD=false
FEATURE_BETA_PAYMENTS=false
6.4 Admin-Controlled Configuration Flow
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  General Settings                                    │   │
│  │  ├── Site Name: [___________]                       │   │
│  │  ├── Currency: [___] Symbol: [_]                    │   │
│  │  ├── Base Color: [#______]                          │   │
│  │  └── [Save Changes]                                 │   │
│  │                                                      │   │
│  │  System Configuration (Toggles)                     │   │
│  │  ├── ☑ Force SSL                                   │   │
│  │  ├── ☑ Email Verification                          │   │
│  │  ├── ☐ SMS Verification                            │   │
│  │  ├── ☑ Allow Registration                          │   │
│  │  └── ☐ Maintenance Mode                            │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼ Stores in general_settings table
                             │
                             ▼ Cache cleared automatically
                             │
                             ▼ Next API call fetches fresh settings
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Mobile App                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GET /api/general-setting                           │   │
│  │  Response:                                          │   │
│  │  {                                                  │   │
│  │    "site_name": "My App",                          │   │
│  │    "cur_sym": "$",                                 │   │
│  │    "base_color": "FF5733",                         │   │
│  │    "maintenance_mode": 0                           │   │
│  │  }                                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
7. Multi-Role Access Control
7.1 Role Hierarchy
┌─────────────────────────────────────────────────────────────┐
│  SUPER ADMIN                                                 │
│  ├── Full system access                                     │
│  ├── Can create/manage other admins                        │
│  └── Can assign roles and permissions                      │
├─────────────────────────────────────────────────────────────┤
│  ADMIN (Role-based)                                         │
│  ├── Permissions assigned via role                         │
│  ├── Example roles: Support, Finance, Marketing            │
│  └── Limited to assigned permissions                       │
├─────────────────────────────────────────────────────────────┤
│  MERCHANT                                                    │
│  ├── Business account type                                 │
│  ├── Can receive payments                                  │
│  ├── Has own panel/dashboard                               │
│  └── Separate authentication guard                         │
├─────────────────────────────────────────────────────────────┤
│  AGENT                                                       │
│  ├── Intermediary account type                             │
│  ├── Can perform cash-in/cash-out                          │
│  ├── Earns commissions                                     │
│  └── Separate authentication guard                         │
├─────────────────────────────────────────────────────────────┤
│  USER                                                        │
│  ├── Standard end-user                                     │
│  ├── Access based on module settings                       │
│  └── Subject to KYC/verification requirements              │
└─────────────────────────────────────────────────────────────┘
7.2 Permission-Based Route Protection
// Permission configuration file
permissions = {
    // User management
    'view users':          'Can view user list',
    'update user':         'Can update user details',
    'ban user':            'Can ban/unban users',
    'update user balance': 'Can add/subtract user balance',
    
    // Transaction management
    'view transactions':   'Can view transactions',
    'approve transactions': 'Can approve pending transactions',
    
    // Settings
    'update general settings': 'Can modify general settings',
    'module settings':         'Can toggle modules on/off',
    
    // Support
    'view tickets':        'Can view support tickets',
    'answer tickets':      'Can respond to tickets',
}
// Route with permission middleware
Route.group(middleware: ['admin', 'permission:view users,admin']):
    Route.get('/users', ManageUsersController.allUsers)
Route.group(middleware: ['admin', 'permission:update user,admin']):
    Route.post('/users/{id}/update', ManageUsersController.update)
7.3 Multiple Authentication Guards
// Auth configuration
guards = {
    'web': {
        driver: 'session',
        provider: 'users'
    },
    'admin': {
        driver: 'session',
        provider: 'admins'
    },
    'agent': {
        driver: 'session',
        provider: 'agents'
    },
    'merchant': {
        driver: 'session',
        provider: 'merchants'
    },
    'api': {
        driver: 'sanctum',  // Token-based for mobile
        provider: 'users'
    }
}
providers = {
    'users':     { driver: 'eloquent', model: User },
    'admins':    { driver: 'eloquent', model: Admin },
    'agents':    { driver: 'eloquent', model: Agent },
    'merchants': { driver: 'eloquent', model: Merchant }
}
7.4 Separate Route Files per Role
routes/
├── web.php        # Public routes
├── admin.php      # Admin panel routes (guard: admin)
├── user.php       # User web routes (guard: web)
├── agent.php      # Agent panel routes (guard: agent)
├── merchant.php   # Merchant panel routes (guard: merchant)
└── api/
    └── api.php    # Mobile API routes (guard: sanctum)
// Route service provider
Route.middleware('web').group('routes/web.php')
Route.prefix('admin').name('admin.').group('routes/admin.php')
Route.prefix('agent').name('agent.').middleware('agent').group('routes/agent.php')
Route.prefix('api').middleware('api').group('routes/api/api.php')
8. State Management Patterns
8.1 Controller-Based State (GetX Pattern)
// Controller definition
class DashboardController extends Controller:
    // Observable state
    isLoading = false
    userData = null
    transactions = []
    
    // Lifecycle
    onInit():
        loadDashboardData()
    
    async function loadDashboardData():
        isLoading = true
        update()  // Notify listeners
        
        try:
            response = await repository.getDashboard()
            if response.status == 'success':
                userData = response.data.user
                transactions = response.data.recent_transactions
        catch (error):
            showError(error.message)
        finally:
            isLoading = false
            update()  // Notify listeners
// Usage in UI
GetBuilder<DashboardController>(
    builder: (controller) =>
        if controller.isLoading:
            return LoadingSpinner()
        else:
            return DashboardContent(
                user: controller.userData,
                transactions: controller.transactions
            )
)
8.2 Repository Pattern for Data Access
// Repository interface
abstract class UserRepository:
    Future<User> getUser(int id)
    Future<List<Transaction>> getTransactions()
    Future<Response> updateProfile(ProfileData data)
// Repository implementation
class UserRepositoryImpl implements UserRepository:
    apiService: ApiService
    
    async function getUser(int id):
        response = await apiService.get('/users/{id}')
        return UserModel.fromJson(response.data.user)
    
    async function getTransactions():
        response = await apiService.get('/transactions')
        return response.data.transactions.map(t => Transaction.fromJson(t))
8.3 Dependency Injection Setup
// DI initialization
async function initDependency():
    // Services (singletons)
    register(ApiService(), permanent: true)
    register(StorageService(), permanent: true)
    register(NotificationService(), permanent: true)
    
    // Repositories
    register(UserRepository(get<ApiService>()))
    register(TransactionRepository(get<ApiService>()))
    
    // Controllers (lazy loaded)
    registerLazy(() => DashboardController(repo: get<UserRepository>()))
    registerLazy(() => ProfileController(repo: get<UserRepository>()))
// Usage
controller = Get.find<DashboardController>()
9. Data Layer Architecture
9.1 Model Structure (Mirroring API)
// API Response
{
    "remark": "user_profile",
    "status": "success",
    "data": {
        "user": {
            "id": 123,
            "username": "john_doe",
            "email": "john@example.com",
            "balance": "1000.00",
            "kv": 1,            // KYC verified
            "ev": 1,            // Email verified
            "sv": 0,            // SMS not verified
            "created_at": "2024-01-15T10:30:00Z"
        }
    }
}
// Corresponding Model
class UserModel:
    int? id
    String? username
    String? email
    String? balance
    String? kv
    String? ev
    String? sv
    String? createdAt
    
    factory UserModel.fromJson(Map<String, dynamic> json):
        return UserModel(
            id: json['id'],
            username: json['username']?.toString(),
            email: json['email']?.toString(),
            balance: json['balance']?.toString(),
            kv: json['kv']?.toString(),
            ev: json['ev']?.toString(),
            sv: json['sv']?.toString(),
            createdAt: json['created_at']?.toString(),
        )
    
    Map<String, dynamic> toJson():
        return {
            'id': id,
            'username': username,
            'email': email,
            // ...
        }
    
    // Helper getters
    bool get isKycVerified => kv == '1'
    bool get isEmailVerified => ev == '1'
    double get balanceAsDouble => double.tryParse(balance ?? '0') ?? 0
9.2 Transaction Flow Pattern
// For financial or state-changing operations, always use transactions
async function transferMoney(senderId, recipientId, amount):
    return Database.transaction(async (trx) => {
        // 1. Validate sender has sufficient balance
        sender = await User.find(senderId).forUpdate(trx)
        if sender.balance < amount:
            throw InsufficientBalanceException()
        
        // 2. Debit sender
        sender.balance -= amount
        await sender.save(trx)
        
        // 3. Credit recipient
        recipient = await User.find(recipientId).forUpdate(trx)
        recipient.balance += amount
        await recipient.save(trx)
        
        // 4. Create transaction records
        await Transaction.create({
            user_id: senderId,
            amount: -amount,
            trx_type: 'DEBIT',
            remark: 'send_money'
        }, trx)
        
        await Transaction.create({
            user_id: recipientId,
            amount: amount,
            trx_type: 'CREDIT',
            remark: 'received_money'
        }, trx)
        
        // 5. Create charge record if applicable
        // ...
        
        return { success: true }
    })
9.3 Transaction Charge Configuration
CREATE TABLE transaction_charges (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    slug            VARCHAR(100) NOT NULL,    -- 'send_money', 'cash_out'
    name            VARCHAR(255) NOT NULL,
    
    -- Charge settings
    fixed_charge    DECIMAL(18,8) DEFAULT 0,
    percent_charge  DECIMAL(8,4) DEFAULT 0,   -- e.g., 1.50 = 1.5%
    
    -- Limits
    min_amount      DECIMAL(18,8),
    max_amount      DECIMAL(18,8),
    daily_limit     DECIMAL(18,8),
    monthly_limit   DECIMAL(18,8),
    
    cap_charge      DECIMAL(18,8),            -- Maximum charge cap
    
    UNIQUE KEY unique_slug (slug)
);
// Calculate charge helper
function calculateCharge(amount, chargeConfig):
    fixedCharge = chargeConfig.fixed_charge
    percentCharge = (amount * chargeConfig.percent_charge) / 100
    totalCharge = fixedCharge + percentCharge
    
    // Apply cap if set
    if chargeConfig.cap_charge and totalCharge > chargeConfig.cap_charge:
        totalCharge = chargeConfig.cap_charge
    
    return totalCharge
10. Notification & Communication System
10.1 Multi-Channel Notification Architecture
┌─────────────────────────────────────────────────────────────┐
│                    Notification Service                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  notify(user, templateName, shortCodes, channels)   │   │
│  │                                                      │   │
│  │  1. Load template by name                           │   │
│  │  2. Replace shortcodes with values                  │   │
│  │  3. Check user notification preferences             │   │
│  │  4. Dispatch to enabled channels                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         ▼                ▼                ▼                 │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐             │
│  │   Email   │   │    SMS    │   │   Push    │             │
│  │  Channel  │   │  Channel  │   │  Channel  │             │
│  └───────────┘   └───────────┘   └───────────┘             │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐             │
│  │  SMTP/    │   │ Twilio/   │   │ Firebase  │             │
│  │ Mailgun   │   │ Vonage    │   │   FCM     │             │
│  └───────────┘   └───────────┘   └───────────┘             │
└─────────────────────────────────────────────────────────────┘
10.2 Notification Template System
-- Notification templates table
CREATE TABLE notification_templates (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,    -- 'SEND_MONEY', 'PASSWORD_RESET'
    
    -- Email template
    email_subject    VARCHAR(255),
    email_body       TEXT,
    email_status     TINYINT DEFAULT 1,
    
    -- SMS template
    sms_body         TEXT,
    sms_status       TINYINT DEFAULT 1,
    
    -- Push notification template
    push_title       VARCHAR(255),
    push_body        TEXT,
    push_status      TINYINT DEFAULT 1,
    
    -- Shortcodes documentation
    shortcodes       JSON                  -- Available placeholders
);
-- Example template data
INSERT INTO notification_templates VALUES (
    1,
    'SEND_MONEY',
    'Money Sent Successfully - {{site_name}}',
    '<p>Dear {{username}},</p><p>You have sent {{amount}} to {{recipient}}.</p>',
    1,
    'You sent {{amount}} to {{recipient}}. TRX: {{trx}}',
    1,
    'Money Sent',
    'You sent {{amount}} to {{recipient}}',
    1,
    '["username", "amount", "recipient", "trx", "site_name"]'
);
10.3 User Notification Preferences
// User can control which notifications they receive
class User:
    en: boolean    // Email notifications enabled
    sn: boolean    // SMS notifications enabled
    pn: boolean    // Push notifications enabled
    
// Check preferences before sending
function notify(user, templateName, shortCodes, channels = ['email', 'sms', 'push']):
    
    // Filter channels based on user preferences
    if not user.en:
        channels.remove('email')
    if not user.sn:
        channels.remove('sms')
    if not user.pn:
        channels.remove('push')
    
    if channels.isEmpty():
        return  // User disabled all notifications
    
    // Proceed with sending...
    notificationService.dispatch(user, templateName, shortCodes, channels)
10.4 Real-Time Communication (Pusher/WebSocket)
// Pusher configuration
pusher_config = {
    app_id:     env('PUSHER_APP_ID'),
    app_key:    env('PUSHER_APP_KEY'),
    app_secret: env('PUSHER_APP_SECRET'),
    cluster:    env('PUSHER_CLUSTER'),
}
// Broadcasting events
class SendMoneyCompleted extends BroadcastEvent:
    channel = 'private-user.' + userId
    
    function broadcastWith():
        return {
            'type': 'send_money',
            'amount': amount,
            'recipient': recipientName,
            'new_balance': newBalance
        }
// Frontend listener
pusher.subscribe('private-user.' + userId)
pusher.bind('send_money_completed', (data) => {
    updateBalance(data.new_balance)
    showNotification('Money sent successfully!')
})
11. Scalability Patterns
11.1 Caching Strategy
// Cache layers
1. Database Query Cache (built-in ORM caching)
2. Application Cache (Redis/Memcached)
3. Response Cache (HTTP cache headers)
4. CDN Cache (for static assets)
// Caching helper
function getFromCache(key, ttl, fallback):
    cached = Cache.get(key)
    if cached:
        return cached
    
    fresh = fallback()
    Cache.put(key, fresh, ttl)
    return fresh
// Usage
settings = getFromCache('general_settings', 3600, () => GeneralSetting.first())
11.2 Background Job Processing
// Job queue for heavy operations
class ProcessWithdrawalJob extends Job:
    queue = 'withdrawals'
    tries = 3
    timeout = 120
    
    function handle():
        withdrawal = Withdrawal.find(this.withdrawalId)
        
        try:
            // Process with external payment gateway
            result = PaymentGateway.processWithdrawal(withdrawal)
            withdrawal.status = 'completed'
            withdrawal.save()
            
            // Notify user
            notify(withdrawal.user, 'WITHDRAWAL_COMPLETED', {
                amount: withdrawal.amount,
                method: withdrawal.method.name
            })
        catch (Exception e):
            withdrawal.status = 'failed'
            withdrawal.failure_reason = e.message
            withdrawal.save()
            throw e  // Will retry
// Dispatch job
ProcessWithdrawalJob.dispatch(withdrawalId)
11.3 CRON Job Management
-- Cron job configuration table
CREATE TABLE cron_jobs (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    command         VARCHAR(255) NOT NULL,    -- 'process:investments'
    schedule        VARCHAR(50) NOT NULL,     -- '0 * * * *' (hourly)
    is_active       TINYINT DEFAULT 1,
    last_run        TIMESTAMP,
    next_run        TIMESTAMP,
    last_status     ENUM('success', 'failed'),
    description     TEXT
);
-- Cron job logs
CREATE TABLE cron_job_logs (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    cron_job_id     BIGINT NOT NULL,
    started_at      TIMESTAMP,
    ended_at        TIMESTAMP,
    status          ENUM('success', 'failed'),
    output          TEXT,
    error           TEXT,
    FOREIGN KEY (cron_job_id) REFERENCES cron_jobs(id)
);
11.4 Database Optimization
-- Indexing strategy
-- 1. Primary keys (automatic)
-- 2. Foreign keys
-- 3. Frequently queried columns
-- 4. Composite indexes for common queries
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at);
CREATE INDEX idx_transactions_trx ON transactions(trx);
CREATE INDEX idx_module_settings_lookup ON module_settings(slug, user_type);
-- Partitioning for large tables
ALTER TABLE transactions PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
11.5 API Rate Limiting & Throttling
// Tiered rate limiting based on user type
rate_limits = {
    'guest':     { requests: 60,   window: '1 minute' },
    'user':      { requests: 120,  window: '1 minute' },
    'agent':     { requests: 200,  window: '1 minute' },
    'merchant':  { requests: 500,  window: '1 minute' },
    'admin':     { requests: 1000, window: '1 minute' }
}
// Response headers for rate limiting
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699123456  // Unix timestamp
12. Implementation Checklist
Use this checklist when building or restructuring your application:

Phase 1: Foundation
 Set up project structure following the standard organization
 Configure environment variables for all environments
 Set up database with proper indexing strategy
 Implement base models with proper relationships
 Create helper functions for common operations (
gs()
, 
apiResponse()
)
 Set up authentication guards for each user type
 Implement base API response format
Phase 2: Security Layer
 Implement authentication middleware
 Set up token-based authentication for API
 Create role and permission system
 Implement KYC verification flow
 Add 2FA support
 Configure rate limiting
 Set up audit logging
Phase 3: Module System
 Create 
ModuleSetting
 table and model
 Implement 
module()
 helper function
 Create Module middleware for route protection
 Add module settings admin UI
 Create API endpoint for fetching module status
 Implement frontend module visibility logic
Phase 4: Core Features
 Build admin dashboard with analytics
 Create user management system
 Implement transaction system with charges
 Build notification system (email, SMS, push)
 Create support ticket system
 Implement file upload handling
Phase 5: Frontend/Mobile
 Set up project structure with proper separation
 Implement state management pattern
 Create repository layer for API calls
 Build reusable UI components
 Implement module-based feature visibility
 Handle offline mode and caching
 Set up push notifications
Phase 6: Quality & Scale
 Add comprehensive input validation
 Implement caching strategy
 Set up background job processing
 Configure CRON jobs for scheduled tasks
 Add monitoring and alerting
 Write automated tests
 Document API endpoints
Appendix A: Essential Extensions & Tools
Backend Security Extensions
Extension	Purpose
CORS Handler	Cross-origin resource sharing
CSRF Protection	Cross-site request forgery prevention
Encryption	Data encryption at rest
Captcha	Bot prevention (reCAPTCHA, hCaptcha)
Frontend Libraries
Library	Purpose
HTTP Client	API communication (Axios, Dio)
State Management	GetX, Redux, Provider, MobX
Secure Storage	Encrypted local storage
Biometric Auth	Fingerprint/Face ID
Third-Party Services
Service	Purpose
Sentry/Crashlytics	Error tracking
Firebase	Push notifications, analytics
Mixpanel/Amplitude	User analytics
Stripe/PayPal	Payment processing
Appendix B: Common Patterns Reference
Error Handling Pattern
try:
    result = riskyOperation()
    return successResponse(result)
catch ValidationException as e:
    return errorResponse(e.errors, 422)
catch AuthenticationException:
    return errorResponse(['Unauthorized'], 401)
catch NotFoundException:
    return errorResponse(['Resource not found'], 404)
catch Exception as e:
    logError(e)
    return errorResponse(['Something went wrong'], 500)
Validation Message Pattern
messages = {
    'email.required': 'Email address is required',
    'email.email': 'Please enter a valid email address',
    'email.unique': 'This email is already registered',
    'password.min': 'Password must be at least 8 characters',
    'amount.numeric': 'Amount must be a number',
    'amount.min': 'Minimum amount is :min',
}
Status Code Constants
class Status:
    DISABLE = 0
    ENABLE = 1
    
    PENDING = 0
    APPROVED = 1
    REJECTED = 2
    
    INACTIVE = 0
    ACTIVE = 1
    BANNED = 2
    
    YES = 1
    NO = 0
    
    VERIFIED = 1
    UNVERIFIED = 0
TIP

This guide is designed to be adapted to any programming language or framework. The patterns and principles are universal—focus on the concepts and adapt the syntax to your specific technology stack.

Generated from analysis of production-grade fintech architecture patterns.