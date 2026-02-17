"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";

interface Photo {
  id: string;
  name: string;
  previewUrl: string;
  downloadUrl: string;
  createdTime: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const pinchDistance = useRef<number | null>(null);
  const isPinching = useRef(false);

  // 🔥 Load + Sort newest first
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const res = await fetch("/api/photos");
        const data = await res.json();

        const formatted: Photo[] = (data.files || [])
          .map((file: any) => ({
            id: file.id,
            name: file.name,
            createdTime: file.createdTime,
            previewUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
          }))
          .sort(
            (a, b) =>
              new Date(b.createdTime).getTime() -
              new Date(a.createdTime).getTime(),
          );

        setPhotos(formatted);
      } catch (err) {
        console.error("โหลดรูปไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  // 🔥 Lock scroll when modal open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedIndex]);

  // 🔥 Preload next/prev safely
  useEffect(() => {
    if (selectedIndex === null || photos.length < 2) return;

    const preload = (index: number) => {
      if (!photos[index]) return;
      const img = new Image();
      img.src = photos[index].previewUrl;
      img.decoding = "async";
    };

    preload((selectedIndex + 1) % photos.length);
    preload((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos]);

  const goNext = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;

    setScale(1);
    setSelectedIndex((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;

    setScale(1);
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  // 🔥 Keyboard Support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goNext, goPrev]);

  // 🔥 Pinch Distance
  const getDistance = (touches: { clientX: number; clientY: number }[]) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>

      {photos.length === 0 && <p>ยังไม่มีรูปภาพ</p>}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <img
            key={photo.id}
            src={photo.previewUrl}
            alt={photo.name}
            loading="lazy"
            decoding="async"
            className="rounded-lg cursor-pointer hover:scale-105 transition"
            onClick={() => {
              setSelectedIndex(index);
              setScale(1);
            }}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedIndex !== null && photos[selectedIndex] && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          {/* Close */}
          <button
            className="absolute top-6 right-6 bg-black/70 p-3 rounded-full hover:bg-black"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={24} />
          </button>

          {/* Prev */}
          <button
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full hover:bg-black"
            onClick={goPrev}
          >
            ‹
          </button>

          {/* Next */}
          <button
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full hover:bg-black"
            onClick={goNext}
          >
            ›
          </button>

          {/* Image */}
          <img
            src={photos[selectedIndex].previewUrl}
            alt={photos[selectedIndex].name}
            className="max-h-[85vh] max-w-[90vw] transition-transform duration-200"
            style={{
              transform: `scale(${scale})`,
            }}
            onDoubleClick={() => setScale(1)}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                touchStartX.current = e.touches[0].clientX;
                isPinching.current = false;
              }

              if (e.touches.length === 2) {
                isPinching.current = true;
                pinchDistance.current = getDistance(Array.from(e.touches));
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && pinchDistance.current) {
                const newDistance = getDistance(Array.from(e.touches));

                const diff = (newDistance - pinchDistance.current) / 200;

                setScale((prev) => Math.min(Math.max(prev + diff, 1), 4));

                pinchDistance.current = newDistance;
              }
            }}
            onTouchEnd={(e) => {
              if (
                !isPinching.current &&
                e.changedTouches.length === 1 &&
                touchStartX.current !== null
              ) {
                const diff = e.changedTouches[0].clientX - touchStartX.current;

                if (diff > 80) goPrev();
                else if (diff < -80) goNext();
              }

              pinchDistance.current = null;
              touchStartX.current = null;
              isPinching.current = false;
            }}
          />

          {/* Zoom Controls */}
          <div className="absolute bottom-20 flex gap-4">
            <button
              onClick={() => setScale((s) => Math.min(s + 0.3, 4))}
              className="bg-black/70 p-3 rounded-full hover:bg-black"
            >
              <ZoomIn />
            </button>

            <button
              onClick={() => setScale((s) => Math.max(s - 0.3, 1))}
              className="bg-black/70 p-3 rounded-full hover:bg-black"
            >
              <ZoomOut />
            </button>
          </div>

          {/* Download */}
          <a
            href={photos[selectedIndex].downloadUrl}
            className="absolute bottom-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Download size={18} />
            Download
          </a>
        </div>
      )}
    </div>
  );
}
