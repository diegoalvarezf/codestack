import type { Metadata } from "next";
import { RedocClient } from "./RedocClient";

export const metadata: Metadata = {
  title: "API Reference — MCPHub",
  description: "Interactive REST API documentation for MCPHub",
};

export default function DocsPage() {
  return <RedocClient specUrl="/api/openapi.json" />;
}
