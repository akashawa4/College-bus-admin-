import React, { useState } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { X } from 'lucide-react';
import { customToast } from '../../lib/notifications';

interface AddDriverModalProps {
  onClose: () => void;
  onDriverAdded: () => void;
}

const AddDriverModal: React.FC<AddDriverModalProps> = ({ onClose, onDriverAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.password.trim()) {
      customToast.error('Please fill in all fields');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      customToast.error('Please enter a valid phone number');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      customToast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Convert phone number to email format for Firebase Auth
      const email = `${formData.phoneNumber.trim().replace(/[\s\-\(\)]/g, '')}@busapp.com`;
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        formData.password
      );
      
      const userId = userCredential.user.uid;
      
      // Create driver document with the same ID as Firebase Auth user
      await setDoc(doc(db, 'drivers', userId), {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: email,
        userId: userId,
        createdAt: new Date(),
        status: 'active'
      });

      // Create initial location document for the driver
      await setDoc(doc(db, 'locations', userId), {
        driverId: userId,
        driverName: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        latitude: null,
        longitude: null,
        lastUpdated: new Date(),
        isOnline: false,
        currentRoute: null,
        currentBus: null
      });
      
      customToast.success('Driver added successfully! Driver can now login with their phone number.');
      onDriverAdded();
      onClose();
    } catch (error: any) {
      console.error('Error creating driver:', error);
      if (error.code === 'auth/email-already-in-use') {
        customToast.error('A driver with this phone number already exists');
      } else if (error.code === 'auth/weak-password') {
        customToast.error('Password is too weak. Please choose a stronger password');
      } else {
        customToast.error(`Failed to add driver: ${error.message}`);
      }
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
            <h3 className="text-lg font-semibold text-gray-900">Add New Driver</h3>
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
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter driver name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +1234567890"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Driver will login using this phone number in their app
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Driver will use this password to login
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Phone number gets converted to email format (phone@busapp.com) for Firebase Auth</li>
                <li>• User ID from Firebase Auth will match the document ID in drivers collection</li>
                <li>• Location updates will be saved to locations collection in Firestore</li>
                <li>• Driver can login using their phone number and password in the driver app</li>
              </ul>
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
                {loading ? 'Creating Driver...' : 'Add Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDriverModal;