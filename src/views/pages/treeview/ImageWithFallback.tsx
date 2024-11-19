// src/components/ImageWithFallback.tsx

import React, { useState, useEffect } from 'react';

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
  fallbackSrc = '/placeholder.png', // تأكد من وجود صورة بديلة في مجلد public
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  // تحديث imgSrc عندما يتغير src المرسل من المكون الأب
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{
        backgroundColor: '#FFFFFF', // لون الخلفية الافتراضي
        ...style,
      }}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
