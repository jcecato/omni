/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini AI Client instance with telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. API: AI Script Auto-Director & Semantic Tagger (Gemini 3.8 Flash)
app.post('/api/director/smart-tagger', async (req, res) => {
  try {
    const { rawScript, category, targetEngine } = req.body;

    if (!rawScript || typeof rawScript !== 'string') {
      return res.status(400).json({ error: 'Texto do roteiro não fornecido.' });
    }

    const systemInstruction = `Você é o Diretor Chefe de Vídeo de IA (AI Video Director Engine) especializado no modelo GEMINI 3.8 FLASH.
Sua missão é ler um roteiro em português (médico, clínico ou corporativo) e reformatá-lo em blocos de cenas estruturados para geração de vídeo com avatares ultrarrealistas.

REGRAS RÍGIDAS DE DIREÇÃO:
1. Divida o roteiro em cenas curtas e dinâmicas (cada cena deve ter entre 1 a 3 frases lógicas).
2. Para CADA cena, determine a intenção emocional exata escolhendo APENAS UMA entre as 15 regras de coerência do sistema:
   - "Sério", "Alerta", "Empático", "Reflexivo", "Propositivo", "Surpreso", "Calmo", "Entusiasmado", "Investigativo", "Autoridade", "Preocupação Clínica", "Urgente", "Educativo", "Cético", "Triunfo", "Correção Empática", "Neutro".
3. Para CADA cena, determine a ação visual ideal:
   - "Falar para câmera", "B-Roll", "Sair de cena", "Voltar para cena", "Gesto de mão", "Microfone na mão".
4. Adicione pausas dramáticas/respiratórias onde necessário (ex: "[Pausa 1.5s]" ou "[Pausa 1.0s]").
5. NUNCA coloque sorrisos ou tons eufóricos em diagnósticos graves ou alertas de risco à saúde (bloqueio de contradição emocional).
6. Entregue o roteiro final formatado com tags prontas para o parser, exemplo:
[Tom: Alerta] Frase falada aqui. [Pausa 1.5s]

[Tom: Reflexivo] Próxima frase reflexiva aqui.

[Ação: B-Roll] Descrição de imagens de apoio ou narração em off.

Forneça também uma justificativa curta de direção cinematográfica para cada cena.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analise, dirija e estruture o seguinte roteiro bruto para a categoria "${category || 'Saúde & Medicina'}" e motor "${targetEngine || 'Omni Flow'}":

ROTEIRO BRUTO:
${rawScript}`,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formattedScript: {
              type: Type.STRING,
              description: 'O roteiro completo reformatado com tags [Tom: ...], [Ação: ...], [Pausa ...] pronto para colar no motor.',
            },
            directorSummary: {
              type: Type.STRING,
              description: 'Visão geral da direção de arte, ritmo e iluminação sugerida.',
            },
            sceneDirectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneIndex: { type: Type.INTEGER },
                  detectedTone: { type: Type.STRING },
                  action: { type: Type.STRING },
                  spokenText: { type: Type.STRING },
                  reasoning: { type: Type.STRING, description: 'Por que este tom e ação foram escolhidos para evitar uncanny valley e contradição emocional.' }
                },
                required: ['sceneIndex', 'detectedTone', 'action', 'spokenText', 'reasoning']
              }
            }
          },
          required: ['formattedScript', 'directorSummary', 'sceneDirectives']
        }
      }
    });

    const outputJson = JSON.parse(response.text || '{}');
    return res.json(outputJson);
  } catch (error: any) {
    console.error('Erro no Smart Tagger (Gemini 3.8 Flash):', error);
    return res.status(500).json({ error: error.message || 'Falha ao processar com Gemini 3.8 Flash' });
  }
});

// 2. API: Coherence & Clinical Safety Audit (Gemini 3.8 Flash)
app.post('/api/director/audit-consistency', async (req, res) => {
  try {
    const { scenes, category } = req.body;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: 'Lista de cenas inválida.' });
    }

    const systemInstruction = `Você é o Auditor de Coerência Facial e Estética de Vídeos com IA (Gemini 3.8 Flash Clinical & Visual Audit).
Sua função é inspecionar cena a cena para encontrar qualquer falha de coerência emocional, risco de expressões deformadas (grimaces, micro-expressions 'feias'), discrepância entre fala e tom facial, e sugerir melhorias de iluminação e bloqueios.`;

    const promptText = `Avalie as seguintes ${scenes.length} cenas geradas pelo Motor de Direção de Vídeo:

${scenes.map((s: any, idx: number) => `
CENA ${idx + 1}:
- Tom: ${s.tomDetectado}
- Ação: ${s.acaoDetectada}
- Texto: "${s.textoTTSPtBr}"
- Prompt Técnico: ${s.promptTecnicoEn}
`).join('\n---\n')}

Analise a consistência geral, o cumprimento da REGRA GLOBAL DE ESTÉTICA e os bloqueios específicos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSafetyScore: {
              type: Type.INTEGER,
              description: 'Pontuação de conformidade de 0 a 100.'
            },
            clinicalAuthorityGrade: {
              type: Type.STRING,
              description: 'Classificação de autoridade e naturalidade (ex: "Excelente - Padrão Ouro", "Apto com pequenas ressalvas").'
            },
            aestheticRuleCompliance: {
              type: Type.BOOLEAN,
              description: 'Se a regra global de estética está 100% blindada contra caretas ou distorções.'
            },
            auditHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sceneRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  status: { type: Type.STRING, enum: ['PERFEITO', 'ATENCAO', 'AJUSTE_RECOMENDADO'] },
                  riskFound: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ['sceneNumber', 'status', 'recommendation']
              }
            }
          },
          required: ['overallSafetyScore', 'clinicalAuthorityGrade', 'aestheticRuleCompliance', 'auditHighlights', 'sceneRecommendations']
        }
      }
    });

    const auditData = JSON.parse(response.text || '{}');
    return res.json(auditData);
  } catch (error: any) {
    console.error('Erro na Auditoria de Coerência:', error);
    return res.status(500).json({ error: error.message || 'Falha ao auditar coerência' });
  }
});

// 3. API: Gemini 3.8 Flash Lite TTS (Gerar Áudio de Voz em Português)
app.post('/api/director/tts', async (req, res) => {
  try {
    const { text, tone, speechRate, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto para síntese não informado.' });
    }

    const selectedVoice = voiceName || 'Zephyr'; // 'Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'
    
    // Configura metadados de estilo vocal conforme o tom
    let styleDescription = 'Clara, profissional, articulação impecável em português do Brasil';
    if (tone === 'Alerta' || tone === 'Urgente') {
      styleDescription = 'Tom firme, focado, alerta clínico sério, sem pressa excessiva';
    } else if (tone === 'Empático' || tone === 'Calmo' || tone === 'Correção Empática') {
      styleDescription = 'Voz calorosa, acolhedora, ritmo respiratório suave e empático';
    } else if (tone === 'Autoridade' || tone === 'Propositivo') {
      styleDescription = 'Voz segura, queixo firme, autoridade técnica médica e corporativa';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: `${styleDescription}. Velocidade de fala ajustada para ${speechRate || 0.95}x.`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Nenhum dado de áudio foi gerado pelo modelo TTS.' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice: selectedVoice,
      toneUsed: tone
    });
  } catch (error: any) {
    console.error('Erro no TTS (gemini-3.8-flash-lite-tts):', error);
    return res.status(500).json({ error: error.message || 'Falha na síntese de voz TTS' });
  }
});

// Serve frontend in production or through Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Video Director Engine] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
