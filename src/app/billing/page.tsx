'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { 
  CreditCard, Download, Calendar, CheckCircle, X, AlertCircle,
  DollarSign, Receipt, Clock, Zap 
} from 'lucide-react';

interface PaymentTransaction {
  id: string;
  amount: number;
  amountInNaira: number;
  gateway: 'PAYSTACK' | 'FLUTTERWAVE' | 'QUICKTELLER';
  reference: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function BillingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    gateway: 'PAYSTACK' as const,
    description: 'Monthly subscription payment'
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    fetchPayments();
  }, [isAuthenticated, router]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setPayments(result.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) < 1) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          gateway: paymentForm.gateway,
          description: paymentForm.description
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Simulate payment process
        alert(`Payment initialized! Reference: ${result.data.reference}\nRedirecting to ${result.data.gateway} payment page...`);
        
        // Simulate payment completion after 2 seconds
        setTimeout(async () => {
          await fetch('http://localhost:5000/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              reference: result.data.reference,
              status: 'successful'
            })
          });
          
          await fetchPayments();
          setShowPaymentForm(false);
          setPaymentForm({ amount: '', gateway: 'PAYSTACK', description: 'Monthly subscription payment' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway) {
      case 'PAYSTACK': return 'bg-blue-100 text-blue-800';
      case 'FLUTTERWAVE': return 'bg-orange-100 text-orange-800';
      case 'QUICKTELLER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amountInNaira, 0);

  const thisMonthPaid = payments
    .filter(p => {
      const paymentDate = new Date(p.createdAt);
      const now = new Date();
      return p.status === 'SUCCESSFUL' && 
             paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.amountInNaira, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Payments</h1>
            <p className="text-gray-600">Manage your payments and billing history</p>
          </div>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Make Payment</span>
          </button>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Total Paid</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₦{totalPaid.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">All time payments</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">This Month</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ₦{thisMonthPaid.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">{new Date().toLocaleString('default', { month: 'long' })} payments</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Total Transactions</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {payments.length}
            </div>
            <p className="text-sm text-gray-500">
              {payments.filter(p => p.status === 'SUCCESSFUL').length} successful
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowPaymentForm(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Quick Payment</h3>
                  <p className="text-sm text-gray-600">Pay for your subscription</p>
                </div>
              </div>
            </button>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Download Receipts</h3>
                  <p className="text-sm text-gray-600">Get payment receipts</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Payment Schedule</h3>
                  <p className="text-sm text-gray-600">View upcoming payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
              <p className="text-gray-600 mb-4">Make your first payment to see your transaction history</p>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Make Your First Payment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payments.map(payment => (
                <div key={payment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{payment.description}</h3>
                          <p className="text-sm text-gray-500">Reference: {payment.reference}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₦{payment.amountInNaira.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGatewayColor(payment.gateway)}`}>
                          {payment.gateway}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Make Payment</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Gateway</label>
                  <select
                    value={paymentForm.gateway}
                    onChange={(e) => setPaymentForm({ ...paymentForm, gateway: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PAYSTACK">Paystack</option>
                    <option value="FLUTTERWAVE">Flutterwave</option>
                    <option value="QUICKTELLER">Quickteller</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Payment description"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={initiatePayment}
                  disabled={processing || !paymentForm.amount || parseFloat(paymentForm.amount) < 1}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
