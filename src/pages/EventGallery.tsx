import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface DriveItem {
  id: string;
  name: string;
  type: "file" | "folder";
  previewUrl: string | null;
  downloadUrl: string | null;
}

export default function EventGallery() {
  const { folderId } = useParams<{ folderId: string }>();
  const [photos, setPhotos] = useState<DriveItem[]>([]);
  const [selected, setSelected] = useState<DriveItem | null>(null);

  useEffect(() => {
    if (!folderId) return;

    fetch(`/api/photos/${folderId}`)
      .then((res) => res.json())
      .then((data: { files: DriveItem[] }) => {
        const onlyPhotos = data.files.filter((item) => item.type === "file");
        setPhotos(onlyPhotos);
      })
      .catch((err) => console.error(err));
  }, [folderId]);

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.previewUrl ?? ""}
            alt={photo.name}
            className="rounded-lg cursor-pointer hover:opacity-80 transition"
            onClick={() => setSelected(photo)}
          />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-4xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.previewUrl ?? ""}
              alt={selected.name}
              className="w-full rounded-lg"
            />

            {selected.downloadUrl && (
              <a
                href={selected.downloadUrl}
                className="mt-6 inline-block bg-[#C46A6A] text-white px-6 py-3 rounded-lg"
              >
                ⬇ ดาวน์โหลด
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
