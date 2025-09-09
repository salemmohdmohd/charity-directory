import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';
import Button from '../components/forms/Button';
import Checkbox from '../components/forms/Checkbox';
import { getNotificationPreferences, updateNotificationPreferences } from '../data/notificationAuth';

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    // Email preferences
    email_welcome: true,
    email_organization_updates: true,
    email_contact_messages: true,
    email_system_announcements: true,
    email_security_alerts: true,
    email_newsletter: false,
    email_reminders: true,

    // In-app preferences
    inapp_welcome: true,
    inapp_organization_updates: true,
    inapp_contact_messages: true,
    inapp_system_announcements: true,
    inapp_security_alerts: true,
    inapp_newsletter: false,
    inapp_reminders: true,

    // General preferences
    notification_frequency: 'immediate',
    email_digest_frequency: 'daily',
    timezone: 'UTC'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { state, dispatch } = useGlobalReducer();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
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
  };

  const handleCheckboxChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccessMessage(''); // Clear success message when making changes
  };

  const handleSelectChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleBulkEmailToggle = (enabled) => {
    const emailFields = [
      'email_welcome',
      'email_organization_updates',
      'email_contact_messages',
      'email_system_announcements',
      'email_security_alerts',
      'email_newsletter',
      'email_reminders'
    ];

    const updates = {};
    emailFields.forEach(field => {
      updates[field] = enabled;
    });

    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
    setSuccessMessage('');
  };

  const handleBulkInAppToggle = (enabled) => {
    const inappFields = [
      'inapp_welcome',
      'inapp_organization_updates',
      'inapp_contact_messages',
      'inapp_system_announcements',
      'inapp_security_alerts',
      'inapp_newsletter',
      'inapp_reminders'
    ];

    const updates = {};
    inappFields.forEach(field => {
      updates[field] = enabled;
    });

    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
    setSuccessMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">


          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage how and when you receive notifications from Charity Directory
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{successMessage}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Email Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
                <p className="text-sm text-gray-600">
                  Choose which email notifications you'd like to receive
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkEmailToggle(true)}
                >
                  Enable All
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkEmailToggle(false)}
                >
                  Disable All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                id="email_welcome"
                checked={preferences.email_welcome}
                onChange={(value) => handleCheckboxChange('email_welcome', value)}
                label="Welcome Messages"
                description="Receive welcome emails when you join or when organizations are approved"
              />

              <Checkbox
                id="email_organization_updates"
                checked={preferences.email_organization_updates}
                onChange={(value) => handleCheckboxChange('email_organization_updates', value)}
                label="Organization Updates"
                description="Get notified about updates to organizations you follow"
              />

              <Checkbox
                id="email_contact_messages"
                checked={preferences.email_contact_messages}
                onChange={(value) => handleCheckboxChange('email_contact_messages', value)}
                label="Contact Messages"
                description="Receive notifications when someone contacts your organization"
              />

              <Checkbox
                id="email_system_announcements"
                checked={preferences.email_system_announcements}
                onChange={(value) => handleCheckboxChange('email_system_announcements', value)}
                label="System Announcements"
                description="Important platform updates and maintenance notices"
              />

              <Checkbox
                id="email_security_alerts"
                checked={preferences.email_security_alerts}
                onChange={(value) => handleCheckboxChange('email_security_alerts', value)}
                label="Security Alerts"
                description="Login attempts and security-related notifications"
              />

              <Checkbox
                id="email_newsletter"
                checked={preferences.email_newsletter}
                onChange={(value) => handleCheckboxChange('email_newsletter', value)}
                label="Newsletter"
                description="Monthly newsletter with charity highlights and platform updates"
              />

              <Checkbox
                id="email_reminders"
                checked={preferences.email_reminders}
                onChange={(value) => handleCheckboxChange('email_reminders', value)}
                label="Reminders"
                description="Helpful reminders about incomplete profiles or pending actions"
              />
            </div>
          </div>

          {/* In-App Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">In-App Notifications</h2>
                <p className="text-sm text-gray-600">
                  Choose which notifications appear in your dashboard
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkInAppToggle(true)}
                >
                  Enable All
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkInAppToggle(false)}
                >
                  Disable All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                id="inapp_welcome"
                checked={preferences.inapp_welcome}
                onChange={(value) => handleCheckboxChange('inapp_welcome', value)}
                label="Welcome Messages"
                description="Show welcome notifications in your dashboard"
              />

              <Checkbox
                id="inapp_organization_updates"
                checked={preferences.inapp_organization_updates}
                onChange={(value) => handleCheckboxChange('inapp_organization_updates', value)}
                label="Organization Updates"
                description="Dashboard notifications for organization changes"
              />

              <Checkbox
                id="inapp_contact_messages"
                checked={preferences.inapp_contact_messages}
                onChange={(value) => handleCheckboxChange('inapp_contact_messages', value)}
                label="Contact Messages"
                description="Dashboard alerts for new contact messages"
              />

              <Checkbox
                id="inapp_system_announcements"
                checked={preferences.inapp_system_announcements}
                onChange={(value) => handleCheckboxChange('inapp_system_announcements', value)}
                label="System Announcements"
                description="Platform updates shown in dashboard"
              />

              <Checkbox
                id="inapp_security_alerts"
                checked={preferences.inapp_security_alerts}
                onChange={(value) => handleCheckboxChange('inapp_security_alerts', value)}
                label="Security Alerts"
                description="Security notifications in dashboard"
              />

              <Checkbox
                id="inapp_newsletter"
                checked={preferences.inapp_newsletter}
                onChange={(value) => handleCheckboxChange('inapp_newsletter', value)}
                label="Newsletter"
                description="Newsletter notifications in dashboard"
              />

              <Checkbox
                id="inapp_reminders"
                checked={preferences.inapp_reminders}
                onChange={(value) => handleCheckboxChange('inapp_reminders', value)}
                label="Reminders"
                description="Reminder notifications in dashboard"
              />
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="notification_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Frequency
                </label>
                <select
                  id="notification_frequency"
                  value={preferences.notification_frequency}
                  onChange={(e) => handleSelectChange('notification_frequency', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly Digest</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  How often you want to receive notifications
                </p>
              </div>

              <div>
                <label htmlFor="email_digest_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Digest Frequency
                </label>
                <select
                  id="email_digest_frequency"
                  value={preferences.email_digest_frequency}
                  onChange={(e) => handleSelectChange('email_digest_frequency', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  How often to receive email summaries
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className={isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;
