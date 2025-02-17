Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
Delivery Management Dashboard for Courier Service
</summary_title>

<image_analysis>

1. Navigation Elements:
- Left sidebar with: Delivery Dashboard, Customer Report, Courier Payroll, Delivery Data, Delivery Invoices, App Integration
- Top header with: Search bar, Delivery Logs dropdown, Download Report, Customize Widget
- Breadcrumb navigation: Home > Delivery Orders > Current Delivery


2. Layout Components:
- Header height: ~60px
- Sidebar width: ~240px
- Main content area: Flexible width
- Card containers: ~300px width
- Padding: 16-24px consistent spacing


3. Content Sections:
- Delivery metrics cards (4 sections)
- Delivery Report tabs
- Detailed delivery items list
- Map view for delivery tracking
- Order status information panels


4. Interactive Controls:
- Search bar with keyboard shortcut (⌘ + F)
- Tab navigation for delivery status
- Expandable/collapsible delivery details
- Interactive map interface
- Status filters and sorting options


5. Colors:
- Primary blue: #2D6BFF
- Success green: #00C48C
- Warning orange: #FF9500
- Text dark: #1A1A1A
- Background gray: #F8F8F8
- Border light: #E5E5E5


6. Grid/Layout Structure:
- 12-column grid system
- Responsive breakpoints at 768px, 1024px, 1440px
- Flexible card layout with auto-fit grid
- Fixed sidebar with scrollable main content
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar
│   │   ├── Header
│   │   └── DeliveryLayout
│   ├── features/
│   │   ├── DeliveryMetrics
│   │   ├── DeliveryReport
│   │   └── DeliveryMap
│   └── shared/
```


2. Key Features:
- Real-time delivery tracking
- Status management system
- Metrics dashboard
- Map integration
- Order management


3. State Management:
```typescript
interface DeliveryState {
├── orders: {
│   ├── current: Order[]
│   ├── pending: Order[]
│   ├── completed: Order[]
│   └── metrics: DeliveryMetrics
├── courier: {
│   ├── active: Courier[]
│   ├── location: Location[]
│   └── status: Status[]
└── }
}
```


4. Routes:
```typescript
const routes = [
├── '/dashboard',
├── '/deliveries/*',
├── '/couriers/*',
├── '/reports/*',
└── '/settings/*'
]
```


5. Component Architecture:
- DeliveryDashboard (parent)
- MetricsCards (child)
- DeliveryList (child)
- MapView (child)
- StatusTabs (shared)


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.