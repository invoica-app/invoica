# Invoicer - Professional Invoice Application

A modern, pixel-perfect invoice application built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Authentication**: Google, Microsoft SSO, and Guest login
- **Dashboard**: Beautiful empty state with 3D visualization
- **Multi-Step Invoice Creation**:
  1. Company Information
  2. Invoice Details with line items
  3. Design & Branding (color picker, font selector)
  4. Email Configuration
  5. Review & Send
- **State Management**: Zustand with localStorage persistence
- **Auto-Save**: Draft saved automatically with timestamps
- **Responsive Design**: Mobile-friendly layouts
- **Pixel-Perfect**: Exact match to Figma designs

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **State**: Zustand with persistence
- **Validation**: Zod (ready for integration)

## Color Palette

```
Primary:          #9747E6 (Purple)
Background:       #FFFFFF (White)
Secondary BG:     #F9FAFB (Light Gray)
Border:           #E5E7EB
Text Primary:     #111827
Text Secondary:   #6B7280
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── login/              # Authentication page
├── dashboard/          # Main dashboard
├── invoice/
│   └── new/
│       ├── welcome/    # Step 0: Landing
│       ├── company/    # Step 1: Company Info
│       ├── details/    # Step 2: Invoice Details
│       ├── design/     # Step 3: Design & Branding
│       ├── email/      # Step 4: Email Details
│       └── review/     # Step 5: Review & Send
└── settings/           # Application settings

components/
├── ui/                 # shadcn/ui components
├── wizard-sidebar.tsx  # Navigation sidebar
└── wizard-header.tsx   # Header with step indicator

lib/
├── store.ts           # Zustand state management
├── utils.ts           # Utility functions
└── date-utils.ts      # Date formatting helpers
```

## Routes

- `/` - Redirects to login
- `/login` - Authentication page
- `/dashboard` - Dashboard with invoice history
- `/invoice/new` - Redirects to welcome
- `/invoice/new/welcome` - Start invoice creation
- `/invoice/new/company` - Step 1: Company Info
- `/invoice/new/details` - Step 2: Invoice Details
- `/invoice/new/design` - Step 3: Design & Branding
- `/invoice/new/email` - Step 4: Email Details
- `/invoice/new/review` - Step 5: Review & Send
- `/settings` - Application settings

## State Management

The application uses Zustand for state management with localStorage persistence:

- Company information
- Invoice details and line items
- Design preferences (color, font)
- Email configuration
- Auto-save timestamps

All state is persisted to localStorage under the key `invoice-storage`.

## Next Steps

- [ ] Add form validation with Zod
- [ ] Implement PDF generation
- [ ] Add email sending functionality
- [ ] Connect to Spring Boot backend
- [ ] Add authentication with NextAuth
- [ ] Add invoice history/list view
- [ ] Add invoice editing
- [ ] Add invoice templates
- [ ] Add payment tracking
- [ ] Add client management

## Design System

The application follows a consistent design system:

- **Border Radius**: 8px (buttons/inputs), 12px (cards), 16px (large cards)
- **Spacing**: 4px, 8px, 12px, 16px, 24px, 32px
- **Typography**: Inter for UI, Pacifico for decorative text
- **Shadows**: Subtle elevation for depth
- **Transitions**: 150-200ms for smooth interactions

## License

MIT
