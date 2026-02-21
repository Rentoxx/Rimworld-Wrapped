"use client";

import { useState } from "react";
import { ParsedStats } from "@/lib/types";
import { parseRimworldSave } from "@/lib/parser";
import UploadView from "@/components/views/UploadView";
import ParsingView from "@/components/views/ParsingView";
import WrappedView from "@/components/views/WrappedView";

export default function Home() {
  const [appState, setAppState] = useState<"upload" | "parsing" | "wrapped">("upload");
  const [stats, setStats] = useState<ParsedStats | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setAppState("parsing");
      const parsedData = await parseRimworldSave(file);
      setStats(parsedData);
      setAppState("wrapped");
    } catch (error) {
      console.error("Fehler beim Parsen der Datei:", error);
      setAppState("upload");
      // Optional: Hier könnte man noch einen Error-Toast einbauen!
    }
  };

  return (
    <>
      {appState === "upload" && <UploadView onFileSelect={handleFileUpload} />}
      {appState === "parsing" && <ParsingView />}
      {appState === "wrapped" && stats && <WrappedView stats={stats} />}
    </>
  );
}