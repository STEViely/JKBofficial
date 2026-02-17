import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface DriveFolder {
  id: string;
  name: string;
}

interface ApiResponse {
  folderName?: string;
  files: DriveFolder[];
}

const EXPORT_FOLDER_ID = "16BXIEtTdZV35udjnxYGSIkjQkQLKYGXu";

const Download = () => {
  const [events, setEvents] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/photos/${EXPORT_FOLDER_ID}`);
        const data: ApiResponse = await res.json();

        if (Array.isArray(data.files)) {
          setEvents(data.files);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-heading text-5xl md:text-7xl text-gradient">
              ดาวน์โหลดรูปภาพ
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              เลือกงานเพื่อดูและดาวน์โหลดรูปภาพ
            </p>
          </motion.div>

          {loading && (
            <p className="text-center text-muted-foreground">
              กำลังโหลดข้อมูล...
            </p>
          )}

          {!loading && events.length === 0 && (
            <p className="text-center text-muted-foreground">ไม่พบอัลบัม</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/download/${event.id}`}
                  className="group bg-card border border-border p-6 hover:border-primary/50 transition-all flex items-center justify-between"
                >
                  <h3 className="font-heading text-xl tracking-wider">
                    {event.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>ดูรูปภาพ</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Download;
