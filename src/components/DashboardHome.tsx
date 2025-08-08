import React, { useState, useEffect } from 'react';
import { Users, Bus, Route, TrendingUp } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { customToast } from '../lib/notifications';

interface DashboardStats {
  totalDrivers: number;
  totalBuses: number;
  totalRoutes: number;
  activeToday: number;
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch total drivers
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const totalDrivers = driversSnapshot.size;

      // Fetch total buses
      const busesSnapshot = await getDocs(collection(db, 'buses'));
      const totalBuses = busesSnapshot.size;

      // Fetch total routes
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const totalRoutes = routesSnapshot.size;

      // Fetch active drivers today (drivers with recent location updates)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const activeToday = locationsSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (data.lastUpdated) {
          const lastUpdated = data.lastUpdated.toDate();
          return lastUpdated >= today && data.isOnline === true;
        }
        return false;
      }).length;

      setStats({
        totalDrivers,
        totalBuses,
        totalRoutes,
        activeToday
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      customToast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to the Bus Management System</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalDrivers
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Bus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Buses</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalBuses
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Route className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalRoutes
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.activeToday
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/drivers"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Manage Drivers</p>
                <p className="text-sm text-gray-500">Add, edit, and manage driver accounts</p>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/buses"
            className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
          >
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-green-600 group-hover:text-green-700" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Manage Buses</p>
                <p className="text-sm text-gray-500">Configure bus fleet and assignments</p>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/routes"
            className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
          >
            <div className="flex items-center">
              <Route className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Manage Routes</p>
                <p className="text-sm text-gray-500">Set up and manage bus routes</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-800">System is running smoothly</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {loading ? 'Loading statistics...' : `${stats.activeToday} out of ${stats.totalDrivers} drivers active today`}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {loading ? '--' : `${Math.round((stats.activeToday / Math.max(stats.totalDrivers, 1)) * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;