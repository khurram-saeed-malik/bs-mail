# ByteShifted Mail - Email Management Platform

## Overview

ByteShifted Mail is a professional email management platform built as a web application that provides a control panel for managing email domains, mailboxes, and aliases. The application is built on a Mailcow infrastructure and features a modern React frontend with an Express.js backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: OpenID Connect (OIDC) via Replit Auth
- **Session Management**: Express sessions with PostgreSQL storage
- **API**: RESTful API design with JSON responses

### Database Architecture
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Zod schema validation
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
The application uses Replit's OpenID Connect authentication system with the following components:
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/update on login
- **Route Protection**: Middleware-based authentication guards
- **OAuth Flow**: Standard OIDC discovery and token exchange

### Email Management System
Core email management functionality through Mailcow API integration:
- **Domain Management**: Create, update, and delete email domains
- **Mailbox Management**: Full CRUD operations for email accounts
- **Alias Management**: Email forwarding and alias configuration
- **Quota Management**: Storage limits and usage tracking

### Data Models
- **Users**: Profile information, plan types, and domain limits
- **Domains**: Email domains with Mailcow integration IDs
- **Mailboxes**: Email accounts with quotas and settings
- **Aliases**: Email forwarding rules and destinations

### UI Components
- **Layout**: Header navigation with user dropdown and sidebar navigation
- **Forms**: Modal-based creation and editing forms
- **Data Display**: Card-based layouts with statistics and tables
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

### Authentication Flow
1. User accesses protected route
2. System checks for valid session
3. If not authenticated, redirects to Replit OAuth
4. On successful auth, user data is stored/updated in database
5. Session is established with PostgreSQL backing

### Email Operations Flow
1. User performs action in UI (create domain, mailbox, etc.)
2. Frontend validates input using Zod schemas
3. API request sent to Express backend
4. Backend validates user permissions and data
5. Mailcow API call made to perform actual email operation
6. Database updated with operation results
7. Frontend state refreshed via TanStack Query

### Error Handling
- **Frontend**: Toast notifications for user feedback
- **Backend**: Structured error responses with appropriate HTTP codes
- **Database**: Transaction rollbacks on failures
- **External API**: Graceful handling of Mailcow API failures

## External Dependencies

### Core Dependencies
- **Mailcow**: Email server management platform
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: OpenID Connect authentication provider

### npm Dependencies
- **Frontend**: React ecosystem, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Drizzle ORM, OpenID Client, Express Session
- **Shared**: Zod for validation, date-fns for date handling

### Development Tools
- **Vite**: Frontend build tool with HMR
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Automatic reloading for both frontend and backend changes
- **Environment Variables**: Database URL, Mailcow credentials, session secrets

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: ESBuild compilation to single JavaScript file
- **Static Assets**: Served from Express with proper caching headers

### Environment Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Sessions**: PostgreSQL-backed session store
- **Authentication**: Replit OIDC with domain allowlisting
- **External APIs**: Mailcow API with authentication

### Security Considerations
- **HTTPS Only**: Secure cookie settings for production
- **CORS**: Configured for specific domains
- **Input Validation**: Zod schemas on both client and server
- **SQL Injection**: Prevented through Drizzle ORM parameterized queries

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.