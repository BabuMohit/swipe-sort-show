import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useToast } from '@/hooks/use-toast';
import { RotateCw, Crop, Save, X } from 'lucide-react';

interface PhotoEditorProps {
  imageDataUrl: string;
  onSave: (editedDataUrl: string) => void;
  onCancel: () => void;
}

export function PhotoEditor({ imageDataUrl, onSave, onCancel }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const { toast } = useToast();

  // Load image when component mounts
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      drawImage(img, 0);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  const drawImage = useCallback((img: HTMLImageElement, rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const maxSize = 600;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();
  }, []);

  const handleRotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    if (originalImage) {
      drawImage(originalImage, newRotation);
    }
  }, [rotation, originalImage, drawImage]);

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create new canvas for cropped image
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    // Calculate crop dimensions
    const cropWidth = (canvas.width * crop.width) / 100;
    const cropHeight = (canvas.height * crop.height) / 100;
    const cropX = (canvas.width * crop.x) / 100;
    const cropY = (canvas.height * crop.y) / 100;

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    // Copy cropped area
    const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
    croppedCtx.putImageData(imageData, 0, 0);

    // Update main canvas
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    toast({
      title: "Cropped",
      description: "Image cropped successfully",
      duration: 1500,
    });
  }, [crop, toast]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const editedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onSave(editedDataUrl);
      toast({
        title: "Saved",
        description: "Photo edits saved successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to save edited photo:', error);
      toast({
        title: "Save Error",
        description: "Failed to save photo edits",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [onSave, toast]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-white/20"
          aria-label="Cancel editing"
        >
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-white font-semibold">Edit Photo</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="text-white hover:bg-white/20"
          aria-label="Save edits"
        >
          <Save className="w-5 h-5" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full border border-white/20 rounded-lg"
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50 space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="min-h-[48px] px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            aria-label="Rotate image 90 degrees"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCrop}
            className="min-h-[48px] px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            aria-label="Apply crop"
          >
            <Crop className="w-4 h-4 mr-2" />
            Crop
          </Button>
        </div>

        {/* Crop controls */}
        <div className="space-y-3">
          <div className="text-white text-sm">Crop Area:</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-xs">Width: {crop.width}%</label>
              <Slider
                value={[crop.width]}
                onValueChange={([width]) => setCrop(prev => ({ ...prev, width }))}
                min={10}
                max={100}
                step={5}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-white text-xs">Height: {crop.height}%</label>
              <Slider
                value={[crop.height]}
                onValueChange={([height]) => setCrop(prev => ({ ...prev, height }))}
                min={10}
                max={100}
                step={5}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}