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
}

const REFRESH_INTERVAL = 5000;

const EventGallery = () => {
  const { folderId } = useParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Event Gallery");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/photos/${folderId}`);
      if (!res.ok) throw new Error("Failed to fetch photos");

      const data = await res.json();

      if (data.folderName) {
        setFolderName(data.folderName);
      }

      if (Array.isArray(data.files)) {
        const images = data.files.filter(
          (item: Photo) => item.type === "image",
        );

        setPhotos((prev) => {
          if (prev.length !== images.length) {
            return images;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Auto refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null,
    );
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null,
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, photos]);

  useEffect(() => {
    if (!folderId) return;

    setLoading(true);
    fetchPhotos();

    intervalRef.current = setInterval(fetchPhotos, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [folderId]);

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

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="break-inside-avoid">
              <img
                src={photo.previewUrl || ""}
                alt={photo.name}
                className="w-full rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() => setSelectedIndex(index)}
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedIndex !== null && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="relative max-w-6xl w-full px-4">
              {/* Close */}
              <button
                className="absolute top-4 right-4 bg-black/70 p-3 rounded-full text-white hover:bg-black z-10"
                onClick={() => setSelectedIndex(null)}
              >
                <X size={24} />
              </button>

              {/* Desktop Prev */}
              <button
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full text-white hover:bg-black z-10 text-2xl"
                onClick={goPrev}
              >
                &lt;
              </button>

              {/* Desktop Next */}
              <button
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full text-white hover:bg-black z-10 text-2xl"
                onClick={goNext}
              >
                &gt;
              </button>

              {/* Image */}
              <img
                src={photos[selectedIndex].previewUrl || ""}
                alt={photos[selectedIndex].name}
                className="max-h-[80vh] mx-auto rounded-lg"
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;

                  const diff =
                    e.changedTouches[0].clientX - touchStartX.current;

                  if (diff > 50) goPrev();
                  if (diff < -50) goNext();

                  touchStartX.current = null;
                }}
              />

              {/* Download */}
              {photos[selectedIndex].downloadUrl && (
                <a
                  href={photos[selectedIndex].downloadUrl}
                  className="mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg text-lg"
                  download
                >
                  <Download size={20} />
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
