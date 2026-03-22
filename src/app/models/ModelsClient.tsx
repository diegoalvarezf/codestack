"use client";

import { useState, useEffect } from "react";

type ToolCalling = "full" | "partial" | "none";
type Runner = "ollama" | "lmstudio";

interface Model {
  id: string;
  name: string;
  provider: string;
  params: string;
  vramRequired: number;
  ramRequired: number;
  capabilities: string[];
  toolCalling: ToolCalling;
  contextWindow: number; // K tokens
  license: "open" | "research" | "commercial";
  description: string;
  ollamaId?: string;
  lmStudioId?: string;
}

const MODELS: Model[] = [
  // ── Llama ──────────────────────────────────────────────────────────────────
  { id: "llama3.2-1b", name: "Llama 3.2 1B", provider: "Meta", params: "1B", vramRequired: 1, ramRequired: 4, capabilities: ["chat"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Lightest Llama. Runs on anything.", ollamaId: "llama3.2:1b", lmStudioId: "lmstudio-community/Llama-3.2-1B-Instruct-GGUF" },
  { id: "llama3.2-3b", name: "Llama 3.2 3B", provider: "Meta", params: "3B", vramRequired: 2, ramRequired: 6, capabilities: ["chat", "code"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Fast and capable for everyday tasks.", ollamaId: "llama3.2:3b", lmStudioId: "lmstudio-community/Llama-3.2-3B-Instruct-GGUF" },
  { id: "llama3.1-8b", name: "Llama 3.1 8B", provider: "Meta", params: "8B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Best quality/size ratio for most use cases.", ollamaId: "llama3.1:8b", lmStudioId: "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF" },
  { id: "llama3.1-70b", name: "Llama 3.1 70B", provider: "Meta", params: "70B", vramRequired: 40, ramRequired: 48, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Near-frontier quality locally.", ollamaId: "llama3.1:70b", lmStudioId: "lmstudio-community/Meta-Llama-3.1-70B-Instruct-GGUF" },
  { id: "llama3.1-405b", name: "Llama 3.1 405B", provider: "Meta", params: "405B", vramRequired: 230, ramRequired: 256, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Largest open model. Needs serious hardware.", ollamaId: "llama3.1:405b" },

  // ── Qwen ───────────────────────────────────────────────────────────────────
  { id: "qwen2.5-0.5b", name: "Qwen 2.5 0.5B", provider: "Alibaba", params: "0.5B", vramRequired: 0.5, ramRequired: 2, capabilities: ["chat"], toolCalling: "partial", contextWindow: 128, license: "commercial", description: "Tiny but surprisingly capable.", ollamaId: "qwen2.5:0.5b", lmStudioId: "lmstudio-community/Qwen2.5-0.5B-Instruct-GGUF" },
  { id: "qwen2.5-3b", name: "Qwen 2.5 3B", provider: "Alibaba", params: "3B", vramRequired: 2, ramRequired: 6, capabilities: ["chat", "code"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Strong multilingual support.", ollamaId: "qwen2.5:3b", lmStudioId: "lmstudio-community/Qwen2.5-3B-Instruct-GGUF" },
  { id: "qwen2.5-7b", name: "Qwen 2.5 7B", provider: "Alibaba", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Excellent code and tool use at 7B scale.", ollamaId: "qwen2.5:7b", lmStudioId: "lmstudio-community/Qwen2.5-7B-Instruct-GGUF" },
  { id: "qwen2.5-14b", name: "Qwen 2.5 14B", provider: "Alibaba", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Strong all-rounder, great for coding.", ollamaId: "qwen2.5:14b", lmStudioId: "lmstudio-community/Qwen2.5-14B-Instruct-GGUF" },
  { id: "qwen2.5-32b", name: "Qwen 2.5 32B", provider: "Alibaba", params: "32B", vramRequired: 20, ramRequired: 32, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Top open-source quality below 70B.", ollamaId: "qwen2.5:32b", lmStudioId: "lmstudio-community/Qwen2.5-32B-Instruct-GGUF" },
  { id: "qwen2.5-72b", name: "Qwen 2.5 72B", provider: "Alibaba", params: "72B", vramRequired: 42, ramRequired: 56, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Flagship Qwen. Best open multilingual model.", ollamaId: "qwen2.5:72b", lmStudioId: "lmstudio-community/Qwen2.5-72B-Instruct-GGUF" },

  // ── Mistral ────────────────────────────────────────────────────────────────
  { id: "mistral-7b", name: "Mistral 7B", provider: "Mistral", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code"], toolCalling: "partial", contextWindow: 32, license: "commercial", description: "Fast, efficient, great instruction following.", ollamaId: "mistral:7b", lmStudioId: "lmstudio-community/Mistral-7B-Instruct-v0.3-GGUF" },
  { id: "mixtral-8x7b", name: "Mixtral 8×7B", provider: "Mistral", params: "47B MoE", vramRequired: 26, ramRequired: 32, capabilities: ["chat", "code", "agents"], toolCalling: "partial", contextWindow: 32, license: "commercial", description: "MoE model with 12.9B active params.", ollamaId: "mixtral:8x7b", lmStudioId: "lmstudio-community/Mixtral-8x7B-Instruct-v0.1-GGUF" },
  { id: "mistral-small-22b", name: "Mistral Small 22B", provider: "Mistral", params: "22B", vramRequired: 14, ramRequired: 24, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 32, license: "commercial", description: "Best small Mistral for coding and agents.", ollamaId: "mistral-small", lmStudioId: "lmstudio-community/Mistral-Small-Instruct-2409-GGUF" },

  // ── Phi ────────────────────────────────────────────────────────────────────
  { id: "phi3-mini", name: "Phi-3 Mini", provider: "Microsoft", params: "3.8B", vramRequired: 2.5, ramRequired: 6, capabilities: ["chat", "code"], toolCalling: "partial", contextWindow: 128, license: "commercial", description: "Punches above its weight. Great for coding.", ollamaId: "phi3:mini", lmStudioId: "microsoft/Phi-3-mini-128k-instruct-gguf" },
  { id: "phi3-medium", name: "Phi-3 Medium", provider: "Microsoft", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "agents"], toolCalling: "partial", contextWindow: 128, license: "commercial", description: "Strong reasoning for a 14B model.", ollamaId: "phi3:medium", lmStudioId: "microsoft/Phi-3-medium-128k-instruct-gguf" },
  { id: "phi4", name: "Phi-4", provider: "Microsoft", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "agents"], toolCalling: "full", contextWindow: 16, license: "commercial", description: "Latest Phi. Excellent at STEM and tool use.", ollamaId: "phi4", lmStudioId: "microsoft/phi-4-gguf" },

  // ── Gemma ──────────────────────────────────────────────────────────────────
  { id: "gemma2-2b", name: "Gemma 2 2B", provider: "Google", params: "2B", vramRequired: 1.5, ramRequired: 4, capabilities: ["chat"], toolCalling: "none", contextWindow: 8, license: "commercial", description: "Google's smallest, surprisingly good.", ollamaId: "gemma2:2b", lmStudioId: "lmstudio-community/gemma-2-2b-it-GGUF" },
  { id: "gemma2-9b", name: "Gemma 2 9B", provider: "Google", params: "9B", vramRequired: 6, ramRequired: 10, capabilities: ["chat", "code"], toolCalling: "partial", contextWindow: 8, license: "commercial", description: "Great quality at 9B.", ollamaId: "gemma2:9b", lmStudioId: "lmstudio-community/gemma-2-9b-it-GGUF" },
  { id: "gemma2-27b", name: "Gemma 2 27B", provider: "Google", params: "27B", vramRequired: 17, ramRequired: 24, capabilities: ["chat", "code"], toolCalling: "partial", contextWindow: 8, license: "commercial", description: "Google's best open model.", ollamaId: "gemma2:27b", lmStudioId: "lmstudio-community/gemma-2-27b-it-GGUF" },

  // ── DeepSeek ───────────────────────────────────────────────────────────────
  { id: "deepseek-r1-7b", name: "DeepSeek R1 7B", provider: "DeepSeek", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "agents"], toolCalling: "partial", contextWindow: 128, license: "open", description: "Reasoning model. Chain-of-thought distilled.", ollamaId: "deepseek-r1:7b", lmStudioId: "lmstudio-community/DeepSeek-R1-Distill-Qwen-7B-GGUF" },
  { id: "deepseek-r1-14b", name: "DeepSeek R1 14B", provider: "DeepSeek", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "agents"], toolCalling: "partial", contextWindow: 128, license: "open", description: "Strong reasoning at 14B.", ollamaId: "deepseek-r1:14b", lmStudioId: "lmstudio-community/DeepSeek-R1-Distill-Qwen-14B-GGUF" },
  { id: "deepseek-r1-32b", name: "DeepSeek R1 32B", provider: "DeepSeek", params: "32B", vramRequired: 20, ramRequired: 32, capabilities: ["chat", "agents"], toolCalling: "partial", contextWindow: 128, license: "open", description: "Top open reasoning model.", ollamaId: "deepseek-r1:32b", lmStudioId: "lmstudio-community/DeepSeek-R1-Distill-Qwen-32B-GGUF" },
  { id: "deepseek-coder-v2", name: "DeepSeek Coder V2 16B", provider: "DeepSeek", params: "16B MoE", vramRequired: 10, ramRequired: 16, capabilities: ["code"], toolCalling: "partial", contextWindow: 32, license: "open", description: "Best open coding model.", ollamaId: "deepseek-coder-v2:16b", lmStudioId: "lmstudio-community/DeepSeek-Coder-V2-Lite-Instruct-GGUF" },

  // ── Code ───────────────────────────────────────────────────────────────────
  { id: "codellama-7b", name: "CodeLlama 7B", provider: "Meta", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["code"], toolCalling: "none", contextWindow: 16, license: "commercial", description: "Solid general code generation.", ollamaId: "codellama:7b", lmStudioId: "TheBloke/CodeLlama-7B-Instruct-GGUF" },
  { id: "codellama-34b", name: "CodeLlama 34B", provider: "Meta", params: "34B", vramRequired: 21, ramRequired: 32, capabilities: ["code"], toolCalling: "none", contextWindow: 16, license: "commercial", description: "Best CodeLlama variant.", ollamaId: "codellama:34b", lmStudioId: "TheBloke/CodeLlama-34B-Instruct-GGUF" },

  // ── Vision ─────────────────────────────────────────────────────────────────
  { id: "llava-7b", name: "LLaVA 7B", provider: "LLaVA Team", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "vision"], toolCalling: "none", contextWindow: 4, license: "open", description: "Vision + language. Understands images.", ollamaId: "llava:7b" },
  { id: "llama3.2-vision-11b", name: "Llama 3.2 Vision 11B", provider: "Meta", params: "11B", vramRequired: 7, ramRequired: 12, capabilities: ["chat", "vision", "agents"], toolCalling: "full", contextWindow: 128, license: "commercial", description: "Meta's multimodal model with tool calling.", ollamaId: "llama3.2-vision:11b", lmStudioId: "lmstudio-community/Llama-3.2-11B-Vision-Instruct-GGUF" },
];

const GPU_VRAM_MAP: [RegExp, number][] = [
  [/RTX\s*4090/i, 24], [/RTX\s*4080\s*SUPER/i, 16], [/RTX\s*4080/i, 16],
  [/RTX\s*4070\s*Ti\s*SUPER/i, 16], [/RTX\s*4070\s*Ti/i, 12], [/RTX\s*4070\s*SUPER/i, 12], [/RTX\s*4070/i, 12],
  [/RTX\s*4060\s*Ti.*16/i, 16], [/RTX\s*4060\s*Ti/i, 8], [/RTX\s*4060/i, 8],
  [/RTX\s*4050/i, 6],
  [/RTX\s*3090\s*Ti/i, 24], [/RTX\s*3090/i, 24],
  [/RTX\s*3080\s*Ti/i, 12], [/RTX\s*3080.*12/i, 12], [/RTX\s*3080/i, 10],
  [/RTX\s*3070\s*Ti/i, 8], [/RTX\s*3070/i, 8],
  [/RTX\s*3060\s*Ti/i, 8], [/RTX\s*3060.*12/i, 12], [/RTX\s*3060/i, 12],
  [/RTX\s*3050/i, 8],
  [/RTX\s*2080\s*Ti/i, 11], [/RTX\s*2080\s*SUPER/i, 8], [/RTX\s*2080/i, 8],
  [/RTX\s*2070\s*SUPER/i, 8], [/RTX\s*2070/i, 8],
  [/GTX\s*1080\s*Ti/i, 11], [/GTX\s*1080/i, 8],
  [/GTX\s*1070\s*Ti/i, 8], [/GTX\s*1070/i, 8],
  [/GTX\s*1060.*6/i, 6], [/GTX\s*1060/i, 6],
  [/RX\s*7900\s*XTX/i, 24], [/RX\s*7900\s*XT/i, 20], [/RX\s*7900/i, 16],
  [/RX\s*7800\s*XT/i, 16], [/RX\s*7700\s*XT/i, 12],
  [/RX\s*6900\s*XT/i, 16], [/RX\s*6800\s*XT/i, 16], [/RX\s*6800/i, 16],
  [/RX\s*6700\s*XT/i, 12], [/RX\s*6600\s*XT/i, 8], [/RX\s*6600/i, 8],
  [/Apple.*M3\s*Max/i, 36], [/Apple.*M3\s*Pro/i, 18], [/Apple.*M3/i, 8],
  [/Apple.*M2\s*Max/i, 32], [/Apple.*M2\s*Pro/i, 16], [/Apple.*M2\s*Ultra/i, 64], [/Apple.*M2/i, 8],
  [/Apple.*M1\s*Max/i, 24], [/Apple.*M1\s*Pro/i, 16], [/Apple.*M1\s*Ultra/i, 48], [/Apple.*M1/i, 8],
  [/A100/i, 80], [/A6000/i, 48], [/A5000/i, 24], [/A4000/i, 16],
  [/H100/i, 80], [/H200/i, 141],
];

function estimateVRAM(gpuName: string): number {
  for (const [pattern, vram] of GPU_VRAM_MAP) {
    if (pattern.test(gpuName)) return vram;
  }
  return 0;
}

function detectGPU(): { name: string; vram: number } {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        const name = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        return { name, vram: estimateVRAM(name) };
      }
    }
  } catch {}
  return { name: "Unknown GPU", vram: 0 };
}

function gradeModel(model: Model, vram: number, ram: number): "S" | "A" | "B" | "C" | "D" | "F" {
  const effectiveVram = vram > 0 ? vram : ram * 0.5;
  if (effectiveVram === 0 && ram === 0) return "F";
  if (model.vramRequired > effectiveVram * 1.1 && model.ramRequired > ram) return "F";
  if (model.vramRequired > effectiveVram) return "D";
  const ratio = model.vramRequired / effectiveVram;
  if (ratio <= 0.5) return "S";
  if (ratio <= 0.7) return "A";
  if (ratio <= 0.85) return "B";
  if (ratio <= 0.95) return "C";
  return "D";
}

const GRADE_STYLES: Record<string, string> = {
  S: "bg-green-500/20 text-green-400 border-green-500/30",
  A: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  B: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  C: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  D: "bg-red-500/20 text-red-400 border-red-500/30",
  F: "bg-gray-800 text-gray-600 border-gray-700",
};

const GRADE_LABEL: Record<string, string> = {
  S: "Runs great", A: "Runs well", B: "Runs fine",
  C: "Tight fit", D: "Very tight", F: "Can't run",
};

const CAP_LABELS: Record<string, string> = {
  chat: "Chat", code: "Code", agents: "Agents", vision: "Vision",
};

const TC_LABEL: Record<ToolCalling, string> = {
  full: "Full tool calling",
  partial: "Partial tool calling",
  none: "No tool calling",
};

const TC_STYLES: Record<ToolCalling, string> = {
  full: "text-green-400",
  partial: "text-yellow-400",
  none: "text-gray-600",
};

const TC_DOT: Record<ToolCalling, string> = {
  full: "bg-green-400",
  partial: "bg-yellow-400",
  none: "bg-gray-600",
};

const PROVIDERS = ["All", "Meta", "Alibaba", "Mistral", "Microsoft", "Google", "DeepSeek"];
const CAPS = ["chat", "code", "agents", "vision"];

function installCommand(model: Model, runner: Runner): string | null {
  if (runner === "ollama") return model.ollamaId ? `ollama run ${model.ollamaId}` : null;
  if (runner === "lmstudio") return model.lmStudioId ? `lms get ${model.lmStudioId}` : null;
  return null;
}

export function ModelsClient() {
  const [gpu, setGpu] = useState({ name: "", vram: 0 });
  const [detected, setDetected] = useState(false);
  const [filterProvider, setFilterProvider] = useState("All");
  const [filterCap, setFilterCap] = useState<string | null>(null);
  const [filterTC, setFilterTC] = useState<ToolCalling | "all">("all");
  const [hideIncompatible, setHideIncompatible] = useState(false);
  const [manualVram, setManualVram] = useState<number | null>(null);
  const [manualRam, setManualRam] = useState<number | null>(null);
  const [runner, setRunner] = useState<Runner>("ollama");

  useEffect(() => {
    const detectedGpu = detectGPU();
    setGpu(detectedGpu);
    setDetected(true);
  }, []);

  const effectiveVram = manualVram !== null ? manualVram : gpu.vram;
  const effectiveRam = manualRam ?? 8;

  const filtered = MODELS
    .filter(m => filterProvider === "All" || m.provider === filterProvider)
    .filter(m => !filterCap || m.capabilities.includes(filterCap))
    .filter(m => filterTC === "all" || m.toolCalling === filterTC)
    .map(m => ({ ...m, grade: gradeModel(m, effectiveVram, effectiveRam) }))
    .filter(m => !hideIncompatible || m.grade !== "F")
    .sort((a, b) => {
      const order = { S: 0, A: 1, B: 2, C: 3, D: 4, F: 5 };
      return order[a.grade] - order[b.grade];
    });

  return (
    <div>
      {/* Hardware panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-8">
        <div className="flex flex-wrap items-start gap-6">
          {/* GPU */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Detected GPU</p>
            {detected ? (
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">GPU</p>
                  <p className="text-sm font-medium text-white truncate max-w-xs">{gpu.name || "Not detected"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">VRAM (estimated)</p>
                  {gpu.vram > 0
                    ? <p className="text-lg font-bold text-white">{gpu.vram} GB</p>
                    : <p className="text-sm text-gray-500">Not detected</p>
                  }
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Detecting...</p>
            )}
          </div>
          {/* VRAM override */}
          <div>
            <p className="text-xs text-gray-500 mb-2">VRAM (GB)</p>
            <div className="flex gap-1 flex-wrap">
              {[4, 6, 8, 10, 12, 16, 24, 32, 48, 80].map(v => (
                <button
                  key={v}
                  onClick={() => setManualVram(manualVram === v ? null : v)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    (manualVram === v) || (manualVram === null && gpu.vram === v)
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
                >
                  {v}GB
                </button>
              ))}
            </div>
          </div>
          {/* RAM override */}
          <div>
            <p className="text-xs text-gray-500 mb-2">System RAM (GB)</p>
            <div className="flex gap-1 flex-wrap">
              {[4, 8, 16, 32, 64, 128].map(v => (
                <button
                  key={v}
                  onClick={() => setManualRam(manualRam === v ? null : v)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    manualRam === v
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
                >
                  {v}GB
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Row 1: provider + capability + hide incompatible */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            {PROVIDERS.map(p => (
              <button
                key={p}
                onClick={() => setFilterProvider(p)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  filterProvider === p
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-800 hidden sm:block" />
          <div className="flex gap-1 flex-wrap">
            {CAPS.map(c => (
              <button
                key={c}
                onClick={() => setFilterCap(filterCap === c ? null : c)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  filterCap === c
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {CAP_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setHideIncompatible(h => !h)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded border transition-colors ${
                hideIncompatible
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "border-gray-800 text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${hideIncompatible ? "bg-green-400" : "bg-gray-600"}`} />
              Hide incompatible
            </button>
          </div>
        </div>

        {/* Row 2: tool calling filter + runner toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-gray-600 self-center mr-1">Tool calling:</span>
            {([["all", "All"], ["full", "Tool use"], ["partial", "Partial"], ["none", "None"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterTC(val)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  filterTC === val
                    ? val === "full"
                      ? "bg-green-500/20 border-green-500/40 text-green-300"
                      : "bg-gray-700 border-gray-600 text-white"
                    : "border-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {val === "full" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 mb-px" />}
                {label}
              </button>
            ))}
          </div>

          {/* Runner toggle */}
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            <button
              onClick={() => setRunner("ollama")}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                runner === "ollama"
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Ollama
            </button>
            <button
              onClick={() => setRunner("lmstudio")}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                runner === "lmstudio"
                  ? "bg-gray-700 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              LM Studio
            </button>
          </div>
        </div>
      </div>

      {/* Grade legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["S", "A", "B", "C", "D", "F"] as const).map(g => (
          <span key={g} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${GRADE_STYLES[g]}`}>
            <span className="font-bold">{g}</span>
            <span className="text-gray-500">—</span>
            {GRADE_LABEL[g]}
          </span>
        ))}
      </div>

      {/* Models grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(model => {
          const cmd = installCommand(model, runner);
          return (
            <div
              key={model.id}
              className={`rounded-lg border p-4 transition-all flex flex-col ${
                model.grade === "F"
                  ? "border-gray-800 bg-gray-900/50 opacity-50"
                  : "border-gray-800 bg-gray-900 hover:border-gray-600 hover:-translate-y-0.5"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{model.name}</p>
                    {model.toolCalling === "full" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-medium shrink-0">
                        Tool use
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{model.provider} · {model.params}</p>
                </div>
                <span className={`shrink-0 ml-2 text-xs font-bold px-2 py-1 rounded border ${GRADE_STYLES[model.grade]}`}>
                  {model.grade}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{model.description}</p>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 mb-3">
                {model.capabilities.map(c => (
                  <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {CAP_LABELS[c] ?? c}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>{model.vramRequired}GB VRAM</span>
                <span className="text-gray-700">·</span>
                <span>{model.contextWindow}K ctx</span>
                <span className="text-gray-700">·</span>
                <span className={`flex items-center gap-1 ${TC_STYLES[model.toolCalling]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TC_DOT[model.toolCalling]}`} />
                  {TC_LABEL[model.toolCalling]}
                </span>
              </div>

              {/* Install command */}
              <div className="mt-auto">
                {cmd ? (
                  <code className="block text-xs font-mono text-green-500/70 bg-black/30 rounded px-2 py-1.5 truncate">
                    {cmd}
                  </code>
                ) : (
                  <p className="text-xs text-gray-600 italic">
                    {runner === "lmstudio" ? "Search in LM Studio app" : "Not available on Ollama"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-sm">
          No models match your filters.
        </div>
      )}
    </div>
  );
}
