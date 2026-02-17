import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Download, X, Plus, Minus } from "lucide-react";

interface Photo {
  id: string;
  name: string;
  type: "folder" | "image";
  previewUrl: string | null;
  downloadUrl: string | null;
  createdTime?: string;
}

const REFRESH_INTERVAL = 5000;

const EventGallery = () => {
  const { folderId } = useParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Event Gallery");
  const [scale, setScale] = useState(1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const pinchDistance = useRef<number | null>(null);

  /* ---------------- FETCH ---------------- */

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/photos/${folderId}`);
      if (!res.ok) throw new Error("Failed to fetch photos");

      const data = await res.json();

      if (data.folderName) {
        setFolderName(data.folderName);
      }

      if (Array.isArray(data.files)) {
        const images = data.files
          .filter((item: Photo) => item.type === "image")
          .sort((a: any, b: any) => {
            if (!a.createdTime || !b.createdTime) return 0;
            return (
              new Date(b.createdTime).getTime() -
              new Date(a.createdTime).getTime()
            );
          });

        setPhotos(images);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- NAVIGATION ---------------- */

  const goNext = () => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null,
    );
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setScale(1);
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null,
    );
  };

  /* ---------------- KEYBOARD ---------------- */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "+") setScale((s) => Math.min(s + 0.2, 3));
      if (e.key === "-") setScale((s) => Math.max(s - 0.2, 1));
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, photos]);

  /* ---------------- PRELOAD ---------------- */

  useEffect(() => {
    if (selectedIndex === null) return;

    const next = photos[(selectedIndex + 1) % photos.length];
    const prev = photos[(selectedIndex - 1 + photos.length) % photos.length];

    [next, prev].forEach((img) => {
      if (img?.previewUrl) {
        const image = new Image();
        image.src = img.previewUrl;
      }
    });
  }, [selectedIndex, photos]);

  /* ---------------- PINCH ZOOM ---------------- */

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!folderId) return;
    setLoading(true);
    fetchPhotos();

    intervalRef.current = setInterval(fetchPhotos, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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

        {/* GRID */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="break-inside-avoid">
              <img
                src={photo.previewUrl || ""}
                alt={photo.name}
                loading="lazy"
                decoding="async"
                className="w-full rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() => setSelectedIndex(index)}
              />
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedIndex !== null && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 overflow-hidden">
            {/* CLOSE */}
            <button
              className="absolute top-4 right-4 bg-black/70 p-3 rounded-full text-white hover:bg-black z-20"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} />
            </button>

            {/* DESKTOP NAV */}
            <button
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full text-white z-20"
              onClick={goPrev}
            >
              &lt;
            </button>

            <button
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 p-4 rounded-full text-white z-20"
              onClick={goNext}
            >
              &gt;
            </button>

            {/* ZOOM BUTTONS */}
            <div className="absolute bottom-24 right-6 flex gap-3 z-20">
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
                className="bg-black/70 p-3 rounded-full text-white"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 1))}
                className="bg-black/70 p-3 rounded-full text-white"
              >
                <Minus size={20} />
              </button>
            </div>

            {/* IMAGE */}
            <img
              src={photos[selectedIndex].previewUrl || ""}
              alt={photos[selectedIndex].name}
              className="max-h-[85vh] transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  touchStartX.current = e.touches[0].clientX;
                }
                if (e.touches.length === 2) {
                  pinchDistance.current = getDistance(e.touches);
                }
              }}
              onTouchMove={(e) => {
                if (e.touches.length === 2 && pinchDistance.current) {
                  const newDistance = getDistance(e.touches);
                  const diff = newDistance - pinchDistance.current;
                  setScale((s) => Math.min(Math.max(s + diff / 300, 1), 3));
                  pinchDistance.current = newDistance;
                }
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current !== null) {
                  const diff =
                    e.changedTouches[0].clientX - touchStartX.current;
                  if (diff > 60) goPrev();
                  if (diff < -60) goNext();
                  touchStartX.current = null;
                }
                pinchDistance.current = null;
              }}
            />

            {/* DOWNLOAD */}
            {photos[selectedIndex].downloadUrl && (
              <a
                href={photos[selectedIndex].downloadUrl}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-lg z-20"
              >
                <Download size={20} />
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
