'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/lib/auth';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, register, loading } = useAuth();

  const handleSubmit = async (data: any) => {
    setError(null);
    
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await register({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone
        });
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleModeChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
  };

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onModeChange={handleModeChange}
    />
  );
}
