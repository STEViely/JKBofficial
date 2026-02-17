import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  Download,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Photo {
  id: string;
  name: string;
  type: "folder" | "image";
  previewUrl: string | null;
  downloadUrl: string | null;
  createdTime?: string;
}

const EventGallery = () => {
  const { folderId } = useParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Event Gallery");
  const [scale, setScale] = useState(1);

  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);

  /* ================= FETCH ================= */

  const fetchPhotos = async () => {
    if (!folderId) return;

    try {
      const res = await fetch(`/api/photos/${folderId}`);
      const data = await res.json();

      if (data.folderName) setFolderName(data.folderName);

      if (Array.isArray(data.files)) {
        const images = data.files
          .filter((item: Photo) => item.type === "image")
          .sort((a: Photo, b: Photo) => {
            const dateA = new Date(a.createdTime || 0).getTime();
            const dateB = new Date(b.createdTime || 0).getTime();
            return dateB - dateA;
          });

        setPhotos(images);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPhotos();
  }, [folderId]);

  /* ================= LOCK SCROLL ================= */

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedIndex]);

  /* ================= KEYBOARD ================= */

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((selectedIndex + 1) % photos.length);
    setTranslateX(0);
  }, [selectedIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    setTranslateX(0);
  }, [selectedIndex, photos.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goNext, goPrev]);

  /* ================= SMOOTH SWIPE ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (Math.abs(translateX) > 120) {
      if (translateX > 0) goPrev();
      else goNext();
    }

    setTranslateX(0);
    touchStartX.current = null;
  };

  /* ================= RENDER ================= */

  return (
    <Layout>
      <section className="py-20 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-center">{folderName}</h1>

        {loading && <p className="text-center">กำลังโหลด...</p>}
        {!loading && photos.length === 0 && (
          <p className="text-center">ไม่พบรูปภาพ</p>
        )}

        {/* GRID */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="break-inside-avoid">
              <img
                src={photo.previewUrl || ""}
                alt={photo.name}
                loading="lazy"
                className="w-full rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() => {
                  setSelectedIndex(index);
                  setScale(1);
                }}
              />
            </div>
          ))}
        </div>

        {/* ================= MODAL ================= */}

        {selectedIndex !== null && photos[selectedIndex] && (
          <div
            className="fixed inset-0 bg-black/90 z-50"
            onClick={() => setSelectedIndex(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* CONTENT WRAPPER */}
              <div
                className="relative flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* CLOSE */}
                <button
                  className="absolute top-6 right-6 bg-black/70 p-3 rounded-full text-white z-20"
                  onClick={() => setSelectedIndex(null)}
                >
                  <X size={24} />
                </button>

                {/* DESKTOP ARROWS */}
                <button
                  onClick={goPrev}
                  className="hidden md:flex absolute left-[-70px] bg-black/70 p-4 rounded-full text-white z-20"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  onClick={goNext}
                  className="hidden md:flex absolute right-[-70px] bg-black/70 p-4 rounded-full text-white z-20"
                >
                  <ChevronRight size={28} />
                </button>

                {/* IMAGE */}
                <img
                  src={photos[selectedIndex].previewUrl || ""}
                  alt={photos[selectedIndex].name}
                  className="max-h-[80vh] max-w-[90vw] transition-transform duration-300"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                  }}
                  onDoubleClick={() =>
                    setScale((prev) => (prev === 1 ? 1.3 : 1))
                  }
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />

                {/* ZOOM */}
                <div className="absolute bottom-20 flex gap-4 z-20">
                  <button
                    onClick={() => setScale((s) => Math.min(s + 0.3, 3))}
                    className="bg-black/70 p-3 rounded-full text-white"
                  >
                    <ZoomIn />
                  </button>
                  <button
                    onClick={() => setScale((s) => Math.max(s - 0.3, 1))}
                    className="bg-black/70 p-3 rounded-full text-white"
                  >
                    <ZoomOut />
                  </button>
                </div>

                {/* DOWNLOAD */}
                {photos[selectedIndex].downloadUrl && (
                  <a
                    href={photos[selectedIndex].downloadUrl}
                    download
                    className="absolute bottom-6 bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={18} />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default EventGallery;
