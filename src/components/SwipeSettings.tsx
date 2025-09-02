import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PhotoStorage, UserSettings, Album } from '@/lib/photoStorage';
import { useToast } from '@/hooks/use-toast';
import { Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Save, RefreshCw } from 'lucide-react';

interface SwipeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  albums: Album[];
}

export function SwipeSettings({ isOpen, onClose, albums }: SwipeSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(PhotoStorage.getUserSettings());
  const { toast } = useToast();

  const handleSaveSettings = () => {
    try {
      PhotoStorage.saveUserSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your swipe mappings have been updated",
        duration: 2000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save settings",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleResetToDefaults = () => {
    setSettings({
      swipeMappings: {
        up: 'favorites',
        down: 'archive',
        left: 'archive',
        right: 'favorites'
      },
      enableNotifications: true,
      autoBackup: false
    });
    toast({
      title: "Reset to defaults",
      description: "Swipe mappings reset to default values",
      duration: 2000,
    });
  };

  const getAlbumOptions = () => {
    return albums.filter(album => album.id !== 'all' && album.id !== 'recent');
  };

  const getAlbumName = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    return album ? `${album.icon} ${album.name}` : albumId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Swipe Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Swipe Mappings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Swipe to Album</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assign swipe directions to move photos to specific albums during sorting
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Swipe Up */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-4 h-4 text-muted-foreground" />
                  <Label>Swipe Up</Label>
                </div>
                <Select
                  value={settings.swipeMappings.up}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      swipeMappings: { ...prev.swipeMappings, up: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-40 min-h-[48px]" aria-label="Swipe up action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAlbumOptions().map(album => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.icon} {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swipe Down */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  <Label>Swipe Down</Label>
                </div>
                <Select
                  value={settings.swipeMappings.down}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      swipeMappings: { ...prev.swipeMappings, down: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-40 min-h-[48px]" aria-label="Swipe down action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAlbumOptions().map(album => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.icon} {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swipe Left */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  <Label>Swipe Left</Label>
                </div>
                <Select
                  value={settings.swipeMappings.left}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      swipeMappings: { ...prev.swipeMappings, left: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-40 min-h-[48px]" aria-label="Swipe left action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAlbumOptions().map(album => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.icon} {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swipe Right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Label>Swipe Right</Label>
                </div>
                <Select
                  value={settings.swipeMappings.right}
                  onValueChange={(value) => 
                    setSettings(prev => ({
                      ...prev,
                      swipeMappings: { ...prev.swipeMappings, right: value }
                    }))
                  }
                >
                  <SelectTrigger className="w-40 min-h-[48px]" aria-label="Swipe right action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAlbumOptions().map(album => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.icon} {album.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={handleResetToDefaults}
                className="w-full min-h-[48px]"
                aria-label="Reset swipe mappings to defaults"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, enableNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autobackup">Auto Backup to Cloud</Label>
                <Switch
                  id="autobackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, autoBackup: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Mappings Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-3 h-3" />
                  <span>→ {getAlbumName(settings.swipeMappings.up)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-3 h-3" />
                  <span>→ {getAlbumName(settings.swipeMappings.down)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-3 h-3" />
                  <span>→ {getAlbumName(settings.swipeMappings.left)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>→ {getAlbumName(settings.swipeMappings.right)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 min-h-[48px]"
              aria-label="Cancel settings changes"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="flex-1 min-h-[48px] bg-gradient-primary border-0 text-primary-foreground"
              aria-label="Save settings changes"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}