import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Smartphone, Download, QrCode, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface InstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallGuide({ isOpen, onClose }: InstallGuideProps) {
  const [showQRCode, setShowQRCode] = useState(false);

  const appLink = "lovable://swipe-sort-show";
  const playStoreLink = "https://play.google.com/store/apps/details?id=app.lovable.b0c1f919f97445429917eb05d5f1e846";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Get Mobile App
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* App Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Native Mobile Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Full camera and gallery access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Offline photo sorting</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Background sync and notifications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Better performance and battery life</span>
              </div>
            </CardContent>
          </Card>

          {/* Installation Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Installation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method 1: Direct Download */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Option 1</Badge>
                  <span className="font-medium">Direct APK Download</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Download and install the APK file directly from Median.co
                </p>
                <Button
                  variant="outline"
                  className="w-full min-h-[48px]"
                  onClick={() => window.open('https://median.co/download/swipe-sort-show.apk', '_blank')}
                  aria-label="Download APK file"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download APK
                </Button>
              </div>

              {/* Method 2: Play Store */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Option 2</Badge>
                  <span className="font-medium">Google Play Store</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Install from the official Play Store (available after publishing)
                </p>
                <Button
                  variant="outline"
                  className="w-full min-h-[48px]"
                  onClick={() => window.open(playStoreLink, '_blank')}
                  aria-label="Open Play Store"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Play Store
                </Button>
              </div>

              {/* Method 3: QR Code */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Option 3</Badge>
                  <span className="font-medium">QR Code</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan QR code with your mobile device
                </p>
                <Button
                  variant="outline"
                  className="w-full min-h-[48px]"
                  onClick={() => setShowQRCode(!showQRCode)}
                  aria-label="Show QR code"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQRCode ? 'Hide' : 'Show'} QR Code
                </Button>
                
                {showQRCode && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                      <div className="absolute text-xs text-center">
                        QR Code<br />Placeholder
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Installation Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">1</Badge>
                  <div className="text-sm">
                    <strong>Enable Unknown Sources:</strong> Go to Settings → Security → Enable "Install from Unknown Sources"
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">2</Badge>
                  <div className="text-sm">
                    <strong>Download APK:</strong> Click the download button or scan the QR code
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">3</Badge>
                  <div className="text-sm">
                    <strong>Install:</strong> Open the downloaded APK file and tap "Install"
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">4</Badge>
                  <div className="text-sm">
                    <strong>Grant Permissions:</strong> Allow camera and storage access when prompted
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deep Link Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test App Link</CardTitle>
              <p className="text-sm text-muted-foreground">
                If you already have the app installed, test the deep link
              </p>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full min-h-[48px]"
                onClick={() => window.open(appLink, '_blank')}
                aria-label="Open app via deep link"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in App
              </Button>
            </CardContent>
          </Card>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full min-h-[48px] bg-gradient-primary border-0 text-primary-foreground"
            aria-label="Close install guide"
          >
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}