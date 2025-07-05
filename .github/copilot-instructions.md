# GitHub Copilot Instructions

## Project Overview
This is a Next.js TypeScript React application designed to create a modern web app workspace. The project uses:
- Next.js 15+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- npm for package management

## Code Standards and Guidelines

### Development Preferences
- Use TypeScript for all new files
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Prefer server components when possible, use client components only when needed
- Use proper TypeScript types and interfaces

### File Organization
- Components go in `src/components/`
- Pages use App Router in `src/app/`
- Utilities in `src/lib/`
- Types in `src/types/`
- Styles in `src/styles/` (when needed beyond Tailwind)

### Code Style
- Use arrow functions for components
- Use named exports for components
- Use proper TypeScript interfaces for props
- Follow Next.js 15+ conventions
- Use ESLint and Prettier for code formatting

### Testing
- Write unit tests for components
- Use Jest and React Testing Library
- Test user interactions and accessibility
- Ensure components are properly typed

## Architecture Notes
- This is a single-page application with client-side routing
- Uses the App Router pattern for better performance
- Leverages React Server Components where appropriate
- Tailwind CSS provides utility-first styling approach

## Common Tasks
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
