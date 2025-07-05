'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Wifi, Zap, Clock, TrendingUp, Download, Upload, Activity, 
  Gauge, Calendar, AlertCircle, CheckCircle 
} from 'lucide-react';

interface UsageData {
  id: string;
  period: string;
  dataUsed: number;
  dataLimit: number;
  createdAt: string;
}

interface SpeedTest {
  id: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  location: string;
  testDate: string;
}

export default function UsagePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [speedTests, setSpeedTests] = useState<SpeedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSpeedTest, setRunningSpeedTest] = useState(false);
  const [currentSpeedTest, setCurrentSpeedTest] = useState<{
    download: number;
    upload: number;
    ping: number;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    try {
      // Fetch usage data
      const usageResponse = await fetch('http://localhost:5000/api/usage', {
        credentials: 'include'
      });
      const usageResult = await usageResponse.json();
      
      if (usageResult.success) {
        setUsageData(usageResult.data);
      }

      // Fetch speed tests
      const speedResponse = await fetch('http://localhost:5000/api/speed-tests', {
        credentials: 'include'
      });
      const speedResult = await speedResponse.json();
      
      if (speedResult.success) {
        setSpeedTests(speedResult.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const runSpeedTest = async () => {
    setRunningSpeedTest(true);
    setCurrentSpeedTest({ download: 0, upload: 0, ping: 0 });

    // Simulate speed test with progressive values
    const steps = 20;
    const targetDownload = Math.random() * 80 + 20; // 20-100 Mbps
    const targetUpload = targetDownload * 0.7; // Usually lower than download
    const targetPing = Math.random() * 30 + 10; // 10-40 ms

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setCurrentSpeedTest({
        download: (targetDownload / steps) * i,
        upload: (targetUpload / steps) * i,
        ping: targetPing + Math.random() * 5 - 2.5
      });
    }

    // Save speed test result
    try {
      const jitter = Math.random() * 5 + 1;
      const response = await fetch('http://localhost:5000/api/speed-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          downloadSpeed: parseFloat(targetDownload.toFixed(2)),
          uploadSpeed: parseFloat(targetUpload.toFixed(2)),
          ping: parseFloat(targetPing.toFixed(2)),
          jitter: parseFloat(jitter.toFixed(2)),
          location: 'Lagos, Nigeria',
          serverId: 'LG-001'
        })
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error saving speed test:', error);
    }

    setRunningSpeedTest(false);
  };

  const currentUsage = usageData[0];
  const usagePercentage = currentUsage ? 
    currentUsage.dataLimit === -1 ? 0 : 
    (currentUsage.dataUsed / currentUsage.dataLimit) * 100 : 0;

  const chartData = usageData.slice(0, 6).reverse().map(item => ({
    month: item.period,
    usage: item.dataUsed,
    limit: item.dataLimit === -1 ? null : item.dataLimit
  }));

  const recentSpeedTests = speedTests.slice(0, 5);
  const avgDownload = speedTests.length > 0 ? 
    speedTests.reduce((sum, test) => sum + test.downloadSpeed, 0) / speedTests.length : 0;
  const avgUpload = speedTests.length > 0 ? 
    speedTests.reduce((sum, test) => sum + test.uploadSpeed, 0) / speedTests.length : 0;
  const avgPing = speedTests.length > 0 ? 
    speedTests.reduce((sum, test) => sum + test.ping, 0) / speedTests.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading usage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage & Performance</h1>
          <p className="text-gray-600">Monitor your internet usage and network performance</p>
        </div>

        {/* Current Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Current Month</h3>
              </div>
              <span className="text-sm text-gray-500">
                {currentUsage?.period || new Date().toISOString().slice(0, 7)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Used</span>
                <span className="font-medium">{currentUsage?.dataUsed.toFixed(1) || '0.0'} GB</span>
              </div>
              {currentUsage?.dataLimit !== -1 && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{usagePercentage.toFixed(1)}% used</span>
                    <span>{currentUsage?.dataLimit} GB limit</span>
                  </div>
                </>
              )}
              {currentUsage?.dataLimit === -1 && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Unlimited Data</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Avg Download</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {avgDownload.toFixed(1)} <span className="text-lg font-normal">Mbps</span>
            </div>
            <p className="text-sm text-gray-500">Based on {speedTests.length} tests</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Avg Upload</h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {avgUpload.toFixed(1)} <span className="text-lg font-normal">Mbps</span>
            </div>
            <p className="text-sm text-gray-500">Ping: {avgPing.toFixed(0)}ms average</p>
          </div>
        </div>

        {/* Speed Test Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Speed Test</h3>
            </div>
            <button
              onClick={runSpeedTest}
              disabled={runningSpeedTest}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningSpeedTest ? 'Testing...' : 'Run Speed Test'}
            </button>
          </div>

          {currentSpeedTest && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {currentSpeedTest.download.toFixed(1)} Mbps
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {currentSpeedTest.upload.toFixed(1)} Mbps
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentSpeedTest.ping.toFixed(0)} ms
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Ping</span>
                </div>
              </div>
            </div>
          )}

          {recentSpeedTests.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Speed Tests</h4>
              <div className="space-y-2">
                {recentSpeedTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">
                        {new Date(test.testDate).toLocaleDateString()}
                      </span>
                      <span className="text-green-600">{test.downloadSpeed.toFixed(1)}↓</span>
                      <span className="text-orange-600">{test.uploadSpeed.toFixed(1)}↑</span>
                      <span className="text-blue-600">{test.ping.toFixed(0)}ms</span>
                    </div>
                    <span className="text-gray-400">{test.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Usage Chart */}
        {usageData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Usage Trend</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} GB`, 
                      name === 'usage' ? 'Data Used' : 'Data Limit'
                    ]}
                  />
                  <Bar dataKey="usage" fill="#3B82F6" name="usage" />
                  {chartData.some(item => item.limit) && (
                    <Bar dataKey="limit" fill="#E5E7EB" name="limit" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
