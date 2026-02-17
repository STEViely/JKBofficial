// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import Layout from "@/components/Layout";
// import { ExternalLink } from "lucide-react";
// import { Link } from "react-router-dom";

// type DriveItem = {
//   id: string;
//   name: string;
//   type: "folder" | "image";
// };

// const EXPORT_FOLDER_ID = "16BXIEtTdZV35udjnxYGSIkjQkQLKYGXu"; // ID ของโฟลเดอร์หลักที่เก็บอัลบัมทั้งหมด

// const Download = () => {
//   const [events, setEvents] = useState<DriveItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await fetch(`/api/photos/${EXPORT_FOLDER_ID}`);

//         const data = await res.json();

//         console.log("API RESPONSE:", data);

//         // ✅ FIX: ใช้ data.files แทน data ตรง ๆ
//         if (data.files && Array.isArray(data.files)) {
//           const folders = data.files.filter(
//             (item: DriveItem) => item.type === "folder",
//           );

//           setEvents(folders);
//         } else {
//           console.error("Unexpected API format:", data);
//           setEvents([]);
//         }
//       } catch (err) {
//         console.error("Failed to load events:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, []);

//   return (
//     <Layout>
//       <section className="py-20">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-16"
//           >
//             <h1 className="font-heading text-5xl md:text-7xl text-gradient">
//               ดาวน์โหลดรูปภาพ
//             </h1>
//             <p className="mt-4 text-muted-foreground text-lg">
//               เลือกงานเพื่อดูและดาวน์โหลดรูปภาพ
//             </p>
//           </motion.div>

//           {loading && (
//             <p className="text-center text-muted-foreground">
//               กำลังโหลดข้อมูล...
//             </p>
//           )}

//           {!loading && events.length === 0 && (
//             <p className="text-center text-muted-foreground">ไม่พบอัลบัม</p>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
//             {events.map((event, i) => (
//               <motion.div
//                 key={event.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: i * 0.1 }}
//               >
//                 <Link
//                   to={`/download/${event.id}`}
//                   className="group bg-card border border-border p-6 hover:border-primary/50 transition-all flex items-center justify-between"
//                 >
//                   <div>
//                     <h3 className="font-heading text-xl tracking-wider">
//                       {event.name}
//                     </h3>
//                   </div>

//                   <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
//                     <span>ดูรูปภาพ</span>
//                     <ExternalLink className="w-4 h-4" />
//                   </div>
//                 </Link>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </Layout>
//   );
// };

// export default Download;

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Photo {
  id: string;
  name: string;
  previewUrl: string | null;
  downloadUrl: string | null;
}

export default function DownloadPage() {
  const params = useParams();
  const folderId = params?.folderId as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [folderName, setFolderName] = useState("Gallery");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!folderId) return;

    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/photos/${folderId}`);
        const data = await res.json();

        setFolderName(data?.folderName || "Gallery");
        setPhotos(Array.isArray(data?.files) ? data.files : []);
      } catch (error) {
        console.error("Fetch error:", error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [folderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">{folderName}</h1>

      {photos.length === 0 ? (
        <div className="text-center text-gray-400">No photos found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.downloadUrl || "#"}
              className="block overflow-hidden rounded-lg"
            >
              <img
                src={photo.previewUrl || ""}
                alt={photo.name}
                className="w-full h-48 object-cover hover:scale-105 transition-transform"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
