import { useGetCallerUserProfile, useUpdateProfile } from '../hooks/useCurrentUserProfile';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { isDark, toggleTheme, themeColor, setThemeColor } = useTheme();
  const [localColor, setLocalColor] = useState(themeColor);

  // Sync local color with theme context when it loads
  useEffect(() => {
    setLocalColor(themeColor);
  }, [themeColor]);

  // Live preview: update theme color as user changes it
  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    setThemeColor(newColor);
  };

  const handleSaveTheme = () => {
    if (!userProfile) return;

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
            <p className="text-sm text-muted-foreground mb-2">
              Choose your primary color (changes apply immediately)
            </p>
            <div className="flex gap-2">
              <Input
                type="color"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#ea580c"
              />
            </div>
            <Button onClick={handleSaveTheme} disabled={isPending} className="mt-2">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Theme
            </Button>
          </div>

          {/* Preview section */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Preview</Label>
            <div className="flex gap-2 flex-wrap">
              <Button variant="default">Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Primary buttons and focus rings will use your selected color
            </p>
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
