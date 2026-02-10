'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';

const notificationSettingsSchema = z.object({
  notifyEndUserOnReply: z.boolean(),
  notifyAgentOnNewTicket: z.boolean(),
  notifyManagerOnNewTicket: z.boolean(),
  useTeamEmail: z.boolean(),
  teamEmail: z.string().email().optional().or(z.literal('')),
  emailFromName: z.string().optional(),
  emailFromAddress: z.string().email().optional().or(z.literal('')),
  emailProvider: z.enum(['graph', 'smtp']),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().optional(),
});

type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

interface NotificationSettingsFormProps {
  initialData?: Partial<NotificationSettings>;
  onSuccess?: () => void;
  isSystemSettings?: boolean;
}

export function NotificationSettingsForm({
  initialData = {},
  onSuccess,
  isSystemSettings = false,
}: NotificationSettingsFormProps) {
  const [formData, setFormData] = useState<NotificationSettings>({
    notifyEndUserOnReply: initialData.notifyEndUserOnReply ?? true,
    notifyAgentOnNewTicket: initialData.notifyAgentOnNewTicket ?? true,
    notifyManagerOnNewTicket: initialData.notifyManagerOnNewTicket ?? true,
    useTeamEmail: initialData.useTeamEmail ?? false,
    teamEmail: initialData.teamEmail ?? '',
    emailFromName: initialData.emailFromName ?? '',
    emailFromAddress: initialData.emailFromAddress ?? '',
    emailProvider: initialData.emailProvider ?? 'smtp',
    smtpHost: initialData.smtpHost ?? '',
    smtpPort: initialData.smtpPort ?? 587,
    smtpUser: initialData.smtpUser ?? '',
    smtpPassword: initialData.smtpPassword ?? '',
    smtpSecure: initialData.smtpSecure ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = <K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      notificationSettingsSchema.parse(formData);

      const endpoint = isSystemSettings ? '/settings/notifications' : '/users/me/notification-preferences';
      await apiClient.post(endpoint, formData);

      setSuccess('Settings saved successfully!');
      onSuccess?.();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join(', '));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save settings');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post('/settings/test-email', {
        emailProvider: formData.emailProvider,
        smtpHost: formData.smtpHost,
        smtpPort: formData.smtpPort,
        smtpUser: formData.smtpUser,
        smtpPassword: formData.smtpPassword,
        smtpSecure: formData.smtpSecure,
      });
      setSuccess('Test email sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isSystemSettings ? 'System Notification Settings' : 'Your Notification Preferences'}
          </CardTitle>
          <CardDescription>
            {isSystemSettings
              ? 'Configure email notifications for the entire support portal'
              : 'Manage your personal notification preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Toggles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Rules</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyEndUserOnReply">Notify End Users on Reply</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to users when agents reply to their tickets
                </p>
              </div>
              <Switch
                id="notifyEndUserOnReply"
                checked={formData.notifyEndUserOnReply}
                onCheckedChange={(checked) => updateField('notifyEndUserOnReply', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyAgentOnNewTicket">Notify Agents on New Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to agents when new tickets are created
                </p>
              </div>
              <Switch
                id="notifyAgentOnNewTicket"
                checked={formData.notifyAgentOnNewTicket}
                onCheckedChange={(checked) => updateField('notifyAgentOnNewTicket', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifyManagerOnNewTicket">Notify Managers on New Tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to managers when new tickets are created
                </p>
              </div>
              <Switch
                id="notifyManagerOnNewTicket"
                checked={formData.notifyManagerOnNewTicket}
                onCheckedChange={(checked) => updateField('notifyManagerOnNewTicket', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Email Settings */}
          {isSystemSettings && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Settings</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="useTeamEmail">Use Team Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send from a shared team email instead of individual agent emails
                    </p>
                  </div>
                  <Switch
                    id="useTeamEmail"
                    checked={formData.useTeamEmail}
                    onCheckedChange={(checked) => updateField('useTeamEmail', checked)}
                  />
                </div>

                {formData.useTeamEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="teamEmail">Team Email Address</Label>
                    <Input
                      id="teamEmail"
                      type="email"
                      placeholder="support@company.com"
                      value={formData.teamEmail}
                      onChange={(e) => updateField('teamEmail', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="emailFromName">Email From Name</Label>
                  <Input
                    id="emailFromName"
                    placeholder="Support Team"
                    value={formData.emailFromName}
                    onChange={(e) => updateField('emailFromName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFromAddress">Email From Address</Label>
                  <Input
                    id="emailFromAddress"
                    type="email"
                    placeholder="noreply@company.com"
                    value={formData.emailFromAddress}
                    onChange={(e) => updateField('emailFromAddress', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Email Provider Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Provider</h3>

                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Provider</Label>
                  <Select
                    value={formData.emailProvider}
                    onValueChange={(value: 'graph' | 'smtp') => updateField('emailProvider', value)}
                  >
                    <SelectTrigger id="emailProvider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="graph">Microsoft Graph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.emailProvider === 'smtp' && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">SMTP Configuration</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          placeholder="smtp.gmail.com"
                          value={formData.smtpHost}
                          onChange={(e) => updateField('smtpHost', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          placeholder="587"
                          value={formData.smtpPort || ''}
                          onChange={(e) => {
                            const port = parseInt(e.target.value, 10);
                            updateField('smtpPort', isNaN(port) ? 587 : port);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        placeholder="your-email@gmail.com"
                        value={formData.smtpUser}
                        onChange={(e) => updateField('smtpUser', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.smtpPassword}
                        onChange={(e) => updateField('smtpPassword', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="smtpSecure">Use TLS/SSL</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable secure connection (recommended)
                        </p>
                      </div>
                      <Switch
                        id="smtpSecure"
                        checked={formData.smtpSecure}
                        onCheckedChange={(checked) => updateField('smtpSecure', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm">
              {success}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            {isSystemSettings && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                disabled={isTesting || isSubmitting}
              >
                {isTesting ? 'Sending...' : 'Send Test Email'}
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
