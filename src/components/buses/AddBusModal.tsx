import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X } from 'lucide-react';
import { customToast } from '../../lib/notifications';
import { Driver } from '../drivers/DriversPage';
import { Route } from './BusesPage';

interface AddBusModalProps {
  drivers: Driver[];
  routes: Route[];
  onClose: () => void;
  onBusAdded: () => void;
}

const AddBusModal: React.FC<AddBusModalProps> = ({ drivers, routes, onClose, onBusAdded }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    assignedDriver: '',
    route: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.busNumber.trim()) {
      customToast.error('Bus number is required');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'buses'), {
        busNumber: formData.busNumber.trim(),
        assignedDriver: formData.assignedDriver || null,
        route: formData.route || null,
        createdAt: new Date()
      });
      
      customToast.success('Bus added successfully');
      onBusAdded();
      onClose();
    } catch (error) {
      customToast.error('Failed to add bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add New Bus</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Number
              </label>
              <input
                type="text"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter bus number (e.g., BUS-001)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Driver
              </label>
              <select
                value={formData.assignedDriver}
                onChange={(e) => setFormData({ ...formData, assignedDriver: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a driver (optional)</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a route (optional)</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName} ({route.fromLocation} → {route.toLocation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Bus'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBusModal;