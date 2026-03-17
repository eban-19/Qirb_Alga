# Pension Booking Platform - Frontend Architecture & Developer Guide

## 1. Project Overview
This platform acts as a digital marketplace connecting **Pension Owners** with **Customers** looking for short-term and long-term stays. 
*   **Customers**: Browse available pensions, filter by location/price, view room details, and (eventually) book stays.
*   **Pension Owners**: Register their business (B2B onboarding), undergo verification, and manage their properties via a dedicated Owner Dashboard.
*   **Admins**: (Future) Platform moderators who verify business IDs and oversee operations.

## 2. Current System State
*   **Status**: Frontend phase one (Public Website & Registration Flow) is complete.
*   **Backend**: Not implemented yet. 
*   **Data**: The application currently relies on strongly typed mock data (e.g., src/lib/rooms.ts) to simulate API responses.
*   **Tech Stack**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui.

## 3. Core User Flow
*   **Customer Flow**: Landing Page &rarr; Search/Filter &rarr; View Room List &rarr; Room Details Profile &rarr; *(Future: Checkout/Booking)*.
*   **Owner Flow**: Landing Page (CTA: "Get Booked Today") &rarr; Multi-step Registration (/register-property with Business ID upload) &rarr; "Pending Verification" Screen &rarr; *(Future: Redirect to Protected Owner Dashboard)*.

## 4. Architecture Overview
The platform embraces a **Role-Based UI Architecture**:
*   **Public/Customer Layer**: Highly visual, optimized for conversion, localized via src/lib/i18n.ts.
*   **B2B/Owner Layer**: Form-heavy, focus on data accuracy, scalable dashboard components.
*   **Shared Foundation**: Common UI components (src/components/ui/), shared utility functions (src/lib/utils.ts), and centralized TypeScript interfaces representing our future domain models.

## 5. Frontend Dashboard Guidelines (MAIN FOCUS)
The immediate next phase is building the **Owner Dashboard**.
*   **Purpose**: A secure CMS for owners to manage their business post-verification.
*   **Expected Features**:
    1.  **Overview/Metrics**: Revenue, pending bookings, active listings.
    2.  **Property & Room Management**: Add/Edit/Delete pensions and individual rooms. Image uploads.
    3.  **Booking Management**: Accept/Decline requests, view guest details.
*   **Development Rules**:
    *   Build modular widgets (e.g., <StatCard />, <BookingTable />).
    *   Bind components directly to TypeScript interfaces (e.g., Room, Pension) to establish standard Data Transfer Objects (DTOs) for the future backend.
    *   Prioritize responsive data grids and clean form validations.

## 6. Routing & Navigation Logic
We strictly use **React Router** for declarative navigation.
*   Currently, CTAs push owners to the onboarding route: useNavigate("/register-property").
*   **Future Context**: The Dashboard must be implemented behind a **Protected Route** wrapper that checks for a valid authentication token and the "OWNER" role before rendering. Unauthorized users should bounce to /login.

## 7. Data & Types
**TypeScript interfaces are our future API contracts.**
*   Ensure all models (User, Room, PropertyView, etc.) are explicitly typed. 
*   Avoid using any. If a response structure is fluid, use unknown and validate, or refine the generic.
*   Frontend dashboard components must consume these exact types. If a dashboard view needs isolated data, create a specific interface (e.g., DashboardRoomListing) extending the base models.

## 8. Mock Data Strategy
*   We use in-memory arrays (e.g., 
ooms.ts) structured exactly how we expect JSON payloads from the future REST/GraphQL server.
*   **To swap mock for real data**: Dashboard developers should write Data Fetching Hooks (e.g., useOwnerPensions()) that currently return Promises resolving mock data. Once the backend is ready, standardizing via fetch/axios or React Query will require editing strictly the hook internals, zero UI changes.

## 9. Backend Integration Plan
The frontend establishes the blueprint for the backend APIs. Future backend responsibilities:
*   **Authentication & RBAC**: JWT-based auth separating ADMIN, OWNER, and CUSTOMER.
*   **Resource Management**: CRUD endpoints matching our exact TS interfaces (GET /api/pensions, POST /api/rooms).
*   **Booking System**: Transactional workflows supporting reservations and eventual payment gateways.
*   **Data Persistence**: Storing user profiles, business IDs from the multi-step form, and property specs.

## 10. Development Guidelines
*   **Type Safety**: Strictly enforced. No any types.
*   **UI Components**: We rely heavily on Radix-based **shadcn/ui** components. Do not reinvent the wheel for standard inputs, dialogs, or dropdowns.
*   **Separation of Concerns**: Keep purely visual pieces pure. Move complex state out of components and into custom hooks (e.g., use-rooms.ts).

## 11. Folder Structure
Our React structure is strictly domain-segregated:
*   /src/components/ui/ - Foundational shadcn/ui generic building blocks.
*   /src/components/ - Complex, project-specific assembled chunks (e.g., HeroSection.tsx, PropertyCard.tsx).
*   /src/pages/ - Top-level route modules (e.g., RegisterProperty.tsx, Rooms.tsx).
*   /src/lib/ - Shared constants, i18n configurations, API mock data, and global utilities.
*   /src/hooks/ - Reusable React lifecycle boundaries separating data logic from rendering.

## 12. Future Roadmap
1.  **Dashboard Scaffolding** (Immediate): Build out the analytical and management views for owners.
2.  **Authentication System**: Integrate JWT flows and login modals.
3.  **Backend Implementation**: Sync Node/Python backend with established TS types.
4.  **Booking Engine**: Operational calendar availability logic.
5.  **Payment Integration**: Secure, third-party payment processing.
