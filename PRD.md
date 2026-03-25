# Planning Guide

Sistema de inventario profesional para Josimar Cell - un sistema de gestión integral con base de datos automática, autenticación de usuarios y seguimiento completo de productos para gestionar eficientemente el inventario del negocio. **Compatible con todos los navegadores modernos, optimizado para producción web y preparado para convertirse en aplicación de escritorio ejecutable compatible con Windows.**

**Experience Qualities**:
1. **Professional** - Clean, organized interface that conveys reliability and trustworthiness for business operations
2. **Efficient** - Quick data entry and instant search capabilities to minimize time spent on inventory tasks
3. **Secure** - Password-protected access with clear admin controls to protect sensitive business data
4. **Universal** - Works across all modern browsers and can be installed as a desktop application or deployed to any web domain
5. **Production-Ready** - Fully optimized for deployment with comprehensive build scripts, server configurations, and cross-platform compatibility

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
- The application manages inventory records with CRUD operations, user authentication with role-based access control, granular permissions system, persistent storage, order management, daily close reporting, and comprehensive audit logging, making it a feature-rich enterprise-grade system. Additionally, it's optimized for cross-browser compatibility, production deployment on web servers, and can be packaged as a standalone desktop executable for Windows with full offline functionality.

## Platform Support

**Production Web Deployment**
- Functionality: Optimized build process for deploying to web servers with comprehensive configuration files
- Purpose: Enable easy deployment to any web domain with maximum performance and compatibility
- Features: Minified assets, code splitting, gzip compression, browser caching, Apache/Nginx configurations, SSL-ready
- Build Scripts: Windows (.bat) and Unix (.sh) scripts for automated production builds
- Trigger: Run build-production script or npm run build command
- Progression: Execute build → Dependencies checked → Previous build cleaned → Vite optimization → Assets minified → dist/ folder generated → Ready for upload
- Success criteria: dist/ folder contains optimized production files; builds complete in under 2 minutes; all assets properly minified; configuration files included (.htaccess, nginx.conf)

**Cross-Browser Compatibility**
- Functionality: Full support for all modern browsers with automatic compatibility detection and verification page
- Purpose: Ensure the application works reliably across different browsers and operating systems
- Supported Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, Opera 76+, Brave, Samsung Internet 13+
- Browser Detection: Automatic capability detection with fallback messages for unsupported browsers
- Compatibility Check Page: Dedicated /compatibility-check.html page for system verification
- Trigger: Automatic browser detection on application load
- Progression: User opens app → Browser capabilities detected → ES2020, localStorage, IndexedDB verified → App loads or shows upgrade message
- Success criteria: Application functions identically across all supported browsers; unsupported browsers show clear upgrade instructions with browser/version details

**Desktop Application (Electron)**
- Functionality: Package the web application as a native desktop executable for Windows with installer and portable versions
- Purpose: Provide offline functionality and native OS integration for users who prefer desktop applications
- Features: Persistent local database, offline operation, native file system access, OS notifications, auto-updates
- Build Options: NSIS installer (customizable installation) and portable executable (no installation required)
- Trigger: User downloads and installs the desktop version or runs generar-ejecutable.bat script
- Progression: Download installer → Install application → Launch from desktop/start menu → Runs independently without browser
- Success criteria: Desktop app works offline with full functionality; data persists on local file system; installers for both x64 and x86 architectures; file size under 200MB

## Essential Features

**User Authentication & Management**
- Functionality: Multi-user system with admin/visitor roles, user creation, editing, and role assignment
- Purpose: Secure access control and user management for team collaboration
- Trigger: Application launch, logout action, or admin accessing user management tab
- Progression: Login screen → Enter credentials → Validate → Access dashboard based on role permissions
- Success criteria: Users authenticate successfully, admins can manage all users, default admin account cannot be deleted

**Granular Product Permissions**
- Functionality: Per-product permission system allowing admins to grant/revoke view, edit, and delete permissions for individual products to specific users
- Purpose: Fine-grained access control to restrict which products non-admin users can interact with
- Trigger: Admin clicks lock icon next to a user in User Management tab
- Progression: Click lock icon → Open permissions dialog → Search/filter products → Toggle view/edit/delete checkboxes per product → Save permissions → Permissions apply immediately
- Success criteria: Non-admin users only see products they have view permission for; edit/delete buttons show lock icons for products without appropriate permissions; admins always have full access; permission changes persist across sessions

**Product Registration**
- Functionality: Add new products to inventory with details (name, SKU, quantity, price, category, supplier)
- Purpose: Build and maintain a comprehensive product catalog
- Trigger: Click "Add Product" button (admin only)
- Progression: Click add button → Fill product form → Submit → Auto-save to database → Log audit entry → Show confirmation → Product appears in list
- Success criteria: Products are immediately visible in inventory list and persist after page refresh; audit log records creation

**Inventory List View**
- Functionality: Display all products in a searchable, sortable table with key information, respecting user permissions
- Purpose: Provide quick overview of current stock levels and product details based on access rights
- Trigger: Automatic on dashboard load
- Progression: Load dashboard → Fetch from database → Filter by user permissions → Display visible products in table → Enable search/filter
- Success criteria: All accessible products display correctly; users only see products they have view permission for; permission indicators show on action buttons

