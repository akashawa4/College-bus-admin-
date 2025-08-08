import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Plus, Edit2, Trash2, Search, ArrowRight } from 'lucide-react';
import { customToast } from '../../lib/notifications';
import AddRouteModal from './AddRouteModal';
import EditRouteModal from './EditRouteModal';

export interface Route {
  id: string;
  routeName: string;
  fromLocation: string;
  toLocation: string;
}

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const fetchRoutes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'routes'));
      const routesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Route[];
      setRoutes(routesData);
    } catch (error) {
      customToast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await deleteDoc(doc(db, 'routes', id));
      setRoutes(routes.filter(route => route.id !== id));
      customToast.success('Route deleted successfully');
    } catch (error) {
      customToast.error('Failed to delete route');
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-600 mt-1">Manage bus routes and destinations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Route
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes by name or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Routes table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{route.routeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                          {route.fromLocation}
                        </span>
                        <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                          {route.toLocation}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingRoute(route)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
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
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    {searchTerm ? 'No routes found matching your search.' : 'No routes found. Add your first route to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddRouteModal
          onClose={() => setShowAddModal(false)}
          onRouteAdded={fetchRoutes}
        />
      )}

      {editingRoute && (
        <EditRouteModal
          route={editingRoute}
          onClose={() => setEditingRoute(null)}
          onRouteUpdated={fetchRoutes}
        />
      )}
    </div>
  );
};

export default RoutesPage;