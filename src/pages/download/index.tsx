import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DownloadIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/download/13759jCy3jMyus8d52gXGTMf-6B26BLZa");
  }, []);

  return null;
}