**Product Editing**
- Functionality: Modify existing product information including stock quantities (subject to permissions)
- Purpose: Keep inventory data current as products are received or sold
- Trigger: Click edit icon on product row (if user has edit permission)
- Progression: Click edit → Verify permission → Pre-fill form with current data → Modify fields → Save → Auto-update database → Log audit changes → Refresh list
- Success criteria: Changes persist immediately and reflect in inventory list; audit log captures field-level changes; users without edit permission see disabled/locked button

**Product Deletion**
- Functionality: Remove discontinued or incorrect products from inventory (subject to permissions)
- Purpose: Maintain clean, accurate inventory records
- Trigger: Click delete icon on product row (if user has delete permission)
- Progression: Click delete → Verify permission → Confirm deletion dialog → Confirm → Remove from database → Log audit entry → Update list
- Success criteria: Deleted products are permanently removed; audit log records deletion; users without delete permission see disabled/locked button

**Stock Level Alerts**
- Functionality: Visual indicators for low stock items with notification badges and detailed alert panel
- Purpose: Prevent stockouts by highlighting products needing reorder with persistent notifications
- Trigger: Automatic based on quantity thresholds (≤10 for low stock, 0 for out of stock)
- Progression: System checks stock levels → Displays notification badge in header → Shows critical stock alert panel above inventory → User can view details or dismiss individual alerts
- Success criteria: Products with quantity below threshold display with warning indicators; notification badge shows count of active alerts; dismissed alerts persist across sessions

**Order Management (Sales & Purchases)**
- Functionality: Create and manage sales orders (reducing stock) and purchase orders (increasing stock) with automatic inventory updates
- Purpose: Track business transactions and maintain accurate stock levels through documented order flow
- Trigger: Navigate to Orders tab, click Create Sale or Create Purchase
- Progression: Select order type → Add products with quantities → Calculate totals → Confirm order → Update inventory automatically → Record transaction
- Success criteria: Orders correctly adjust inventory quantities; completed orders show in history; orders can be filtered by type and status

**Daily Close Reports**
- Functionality: Generate end-of-day summary reports with sales, purchases, inventory metrics, and financial analysis
- Purpose: Provide comprehensive daily business insights for accounting and management review
- Trigger: Navigate to Daily Close tab, click Generate Report
- Progression: Click generate → System analyzes all orders and inventory for the day → Calculate financial metrics → Display comprehensive report → Save report history
- Success criteria: Reports accurately reflect daily activity; top products identified; profit margins calculated; reports persist and can be reviewed later

**Export Functionality**
- Functionality: Download inventory data as CSV file
- Purpose: Enable reporting and external analysis of inventory data
- Trigger: Click export button
- Progression: Click export → Generate CSV from current inventory → Download file
- Success criteria: CSV contains all inventory data in readable format

**Statistics Dashboard**
- Functionality: Visual analytics with interactive charts showing inventory distribution, value, and trends
- Purpose: Provide data-driven insights for inventory management decisions and quick pattern recognition
- Trigger: Automatic display on dashboard load, above product table
- Progression: Load dashboard → Calculate statistics → Render charts in tabbed interface → User switches between chart views
- Success criteria: Charts accurately reflect product data with category distribution, supplier analysis, stock levels, price ranges, and top products by value

**Audit Logging**
- Functionality: Comprehensive logging of all product create, update, and delete operations with field-level change tracking
- Purpose: Maintain accountability and traceability for all inventory modifications
- Trigger: Automatic on any product modification; viewable by admins via Audit button
- Progression: User modifies data → System captures changes → Logs username, timestamp, action, and details → Admin views audit dialog
- Success criteria: All changes logged with complete details; admins can review full history; logs persist across sessions

**Database Backup & Restore**
- Functionality: Export and import full database snapshots with integrity verification
- Purpose: Enable data backup, migration, and recovery capabilities
- Trigger: Click Backup or Restore buttons (admin only)
- Progression: Backup: Click → Generate JSON file → Download; Restore: Select file → Validate → Confirm → Import data → Verify integrity
- Success criteria: Backups contain all data; restores successfully recreate system state; automatic daily backups; checksum validation

## Edge Case Handling

- **Empty Inventory**: Display helpful empty state with clear call-to-action to add first product
- **No Visible Products (Permissions)**: Non-admin users without any product permissions see informative message about permission requirements
- **Duplicate SKUs**: Show validation error preventing duplicate SKU entries
- **Invalid Data**: Form validation prevents submission of incomplete or invalid product information
- **Low Stock Zero Items**: Products with 0 quantity display with critical alert styling
- **Long Product Names**: Text truncates gracefully with ellipsis and full name on hover
- **Search No Results**: Clear message when search yields no matching products
- **Permission Denied Actions**: Users attempting to edit/delete products without permission see clear error toast and visual lock indicators
- **Admin Self-Modification**: Prevent admins from removing their own admin privileges or deleting themselves
- **Default Admin Protection**: Prevent deletion or permission changes to the default "admin" account
- **Empty Permission Sets**: Users with no product permissions cannot see any products but receive helpful guidance in UI
- **Concurrent Permission Updates**: Changes to user permissions apply immediately to that user's active session
- **Bulk Permission Changes**: Select-all functionality in permissions dialog handles large product catalogs efficiently
- **User Deletion with Permissions**: Deleting a user automatically removes all their product permissions

