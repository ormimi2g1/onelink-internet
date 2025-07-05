'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

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

export default function PlansPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      // Fetch regions
      const regionsResponse = await fetch('http://localhost:5000/api/regions', {
        credentials: 'include'
      });
      const regionsData = await regionsResponse.json();
      
      if (regionsData.success) {
        setRegions(regionsData.data);
        setSelectedRegion(regionsData.data[0] || '');
      }

      // Fetch plans
      const plansResponse = await fetch('http://localhost:5000/api/plans', {
        credentials: 'include'
      });
      const plansData = await plansResponse.json();
      
      if (plansData.success) {
        setPlans(plansData.data);
      }

      // Fetch user subscriptions
      const subscriptionsResponse = await fetch('http://localhost:5000/api/subscriptions', {
        credentials: 'include'
      });
      const subscriptionsData = await subscriptionsResponse.json();
      
      if (subscriptionsData.success) {
        setSubscriptions(subscriptionsData.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!address.trim()) {
      setError('Please provide your full address');
      return;
    }

    setSubscribing(planId);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          address,
          installationDate: installationDate || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh subscriptions
        await fetchData();
        setShowSubscriptionForm(null);
        setAddress('');
        setInstallationDate('');
        alert('Subscription created successfully!');
      } else {
        setError(data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError('Failed to create subscription');
    } finally {
      setSubscribing(null);
    }
  };

  const filteredPlans = selectedRegion 
    ? plans.filter(plan => plan.region === selectedRegion)
    : plans;

  const hasActiveSubscription = subscriptions.some(sub => sub.status === 'ACTIVE');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Plans</h1>
          <p className="text-gray-600">Choose the perfect internet plan for your needs</p>
        </div>

        {/* Current Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Current Subscriptions</h2>
            <div className="grid gap-4">
              {subscriptions.map(sub => (
                <div key={sub.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{sub.plan.name}</h3>
                      <p className="text-gray-600">{sub.plan.region} • {sub.plan.speed}</p>
                      <p className="text-sm text-gray-500">Status: <span className={`font-medium ${sub.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>{sub.status}</span></p>
                      <p className="text-sm text-gray-500">Next Renewal: {new Date(sub.nextRenewal).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">₦{sub.plan.priceInNaira.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Region Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">₦{plan.priceInNaira.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">per month</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-900 mb-2">Speed: {plan.speed}</p>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {showSubscriptionForm === plan.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete address for installation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Installation Date</label>
                      <input
                        type="date"
                        value={installationDate}
                        onChange={(e) => setInstallationDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={subscribing === plan.id}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {subscribing === plan.id ? 'Creating...' : 'Confirm Subscription'}
                      </button>
                      <button
                        onClick={() => setShowSubscriptionForm(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSubscriptionForm(plan.id)}
                    disabled={hasActiveSubscription}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      hasActiveSubscription
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasActiveSubscription ? 'Already Subscribed' : 'Subscribe Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
