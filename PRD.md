# Planning Guide

A professional inventory management system with automatic database persistence, user authentication, and comprehensive product tracking capabilities for businesses to efficiently manage their stock.

**Experience Qualities**:
1. **Professional** - Clean, organized interface that conveys reliability and trustworthiness for business operations
2. **Efficient** - Quick data entry and instant search capabilities to minimize time spent on inventory tasks
3. **Secure** - Password-protected access with clear admin controls to protect sensitive business data

**Complexity Level**: Light Application (multiple features with basic state)
- The application manages inventory records with CRUD operations, user authentication, and persistent storage, making it more than a micro tool but less complex than a multi-view enterprise system.

## Essential Features

**User Authentication**
- Functionality: Password-protected login system with admin credentials
- Purpose: Secure access to inventory data and prevent unauthorized modifications
- Trigger: Application launch or logout action
- Progression: Login screen → Enter credentials → Validate password → Access dashboard (or show error)
- Success criteria: Only users with correct password can access the system; invalid attempts show clear error messages

**Product Registration**
- Functionality: Add new products to inventory with details (name, SKU, quantity, price, category, supplier)
- Purpose: Build and maintain a comprehensive product catalog
- Trigger: Click "Add Product" button
- Progression: Click add button → Fill product form → Submit → Auto-save to database → Show confirmation → Product appears in list
- Success criteria: Products are immediately visible in inventory list and persist after page refresh

**Inventory List View**
- Functionality: Display all products in a searchable, sortable table with key information
- Purpose: Provide quick overview of current stock levels and product details
- Trigger: Automatic on dashboard load
- Progression: Load dashboard → Fetch from database → Display products in table → Enable search/filter
- Success criteria: All products display correctly with accurate data; search filters results in real-time

**Product Editing**
- Functionality: Modify existing product information including stock quantities
- Purpose: Keep inventory data current as products are received or sold
- Trigger: Click edit icon on any product row
- Progression: Click edit → Pre-fill form with current data → Modify fields → Save → Auto-update database → Refresh list
- Success criteria: Changes persist immediately and reflect in the inventory list

**Product Deletion**
- Functionality: Remove discontinued or incorrect products from inventory
- Purpose: Maintain clean, accurate inventory records
- Trigger: Click delete icon on product row
- Progression: Click delete → Confirm deletion dialog → Confirm → Remove from database → Update list
- Success criteria: Deleted products are permanently removed and don't reappear on refresh

**Stock Level Alerts**
- Functionality: Visual indicators for low stock items
- Purpose: Prevent stockouts by highlighting products needing reorder
- Trigger: Automatic based on quantity thresholds
- Progression: System checks stock levels → Applies warning styling to low stock items → Admin sees alerts
- Success criteria: Products with quantity below threshold display with warning indicators

**Export Functionality**
- Functionality: Download inventory data as CSV file
- Purpose: Enable reporting and external analysis of inventory data
- Trigger: Click export button
- Progression: Click export → Generate CSV from current inventory → Download file
- Success criteria: CSV contains all inventory data in readable format

## Edge Case Handling

- **Empty Inventory**: Display helpful empty state with clear call-to-action to add first product
- **Duplicate SKUs**: Show validation error preventing duplicate SKU entries
- **Invalid Data**: Form validation prevents submission of incomplete or invalid product information
- **Low Stock Zero Items**: Products with 0 quantity display with critical alert styling
- **Long Product Names**: Text truncates gracefully with ellipsis and full name on hover
- **Search No Results**: Clear message when search yields no matching products
- **Password Reset**: Include password hint or recovery mechanism for forgotten credentials

## Design Direction

The design should evoke trust, organization, and efficiency - like a well-managed warehouse. Professional corporate aesthetic with emphasis on data clarity and quick scanning. Clean tables, clear hierarchy, and purposeful use of color for status indicators.

## Color Selection

A professional business palette with navy blue primary, complemented by clean grays and status-driven accent colors.

- **Primary Color**: Deep navy blue (oklch(0.35 0.08 250)) - Conveys professionalism, trust, and corporate stability
- **Secondary Colors**: 
  - Light gray (oklch(0.96 0 0)) for subtle backgrounds and cards
  - Medium gray (oklch(0.45 0.02 250)) for secondary text
- **Accent Color**: Vibrant cyan (oklch(0.65 0.15 220)) for CTAs, active states, and interactive elements
- **Status Colors**:
  - Success green (oklch(0.65 0.15 145)) for good stock levels
  - Warning amber (oklch(0.75 0.15 85)) for low stock alerts
  - Critical red (oklch(0.60 0.22 25)) for out of stock
