import React, { useState, useCallback, useRef } from 'react';
import Experience from './components/Experience';
import GestureController from './components/GestureController';
import { TreeColors, HandGesture } from './types';

const App: React.FC = () => {
  // 1 = Formed, 0 = Chaos.
  const [targetMix, setTargetMix] = useState(1); 
  // Default colors kept, UI control removed
  const [colors] = useState<TreeColors>({ bottom: '#022b1c', top: '#217a46' });
  
  const inputRef = useRef({ x: 0, y: 0 });
  
  const [gestureDetected, setGestureDetected] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  // Image Upload State
  const [userImages, setUserImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wrap in useCallback to prevent new function creation on every render
  const handleGesture = useCallback((data: HandGesture) => {
    setGestureDetected(data.isDetected);
    
    if (data.isDetected) {
        const newTarget = data.isOpen ? 0 : 1;
        setTargetMix(prev => {
            if (prev !== newTarget) return newTarget;
            return prev;
        });
        
        inputRef.current = { 
            x: data.position.x * 1.2, 
            y: data.position.y 
        };
    } 
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gestureDetected && debugMode) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        inputRef.current = { x, y };
    }
  };

  const toggleState = () => {
      setTargetMix(prev => prev === 1 ? 0 : 1);
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files).slice(0, 30); // Limit to 30
          const urls = files.map(file => URL.createObjectURL(file));
          setUserImages(prev => {
              // Revoke old URLs to prevent memory leaks (optional but good practice)
              prev.forEach(url => URL.revokeObjectURL(url));
              return urls;
          });
      }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" onMouseMove={handleMouseMove}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* CENTER TITLE - Ethereal Silver Script */}
      {/* Layer: z-0 (Background layer, behind the tree) */}
      <div className="absolute top-[5%] left-0 w-full flex justify-center pointer-events-none z-0">
        <h1 
            className="font-script text-6xl md:text-9xl text-center leading-[1.5] py-10"
            style={{
                // Silver Metallic Gradient
                background: 'linear-gradient(to bottom, #ffffff 20%, #e8e8e8 50%, #b0b0b0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                // 3D Depth Shadows + Glow
                filter: 'drop-shadow(0px 5px 5px rgba(0,0,0,0.8)) drop-shadow(0px 0px 20px rgba(255,255,255,0.4))'
            }}
        >
            Merry Christmas
        </h1>
      </div>

      {/* 3D Scene */}
      {/* Layer: z-10 (Foreground layer, tree renders on top of text) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Experience 
            mixFactor={targetMix}
            colors={colors} 
            inputRef={inputRef} 
            userImages={userImages}
        />
      </div>

      {/* TOP RIGHT - UPLOAD BUTTON */}
      <div className="absolute top-6 right-6 z-20 pointer-events-auto">
          <button 
            onClick={handleUploadClick}
            className="bg-black/40 backdrop-blur-md border border-[#d4af37]/50 text-[#d4af37] font-luxury text-xs px-6 py-2 rounded hover:bg-[#d4af37] hover:text-black transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
              Upload Photos
          </button>
      </div>

      {/* BOTTOM RIGHT CONTROLS & STATUS */}
      {/* Layer: z-20 (UI on top of everything) */}
      <div className="absolute bottom-6 right-56 z-20 flex flex-col items-end gap-2 pointer-events-none">
            {!gestureDetected ? (
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-lg pointer-events-auto">
                     <p className="text-white/60 font-body text-xs whitespace-nowrap">
                        Waiting for camera... or <button onClick={() => setDebugMode(!debugMode)} className="underline decoration-[#d4af37] text-[#d4af37] hover:text-white transition-colors">
                            {debugMode ? "Disable Mouse" : "Enable Mouse"}
                        </button>
                    </p>
                </div>
            ) : (
                <div className="bg-[#d4af37]/10 backdrop-blur-sm border border-[#d4af37]/50 px-4 py-2 rounded-lg animate-pulse pointer-events-auto">
                     <p className="text-[#d4af37] font-luxury text-xs tracking-widest whitespace-nowrap">
                        AI CONNECTED
                    </p>
                </div>
            )}
            
            <div className="pointer-events-auto">
                 <button 
                    onClick={toggleState}
                    className="md:hidden bg-[#d4af37] text-black font-luxury text-xs px-4 py-2 rounded shadow-[0_0_10px_rgba(212,175,55,0.3)] active:scale-95 transition-transform"
                >
                    {targetMix === 1 ? "UNLEASH" : "FORM"}
                </button>
            </div>
      </div>

      {/* Footer Info (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
            <div className="text-white/20 text-[10px] uppercase tracking-widest font-luxury">
                <div>Grand Luxury Edition</div>
                <div className="text-[#d4af37]/40">2024 Holiday Special</div>
            </div>
      </div>

      {/* Logic */}
      <GestureController onGesture={handleGesture} />
    </div>
  );
};

export default App;