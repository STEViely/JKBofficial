import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";

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

  const touchStartX = useRef<number | null>(null);
  const pinchDistance = useRef<number | null>(null);
  const isPinching = useRef(false);

  // ===============================
  // Fetch Photos (ใช้ API เดิมคุณ)
  // ===============================
  const fetchPhotos = async () => {
    if (!folderId) return;

    try {
      const res = await fetch(`/api/photos/${folderId}`);
      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      if (data.folderName) {
        setFolderName(data.folderName);
      }

      if (Array.isArray(data.files)) {
        const images = data.files
          .filter((item: Photo) => item.type === "image")
          .sort((a: Photo, b: Photo) => {
            const dateA = new Date(a.createdTime || 0).getTime();
            const dateB = new Date(b.createdTime || 0).getTime();
            return dateB - dateA; // ล่าสุดก่อน
          });

        setPhotos(images);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPhotos();
  }, [folderId]);

  // ===============================
  // Preload Next / Prev
  // ===============================
  useEffect(() => {
    if (selectedIndex === null || photos.length < 2) return;

    const preload = (index: number) => {
      if (!photos[index]?.previewUrl) return;
      const img = new Image();
      img.src = photos[index].previewUrl;
    };

    preload((selectedIndex + 1) % photos.length);
    preload((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos]);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  // ===============================
  // Keyboard Support
  // ===============================
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

  // ===============================
  // Pinch Helper
  // ===============================
  const getDistance = (touches: { clientX: number; clientY: number }[]) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <Layout>
      <section className="py-20 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-center">{folderName}</h1>

        {loading && (
          <p className="text-center text-muted-foreground">
            กำลังโหลดรูปภาพ...
          </p>
        )}

        {!loading && photos.length === 0 && (
          <p className="text-center text-muted-foreground">ไม่พบรูปภาพ</p>
        )}

        {/* Grid */}
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

        {/* Modal */}
        {selectedIndex !== null && photos[selectedIndex] && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            {/* Close */}
            <button
              className="absolute top-6 right-6 bg-black/70 p-3 rounded-full text-white"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} />
            </button>

            {/* Prev */}
            <button
              className="hidden md:block absolute left-6 text-white text-4xl"
              onClick={goPrev}
            >
              ‹
            </button>

            {/* Next */}
            <button
              className="hidden md:block absolute right-6 text-white text-4xl"
              onClick={goNext}
            >
              ›
            </button>

            {/* Image */}
            <img
              src={photos[selectedIndex].previewUrl || ""}
              alt={photos[selectedIndex].name}
              className="max-h-[80vh] max-w-[90vw] transition-transform"
              style={{ transform: `scale(${scale})` }}
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
                  const diff =
                    e.changedTouches[0].clientX - touchStartX.current;

                  if (diff > 80) goPrev();
                  else if (diff < -80) goNext();
                }

                pinchDistance.current = null;
                touchStartX.current = null;
                isPinching.current = false;
              }}
            />

            {/* Zoom Buttons */}
            <div className="absolute bottom-20 flex gap-4">
              <button
                onClick={() => setScale((s) => Math.min(s + 0.3, 4))}
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

            {/* Download */}
            {photos[selectedIndex].downloadUrl && (
              <a
                href={photos[selectedIndex].downloadUrl}
                className="absolute bottom-6 bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </a>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default EventGallery;
