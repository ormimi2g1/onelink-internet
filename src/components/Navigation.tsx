'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center mr-3">
                {/* One Link Internet Logo - Two interlocking chain-links */}
                <div className="relative">
                  <svg className="h-10 w-10" viewBox="0 0 40 40" fill="none">
                    {/* First chain link with gradient */}
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#29ABE2'}} />
                        <stop offset="100%" style={{stopColor: '#0052CC'}} />
                      </linearGradient>
                    </defs>
                    {/* First link (rotated 45°) */}
                    <ellipse cx="15" cy="15" rx="8" ry="4" stroke="url(#logoGradient)" strokeWidth="3" fill="none" transform="rotate(45 15 15)" />
                    {/* Second link (rotated 45°, interlocked) */}
                    <ellipse cx="25" cy="25" rx="8" ry="4" stroke="url(#logoGradient)" strokeWidth="3" fill="none" transform="rotate(45 25 25)" />
                  </svg>
                </div>
              </div>
              <div className="text-xl font-bold" style={{letterSpacing: '0.5px'}}>
                <span className="text-gray-900 font-bold uppercase" style={{color: '#003366'}}>ONE LINK</span>
                <span className="text-blue-600 ml-2 font-normal" style={{color: '#0052CC'}}>Internet</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/plans"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Plans
                </Link>
                <Link
                  href="/usage"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Usage
                </Link>
                <Link
                  href="/billing"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Billing
                </Link>
                <Link
                  href="/support"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Support
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-purple-700 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium font-semibold"
                  >
                    Admin
                  </Link>
                )}
                <NotificationBell />
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 text-sm">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/plans"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Plans
                </Link>
                <Link
                  href="/auth"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
