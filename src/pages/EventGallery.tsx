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

const REFRESH_INTERVAL = 5000; // 5 วินาที

const EventGallery = () => {
  const { folderId } = useParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState("Event Gallery");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/photos/${folderId}`);

      if (!res.ok) throw new Error("Failed to fetch photos");

      const data = await res.json();

      if (data.folderName) {
        setFolderName(data.folderName);
      }

      if (Array.isArray(data.files)) {
        const images = data.files.filter(
          (item: Photo) => item.type === "image",
        );

        // อัปเดตเฉพาะตอนมีรูปเพิ่ม
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

        {/* ✅ Masonry Layout (ไม่ crop ไม่บีบภาพ) */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {photos.map((photo) => (
            <div key={photo.id} className="break-inside-avoid">
              <img
                src={photo.previewUrl || ""}
                alt={photo.name}
                className="w-full rounded-lg cursor-pointer hover:opacity-80 transition"
                onClick={() => setSelected(photo)}
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative max-w-5xl w-full px-4">
              <button
                className="absolute top-4 right-4 bg-black/70 p-3 rounded-full text-white hover:bg-black"
                onClick={() => setSelected(null)}
              >
                <X size={24} />
              </button>

              <img
                src={selected.previewUrl || ""}
                alt={selected.name}
                className="max-h-[80vh] mx-auto rounded-lg"
              />

              {selected.downloadUrl && (
                <a
                  href={selected.downloadUrl}
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
