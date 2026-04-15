'use client'

import { useState, useCallback, useEffect } from 'react'

export function ImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!fullscreen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
      if (e.key === 'ArrowRight') setSelected(s => (s + 1) % images.length)
      if (e.key === 'ArrowLeft') setSelected(s => (s - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreen, images.length])

  const goNext = useCallback(() => setSelected(s => (s + 1) % images.length), [images.length])
  const goPrev = useCallback(() => setSelected(s => (s - 1 + images.length) % images.length), [images.length])

  if (images.length === 0) return (
    <div className="h-64 w-full rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">No images</div>
  )

  return (
    <>
      {/* Main image display */}
      <div className="relative group">
        <div className="w-full max-h-[500px] rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center aspect-[16/10]">
          <img
            src={images[selected]}
            alt="Room"
            className="h-full w-full object-cover"
          />
        </div>

        {/* View full image button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          View Full
        </button>

        {/* Prev/Next arrows on main image */}
        {images.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white">
            {selected + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelected(i)} className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === selected ? 'border-teal-500 ring-1 ring-teal-300' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setFullscreen(false)}>
          {/* Close button */}
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors z-10">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Full image */}
          <img
            src={images[selected]}
            alt="Room full view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Prev/Next in fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); goPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); goNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Counter in fullscreen */}
          {images.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm text-white">
              {selected + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  )
}