## Design Direction

The design should evoke trust, organization, and efficiency - like a well-managed warehouse. Professional corporate aesthetic with emphasis on data clarity and quick scanning. Clean tables, clear hierarchy, and purposeful use of color for status indicators.

## Application Icon Design

The custom application icon is a modern, professional representation of Josimar Cell's core business - mobile phone inventory management.

- **Visual Elements**: 
  - Central smartphone device with gradient screen showcasing the digital interface
  - Flanking inventory boxes on both sides representing stock management
  - Status indicator dots (green, amber, red) symbolizing real-time inventory tracking
  - Clean geometric shapes with rounded corners matching the app's modern aesthetic
  
- **Color Palette**: 
  - Deep indigo gradient background (#4338CA to #6366F1) - conveying trust and professionalism
  - White/light gray device for clarity and contrast
  - Cyan/blue accents on screen matching the app's primary colors
  - Status colors for inventory states
  
- **Technical Implementation**:
  - SVG format for infinite scalability and crisp rendering at any size
  - Optimized shadows and glows for depth and modern 3D appearance
  - PWA-ready with manifest.json for installable web app support
  - Favicon integration for browser tab identification
  
- **Design Philosophy**: The icon instantly communicates the app's purpose - professional mobile phone inventory management - through iconic visual metaphors that are immediately recognizable even at small sizes (16x16px browser favicon to 512x512px splash screens).

## Color Selection

A clean, professional business palette with navy blue primary, modern cyan accents, and bright white cards for a polished corporate aesthetic.

- **Primary Color**: Deep navy blue (oklch(0.35 0.08 250)) - Conveys professionalism, trust, and authority
- **Secondary Colors**: 
  - Ultra-light gray background (oklch(0.98 0 0)) for main page background
  - Pure white (oklch(1 0 0)) for elevated cards and panels
  - Medium gray (oklch(0.45 0.02 250)) for secondary text
- **Accent Color**: Vibrant cyan (oklch(0.65 0.15 220)) for interactive elements, highlights, and active states
- **Status Colors**:
  - Success green (oklch(0.65 0.15 145)) for positive metrics and confirmations
  - Warning amber (oklch(0.75 0.15 85)) for low stock alerts and cautions
  - Destructive red (oklch(0.60 0.22 25)) for critical alerts and dangerous actions
- **Foreground/Background Pairings**:
  - Primary Navy (oklch(0.35 0.08 250)): White text (oklch(1 0 0)) - Ratio 9.2:1 ✓
  - Accent Cyan (oklch(0.65 0.15 220)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card White (oklch(1 0 0)): Dark text (oklch(0.20 0.01 250)) - Ratio 15.2:1 ✓
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

Animations are crisp, immediate, and purposeful - reinforcing the professional nature of the system with subtle spring-based transitions. Use gentle scale and fade effects on stat cards (0.4s spring), smooth slide-up transitions for content sections (0.3s ease-out), and instant table row highlights. Tab transitions feature smooth color changes with shadow effects. Buttons respond with subtle hover states. All animations prioritize speed and clarity over decoration, maintaining the business-focused aesthetic.

## Component Selection

- **Components**:
  - Dialog: For product add/edit forms with clear modal overlay and critical stock alerts detail view
  - Alert Dialog: For deletion confirmations requiring explicit user choice
  - Table: Core component for inventory list with sortable columns
  - Input: Standard form fields with clear labels and validation states
  - Button: Primary (add, save), Secondary (cancel), Destructive (delete) variants
  - Badge: For stock status indicators (In Stock, Low Stock, Out of Stock) and notification counts
  - Card: For dashboard statistics, key metrics overview, and critical stock alerts
  - Toast (Sonner): Success/error notifications for CRUD operations and alert dismissals
  - Form (react-hook-form): Structured validation for product data entry
  - Select: Dropdown for category selection
  - Tooltip: Display full product names/descriptions on hover
  - Tabs: For switching between different statistics chart views
  - Charts (Recharts): Bar charts, pie charts, area charts, and line charts for data visualization
  - ScrollArea: For scrollable content in audit logs and critical stock details

- **Customizations**:
  - Custom login card component with centered layout and branded header
  - Dashboard statistics cards showing total products, low stock count, total value
  - Statistics panel with tabbed interface displaying five chart categories
  - Stock level badge component with color-coded severity levels
  - Table row hover state with subtle background highlight
  - Interactive charts with tooltips showing detailed data on hover
  - Critical stock alert panel with animated cards, dismissible alerts, and notification badge
  - Notification bell icon with count badge in header for active critical alerts

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
  - Bell (Notification badge for critical alerts)
  - X (Dismiss alerts)
  - TrendDown (Out of stock indicator)

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
