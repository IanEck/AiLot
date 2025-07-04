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
  const [preloadedVideos, setPreloadedVideos] = useState<{ [key: string]: HTMLVideoElement }>({});

  // Locked settings
  const rows = 1;
  const cols = 1;
  const cornerRadius = 0;
  const numLayers = 4;
  const floatScale = 1;
  const floatHeight = 2;
  const floatDepth = 16;
  const blurAmount = 0;

  const [positions, setPositions] = useState<Position[]>(
    Array.from({ length: cols }, () => ({
      activeLayer: 0,
      transitionDelay: 0,
      flipDirection: null
    }))
  );
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>(Array(cols).fill(null));
  const videoRefs = useRef<(HTMLVideoElement | null)[][]>(
    Array(numLayers).fill(null).map(() => Array(cols).fill(null))
  );
  const fullscreenVideoRefs = useRef<(HTMLVideoElement | null)[]>(Array(numLayers).fill(null));
  const cellRefs = useRef<(HTMLDivElement | null)[]>(Array(cols).fill(null));

  const getOriginalPosition = (index: number) => ({
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

    const leftPanelDuration = 600;

    setTimeout(() => {
      setPositions(currentPositions => {
        const updatedPositions = [...currentPositions];
        const currentLayer = updatedPositions[0].activeLayer;
        const nextLayer = (currentLayer + 1) % mediaSlots.length;

        // Update all positions to the same next layer
        updatedPositions.forEach((_, index) => {
          updatedPositions[index] = {
            activeLayer: nextLayer,
            transitionDelay: 0,
            backgroundPosition: getOriginalPosition(index),
            flipDirection: 'right',
          };
        });

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
  onClick={() => window.open("https://lu.ma/aionthelot", "_blank")}
>
  BUY TICKETS
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
              ? 'slide-left-in'
              : 'slide-right-out'
              }`}
          >

          {mediaSlots[layerIndex]?.a.type === 'video' ? (
            <div className="relative w-full h-full">
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
              {positions.map((pos, i) => (
                <div
                  key={`mask${layerIndex}-${i}`}
                  ref={el => cellRefs.current[i] = el}
                  className={`grid-cell ${pos.activeLayer === layerIndex ? 'mask-visible' : 'mask-hidden'} ${
                    pos.activeLayer === layerIndex ? 'slide-left-in' : 'slide-right-out'
                  }`}
                  style={{
                    borderRadius: `${cornerRadius}px`,
                    transitionDelay: `${pos.transitionDelay}ms`,
                    gridColumn: `${i + 1} / span 1`,
                    gridRow: '1 / span 1'
                  }}
                >
                  {mediaSlots[layerIndex]?.b.type === 'video' ? (
                    <div className="video-container">
                      <video
                        ref={el => {
                          if (videoRefs.current[layerIndex]) {
                            videoRefs.current[layerIndex][i] = el;
                          }
                        }}
                        onTimeUpdate={(e) => handleVideoTimeUpdate(e, layerIndex, i)}
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
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;