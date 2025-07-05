# OneLink VS Code - Modern Web App Workspace

This is a modern web application workspace built with Next.js, TypeScript, and React. The project is designed to create a comprehensive development environment with best practices and modern tooling.

## Tech Stack

- **Next.js 15+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting and quality
- **npm** - Package management

## Project Structure

```
src/
├── app/          # App Router pages
├── components/   # React components
├── lib/          # Utility functions
├── types/        # TypeScript type definitions
└── styles/       # Additional styles (when needed)
```

## Getting Started

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Development Guidelines

- Use TypeScript for all new files
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Prefer server components when possible
- Use proper TypeScript types and interfaces

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
