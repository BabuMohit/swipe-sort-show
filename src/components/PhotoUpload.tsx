import { useState } from 'react';
import { CameraPhoto } from './CameraPhoto';
import { PhotoStorage, UploadedPhoto } from '@/lib/photoStorage';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: UploadedPhoto[]) => void;
  existingPhotos: UploadedPhoto[];
}

export function PhotoUpload({ onPhotosUploaded }: PhotoUploadProps) {
  return (
    <div className="w-full">
      <CameraPhoto onPhotoCaptured={onPhotosUploaded} />
    </div>
  );
}