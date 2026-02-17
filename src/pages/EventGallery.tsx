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
  const [isDragging, setIsDragging] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const startX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!folderId) return;

      const res = await fetch(`/api/photos/${folderId}`);
      const data = await res.json();

      const images = data.files.filter((item: Photo) => item.type === "image");

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

  /* ================= SLIDE ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomed) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null || zoomed) return;

    const diff = e.touches[0].clientX - startX.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (startX.current === null || selectedIndex === null) return;

    const width = containerRef.current?.offsetWidth || 1;

    if (translateX > width / 4 && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (translateX < -width / 4 && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }

    setTranslateX(0);
    setIsDragging(false);
    startX.current = null;
  };

  /* ================= ZOOM ================= */

  const handleDoubleClick = () => {
    setZoomed((prev) => !prev);
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
              onClick={() => {
                setSelectedIndex(index);
                setZoomed(false);
              }}
            />
          ))}
        </div>

        {/* ================= MODAL ================= */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              ref={containerRef}
            >
              {/* CLOSE */}
              <button
                className="absolute top-6 right-6 text-white z-20"
                onClick={() => setSelectedIndex(null)}
              >
                <X size={32} />
              </button>

              {/* SLIDER */}
              <div
                className="flex h-full"
                style={{
                  transform: `translateX(calc(-${
                    selectedIndex * 100
                  }% + ${translateX}px))`,
                  transition: isDragging ? "none" : "transform 0.35s ease",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="min-w-full flex items-center justify-center"
                  >
                    <img
                      src={photo.previewUrl || ""}
                      onDoubleClick={handleDoubleClick}
                      className="max-h-[90vh] max-w-[95vw] object-contain transition-transform duration-300"
                      style={{
                        transform: zoomed ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* DOWNLOAD */}
              {photos[selectedIndex].downloadUrl && (
                <a
                  href={photos[selectedIndex].downloadUrl}
                  download
                  className="absolute bottom-8 bg-[#E10600] text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold"
                >
                  <Download size={18} />
                  ดาวน์โหลด
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
