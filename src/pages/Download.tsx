import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const EXPORT_FOLDER_ID = "16BXIEtTdZV35udjnxYGSIkjQkQLKYGXu";

interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
}

export default function Download() {
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/photos/${EXPORT_FOLDER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        const onlyFolders = data.files.filter(
          (item: DriveItem) => item.type === "folder",
        );
        setFolders(onlyFolders);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Event Albums</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Link
            key={folder.id}
            to={`/download/${folder.id}`}
            className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg transition"
          >
            📁 {folder.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
