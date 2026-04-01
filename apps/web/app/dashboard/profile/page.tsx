'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { get, patch, isAuthenticated } = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const data = await get<UserProfile>('/api/users/me');
        setProfile(data);
        setName(data.name);
        setAvatar(data.avatar || '');
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [get, isAuthenticated]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage('');
    try {
      const updated = await patch<UserProfile>(`/api/users/${profile.id}`, {
        name: name || undefined,
        avatar: avatar || undefined,
      });
      setProfile(updated);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="h-16 w-16 text-muted-foreground" />
            )}
            <div>
              <CardTitle>{profile?.name}</CardTitle>
              <CardDescription>
                {profile?.email} · {profile?.role}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Avatar URL</label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input value={profile?.email || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Member since
            </label>
            <Input
              value={
                profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : ''
              }
              disabled
            />
          </div>

          {message && (
            <p
              className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-destructive'}`}
            >
              {message}
            </p>
          )}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
