import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { customToast } from '../../lib/notifications';
import AddBusModal from './AddBusModal';
import EditBusModal from './EditBusModal';
import { Driver } from '../drivers/DriversPage';

export interface Route {
  id: string;
  routeName: string;
  fromLocation: string;
  toLocation: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  assignedDriver?: string;
  driverName?: string;
  route?: string;
  routeName?: string;
}

const BusesPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  const fetchData = async () => {
    try {
      // Fetch buses
      const busesSnapshot = await getDocs(collection(db, 'buses'));
      const busesData = busesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bus[];

      // Fetch drivers
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      const driversData = driversSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Driver[];

      // Fetch routes
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Route[];

      setBuses(busesData);
      setDrivers(driversData);
      setRoutes(routesData);
    } catch (error) {
      customToast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      await deleteDoc(doc(db, 'buses', id));
      setBuses(buses.filter(bus => bus.id !== id));
      customToast.success('Bus deleted successfully');
    } catch (error) {
      customToast.error('Failed to delete bus');
    }
  };

  const getDriverName = (driverId?: string) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || 'Unassigned';
  };

  const getRouteName = (routeId?: string) => {
    const route = routes.find(r => r.id === routeId);
    return route?.routeName || 'Unassigned';
  };

  const filteredBuses = buses.filter(bus =>
    bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDriverName(bus.assignedDriver).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRouteName(bus.route).toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-600 mt-1">Manage bus fleet and assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Bus
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search buses by number, driver, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Buses table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuses.length > 0 ? (
                filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bus.busNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.assignedDriver ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {getDriverName(bus.assignedDriver)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.route ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getRouteName(bus.route)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingBus(bus)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBus(bus.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    {searchTerm ? 'No buses found matching your search.' : 'No buses found. Add your first bus to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddBusModal
          drivers={drivers}
          routes={routes}
          onClose={() => setShowAddModal(false)}
          onBusAdded={fetchData}
        />
      )}

      {editingBus && (
        <EditBusModal
          bus={editingBus}
          drivers={drivers}
          routes={routes}
          onClose={() => setEditingBus(null)}
          onBusUpdated={fetchData}
        />
      )}
    </div>
  );
};

export default BusesPage;