- **Foreground/Background Pairings**:
  - Primary Navy (oklch(0.35 0.08 250)): White text (oklch(1 0 0)) - Ratio 9.2:1 ✓
  - Accent Cyan (oklch(0.65 0.15 220)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Background (oklch(0.98 0 0)): Dark text (oklch(0.20 0.01 250)) - Ratio 13.1:1 ✓
  - Warning Amber (oklch(0.75 0.15 85)): Dark text (oklch(0.25 0.02 85)) - Ratio 7.8:1 ✓

## Font Selection

Typography should convey precision and professionalism, using modern sans-serif faces optimized for data-heavy interfaces and extended reading.

- **Primary Font**: IBM Plex Sans - Technical precision with humanist warmth, excellent for both headings and data tables
- **Monospace Font**: JetBrains Mono - For SKU codes and numeric data requiring precise alignment

- **Typographic Hierarchy**:
  - H1 (System Title): IBM Plex Sans SemiBold / 32px / -0.02em letter spacing
  - H2 (Section Headers): IBM Plex Sans Medium / 24px / -0.01em letter spacing
  - H3 (Card Titles): IBM Plex Sans Medium / 18px / normal letter spacing
  - Body (Forms, Labels): IBM Plex Sans Regular / 15px / normal letter spacing / 1.6 line height
  - Table Data: IBM Plex Sans Regular / 14px / normal letter spacing
  - SKU/Codes: JetBrains Mono Regular / 13px / tabular-nums
  - Small (Metadata): IBM Plex Sans Regular / 13px / oklch(0.55 0.02 250) color

## Animations

Animations should feel immediate and businesslike - quick confirmations and subtle state changes. Use micro-interactions to confirm actions (form submissions, deletions) with brief scale/fade effects. Table row highlights on hover should be instant. Success toasts slide in smoothly but briefly. Avoid decorative animations; focus on functional feedback that reinforces user actions without delay.

## Component Selection

- **Components**:
  - Dialog: For product add/edit forms with clear modal overlay
  - Alert Dialog: For deletion confirmations requiring explicit user choice
  - Table: Core component for inventory list with sortable columns
  - Input: Standard form fields with clear labels and validation states
  - Button: Primary (add, save), Secondary (cancel), Destructive (delete) variants
  - Badge: For stock status indicators (In Stock, Low Stock, Out of Stock)
  - Card: For dashboard statistics and key metrics overview
  - Toast (Sonner): Success/error notifications for CRUD operations
  - Form (react-hook-form): Structured validation for product data entry
  - Select: Dropdown for category selection
  - Tooltip: Display full product names/descriptions on hover

- **Customizations**:
  - Custom login card component with centered layout and branded header
  - Dashboard statistics cards showing total products, low stock count, total value
  - Stock level badge component with color-coded severity levels
  - Table row hover state with subtle background highlight

- **States**:
  - Buttons: Default with solid backgrounds, hover with slight lightening, active with scale press effect, disabled with reduced opacity
  - Inputs: Default with border, focus with accent ring, error with red border and message, success with green border
  - Table rows: Hover with light gray background, selected (for editing) with accent tint
  - Badges: Static colors based on stock level (no hover states)

- **Icon Selection**:
  - Plus (Add new product)
  - PencilSimple (Edit product)
  - Trash (Delete product)
  - MagnifyingGlass (Search inventory)
  - Download (Export data)
  - SignOut (Logout)
  - Package (Inventory/product icons)
  - Warning (Low stock alerts)
  - Lock (Login/security)

- **Spacing**:
  - Page padding: p-6 (24px)
  - Card padding: p-6 (24px)
  - Form field gaps: gap-4 (16px)
  - Table cell padding: px-4 py-3 (16px horizontal, 12px vertical)
  - Button padding: px-4 py-2 (16px horizontal, 8px vertical)
  - Section margins: mb-6 (24px)

- **Mobile**:
  - Table converts to card-based layout on mobile with stacked information
  - Statistics cards stack vertically on small screens (grid-cols-1 on mobile, grid-cols-3 on desktop)
  - Action buttons group in dropdown menu on mobile instead of inline row
  - Login form maintains centered layout with adjusted padding (p-4 instead of p-6)
  - Form dialogs expand to near full-screen on mobile with scrollable content
