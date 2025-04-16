import React, { useState, useRef, useEffect } from 'react';
import { Settings2, X, Upload, ArrowRight } from 'lucide-react';
import { defaultMediaSlots } from './config/mediaDefaults';
import useIsMobile from './hooks/useIsMobile';


type Position = {
  activeLayer: number;
  transitionDelay: number;
  backgroundPosition?: { x: number; y: number };
  flipDirection?: 'left' | 'right' | null;
};

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  header?: string;
};

type MediaSlot = {
  a: MediaItem;
  b: MediaItem;
};

function App() {
  const isMobile = useIsMobile();
  const [showControls, setShowControls] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [mediaSlots, setMediaSlots] = useState(defaultMediaSlots);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [preloadedVideos, setPreloadedVideos] = useState<{ [key: string]: HTMLVideoElement }>({});

  // Locked settings
  const rows = 1;
  const cols = 8;
  const cornerRadius = 0;
  const numLayers = 4;
  const floatScale = 1;
  const floatHeight = 2;
  const floatDepth = 16;
  const blurAmount = 0;

  const [positions, setPositions] = useState<Position[]>(
    Array.from({ length: 1 }, () => ({
      activeLayer: 0,
      transitionDelay: 0,
      flipDirection: null
    }))
  );
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>(Array(1).fill(null));
  const videoRefs = useRef<(HTMLVideoElement | null)[][]>(
    Array(numLayers).fill(null).map(() => Array(1).fill(null))
  );
  const fullscreenVideoRefs = useRef<(HTMLVideoElement | null)[]>(Array(numLayers).fill(null));
  const cellRefs = useRef<(HTMLDivElement | null)[]>(Array(1).fill(null));

  const getOriginalPosition = () => ({
    x: 50,
    y: 50
  });
  

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, layerIndex: number, slot: 'a' | 'b') => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setMediaSlots(prev => prev.map((item, index) =>
        index === layerIndex ? {
          ...item,
          [slot]: {
            ...item[slot],
            type,
            url
          }
        } : item
      ));
    }
  };

  const handleHeaderChange = (layerIndex: number, slot: 'a' | 'b', value: string) => {
    setMediaSlots(prev => prev.map((item, index) =>
      index === layerIndex ? {
        ...item,
        [slot]: {
          ...item[slot],
          header: value
        }
      } : item
    ));
  };

  useEffect(() => {
    mediaSlots.forEach((slot, layerIndex) => {
      if (slot.a.type === 'video' && fullscreenVideoRefs.current[layerIndex]) {
        const video = fullscreenVideoRefs.current[layerIndex];
        if (video) {
          video.currentTime = 0;
          video.play().catch(error => {
            console.log('Fullscreen video autoplay failed:', error);
          });
        }
      }

      if (slot.b.type === 'video') {
        const videos = videoRefs.current[layerIndex];
        if (videos) {
          const playPromises = videos
            .filter(video => video !== null)
            .map(video => {
              if (video) {
                video.currentTime = 0;
                return video.play();
              }
              return Promise.resolve();
            });

          Promise.all(playPromises).catch(error => {
            console.log('Tiled video autoplay failed:', error);
          });
        }
      }
    });
  }, [mediaSlots]);

  const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>, layerIndex: number, cellIndex: number) => {
    const video = event.currentTarget;
    const videos = videoRefs.current[layerIndex];

    if (videos) {
      videos.forEach((otherVideo, i) => {
        if (otherVideo && i !== cellIndex && Math.abs(otherVideo.currentTime - video.currentTime) > 0.1) {
          otherVideo.currentTime = video.currentTime;
        }
      });
    }
  };

  const handleCascadingFlip = (direction: 'right' | 'left', startPoint: 'right' | 'left') => {
    if (isFlipping) return;
    setIsFlipping(true);

    const newFlipDirection = direction === 'left' ? 'right' : 'left';
    const leftPanelDuration = 600;

    setTimeout(() => {
      setPositions(currentPositions => {
        const updatedPositions = [...currentPositions];
        const currentLayer = updatedPositions[0].activeLayer;
        const nextLayer = direction === 'left'
          ? (currentLayer + 1) % numLayers
          : (currentLayer - 1 + numLayers) % numLayers;

        updatedPositions[0] = {
          activeLayer: nextLayer,
          transitionDelay: 0,
          backgroundPosition: getOriginalPosition(),
          flipDirection: newFlipDirection,
        };

        return updatedPositions;
      });

      setTimeout(() => setIsFlipping(false), 600);
    }, leftPanelDuration);
  };

  // Preload next video
  useEffect(() => {
    const preloadVideo = async (url: string) => {
      if (!preloadedVideos[url]) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        video.muted = true;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
        
        setPreloadedVideos(prev => ({ ...prev, [url]: video }));
      }
    };

    // Preload next video in sequence
    const currentIndex = positions[0]?.activeLayer || 0;
    const nextIndex = (currentIndex + 1) % mediaSlots.length;
    const nextVideoUrl = isMobile ? mediaSlots[nextIndex]?.a.mobileUrl : mediaSlots[nextIndex]?.a.url;
    
    if (nextVideoUrl) {
      preloadVideo(nextVideoUrl);
    }
  }, [positions, mediaSlots, isMobile]);

  // Update video loading states
  const handleVideoLoading = (url: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [url]: isLoading }));
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--float-scale', floatScale.toString());
    document.documentElement.style.setProperty('--float-height', `-${floatHeight}px`);
    document.documentElement.style.setProperty('--float-depth', `${floatDepth}px`);
    document.documentElement.style.setProperty('--blur-amount', `${blurAmount}px`);
  }, []);

  // <-- Add the auto-flip effect here:
