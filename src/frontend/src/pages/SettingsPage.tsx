import { useGetCallerUserProfile, useUpdateProfile } from '../hooks/useCurrentUserProfile';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { isDark, toggleTheme, themeColor, setThemeColor } = useTheme();
  const [localColor, setLocalColor] = useState(themeColor);

  const handleSaveTheme = () => {
    if (!userProfile) return;

    setThemeColor(localColor);
    updateProfile(
      {
        username: userProfile.username,
        displayName: userProfile.displayName,
        themeColor: localColor,
        darkMode: isDark,
      },
      {
        onSuccess: () => {
          toast.success('Theme saved');
        },
        onError: (error) => {
          toast.error('Failed to save theme: ' + error.message);
        },
      }
    );
  };

  const handleToggleDarkMode = () => {
    if (!userProfile) return;

    const newDarkMode = !isDark;
    toggleTheme();

    updateProfile(
      {
        username: userProfile.username,
        displayName: userProfile.displayName,
        themeColor: userProfile.themeColor,
        darkMode: newDarkMode,
      },
      {
        onError: (error) => {
          toast.error('Failed to save preference: ' + error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch checked={isDark} onCheckedChange={handleToggleDarkMode} />
          </div>

          <div className="space-y-2">
            <Label>Theme Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                placeholder="#ea580c"
              />
            </div>
            <Button onClick={handleSaveTheme} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Theme
            </Button>
          </div>
        </div>
      </Card>

      <footer className="text-center text-sm text-muted-foreground py-8">
        © 2026. Built with ❤️ using{' '}
        <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline">
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
