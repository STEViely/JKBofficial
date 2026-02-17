"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Photo {
  id: string;
  name: string;
  previewUrl: string | null;
  downloadUrl: string | null;
}

interface Props {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null,
    );
    resetTransform();
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null,
    );
    resetTransform();
  };

  const resetTransform = () => {
    setScale(1);
    setTranslateX(0);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex]);

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={photo.previewUrl || ""}
              alt={photo.name}
              className="w-full h-48 object-cover hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedIndex !== null && photos[selectedIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              className="absolute -top-12 right-0 bg-black/70 p-2 rounded-full text-white"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={22} />
            </button>

            {/* DESKTOP ARROWS */}
            <button
              onClick={goPrev}
              className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 bg-primary p-4 rounded-full text-white shadow-lg"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={goNext}
              className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 bg-primary p-4 rounded-full text-white shadow-lg"
            >
              <ChevronRight size={28} />
            </button>

            {/* IMAGE */}
            <div className="relative">
              <img
                src={photos[selectedIndex].previewUrl || ""}
                alt={photos[selectedIndex].name}
                className="max-h-[75vh] max-w-[95vw] object-contain"
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  transition: "transform 0.3s ease",
                }}
              />

              {/* MOBILE ARROWS */}
              <button
                onClick={goPrev}
                className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-full text-white shadow-md"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={goNext}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-full text-white shadow-md"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* CONTROL BAR (ชิดขอบภาพ ไม่ทับ) */}
            <div className="mt-4 w-full max-w-[95vw] flex items-center justify-between px-2">
              <div className="flex gap-3">
                <button
                  onClick={() => setScale((s) => Math.min(s + 0.3, 3))}
                  className="bg-primary text-white p-3 rounded-full shadow-md"
                >
                  <ZoomIn size={20} />
                </button>

                <button
                  onClick={() => setScale((s) => Math.max(s - 0.3, 1))}
                  className="bg-primary text-white p-3 rounded-full shadow-md"
                >
                  <ZoomOut size={20} />
                </button>
              </div>

              {photos[selectedIndex].downloadUrl && (
                <a
                  href={photos[selectedIndex].downloadUrl}
                  className="bg-primary text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-md"
                >
                  <Download size={18} />
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
