import { useState, useCallback } from 'react';

interface UseImageToolResult {
  image: string | null;
  processed: string | null;
  loading: boolean;
  setImage: (image: string | null) => void;
  setProcessed: (processed: string | null) => void;
  setLoading: (loading: boolean) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  downloadResult: () => void;
}

export function useImageTool(): UseImageToolResult {
  const [image, setImage] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setProcessed(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const downloadResult = useCallback(() => {
    if (!processed) return;

    const link = document.createElement('a');
    link.href = processed;
    link.download = `processed-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processed]);

  return {
    image,
    processed,
    loading,
    setImage,
    setProcessed,
    setLoading,
    handleImageUpload,
    downloadResult,
  };
}
