import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ImageModel = 'cogview-3-plus' | 'cogview-3-flash';

export type ImageSize = '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864';

export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3';

export type ImageStyle =
  | 'realistic'
  | 'anime'
  | 'oil-painting'
  | 'watercolor'
  | 'sketch'
  | '3d-render'
  | 'none';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: ImageModel;
  size: ImageSize;
  style: ImageStyle;
  timestamp: number;
}

interface ImageState {
  // 状态
  generatedImages: GeneratedImage[];
  selectedModel: ImageModel;
  selectedSize: ImageSize;
  selectedAspectRatio: AspectRatio;
  selectedStyle: ImageStyle;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setSelectedModel: (model: ImageModel) => void;
  setSelectedSize: (size: ImageSize) => void;
  setSelectedAspectRatio: (ratio: AspectRatio) => void;
  setSelectedStyle: (style: ImageStyle) => void;
  addImage: (image: GeneratedImage) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}

const ASPECT_RATIO_TO_SIZE: Record<AspectRatio, ImageSize> = {
  '1:1': '1024x1024',
  '9:16': '768x1344',
  '16:9': '1344x768',
  '3:4': '864x1152',
  '4:3': '1152x864',
};

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      // 初始状态
      generatedImages: [],
      selectedModel: 'cogview-3-flash',
      selectedSize: '1024x1024',
      selectedAspectRatio: '1:1',
      selectedStyle: 'none',
      isGenerating: false,
      error: null,

      // Actions
      setSelectedModel: (model) => {
        set({ selectedModel: model });
      },

      setSelectedSize: (size) => {
        set({ selectedSize: size });
      },

      setSelectedAspectRatio: (ratio) => {
        const size = ASPECT_RATIO_TO_SIZE[ratio];
        set({ selectedAspectRatio: ratio, selectedSize: size });
      },

      setSelectedStyle: (style) => {
        set({ selectedStyle: style });
      },

      addImage: (image) => {
        set((state) => ({
          generatedImages: [image, ...state.generatedImages],
        }));
      },

      removeImage: (id) => {
        set((state) => ({
          generatedImages: state.generatedImages.filter((img) => img.id !== id),
        }));
      },

      clearImages: () => {
        set({ generatedImages: [] });
      },

      setGenerating: (isGenerating) => {
        set({ isGenerating });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'bigmodel-image-storage',
      partialize: (state) => ({
        generatedImages: state.generatedImages,
        selectedModel: state.selectedModel,
        selectedSize: state.selectedSize,
        selectedAspectRatio: state.selectedAspectRatio,
        selectedStyle: state.selectedStyle,
      }),
    }
  )
);
