import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Photo {
  id: string;
  name: string;
  previewUrl: string;
  downloadUrl: string;
}

export default function DownloadPage() {
  const router = useRouter();
  const { folderId } = router.query;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!folderId) return;

    fetch(`/api/photos/${folderId}`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.files || []);
      });
  }, [folderId]);

  /* ================= Touch Slide ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (dragOffset < -80 && selectedIndex < photos.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
    if (dragOffset > 80 && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  if (!photos.length) {
    return (
      <div
        style={{
          color: "white",
          background: "black",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: "black",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* SLIDER */}
      <div
        style={{ flex: 1, overflow: "hidden" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            transform: `translateX(calc(-${selectedIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.35s ease",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                minWidth: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={photo.previewUrl}
                alt={photo.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div
        style={{
          padding: "20px",
          textAlign: "center",
        }}
      >
        <a
          href={photos[selectedIndex].downloadUrl}
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#E10600",
            color: "white",
            padding: "12px 22px",
            borderRadius: "999px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ดาวน์โหลด
        </a>
      </div>
    </div>
  );
}