useEffect(() => {
  const autoFlipInterval = setInterval(() => {
    if (!isFlipping) {
      handleCascadingFlip('right', 'right');
    }
  }, 8000); // Flip every 8 seconds

  return () => clearInterval(autoFlipInterval);
}, [isFlipping]);

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden flex flex-col-reverse md:flex-row border-[0.5rem] border-black">
      <div className="md:w-1/2 w-full md:h-full h-1/2 bg-gray-900 relative overflow-hidden md:border-r-[0.5rem] md:border-black">
        <div className="absolute inset-0 z-10 flex flex-col items-start justify-center p-6">
          <h2 className="text-white text-4xl font-bold drop-shadow-lg mb-4 font-space-grotesk">
            {mediaSlots[positions[0]?.activeLayer]?.a.header}
          </h2>
          <div className="flex gap-2 mt-4">
          <button
  style={{
    width: '192px',
    height: '62px',
    top: '605.17px',
    left: '99px',
    borderWidth: '1px',
    padding: '0 27.35px',
    gap: '9.12px',
    backgroundColor: 'white',
    color: 'black',
    fontFamily: 'Space Mono, monospace',
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: '100%',
    letterSpacing: '1.14px',
    textAlign: 'center',
  }}
  className="rounded-none border border-black"
  onClick={() => window.open("https://airtable.com/appRpU91ro4CMTHVd/paghic61rXUeGaece/form", "_blank")}
>
  JOIN WAITLIST
