"use client";

import { useState, useEffect } from "react";

interface Model {
  id: string;
  name: string;
  provider: string;
  params: string;
  vramRequired: number; // GB, Q4 quantized
  ramRequired: number;  // GB system RAM
  capabilities: string[];
  license: "open" | "research" | "commercial";
  description: string;
  ollamaId?: string;
}

const MODELS: Model[] = [
  // ── Llama ──────────────────────────────────────────────────────────────────
  { id: "llama3.2-1b", name: "Llama 3.2 1B", provider: "Meta", params: "1B", vramRequired: 1, ramRequired: 4, capabilities: ["chat"], license: "commercial", description: "Lightest Llama. Runs on anything.", ollamaId: "llama3.2:1b" },
  { id: "llama3.2-3b", name: "Llama 3.2 3B", provider: "Meta", params: "3B", vramRequired: 2, ramRequired: 6, capabilities: ["chat", "code"], license: "commercial", description: "Fast and capable for everyday tasks.", ollamaId: "llama3.2:3b" },
  { id: "llama3.1-8b", name: "Llama 3.1 8B", provider: "Meta", params: "8B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Best quality/size ratio for most use cases.", ollamaId: "llama3.1:8b" },
  { id: "llama3.1-70b", name: "Llama 3.1 70B", provider: "Meta", params: "70B", vramRequired: 40, ramRequired: 48, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Near-frontier quality locally.", ollamaId: "llama3.1:70b" },
  { id: "llama3.1-405b", name: "Llama 3.1 405B", provider: "Meta", params: "405B", vramRequired: 230, ramRequired: 256, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Largest open model. Needs serious hardware.", ollamaId: "llama3.1:405b" },

  // ── Qwen ───────────────────────────────────────────────────────────────────
  { id: "qwen2.5-0.5b", name: "Qwen 2.5 0.5B", provider: "Alibaba", params: "0.5B", vramRequired: 0.5, ramRequired: 2, capabilities: ["chat"], license: "commercial", description: "Tiny but surprisingly capable.", ollamaId: "qwen2.5:0.5b" },
  { id: "qwen2.5-3b", name: "Qwen 2.5 3B", provider: "Alibaba", params: "3B", vramRequired: 2, ramRequired: 6, capabilities: ["chat", "code"], license: "commercial", description: "Strong multilingual support.", ollamaId: "qwen2.5:3b" },
  { id: "qwen2.5-7b", name: "Qwen 2.5 7B", provider: "Alibaba", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Excellent code and reasoning at 7B scale.", ollamaId: "qwen2.5:7b" },
  { id: "qwen2.5-14b", name: "Qwen 2.5 14B", provider: "Alibaba", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Strong all-rounder, great for coding.", ollamaId: "qwen2.5:14b" },
  { id: "qwen2.5-32b", name: "Qwen 2.5 32B", provider: "Alibaba", params: "32B", vramRequired: 20, ramRequired: 32, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Top open-source quality below 70B.", ollamaId: "qwen2.5:32b" },
  { id: "qwen2.5-72b", name: "Qwen 2.5 72B", provider: "Alibaba", params: "72B", vramRequired: 42, ramRequired: 56, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Flagship Qwen. Best open multilingual model.", ollamaId: "qwen2.5:72b" },

  // ── Mistral ────────────────────────────────────────────────────────────────
  { id: "mistral-7b", name: "Mistral 7B", provider: "Mistral", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "code"], license: "commercial", description: "Fast, efficient, great instruction following.", ollamaId: "mistral:7b" },
  { id: "mixtral-8x7b", name: "Mixtral 8×7B", provider: "Mistral", params: "47B MoE", vramRequired: 26, ramRequired: 32, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "MoE model with 12.9B active params.", ollamaId: "mixtral:8x7b" },
  { id: "mistral-small-22b", name: "Mistral Small 22B", provider: "Mistral", params: "22B", vramRequired: 14, ramRequired: 24, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Best small Mistral for coding tasks.", ollamaId: "mistral-small" },

  // ── Phi ────────────────────────────────────────────────────────────────────
  { id: "phi3-mini", name: "Phi-3 Mini", provider: "Microsoft", params: "3.8B", vramRequired: 2.5, ramRequired: 6, capabilities: ["chat", "code"], license: "commercial", description: "Punches above its weight. Great for coding.", ollamaId: "phi3:mini" },
  { id: "phi3-medium", name: "Phi-3 Medium", provider: "Microsoft", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Strong reasoning for a 14B model.", ollamaId: "phi3:medium" },
  { id: "phi4", name: "Phi-4", provider: "Microsoft", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Latest Phi. Excellent at STEM and reasoning.", ollamaId: "phi4" },

  // ── Gemma ──────────────────────────────────────────────────────────────────
  { id: "gemma2-2b", name: "Gemma 2 2B", provider: "Google", params: "2B", vramRequired: 1.5, ramRequired: 4, capabilities: ["chat"], license: "commercial", description: "Google's smallest, surprisingly good.", ollamaId: "gemma2:2b" },
  { id: "gemma2-9b", name: "Gemma 2 9B", provider: "Google", params: "9B", vramRequired: 6, ramRequired: 10, capabilities: ["chat", "code"], license: "commercial", description: "Great quality at 9B.", ollamaId: "gemma2:9b" },
  { id: "gemma2-27b", name: "Gemma 2 27B", provider: "Google", params: "27B", vramRequired: 17, ramRequired: 24, capabilities: ["chat", "code", "reasoning"], license: "commercial", description: "Google's best open model.", ollamaId: "gemma2:27b" },

  // ── DeepSeek ───────────────────────────────────────────────────────────────
  { id: "deepseek-r1-7b", name: "DeepSeek R1 7B", provider: "DeepSeek", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "reasoning"], license: "open", description: "Reasoning model. Chain-of-thought distilled.", ollamaId: "deepseek-r1:7b" },
  { id: "deepseek-r1-14b", name: "DeepSeek R1 14B", provider: "DeepSeek", params: "14B", vramRequired: 9, ramRequired: 16, capabilities: ["chat", "reasoning"], license: "open", description: "Strong reasoning at 14B.", ollamaId: "deepseek-r1:14b" },
  { id: "deepseek-r1-32b", name: "DeepSeek R1 32B", provider: "DeepSeek", params: "32B", vramRequired: 20, ramRequired: 32, capabilities: ["chat", "reasoning"], license: "open", description: "Top open reasoning model.", ollamaId: "deepseek-r1:32b" },
  { id: "deepseek-coder-v2", name: "DeepSeek Coder V2 16B", provider: "DeepSeek", params: "16B MoE", vramRequired: 10, ramRequired: 16, capabilities: ["code"], license: "open", description: "Best open coding model.", ollamaId: "deepseek-coder-v2:16b" },

  // ── Code ───────────────────────────────────────────────────────────────────
  { id: "codellama-7b", name: "CodeLlama 7B", provider: "Meta", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["code"], license: "commercial", description: "Solid general code generation.", ollamaId: "codellama:7b" },
  { id: "codellama-34b", name: "CodeLlama 34B", provider: "Meta", params: "34B", vramRequired: 21, ramRequired: 32, capabilities: ["code"], license: "commercial", description: "Best CodeLlama variant.", ollamaId: "codellama:34b" },

  // ── Vision ─────────────────────────────────────────────────────────────────
  { id: "llava-7b", name: "LLaVA 7B", provider: "LLaVA Team", params: "7B", vramRequired: 5, ramRequired: 8, capabilities: ["chat", "vision"], license: "open", description: "Vision + language. Understands images.", ollamaId: "llava:7b" },
  { id: "llama3.2-vision-11b", name: "Llama 3.2 Vision 11B", provider: "Meta", params: "11B", vramRequired: 7, ramRequired: 12, capabilities: ["chat", "vision", "reasoning"], license: "commercial", description: "Meta's multimodal model.", ollamaId: "llama3.2-vision:11b" },
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
  const effectiveVram = vram > 0 ? vram : ram * 0.5; // if no dedicated GPU, use half RAM as estimate
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
  chat: "Chat", code: "Code", reasoning: "Reasoning", vision: "Vision",
};

const PROVIDERS = ["All", "Meta", "Alibaba", "Mistral", "Microsoft", "Google", "DeepSeek"];
const CAPS = ["chat", "code", "reasoning", "vision"];

export function ModelsClient() {
  const [ram, setRam] = useState(0);
  const [gpu, setGpu] = useState({ name: "", vram: 0 });
  const [detected, setDetected] = useState(false);
  const [filterProvider, setFilterProvider] = useState("All");
  const [filterCap, setFilterCap] = useState<string | null>(null);
  const [hideIncompatible, setHideIncompatible] = useState(false);
  const [manualVram, setManualVram] = useState<number | null>(null);

  useEffect(() => {
    const detectedRam = (navigator as any).deviceMemory || 8;
    const detectedGpu = detectGPU();
    setRam(detectedRam);
    setGpu(detectedGpu);
    setDetected(true);
  }, []);

  const effectiveVram = manualVram !== null ? manualVram : gpu.vram;

  const filtered = MODELS
    .filter(m => filterProvider === "All" || m.provider === filterProvider)
    .filter(m => !filterCap || m.capabilities.includes(filterCap))
    .map(m => ({ ...m, grade: gradeModel(m, effectiveVram, ram) }))
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
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Detected hardware</p>
            {detected ? (
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">System RAM</p>
                  <p className="text-lg font-bold text-white">{ram} GB</p>
                </div>
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
          <div>
            <p className="text-xs text-gray-500 mb-2">Override VRAM (GB)</p>
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
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        {filtered.map(model => (
          <div
            key={model.id}
            className={`rounded-lg border p-4 transition-all ${
              model.grade === "F"
                ? "border-gray-800 bg-gray-900/50 opacity-50"
                : "border-gray-800 bg-gray-900 hover:border-gray-600 hover:-translate-y-0.5"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate">{model.name}</p>
                <p className="text-xs text-gray-500">{model.provider} · {model.params}</p>
              </div>
              <span className={`shrink-0 ml-2 text-xs font-bold px-2 py-1 rounded border ${GRADE_STYLES[model.grade]}`}>
                {model.grade}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{model.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {model.capabilities.map(c => (
                <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {CAP_LABELS[c]}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{model.vramRequired}GB VRAM · {model.ramRequired}GB RAM</span>
              {model.ollamaId && (
                <code className="text-green-500/70 font-mono">ollama run {model.ollamaId}</code>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-sm">
          No models match your filters.
        </div>
      )}
    </div>
  );
}
