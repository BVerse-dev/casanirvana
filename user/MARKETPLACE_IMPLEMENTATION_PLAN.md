# Marketplace Implementation Plan

## Overview
The marketplace feature will enable community members to buy and sell products within their residential community. This includes groceries, fresh foods, household items, and other essential products.

## Core Features
1. **Product Categories** - Organized shopping experience
2. **Product Discovery** - Search and browse products
3. **Product Details** - Comprehensive product information
4. **Shopping Cart** - Add to cart functionality
5. **Order Management** - Track past and current orders
6. **Vendor Management** - Multiple sellers within community
7. **Navigation** - Floating bottom tab navigation

## Screen Flow Architecture

### 1. Marketplace Home Screen (`marketplaceHomeScreen.js`)
**Purpose**: Main entry point with category grid and featured products

**Components**:
- Search bar at top
- Category grid (2x2 layout):
  - Baby & toddler
  - Home
  - Fitness & nutrition
  - Accessories
  - Beauty
  - Food & drinks
  - Pet supplies
  - Toys & games
  - Electronics
  - Arts & crafts
  - Luggage & bags
  - Sporting goods
- "Try something new" section with mini-apps:
  - Rate My Fit
  - Radiance Routine
  - Image Search
- Featured sections (Women, Men, etc.)
- Promotional banners

**Navigation**:
- Tapping category → Category listing screen
- Tapping product → Product detail screen
- Search bar → Search screen

### 2. Category Listing Screen (`categoryListingScreen.js`)
**Purpose**: Display products within a selected category

**Components**:
- Category header with subcategories
- Filter/sort options
- Product grid (2 columns)
- Product cards showing:
  - Product image
  - Discount badge (if applicable)
  - Product name
  - Rating
  - Price (original and discounted)
  - Heart icon for favorites

**Features**:
- Pull to refresh
- Infinite scroll pagination
- Quick add to cart

### 3. Product Detail Screen (`productDetailScreen.js`)
**Purpose**: Comprehensive product information and purchase options

**Components**:
- Image carousel
- Vendor info with rating
- Product title
- Price display
- Variant selection (size, color, etc.)
- Quantity selector
- "Add to cart" button (purple)
- "Buy now" button (black)
- Description section
- Refund/Shipping policies
- Ratings and reviews
- "More from vendor" section
- Related products

**Features**:
- Share product
- Add to favorites
- One-time purchase vs subscription options

### 4. Vendor Store Screen (`vendorStoreScreen.js`)
**Purpose**: Display all products from a specific vendor

**Components**:
- Vendor header (logo, name, rating, follower count)
- Follow button
- Tab navigation (All, Collections, New Releases)
- Product grid
- Recently viewed section

### 5. Search Screen (`marketplaceSearchScreen.js`)
**Purpose**: Search and filter products

**Components**:
- Search input with recent searches
- Category quick filters
- Search results grid
- Filter options (price, rating, availability)
- Sort options

### 6. Orders Screen (`ordersScreen.js`)
**Purpose**: Manage and track orders

**Components**:
- Tab navigation (Active, Past)
- Order cards showing:
  - Order status
  - Delivery method
  - Product preview
  - Order date
  - Total amount
- Order tracking
- Reorder functionality

### 7. Shopping Cart Screen (`shoppingCartScreen.js`)
**Purpose**: Review and manage cart items

**Components**:
- Cart items list
- Quantity adjusters
- Remove item option
- Price breakdown
- Promo code input
- Checkout button
- Saved for later section

### 8. Checkout Flow
**Multiple screens for checkout process**:
- `deliveryAddressScreen.js` - Select/add delivery address
- `paymentMethodScreen.js` - Payment selection (reuse existing)
- `orderReviewScreen.js` - Final review before purchase
- `orderConfirmationScreen.js` - Success screen with order details

## Bottom Navigation Component (`MarketplaceBottomTab.js`)
**Floating tab bar with**:
- Home icon → Marketplace home
- Search icon → Search screen
- List icon → Orders screen

## Data Models

### Products Table
```sql
- id (UUID)
- vendor_id (FK to vendors)
- category_id (FK to categories)
- name
- description
- price
- discounted_price
- images (JSONB array)
- variants (JSONB)
- stock_quantity
- rating
- review_count
- is_active
- created_at
- updated_at
```

### Categories Table
```sql
- id (UUID)
- name
- slug
- icon
- parent_id (self-referential for subcategories)
- display_order
```

### Vendors Table
```sql
- id (UUID)
- user_id (FK to users)
- store_name
- description
- logo
- rating
- follower_count
- is_verified
- created_at
```

### Orders Table
```sql
- id (UUID)
- user_id (FK to users)
- vendor_id (FK to vendors)
- status (pending, processing, shipped, delivered, cancelled)
- items (JSONB)
- total_amount
- delivery_address (JSONB)
- delivery_method
- tracking_number
- created_at
- delivered_at
```

### Cart Items Table
```sql
- id (UUID)
- user_id (FK to users)
- product_id (FK to products)
- quantity
- variant_options (JSONB)
- added_at
```

## Services & Hooks

### Services
- `marketplaceService.js` - Core marketplace operations
- `productService.js` - Product CRUD operations
- `cartService.js` - Cart management
- `orderService.js` - Order processing
- `vendorService.js` - Vendor operations

### Hooks
- `useProducts.js` - Product fetching and filtering
- `useCart.js` - Cart state management
- `useOrders.js` - Order management
- `useVendor.js` - Vendor data
- `useCategories.js` - Category navigation

## Design System

### Colors
- Primary Purple: #6B3AA0 (Add to cart buttons)
- Black: #000000 (Buy now buttons)
- Discount badges: Purple with white text
- Background: #F5F5F5
- Cards: White with subtle shadows

### Typography
- Product titles: SemiBold, 14px
- Prices: Bold, 16px
- Descriptions: Regular, 12px
- Category titles: SemiBold, 16px

### Spacing
- Grid gap: 12px
- Card padding: 12px
- Section margins: 16px

### Components
- Rounded corners: 12px for cards
- Shadow: Subtle elevation for cards
- Icons: Consistent 24px size

## Implementation Priority

### Phase 1: Core Shopping Experience
1. Marketplace home screen
2. Category listing
3. Product detail
4. Bottom navigation

### Phase 2: Cart & Search
1. Shopping cart
2. Search functionality
3. Product filtering

### Phase 3: Orders & Checkout
1. Checkout flow
2. Orders management
3. Order tracking

### Phase 4: Advanced Features
1. Vendor stores
2. Reviews and ratings
3. Favorites/Wishlist
4. Recommendations

## Performance Considerations
- Lazy load images
- Implement pagination (20 items per page)
- Cache category data
- Optimize search with debouncing
- Use React.memo for product cards

## Security Considerations
- Validate all inputs
- Secure payment processing
- User authentication for purchases
- Rate limiting on API calls
- Input sanitization for product listings

## Testing Strategy
1. Unit tests for services
2. Integration tests for cart operations
3. E2E tests for complete purchase flow
4. Performance testing for large catalogs
5. Accessibility testing

## Success Metrics
- Page load time < 2 seconds
- Search response < 500ms
- Cart operations < 200ms
- 99.9% uptime for marketplace
- User satisfaction > 4.5/5 rating
