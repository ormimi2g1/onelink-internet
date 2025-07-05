'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { User, Settings, CreditCard, Wifi, BarChart3, Phone, Mail, Package, Calendar, MapPin } from 'lucide-react';

interface ServicePlan {
  id: string;
  name: string;
  region: string;
  speed: string;
  price: number;
  priceInNaira: number;
  type: string;
  features: string[];
  description: string;
  isActive: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  nextRenewal: string;
  monthlyFee: number;
  address: string;
  installationDate: string | null;
  plan: ServicePlan;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, loading, router]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your One Link Internet account and services
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Account Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Subscription */}
          {activeSubscription ? (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Active Subscription</h2>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">₦{activeSubscription.plan.priceInNaira.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{activeSubscription.plan.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4" />
                      <span>Speed: {activeSubscription.plan.speed}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Region: {activeSubscription.plan.region}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Next Renewal: {new Date(activeSubscription.nextRenewal).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Installation Address</h4>
                  <p className="text-sm text-gray-600">{activeSubscription.address}</p>
                  {activeSubscription.installationDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Installed: {new Date(activeSubscription.installationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-sm p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Get Started with One Link Internet</h2>
                  <p className="text-blue-100 mb-4">
                    Choose from our high-speed internet plans and enjoy unlimited connectivity
                  </p>
                  <Link 
                    href="/plans"
                    className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-block"
                  >
                    Browse Plans
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Wifi className="w-16 h-16 text-blue-200" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link 
              href="/plans"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Service Plans</h3>
                  <p className="text-sm text-gray-500">Browse & subscribe</p>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Billing</h3>
                  <p className="text-sm text-gray-500">View payments</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Usage</h3>
                  <p className="text-sm text-gray-500">Monitor data</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-500">Account settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
                {user.isEmailVerified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium text-gray-900">{user.phone}</span>
                {user.isPhoneVerified && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Role:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{user.role.toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium text-gray-900">Personal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Joined</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Plans</h3>
                <p className="text-sm text-gray-600">Browse available internet plans</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Usage Stats</h3>
                <p className="text-sm text-gray-600">Monitor your data usage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Manage account settings</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
