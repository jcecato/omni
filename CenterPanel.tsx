/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Painel Central — Auditoria, Mudança Rápida e Saída Compilada
 * Super-Skill Omni Video Director Pro v3.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Send, 
  Copy, 
  Check, 
  Layers, 
  Camera, 
  Sun, 
  UserCheck, 
  FileText, 
  Sparkles,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

import { 
  CompiledOutput, 
  SceneDirectiveState 
} from '../engine/directorRules';

interface CenterPanelProps {
  compiled: CompiledOutput;
  state: SceneDirectiveState;
  onApplyQuickChange: (request: string) => void;
  quickChangeLog: string | null;
  onCopyText: (text: string, label: string) => void;
  isCopied: boolean;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  compiled,
  state,
  onApplyQuickChange,
  quickChangeLog,
  onCopyText,
  isCopied
}) => {
  const [outputTab, setOutputTab] = useState<'pt' | 'en'>('en');
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onApplyQuickChange(quickInput.trim());
    setQuickInput('');
  };

  const currentPromptText = outputTab === 'en' ? compiled.promptEn : compiled.promptPt;
  const currentCharCount = outputTab === 'en' ? compiled.charCountEn : compiled.charCountPt;

  return (
    <main className="bg-[#10131c] border border-[#242b3d] rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
      {/* ============================================================ */}
      {/* BLOCO 1: Auditoria / Prévia em PT-BR                         */}
      {/* ============================================================ */}
      <section className="bg-[#0b0d13] border border-[#242b3d] rounded-xl p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#1f2537] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                BLOCO 1: Painel de Decisão & Auditoria Técnica (PT-BR)
              </h2>
              <span className="text-[10px] text-slate-400">
                {compiled.audit.engineName} • {compiled.audit.blockInfo}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
            ✓ 100% Blindado
          </span>
        </div>

        {/* Grid de Auditoria */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="bg-[#151924] p-2 rounded-lg border border-[#242b3d]">
            <div className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
              <Camera className="w-3 h-3 text-cyan-400" />
              Câmera & Lente
            </div>
            <div className="font-semibold text-slate-200 line-clamp-2">
              {compiled.audit.cameraLens}
            </div>
          </div>

          <div className="bg-[#151924] p-2 rounded-lg border border-[#242b3d]">
            <div className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
              <Layers className="w-3 h-3 text-amber-400" />
              Caixa Z-Depth
            </div>
            <div className="font-semibold text-slate-200 line-clamp-2">
              {compiled.audit.zDepthLayout}
            </div>
          </div>

          <div className="bg-[#151924] p-2 rounded-lg border border-[#242b3d]">
            <div className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
              <Sun className="w-3 h-3 text-yellow-400" />
              Iluminação
            </div>
            <div className="font-semibold text-slate-200 line-clamp-2">
              {compiled.audit.lightingName}
            </div>
          </div>

          <div className="bg-[#151924] p-2 rounded-lg border border-[#242b3d]">
            <div className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              Perfil Corporal
            </div>
            <div className="font-semibold text-slate-200 line-clamp-2">
              {compiled.audit.bodyProfileName}
            </div>
          </div>
        </div>

        {/* Resumo de Diretrizes */}
        <div className="bg-[#07090e] p-2.5 rounded-lg border border-[#1f2537] text-[10px] space-y-1 text-slate-300">
          {compiled.audit.reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* BLOCO 2: Campo "🔄 Solicitar Mudança Rápida"                 */}
      {/* ============================================================ */}
      <section className="bg-[#0b0d13] border border-cyan-500/30 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            BLOCO 2: Solicitar Mudança Rápida (NLP Fast Engine)
          </label>
          <span className="text-[10px] text-slate-400">
            Ajuste em linguagem natural
          </span>
        </div>

        <form onSubmit={handleQuickSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder='Ex: "mude para luz quente e caixa ao lado", "perfil empatia", "tirar microfone"...'
            className="flex-1 text-xs rounded-xl px-3 py-2.5 bg-[#07090e] border border-[#242b3d] focus:border-cyan-400 text-slate-100 placeholder:text-slate-500 font-sans"
          />
          <button
            type="submit"
            className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Send className="w-3 h-3" />
            <span>Aplicar</span>
          </button>
        </form>

        {quickChangeLog && (
          <div className="text-[11px] text-cyan-300/90 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40 flex items-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>{quickChangeLog}</span>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* BLOCO 3: Saída Final Compilada PT / EN                       */}
      {/* ============================================================ */}
      <section className="bg-[#0b0d13] border border-[#242b3d] rounded-xl p-3.5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#1f2537] pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              BLOCO 3: Saída Final Compilada
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs PT-BR vs EN */}
            <div className="flex items-center bg-[#151924] p-0.5 rounded-lg border border-[#242b3d]">
              <button
                type="button"
                onClick={() => setOutputTab('en')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  outputTab === 'en'
                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inglês Técnico (EN)
              </button>
              <button
                type="button"
                onClick={() => setOutputTab('pt')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  outputTab === 'pt'
                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Português (PT-BR)
              </button>
            </div>

            {/* Botão Copiar */}
            <button
              type="button"
              onClick={() => onCopyText(currentPromptText, outputTab === 'en' ? 'Prompt EN' : 'Prompt PT-BR')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copiado!' : `Copiar Prompt (${outputTab.toUpperCase()})`}</span>
            </button>
          </div>
        </div>

        {/* Teto e Status de Caracteres */}
        <div className="flex items-center justify-between text-[11px] px-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Teto Máximo do Modelo:</span>
            <span className={`font-mono font-bold ${
              currentCharCount <= 1800 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {currentCharCount} / 1.800 caracteres
            </span>
          </div>
          {currentCharCount <= 1800 ? (
            <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
              ✓ Dentro do limite seguro (&lt;1.800 chars)
            </span>
          ) : (
            <span className="text-rose-400 text-[10px] font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Ultrapassou o teto de 1.800 chars
            </span>
          )}
        </div>

        {/* Caixa de Texto do Prompt Compilado */}
        <div className="relative">
          <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono bg-[#07090e] p-3.5 rounded-xl border border-[#242b3d] overflow-y-auto max-h-[460px] leading-relaxed selection:bg-amber-500/30 selection:text-amber-200">
            {currentPromptText}
          </pre>
        </div>
      </section>
    </main>
  );
};