</button>

            <button
              onClick={() => handleCascadingFlip('right', 'right')}
              className="p-5 rounded-full border border-black bg-transparent hover:bg-white transition-colors"
              aria-label="Flip right"
              disabled={isFlipping}
            >
              <ArrowRight className="w-5 h-5 text-black" />
            </button>

          </div>
        </div>
        {Array(numLayers).fill(0).map((_, layerIndex) => (
          <div
            key={`fullscreen-${layerIndex}`}
            className={`absolute inset-0 ${positions[0]?.activeLayer === layerIndex
              ? positions[0]?.flipDirection === 'right'
                ? 'slide-right-in'
                : positions[0]?.flipDirection === 'left'
                  ? 'slide-left-in'
                  : ''
              : positions[0]?.flipDirection === 'right'
                ? 'slide-left-out'
                : positions[0]?.flipDirection === 'left'
                  ? 'slide-right-out'
                  : 'opacity-0'
              }`}
          >

          {mediaSlots[layerIndex]?.a.type === 'video' ? (
            <div className="relative w-full h-full">
              {loadingStates[mediaSlots[layerIndex]?.a.url] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <video
                ref={el => {
                  fullscreenVideoRefs.current[layerIndex] = el;
                  if (el) {
                    el.addEventListener('error', (e) => {
                      console.error('Video error:', e);
                      console.error('Video source:', el.src);
                    });
                    el.addEventListener('loadeddata', () => {
                      console.log('Video loaded:', el.src);
                      handleVideoLoading(el.src, false);
                    });
                    el.addEventListener('waiting', () => {
                      handleVideoLoading(el.src, true);
                    });
                  }
                }}
                className="absolute w-full h-full object-cover"
                src={isMobile && mediaSlots[layerIndex]?.a.mobileUrl ? mediaSlots[layerIndex].a.mobileUrl : mediaSlots[layerIndex].a.url}
                poster={mediaSlots[layerIndex]?.a.fallbackUrl || ''}
                preload="metadata"
                muted
                playsInline
                loop
                autoPlay
                onError={(e) => console.error('Video error:', e)}
                onLoadedData={() => console.log('Video loaded successfully')}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${mediaSlots[layerIndex]?.a.url}")`,
              }}
            />
          )}

          </div>
        ))}
      </div>

      <div className="relative md:w-1/2 w-full md:h-full h-1/2 md:border-none border-t-[0.rem] border-black">
        <button
          onClick={() => setShowControls(!showControls)}
          className="fixed top-4 right-4 z-[1000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {showControls ? <X className="w-6 h-6 text-white" /> : <Settings2 className="w-6 h-6 text-white" />}
        </button>

        <div
          className={`fixed right-0 top-0 h-full w-full md:w-80 bg-gray-800 p-6 transform transition-transform duration-300 ease-in-out z-[999] overflow-y-auto ${showControls ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <h2 className="text-white text-xl font-bold mb-6">Media Controls</h2>

          <div className="space-y-6">
            <div className="space-y-4">
              {Array(numLayers).fill(0).map((_, index) => (
                <div key={index} className="space-y-4 border-b border-gray-700 pb-4">
                  <h4 className="text-white font-medium">Layer {index + 1}</h4>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-300">Fullscreen Header</label>
                    <input
                      type="text"
                      value={mediaSlots[index]?.a.header || ''}
                      onChange={(e) => handleHeaderChange(index, 'a', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Enter header text..."
                    />
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current[index * 2] = el}
                      onChange={(e) => handleMediaUpload(e, index, 'a')}
                      accept="image/*,video/mp4"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs.current[index * 2]?.click()}
                      className="w-full p-3 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Fullscreen Media
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-300">Grid Header</label>
                    <input
                      type="text"
                      value={mediaSlots[index]?.b.header || ''}
                      onChange={(e) => handleHeaderChange(index, 'b', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                      placeholder="Enter header text..."
                    />
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={el => fileInputRefs.current[index * 2 + 1] = el}
                      onChange={(e) => handleMediaUpload(e, index, 'b')}
                      accept="image/*,video/mp4"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs.current[index * 2 + 1]?.click()}
                      className="w-full p-3 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Grid Media
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-container">
          {Array(numLayers).fill(0).map((_, layerIndex) => (
            <div
              key={layerIndex}
              className={`grid-layer ${positions[0]?.activeLayer === layerIndex ? 'active' : 'inactive'}`}
            >
              <div
                ref={el => cellRefs.current[0] = el}
                className={`grid-cell ${positions[0]?.activeLayer === layerIndex ? 'mask-visible' : 'mask-hidden'} ${
                  positions[0]?.flipDirection === 'right' ? 'flip-right-in' : 
                  positions[0]?.flipDirection === 'left' ? 'flip-left-in' : ''
                }`}
                style={{
                  borderRadius: `${cornerRadius}px`,
                  transitionDelay: `${positions[0]?.transitionDelay}ms`,
                  gridColumn: '1 / -1',
                  gridRow: '1 / span 1'
                }}
              >
                {mediaSlots[layerIndex]?.b.type === 'video' ? (
                  <div className="video-container">
                    <video
                      ref={el => {
                        if (videoRefs.current[layerIndex]) {
                          videoRefs.current[layerIndex][0] = el;
                        }
                      }}
                      onTimeUpdate={(e) => handleVideoTimeUpdate(e, layerIndex, 0)}
                      className="video-tile"
                      src={isMobile && mediaSlots[layerIndex]?.b.mobileUrl ? mediaSlots[layerIndex].b.mobileUrl : mediaSlots[layerIndex].b.url}
                      poster={mediaSlots[layerIndex]?.b.fallbackUrl || ''}
                      muted
                      playsInline
                      loop
                      autoPlay
                    />
                  </div>
                ) : (
                  <div
                    className="image-container"
                    style={{
                      backgroundImage: `url("${mediaSlots[layerIndex]?.b.url}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}
                <div className="noise-overlay" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;