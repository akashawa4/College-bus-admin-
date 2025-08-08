import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Download, Calendar, TrendingUp, Users, Bus, Route } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportData {
  totalDrivers: number;
  totalBuses: number;
  totalRoutes: number;
  activeDrivers: number;
  assignedBuses: number;
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalDrivers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    activeDrivers: 0,
    assignedBuses: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch drivers
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch buses
      const busesSnapshot = await getDocs(collection(db, 'buses'));
      const buses = busesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch routes
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routes = routesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate metrics
      const assignedBuses = buses.filter(bus => bus.assignedDriver).length;
      const activeDrivers = drivers.filter(driver => 
        buses.some(bus => bus.assignedDriver === driver.id)
      ).length;

      setReportData({
        totalDrivers: drivers.length,
        totalBuses: buses.length,
        totalRoutes: routes.length,
        activeDrivers,
        assignedBuses
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExport = () => {
    const csvContent = [
      'Metric,Value',
      `Total Drivers,${reportData.totalDrivers}`,
      `Total Buses,${reportData.totalBuses}`,
      `Total Routes,${reportData.totalRoutes}`,
      `Active Drivers,${reportData.activeDrivers}`,
      `Assigned Buses,${reportData.assignedBuses}`,
      '',
      `Report Generated,${new Date().toLocaleDateString()}`,
      `Date Range,${dateRange.startDate} to ${dateRange.endDate}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bus-management-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    percentage?: number;
  }> = ({ title, value, icon, color, percentage }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {percentage !== undefined && (
            <p className={`text-sm mt-1 flex items-center ${
              percentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {percentage}% utilization
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">System overview and performance metrics</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            Report Period:
          </div>
          <div className="flex gap-4 items-center">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Drivers"
          value={reportData.totalDrivers}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        
        <StatCard
          title="Total Buses"
          value={reportData.totalBuses}
          icon={<Bus className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        
        <StatCard
          title="Total Routes"
          value={reportData.totalRoutes}
          icon={<Route className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
        />
        
        <StatCard
          title="Active Drivers"
          value={reportData.activeDrivers}
          icon={<Users className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100"
          percentage={reportData.totalDrivers > 0 ? Math.round((reportData.activeDrivers / reportData.totalDrivers) * 100) : 0}
        />
        
        <StatCard
          title="Assigned Buses"
          value={reportData.assignedBuses}
          icon={<Bus className="h-6 w-6 text-teal-600" />}
          color="bg-teal-100"
          percentage={reportData.totalBuses > 0 ? Math.round((reportData.assignedBuses / reportData.totalBuses) * 100) : 0}
        />
        
        <StatCard
          title="Unassigned Buses"
          value={reportData.totalBuses - reportData.assignedBuses}
          icon={<Bus className="h-6 w-6 text-red-600" />}
          color="bg-red-100"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Summary</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-medium">Driver Utilization:</span> {reportData.activeDrivers} out of {reportData.totalDrivers} drivers are currently assigned to buses
            ({reportData.totalDrivers > 0 ? Math.round((reportData.activeDrivers / reportData.totalDrivers) * 100) : 0}% utilization).
          </p>
          <p>
            <span className="font-medium">Fleet Status:</span> {reportData.assignedBuses} out of {reportData.totalBuses} buses have assigned drivers
            ({reportData.totalBuses > 0 ? Math.round((reportData.assignedBuses / reportData.totalBuses) * 100) : 0}% assigned).
          </p>
          <p>
            <span className="font-medium">Route Coverage:</span> The system currently manages {reportData.totalRoutes} routes across the network.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;