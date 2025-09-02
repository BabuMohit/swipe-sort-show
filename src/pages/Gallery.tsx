import { useNavigate } from 'react-router-dom';
import { GalleryView } from '@/components/GalleryView';

const Gallery = () => {
  const navigate = useNavigate();

  const handleBackToSorting = () => {
    navigate('/');
  };

  return <GalleryView onBackToSorting={handleBackToSorting} />;
};

export default Gallery;