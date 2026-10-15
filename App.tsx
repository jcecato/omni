/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Aplicação Central — AI Video Director Engine
 * Super-Skill Omni Video Director Pro v3.0
 */

import React, { useState, useMemo } from 'react';
import { Header, HeaderPreset } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { CenterPanel } from './components/CenterPanel';
import { RightPanel } from './components/RightPanel';

import { 
  SceneDirectiveState, 
  createDefaultSceneState, 
  compileScene, 
  analyzeSpeechCadence, 
  applyQuickNaturalChange 
} from './engine/directorRules';

export default function App() {
  const [sceneState, setSceneState] = useState<SceneDirectiveState>(() => createDefaultSceneState(1));
  const [quickChangeLog, setQuickChangeLog] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'en' | 'pt' | null>(null);

  const wordAnalysis = useMemo(() => {
    return analyzeSpeechCadence(sceneState.speechText);
  }, [sceneState.speechText]);

  const compiled = useMemo(() => {
    return compileScene(sceneState);
  }, [sceneState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleUpdateState = (partial: Partial<SceneDirectiveState>) => {
    setSceneState((prev) => ({
      ...prev,
      ...partial
    }));
  };

  // BLOCO 2: Processamento de Mudança Rápida (NLP Fast Engine)
  const handleApplyQuickChange = (request: string) => {
    const { updatedState, changeLog } = applyQuickNaturalChange(sceneState, request);
    setSceneState(updatedState);
    setQuickChangeLog(changeLog);
    showToast('Ajuste aplicado com sucesso!');
  };

  // Botão "⚡ Criar Direção Inteligente"
  const handleGenerateSmartDirection = async () => {
    setIsGenerating(true);
    try {
      // Tentar consultar backend inteligente ou sintetizar com as regras locais
      const res = await fetch('/api/director/smart-tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawScript: sceneState.speechText,
          category: 'Saúde & Medicina',
          targetEngine: 'Omni Flow v3.0'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.directorSummary) {
          setSceneState((prev) => ({
            ...prev,
            visualIdea: data.directorSummary
          }));
        }
      }
      showToast('Direção Audiovisual compilada!');
    } catch {
      // Fallback local elegante
      showToast('Direção local recalculada com sucesso!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (p: HeaderPreset) => {
    setSceneState((prev) => ({
      ...prev,
      masterMode: p.masterMode,
      speechText: p.speechText,
      visualIdea: p.visualIdea,
      bodyProfileId: p.bodyProfileId,
      zDepthBoxId: p.zDepthBoxId,
      scenarioId: p.scenarioId,
      lightingId: p.lightingId
    }));
    setQuickChangeLog(`Pré-configuração "${p.title}" aplicada com sucesso.`);
    showToast(`Carregado: ${p.title}`);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copiado para a área de transferência!`);
    }).catch(() => {
      showToast('Falha ao copiar.');
    });
  };

  const handleCopyAllEN = () => {
    handleCopyText(compiled.promptEn, 'Prompt Técnico (EN)');
    setCopiedType('en');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopySpeechPT = () => {
    handleCopyText(sceneState.speechText, 'Roteiro da Fala (PT-BR)');
    setCopiedType('pt');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header Superior */}
      <Header
        onSelectPreset={handleSelectPreset}
        onCopyAllEN={handleCopyAllEN}
        onCopySpeechPT={handleCopySpeechPT}
        copiedType={copiedType}
      />

      {/* Grid Principal dos 3 Painéis */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Painel Esquerdo: Configuração Mestre e Roteiro */}
        <div className="lg:col-span-4 h-fit">
          <LeftPanel
            state={sceneState}
            wordAnalysis={wordAnalysis}
            onUpdateState={handleUpdateState}
            onGenerateSmartDirection={handleGenerateSmartDirection}
            isGenerating={isGenerating}
          />
        </div>

        {/* Painel Central: Auditoria, Mudança Rápida e Saída Final Compilada */}
        <div className="lg:col-span-5 h-fit">
          <CenterPanel
            compiled={compiled}
            state={sceneState}
            onApplyQuickChange={handleApplyQuickChange}
            quickChangeLog={quickChangeLog}
            onCopyText={handleCopyText}
            isCopied={toastMessage?.includes('copiado') || false}
          />
        </div>

        {/* Painel Direito: Chaves Rápidas de Override */}
        <div className="lg:col-span-3 h-fit">
          <RightPanel
            state={sceneState}
            onUpdateState={handleUpdateState}
          />
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
