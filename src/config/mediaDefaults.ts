// src/config/mediaDefaults.ts
export type MediaItem = {
    type: 'image' | 'video';
    url: string;
    mobileUrl?: string;  // <-- add mobile URL here
    header?: string;
    fallbackUrl?: string;
  };
  
  
  export type MediaSlot = {
    a: MediaItem;
    b: MediaItem;
  };
  
  
  export const defaultMediaSlots: MediaSlot[] = [
    {
      a: { 
        type: 'video', 
        url: '/videos/eye-gradient-compressed.mp4', 
        mobileUrl: '/videos/eye-gradient-compressed-mobile.mp4',
        header: 'What’s the ceiling on AI video models',
        fallbackUrl: '/images/eye-gradient_2.3.1.webp'
      },
      b: { 
        type: 'video', 
        url: '/videos/eye-compressed.mp4', 
        mobileUrl: '/videos/eye-compressed-mobile.mp4',
        header: 'What’s the ceiling on AI video models?',
        fallbackUrl: '/images/eye1.3.1.webp'
      }
    },
    {
      a: { 
        type: 'video', 
        url: '/videos/eye-light-gradient-compressed.mp4', 
        mobileUrl: '/videos/eye-light-gradient-compressed-mobile.mp4',
        header: 'When the tech improves every week, what is timeless?',
        fallbackUrl: '/images/eye-dark-gradient_2.1.1.webp'
      },
      b: { 
        type: 'video', 
        url: '/videos/eye-light-compressed.mp4', 
        mobileUrl: '/videos/eye-light-compressed-mobile.mp4',
        header: 'When the tech improves every week, what is timeless?',
        fallbackUrl: '/images/eye-dark_1.1.1.webp'
      }
    },
    {
      a: { 
        type: 'video', 
        url: '/videos/eye-pit-gradient-compressed.mp4', 
        mobileUrl: '/videos/eye-pit-gradient-compressed-mobile.mp4',
        header: 'Can you direct a dataset?',
        fallbackUrl: '/images/eye-pit-gradient_2.4.1.webp'
      },
      b: { 
        type: 'video', 
        url: '/videos/eye-pit-compressed.mp4', 
        mobileUrl: '/videos/eye-pit-compressed-mobile.mp4',
        header: 'Can you direct a dataset?',
        fallbackUrl: '/images/eye-pit_1.4.1.webp'
      }
    },
    {
      a: { 
        type: 'video', 
        url: '/videos/eye-lens-gradient-compressed.mp4', 
        mobileUrl: '/videos/eye-lens-gradient-compressed-mobile.mp4',
        header: 'What jobs will AI create in the media industry?',
        fallbackUrl: '/images/eye-lens-gradient_2.2.1.webp'
      },
      b: { 
        type: 'video', 
        url: '/videos/eye-lens-compressed.mp4', 
        mobileUrl: '/videos/eye-lens-compressed-mobile.mp4',
        header: 'What jobs will AI create in the media industry?',
        fallbackUrl: '/images/eye-cloud_1.2.1.webp'
      }
    }
  ];
  
  