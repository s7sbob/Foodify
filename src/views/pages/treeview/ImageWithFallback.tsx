// src/components/ImageWithFallback.tsx

import React from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  style,
  fallbackSrc = '/placeholder.png', // Ensure this placeholder image exists in your public folder
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
