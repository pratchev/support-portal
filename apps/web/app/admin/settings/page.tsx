'use client';

import { useState, useEffect } from 'react';
import { NotificationSettingsForm } from '@/components/notifications/notification-settings-form';
import { apiClient } from '@/lib/api-client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.get('/settings/notifications');
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSuccess = () => {
    // Refresh settings after successful save
    apiClient.get('/settings/notifications').then(setSettings);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and notification preferences
        </p>
      </div>

      <NotificationSettingsForm
        initialData={settings}
        onSuccess={handleSuccess}
        isSystemSettings={true}
      />
    </div>
  );
}
