// src/config/mediaDefaults.ts
export type MediaItem = {
    type: 'image' | 'video';
    url: string;
    header?: string;
  };
  
  export type MediaSlot = {
    a: MediaItem;
    b: MediaItem;
  };
  
  export const defaultMediaSlots: MediaSlot[] = [
    {
      a: { type: 'video', url: '/videos/eye-gradient-compressed.mp4', header: 'What’s the ceiling on AI video models?' },
      b: { type: 'video', url: '/videos/eye-compressed.mp4', header: 'What’s the ceiling on AI video models?' }
    },
    {
      a: { type: 'video', url: '/videos/eye-light-gradient-compressed.mp4', header: 'When the tech improves every week, what is timeless?' },
      b: { type: 'video', url: '/videos/eye-light-compressed.mp4', header: 'When the tech improves every week, what is timeless?' }
    },
    {
      a: { type: 'video', url: '/videos/eye-pit-gradient-compressed.mp4', header: 'Can you direct a dataset?' },
      b: { type: 'video', url: '/videos/eye-pit-compressed.mp4', header: 'Can you direct a dataset?' }
    },
    {
      a: { type: 'video', url: '/videos/eye-lens-gradient-compressed.mp4', header: 'What jobs will AI create in the media industry?' },
      b: { type: 'video', url: '/videos/eye-lens-compressed.mp4', header: 'What jobs will AI create in the media industry?' }
    }
  ];
  