import { useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { PhotoStorage, UploadedPhoto } from '@/lib/photoStorage';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: UploadedPhoto[]) => void;
  existingPhotos: UploadedPhoto[];
}

export function PhotoUpload({ onPhotosUploaded, existingPhotos }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const newPhotos = await PhotoStorage.processFiles(files);
      
      if (newPhotos.length === 0) {
        toast({
          title: "No valid photos",
          description: "Please select JPG, PNG, or WebP images under 10MB",
          variant: "destructive",
        });
        return;
      }

      const allPhotos = [...existingPhotos, ...newPhotos];
      await PhotoStorage.savePhotos(allPhotos);
      onPhotosUploaded(allPhotos);

      toast({
        title: `${newPhotos.length} photos added`,
        description: `Total: ${allPhotos.length} photos in collection`,
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process photos",
        variant: "destructive",
      });
    }
  };

  const handleClearPhotos = async () => {
    PhotoStorage.clearPhotos();
    onPhotosUploaded([]);
    toast({
      title: "Photos cleared",
      description: "All photos removed from collection",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Import Your Photos</h2>
              <p className="text-muted-foreground text-sm">
                Add photos to sort through. Supports JPG, PNG, and WebP files.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] bg-gradient-primary text-primary-foreground shadow-action hover:shadow-elevated"
                size="lg"
              >
                📷 Select Photos
              </Button>

              {existingPhotos.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[44px]"
                  >
                    ➕ Add More
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearPhotos}
                    className="flex-1 min-h-[44px] text-destructive hover:text-destructive"
                  >
                    🗑️ Clear All
                  </Button>
                </div>
              )}
            </div>

            {existingPhotos.length > 0 && (
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm">
                  <span className="font-medium">{existingPhotos.length} photos</span> ready to sort
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}