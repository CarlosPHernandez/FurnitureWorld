Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /delivery-dashboard
- /customer-report
- /courier-payroll
- /delivery-data
- /delivery-invoices
- /app-integration
- /search-bar
- /delivery-logs-dropdown
- /download-report
- /customize-widget

Page Implementations:
/delivery-dashboard:
Core Purpose: Central hub for monitoring all delivery operations
Key Components
- Real-time delivery status cards
- Performance metrics charts
- Active courier map
- Order queue list
Layout Structure
- Grid layout with 4 main sections
- Collapsible sidebar
- Responsive cards that stack on mobile

/customer-report:
Core Purpose: Detailed customer analytics and feedback overview
Key Components
- Customer satisfaction metrics
- Delivery feedback charts
- Customer behavior analysis
- Issue resolution tracking
Layout Structure
- Vertical sections with filters
- Expandable data tables
- Print-friendly layout

/courier-payroll:
Core Purpose: Manage courier compensation and payment processing
Key Components
- Payment calculator
- Timesheet viewer
- Commission tracker
- Payment history table
Layout Structure
- Two-column layout
- Floating action buttons
- Mobile-first forms

/delivery-data:
Core Purpose: Comprehensive delivery statistics and analytics
Key Components
- Data visualization charts
- Filtering system
- Export functionality
- Custom date range selector
Layout Structure
- Full-width charts
- Sticky header
- Responsive data grid

/delivery-invoices:
Core Purpose: Invoice generation and management
Key Components
- Invoice generator
- Template selector
- Batch processing tools
- Invoice archive
Layout Structure
- Split view layout
- Preview pane
- Mobile-optimized lists

/app-integration:
Core Purpose: Manage third-party app connections and APIs
Key Components
- API key manager
- Integration status dashboard
- Webhook configuration
- Documentation viewer
Layout Structure
- Tabbed interface
- Code snippet displays
- Responsive settings panels

/search-bar:
Core Purpose: Global search functionality across all delivery data
Key Components
- Advanced search filters
- Auto-complete
- Recent searches
- Search results display
Layout Structure
- Fixed top search bar
- Expandable filter drawer
- Results grid

/delivery-logs-dropdown:
Core Purpose: Access and filter delivery activity logs
Key Components
- Log level filters
- Time-based filtering
- Export functionality
- Real-time log viewer
Layout Structure
- Dropdown container
- Scrollable log list
- Filter sidebar

/download-report:
Core Purpose: Generate and download custom reports
Key Components
- Report template selector
- Data range picker
- Format options
- Progress indicator
Layout Structure
- Wizard-style interface
- Preview window
- Download queue

/customize-widget:
Core Purpose: Configure and customize dashboard widgets
Key Components
- Widget library
- Style editor
- Layout manager
- Preview panel
Layout Structure
- Drag-and-drop interface
- Configuration sidebar
- Live preview area

Layouts:
DashboardLayout:
- Applicable routes: /delivery-dashboard, /delivery-data
- Core components: Navigation bar, sidebar, content area
- Responsive behavior: Collapsible sidebar, stacking on mobile

ReportLayout
- Applicable routes: /customer-report, /download-report
- Core components: Report header, filters, content area
- Responsive behavior: Print-friendly, adaptive charts

AdminLayout
- Applicable routes: /courier-payroll, /delivery-invoices, /app-integration
- Core components: Admin toolbar, breadcrumbs, content area
- Responsive behavior: Priority navigation, responsive tables

UtilityLayout
- Applicable routes: /search-bar, /delivery-logs-dropdown, /customize-widget
- Core components: Utility bar, main content, action panel
- Responsive behavior: Full-screen on mobile, floating panels
</page-structure-prompt>