import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, ZoomIn, ZoomOut, RotateCcw, Trash2, Check, User, Lock, Edit3 } from 'lucide-react';

interface ProfileModalProps {
  currentName: string;
  currentPhoto: string;
  onSave: (newName: string, newPhoto: string) => void;
  onClose: () => void;
  onSystemDialogChange?: (open: boolean) => void;
}

const VIEWPORT_SIZE = 180; // Diameter of circular preview in px
const OUTPUT_SIZE = 256;   // Output resolution for saved image (crisp & compact ~30KB)

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentName,
  currentPhoto,
  onSave,
  onClose,
  onSystemDialogChange
}) => {
  const [name, setName] = useState<string>(currentName || 'OPERATIVE_X');
  const [photoSrc, setPhotoSrc] = useState<string>(currentPhoto || '');
  const [hasNewPhoto, setHasNewPhoto] = useState<boolean>(false);

  // Edit mode: only unlocked when user clicks "Edit Photo" or selects a new photo
  // Locked by default when viewing existing saved photo
  const [isEditMode, setIsEditMode] = useState<boolean>(!currentPhoto);

  // Pan & Zoom controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Backup framing state to restore if edit is cancelled
  const backupFramingRef = useRef<{ zoom: number; pan: { x: number; y: number }; photoSrc: string }>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    photoSrc: currentPhoto || ''
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Reset pan and zoom when a new photo is loaded
  const resetTransform = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Enter edit mode and save snapshot for cancellation
  const startEditingPhoto = () => {
    backupFramingRef.current = {
      zoom,
      pan: { ...pan },
      photoSrc
    };
    setIsEditMode(true);
  };

  // Lock current framing
  const lockFraming = () => {
    setIsEditMode(false);
  };

  // Cancel edit mode and restore previous framing
  const cancelEditingPhoto = () => {
    setZoom(backupFramingRef.current.zoom);
    setPan({ ...backupFramingRef.current.pan });
    setPhotoSrc(backupFramingRef.current.photoSrc);
    setIsEditMode(false);
  };

  // Handle file selection from gallery/disk
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSystemDialogChange?.(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image file is too large (max 15MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file. Please try again.');
    };

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          backupFramingRef.current = {
            zoom,
            pan: { ...pan },
            photoSrc
          };
          setPhotoSrc(reader.result as string);
          setHasNewPhoto(true);
          resetTransform();
          setIsEditMode(true); // Automatically enter edit mode for framing
        };
        img.onerror = () => {
          setErrorMessage('Failed to decode image data. Please choose another image.');
        };
        img.src = reader.result;
      }
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag-to-pan handlers: ONLY active when isEditMode is true
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!photoSrc || !isEditMode) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isEditMode) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDragging(false);
    }
  };

  // Perform crisp, offscreen canvas crop to ensure small storage footprint (<40KB)
  const generateCroppedImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!photoSrc) {
        resolve('');
        return;
      }

      // If user hasn't changed photo or zoomed/panned, and we already had an optimized photo
      if (!hasNewPhoto && zoom === 1 && pan.x === 0 && pan.y === 0) {
        resolve(photoSrc);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = OUTPUT_SIZE;
          canvas.height = OUTPUT_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Anti-aliasing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Circular clip on output canvas
          ctx.beginPath();
          ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
          ctx.clip();

          // Calculate scaling and positioning
          // Viewport is VIEWPORT_SIZE x VIEWPORT_SIZE
          // Scaled to OUTPUT_SIZE x OUTPUT_SIZE
          const scaleToCanvas = OUTPUT_SIZE / VIEWPORT_SIZE;

          // How image is rendered in preview:
          // aspect ratio preservation
          const naturalW = img.naturalWidth || 100;
          const naturalH = img.naturalHeight || 100;
          const aspect = naturalW / naturalH;

          let baseW = VIEWPORT_SIZE;
          let baseH = VIEWPORT_SIZE;

          if (aspect > 1) {
            // Wider than tall
            baseH = VIEWPORT_SIZE;
            baseW = VIEWPORT_SIZE * aspect;
          } else {
            // Taller than wide
            baseW = VIEWPORT_SIZE;
            baseH = VIEWPORT_SIZE / aspect;
          }

          const renderedW = baseW * zoom;
          const renderedH = baseH * zoom;

          // Center of viewport in preview + pan
          const previewCenterX = VIEWPORT_SIZE / 2 + pan.x;
          const previewCenterY = VIEWPORT_SIZE / 2 + pan.y;

          // Map to output canvas coordinates
          const canvasCenterX = previewCenterX * scaleToCanvas;
          const canvasCenterY = previewCenterY * scaleToCanvas;
          const canvasW = renderedW * scaleToCanvas;
          const canvasH = renderedH * scaleToCanvas;

          const drawX = canvasCenterX - canvasW / 2;
          const drawY = canvasCenterY - canvasH / 2;

          ctx.drawImage(img, drawX, drawY, canvasW, canvasH);

          // Compress to JPEG at 0.85 quality (~25KB-40KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for cropping'));
      };

      img.src = photoSrc;
    });
  };

  const handleSave = async () => {
    try {
      const finalPhoto = await generateCroppedImage();
      const finalName = name.trim() || 'OPERATIVE_X';
      onSave(finalName, finalPhoto);
    } catch (err) {
      console.error('Error saving profile photo:', err);
      setErrorMessage('Could not save image. Please try a different photo.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoSrc('');
    setHasNewPhoto(true);
    resetTransform();
  };

  const zoomPct = Math.round(((zoom - 1) / 2) * 100);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/88 backdrop-blur-md">
      <div className="relative w-full max-w-sm ui-panel-box rounded-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2a3950] bg-[#0b101b]">
          <div className="flex items-center gap-2.5">
            <span className="ui-icon-box icon-box-levels">
              <User className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Operative Identity
              </div>
              <h2 className="text-sm md:text-base font-extrabold text-slate-100 tracking-wide leading-tight">
                Edit Operative Profile
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 theme-neutral rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            title="Cancel and close"
          >
            <span className="ui-icon-box-sm icon-box-neutral">
              <X className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs md:text-sm text-slate-200">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl theme-danger text-xs font-semibold flex items-center gap-2">
              <span className="ui-icon-box-sm icon-box-danger shrink-0">
                <X className="w-3.5 h-3.5" />
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Framed Name Input Box */}
          <div className="ui-inset-box p-3 rounded-xl space-y-2 text-left">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="ui-icon-box-sm icon-box-levels">
                  <User className="w-3 h-3" />
                </span>
                <span>Codename / Player Name</span>
              </label>
              <span className="setting-value-badge text-sky-300">
                {name.length}/16
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={16}
              placeholder="OPERATIVE_X"
              className="w-full ui-dark-input rounded-xl px-3.5 py-2 text-sm tracking-wide"
            />
          </div>

          {/* Framed Circular Photo Preview & Crop/Adjust Deck */}
          <div className="ui-inset-box p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-extrabold text-slate-200 uppercase tracking-wider">
                Profile Avatar Photo
              </label>
              {photoSrc && !isEditMode && (
                <span className="flex items-center gap-1.5 text-[10px] theme-play px-2 py-0.5 rounded-lg font-bold">
                  <Lock className="w-3 h-3 text-emerald-300" />
                  <span>Photo Locked</span>
                </span>
              )}
              {photoSrc && isEditMode && (
                <span className="flex items-center gap-1 text-[10px] theme-levels px-2 py-0.5 rounded-lg font-bold">
                  <Edit3 className="w-3 h-3 text-sky-300" />
                  <span>Drag to Pan • Zoom</span>
                </span>
              )}
            </div>

            {/* Outer Dark Gunmetal Bezel + Circular Preview Viewport (True Photo Colours Preserved) */}
            <div className="flex justify-center py-1">
              <div
                className={`p-2 rounded-full transition-colors ${
                  isEditMode
                    ? 'bg-[#0c1829] border-[1.5px] border-[#38bdf8]'
                    : 'bg-[#0b111c] border-[1.5px] border-[#334763]'
                }`}
                style={{
                  boxShadow: isEditMode
                    ? '0 6px 18px rgba(2, 132, 199, 0.28), inset 0 1px 0 rgba(125, 211, 252, 0.2)'
                    : '0 6px 16px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(148, 163, 184, 0.12)'
                }}
              >
                <div
                  className={`relative rounded-full select-none flex items-center justify-center bg-[#070b12] ${
                    isEditMode
                      ? 'cursor-grab active:cursor-grabbing touch-none'
                      : 'cursor-default'
                  }`}
                  style={{
                    width: `${VIEWPORT_SIZE}px`,
                    height: `${VIEWPORT_SIZE}px`,
                    border: isEditMode ? '2px solid #38bdf8' : '2px solid #475e7e',
                    overflow: 'hidden'
                  }}
                  onPointerDown={isEditMode ? handlePointerDown : undefined}
                  onPointerMove={isEditMode ? handlePointerMove : undefined}
                  onPointerUp={isEditMode ? handlePointerUp : undefined}
                  onPointerCancel={isEditMode ? handlePointerUp : undefined}
                >
                  {photoSrc ? (
                    <img
                      ref={imageElementRef}
                      src={photoSrc}
                      alt="Preview"
                      draggable={false}
                      className="pointer-events-none select-none max-w-none"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                        width: imageDimensions.width && imageDimensions.height && imageDimensions.width > imageDimensions.height
                          ? `${VIEWPORT_SIZE * (imageDimensions.width / imageDimensions.height)}px`
                          : `${VIEWPORT_SIZE}px`,
                        height: imageDimensions.width && imageDimensions.height && imageDimensions.height > imageDimensions.width
                          ? `${VIEWPORT_SIZE * (imageDimensions.height / imageDimensions.width)}px`
                          : `${VIEWPORT_SIZE}px`,
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <span className="ui-icon-box icon-box-levels">
                        <User className="w-6 h-6" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">No Photo Selected</span>
                    </div>
                  )}

                  {/* Subtle Framing Ring Overlay (Active Only in Edit Mode; Does Not Tint Photo) */}
                  {photoSrc && isEditMode && (
                    <div className="absolute inset-0 pointer-events-none border border-sky-400/35 rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* When photo is present and NOT in edit mode: Show explicit Edit Photo button */}
            {photoSrc && !isEditMode && (
              <button
                type="button"
                onClick={startEditingPhoto}
                className="w-full py-2 px-3 theme-levels rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                title="Reposition, zoom, and crop photo"
              >
                <span className="ui-icon-box-sm icon-box-levels">
                  <Edit3 className="w-3.5 h-3.5" />
                </span>
                <span>Edit Photo (Pan & Zoom)</span>
              </button>
            )}

            {/* When IN edit mode: Framed Zoom Slider, Reset, and Lock / Cancel Controls */}
            {photoSrc && isEditMode && (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-[#090d16] border border-[#2a3950] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="ui-icon-box-sm icon-box-levels">
                        <ZoomOut className="w-3.5 h-3.5" />
                      </span>
                      <span>Crop Zoom</span>
                    </span>
                    <span className="setting-value-badge text-sky-300">
                      {zoom.toFixed(2)}x
                    </span>
                    <button
                      type="button"
                      onClick={resetTransform}
                      className="px-2 py-1 rounded-lg theme-neutral flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer"
                      title="Center and Reset Zoom"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-200" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div className="slider-track-frame">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="slider-levels"
                      style={{
                        background: `linear-gradient(90deg, #0284c7 0%, #38bdf8 ${zoomPct}%, #090d16 ${zoomPct}%)`
                      }}
                    />
                    <ZoomIn className="w-4 h-4 text-sky-300 shrink-0" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={lockFraming}
                    className="flex-1 py-2 px-3 theme-play font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="ui-icon-box-sm icon-box-play">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>Done (Lock Framing)</span>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingPhoto}
                    className="py-2 px-3 theme-neutral rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="ui-icon-box-sm icon-box-neutral">
                      <X className="w-3.5 h-3.5" />
                    </span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Photo Action Buttons: Choose/Change Photo & Remove */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => {
                  onSystemDialogChange?.(true);
                  const clearGuardOnFocus = () => {
                    window.setTimeout(() => {
                      onSystemDialogChange?.(false);
                    }, 900);
                    window.removeEventListener('focus', clearGuardOnFocus);
                  };
                  window.addEventListener('focus', clearGuardOnFocus);
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-2 px-3 theme-levels rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="ui-icon-box-sm icon-box-levels">
                  <Upload className="w-3.5 h-3.5" />
                </span>
                <span>{photoSrc ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {photoSrc && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="py-2 px-3 theme-danger rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <span className="ui-icon-box-sm icon-box-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions: Cancel/Back and Save Profile */}
        <div className="px-4 py-3.5 border-t border-[#2a3950] bg-[#0b101b] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 theme-neutral rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="ui-icon-box-sm icon-box-neutral">
              <X className="w-3.5 h-3.5" />
            </span>
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 theme-play font-extrabold rounded-xl text-xs tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="ui-icon-box-sm icon-box-play">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
