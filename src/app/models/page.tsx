import type { Metadata } from "next";
import { ModelsClient } from "./ModelsClient";

export const metadata: Metadata = {
  title: "Local AI Models — MCPHub",
  description: "Find out which AI models can run on your hardware. See VRAM requirements, grades, and one-click Ollama install commands.",
};

export default function ModelsPage() {
  return <ModelsClient />;
}
