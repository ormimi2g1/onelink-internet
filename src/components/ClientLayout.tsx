'use client';

import { AuthProvider } from '@/lib/auth';
import Navigation from './Navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navigation />
      {children}
    </AuthProvider>
  );
}
