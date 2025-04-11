import React, { useState, useRef, useEffect } from 'react';
import { Settings2, X, Upload, ArrowRight } from 'lucide-react';
import { defaultMediaSlots } from './config/mediaDefaults';


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
  const [showControls, setShowControls] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [mediaSlots, setMediaSlots] = useState(defaultMediaSlots);


  // Locked settings
  const rows = 1;
  const cols = 8;
  const gapSize = 0;
  const cornerRadius = 0;
  const numLayers = 4;
  const floatScale = 1;
  const floatHeight = 2;
  const floatDepth = 16;
  const blurAmount = 0;

  const [isOverlayFlipping, setOverlayFlipping] = useState(false);

  const [positions, setPositions] = useState<Position[]>(
    Array.from({ length: rows * cols }, () => ({
      activeLayer: 0,
      transitionDelay: 0,
      flipDirection: null
    }))
  );
  
  const fileInputRefs = Array(8).fill(0).map(() => useRef<HTMLInputElement>(null));
  const videoRefs = useRef<(HTMLVideoElement | null)[][]>(
    Array(numLayers).fill(null).map(() => Array(rows * cols).fill(null))
  );
  const fullscreenVideoRefs = useRef<(HTMLVideoElement | null)[]>(Array(numLayers).fill(null));
  const cellRefs = useRef<(HTMLDivElement | null)[]>(Array(rows * cols).fill(null));

  const getOriginalPosition = (index: number) => ({
    x: (index % cols) * (100 / cols),
    y: Math.floor(index / cols) * (100 / rows)
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
  
    // Trigger the overlay animation for the unified grid panel.
    setOverlayFlipping(true);
  
    // (Optional: You could also run your left-panel cascade logic here if needed.
    // For the unified grid, however, we update all at once.)
    
    // Wait for the overlay animation to play out (600ms in our CSS).
    setTimeout(() => {
      // Update every cell's activeLayer in one go.
      setPositions(prev =>
        prev.map(pos => {
          const currentLayer = pos.activeLayer;
          const nextLayer =
            direction === 'left'
              ? (currentLayer + 1) % numLayers
              : (currentLayer - 1 + numLayers) % numLayers;
          return {
            activeLayer: nextLayer,
            transitionDelay: 0,
            // In the unified approach, individual cell background positions are not used,
            // but we can assign the default value.
            backgroundPosition: getOriginalPosition(0),
            flipDirection: direction === 'left' ? 'right' : 'left'
          };
        })
      );
  
      // Clear the overlay animation and flipping flag.
      setOverlayFlipping(false);
      setIsFlipping(false);
    }, 600); // Should match your CSS animation duration for .flipping
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
            <video
              ref={el => fullscreenVideoRefs.current[layerIndex] = el}
              className="absolute w-full h-full object-cover"
              src={mediaSlots[layerIndex]?.a.url}
              poster={mediaSlots[layerIndex]?.a.fallbackUrl || ''}
              muted
              playsInline
              loop
              autoPlay
            />
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

      <div className="relative md:w-1/2 w-full md:h-full h-1/2 md:border-none border-t-[0.5rem] border-black">
        <button
          onClick={() => setShowControls(!showControls)}
          className="fixed top-4 right-4 z-[1000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {showControls ? <X className="w-6 h-6 text-white" /> : <Settings2 className="w-6 h-6 text-white" />}
        </button>

        {/* Unified video container */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Render the unified video using the active media slot for grid (slot "b").
              Adjust positions[0].activeLayer as needed if you cycle through layers. */}
          <video
            src={mediaSlots[positions[0]?.activeLayer]?.b.url}
            poster={mediaSlots[positions[0]?.activeLayer]?.b.fallbackUrl || ''}
            muted
            playsInline
            loop
            autoPlay
            className="absolute top-0 left-0 object-cover"
            style={{ width: `${cols * 100}%`, height: '100%' }}
          />

          {/* Grid overlay: divides the unified video into 8 columns and applies a staggered flip animation */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full overflow-hidden relative"
                // Apply staggered animation delay if overlay flipping is active
                style={{ animationDelay: isOverlayFlipping ? `${i * 50}ms` : undefined }}
              >
                {isOverlayFlipping && (
                  <div className="absolute top-0 left-0 w-full h-full flipping" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;