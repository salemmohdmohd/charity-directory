import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import { getNotificationPreferences, updateNotificationPreferences } from '../data/notificationAuth';
import useAuth from '../hooks/useAuth';
import NotificationGroup from './NotificationSettings/NotificationGroup';
import { emailFields, inAppFields } from './NotificationSettings/fields';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading notification settings...</p>
    </div>
  </div>
);

const Alert = ({ type, title, message }) => {
  const baseClasses = 'mb-6 rounded-md p-4 border';
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
};

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { dispatch } = useGlobalReducer();
  const { isAuthenticated } = useAuth();

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getNotificationPreferences();
      if (response.success) {
        setPreferences(response.preferences);
      } else {
        setError(response.message || 'Failed to load notification preferences');
      }
    } catch (err) {
      setError('Failed to load notification preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated, loadPreferences]);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setSuccessMessage('');
  };

  const handleBulkToggle = (fields, enabled) => {
    const updates = fields.reduce((acc, field) => {
      acc[field.id] = enabled;
      return acc;
    }, {});
    setPreferences(prev => ({ ...prev, ...updates }));
    setSuccessMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await updateNotificationPreferences(preferences);
      if (response.success) {
        setSuccessMessage('Notification preferences updated successfully!');
        dispatch({
          type: 'SET_SUCCESS',
          payload: 'Notification preferences updated successfully!'
        });
      } else {
        setError(response.message || 'Failed to update preferences');
      }
    } catch (err) {
      setError('Failed to update notification preferences');
      console.error('Error updating preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notification Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage how and when you receive notifications from Charity Directory.
          </p>
        </header>

        {error && <Alert type="error" title="Error" message={error} />}
        {successMessage && <Alert type="success" title="Success" message={successMessage} />}

        <form onSubmit={handleSave} className="space-y-8">
          <NotificationGroup
            title="Email Notifications"
            description="Choose which email notifications you'd like to receive."
            preferences={preferences}
            fields={emailFields}
            onToggle={handlePreferenceChange}
            onBulkToggle={(enabled) => handleBulkToggle(emailFields, enabled)}
          />

          <NotificationGroup
            title="In-App Notifications"
            description="Choose which notifications appear in your dashboard."
            preferences={preferences}
            fields={inAppFields}
            onToggle={handlePreferenceChange}
            onBulkToggle={(enabled) => handleBulkToggle(inAppFields, enabled)}
          />

          <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200/80">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="notification_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Frequency
                </label>
                <select
                  id="notification_frequency"
                  value={preferences.notification_frequency || 'immediate'}
                  onChange={(e) => handlePreferenceChange('notification_frequency', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly Digest</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">How often you want to receive notifications.</p>
              </div>
              <div>
                <label htmlFor="email_digest_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Digest Frequency
                </label>
                <select
                  id="email_digest_frequency"
                  value={preferences.email_digest_frequency || 'daily'}
                  onChange={(e) => handlePreferenceChange('email_digest_frequency', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">How often to receive email summaries.</p>
              </div>
            </div>
          </div>

          <footer className="flex justify-end items-center space-x-4 pt-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;
