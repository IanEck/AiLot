// src/config/mediaDefaults.ts

// Add this at the top of the file
const CDN_URL = 'https://d2piq6txt4uym9.cloudfront.net'; // You'll get this URL from CloudFront

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
        url: `${CDN_URL}/videos/eye-light-gradient-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-light-gradient-compressed-mobile.mp4`,
        header: 'When the tech improves every week, what is timeless?',
        fallbackUrl: `${CDN_URL}/images/eye-dark-gradient_2.1.1.webp`
      },
      b: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-light-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-light-compressed-mobile.mp4`,
        header: 'When the tech improves every week, what is timeless?',
        fallbackUrl: `${CDN_URL}/images/eye-dark_1.1.1.webp`
      }
    },
    {
      a: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-gradient-compressed.mp4`,
        mobileUrl: `${CDN_URL}/videos/eye-gradient-compressed-mobile.mp4`,
        header: 'What\'s the ceiling on AI video models?',
        fallbackUrl: `${CDN_URL}/images/eye-gradient_2.3.1.webp`
      },
      b: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-compressed-mobile.mp4`,
        header: 'What\'s the ceiling on AI video models?',
        fallbackUrl: `${CDN_URL}/images/eye1.3.1.webp`
      }
    },
    {
      a: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-lens-gradient-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-lens-gradient-compressed-mobile.mp4`,
        header: 'What jobs will AI create in the media industry?',
        fallbackUrl: `${CDN_URL}/images/eye-lens-gradient_2.2.1.webp`
      },
      b: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-lens-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-lens-compressed-mobile.mp4`,
        header: 'What jobs will AI create in the media industry?',
        fallbackUrl: `${CDN_URL}/images/eye-cloud_1.2.1.webp`
      }
    },
    {
      a: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-pit-gradient-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-pit-gradient-compressed-mobile.mp4`,
        header: 'Can you direct a dataset?',
        fallbackUrl: `${CDN_URL}/images/eye-pit-gradient_2.4.1.webp`
      },
      b: { 
        type: 'video', 
        url: `${CDN_URL}/videos/eye-pit-compressed.mp4`, 
        mobileUrl: `${CDN_URL}/videos/eye-pit-compressed-mobile.mp4`,
        header: 'Can you direct a dataset?',
        fallbackUrl: `${CDN_URL}/images/eye-pit_1.4.1.webp`
      }
    }
  ];
  
  