import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Download, X } from "lucide-react";

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
  const [translateX, setTranslateX] = useState(0);

  const startX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!folderId) return;

      const res = await fetch(`/api/photos/${folderId}`);
      const data = await res.json();

      const images = data.files
        .filter((item: Photo) => item.type === "image")
        .sort((a: Photo, b: Photo) => {
          const A = new Date(a.createdTime || 0).getTime() || Number(a.id);
          const B = new Date(b.createdTime || 0).getTime() || Number(b.id);
          return B - A; // ใหม่สุดก่อน
        });

      setPhotos(images);
      setLoading(false);
    };

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

  /* ================= SWIPE ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;

    const diff = e.touches[0].clientX - startX.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (startX.current === null || selectedIndex === null) return;

    const width = containerRef.current?.offsetWidth || 1;

    if (translateX > width / 4) {
      goPrev();
    } else if (translateX < -width / 4) {
      goNext();
    }

    setTranslateX(0);
    startX.current = null;
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % photos.length);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

  /* ================= RENDER ================= */

  return (
    <Layout>
      <section className="py-20 container mx-auto px-4">
        {loading && <p>Loading...</p>}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <img
              key={photo.id}
              src={photo.previewUrl || ""}
              className="w-full rounded-lg cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        {/* MODAL */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="relative max-w-[95vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              ref={containerRef}
            >
              <button
                className="absolute top-4 right-4 text-white z-20"
                onClick={() => setSelectedIndex(null)}
              >
                <X size={28} />
              </button>

              <div
                className="flex transition-transform duration-200 ease-out"
                style={{
                  transform: `translateX(${translateX}px)`,
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={photos[selectedIndex].previewUrl || ""}
                  className="max-h-[90vh] max-w-[95vw]"
                />
              </div>

              {photos[selectedIndex].downloadUrl && (
                <a
                  href={photos[selectedIndex].downloadUrl}
                  download
                  className="absolute bottom-4 bg-white text-black px-4 py-2 rounded"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default EventGallery;
