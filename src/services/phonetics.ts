import { GoogleGenAI, Modality } from "@google/genai";
import { WORD_DATABASE, WordData } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Persistent cache using LocalStorage to reduce API calls across sessions
const getCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const saveCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage cache", e);
  }
};

const transcriptionCache: Record<string, string[]> = getCache('ipa_transcription_cache');

export async function transcribeToIPA(word: string, dialectId: string = 'pb-standard'): Promise<string[]> {
  const normalizedWord = word.trim().toLowerCase();
  const cacheKey = `${dialectId}:${normalizedWord}`;
  
  if (transcriptionCache[cacheKey]) {
    return transcriptionCache[cacheKey];
  }

  const dialectPrompts: Record<string, string> = {
    'pb-standard': 'Português Brasileiro (Padrão/Sudeste)',
    'pb-carioca': 'Português Brasileiro (Dialeto Carioca/RJ - considere o "s" chiado e "r" uvular)',
    'pb-nordestino': 'Português Brasileiro (Dialeto Nordestino)',
    'pb-sulista': 'Português Brasileiro (Dialeto Sulista - considere o "r" vibrante alveolar)',
    'pe-standard': 'Português Europeu (Padrão de Portugal - considere a redução de vogais átonas)',
  };

  const dialectDescription = dialectPrompts[dialectId] || dialectPrompts['pb-standard'];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transcreva a palavra portuguesa "${word}" para o Alfabeto Fonético Internacional (AFI/IPA) seguindo o padrão: ${dialectDescription}. 
      Forneça apenas a transcrição mais comum e aceitável para este dialeto específico.
      Retorne apenas um array JSON de strings com UMA ÚNICA transcrição, sem explicações.
      Exemplo: ["ˈka.zɐ"]`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const result = parsed.slice(0, 1);
          transcriptionCache[cacheKey] = result;
          saveCache('ipa_transcription_cache', transcriptionCache);
          return result;
        }
      } catch (e) {
        console.error("Failed to parse IPA response", e);
      }
    }
    return [];
  } catch (error: any) {
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429 || error?.message?.includes('quota')) {
      const quotaError = new Error("Quota exceeded");
      (quotaError as any).isQuotaError = true;
      throw quotaError;
    }
    console.error("Error in transcription service", error);
    return [];
  }
}

export async function analyzeMistake(word: string, expectedIPA: string, userInput: string, dialectDescription: string): Promise<{ summary: string, errorAnalysis: string, phonemeTips: string[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário tentou transcrever a palavra/frase "${word}" para o AFI (${dialectDescription}).
      A transcrição correta esperada era: /${expectedIPA}/
      O usuário digitou: /${userInput}/
      
      Forneça uma análise detalhada do erro em JSON com os seguintes campos:
      "s": Um resumo de como se pronuncia toda a palavra foneticamente (explicando os sons de forma simples).
      "e": Uma explicação detalhada e amigável de por que o usuário errou, comparando o que ele digitou com o esperado. Aponte exatamente qual fonema ele trocou, omitiu ou adicionou.
      "t": Um array de strings com dicas estritamente fonéticas (ex: "O fonema /s/ é uma fricativa alveolar, tente posicionar a língua atrás dos dentes superiores", "O fonema /ʁ/ é uma fricativa uvular, tente produzir o som na garganta"). Evite dicas genéricas.
      
      Retorne APENAS o JSON válido.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        summary: parsed.s || '',
        errorAnalysis: parsed.e || '',
        phonemeTips: parsed.t || []
      };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Error analyzing mistake", error);
    return {
      summary: `A transcrição correta é /${expectedIPA}/.`,
      errorAnalysis: "Ocorreu um erro ao analisar sua resposta detalhadamente. Verifique a transcrição correta acima.",
      phonemeTips: []
    };
  }
}

export async function getPhoneticExplanation(word: string, dialectId: string = 'pb-standard'): Promise<{ transcription: string, explanation: string, tonicSyllable: string, phoneticProcesses: string[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a palavra "${word}" (dialeto: ${dialectId}) sob a ótica da fonética e fonologia.
      Forneça um JSON com:
      "t": Transcrição AFI (apenas a string).
      "e": Explicação dos sons presentes (quais fonemas aparecem).
      "s": Sílaba tônica (ex: "segunda sílaba").
      "p": Array de strings comentando processos fonéticos relevantes (ex: "nasalização da vogal", "palatalização do 't' antes de 'i'", "redução vocálica").
      
      Retorne APENAS o JSON válido.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        transcription: parsed.t || '',
        explanation: parsed.e || '',
        tonicSyllable: parsed.s || '',
        phoneticProcesses: parsed.p || []
      };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Error getting phonetic explanation", error);
    return {
      transcription: '?',
      explanation: 'Não foi possível gerar a explicação.',
      tonicSyllable: '?',
      phoneticProcesses: []
    };
  }
}

export async function fetchRandomWord(difficulty: number, excludedWords: string[] = [], dialectId: string = 'pb-standard'): Promise<WordData> {
  const difficultyPrompts = [
    "palavras simples de 1 ou 2 sílabas, sem encontros consonantais complexos (ex: casa, bola, pato)",
    "palavras com sons nasais (~), ditongos ou dígrafos simples (ex: pão, muito, chuva)",
    "palavras com R vibrante, S chiado, encontros consonantais ou acentuação variada (ex: carro, prato, escola)",
    "palavras longas, complexas, com prefixos/sufixos ou fonética muito desafiadora (ex: paralelepípedo, exceção, ritmo, inconstitucionalissimamente)",
    "frases curtas ou expressões idiomáticas comuns (ex: 'Bom dia', 'Mais ou menos', 'Pão de queijo', 'Deixa pra lá')"
  ];

  const dialectPrompts: Record<string, string> = {
    'pb-standard': 'Português Brasileiro (Padrão/Sudeste)',
    'pb-carioca': 'Português Brasileiro (Dialeto Carioca/RJ - considere o "s" chiado e "r" uvular)',
    'pb-nordestino': 'Português Brasileiro (Dialeto Nordestino)',
    'pb-sulista': 'Português Brasileiro (Dialeto Sulista - considere o "r" vibrante alveolar)',
    'pe-standard': 'Português Europeu (Padrão de Portugal - considere a redução de vogais átonas)',
  };

  const dialectDescription = dialectPrompts[dialectId] || dialectPrompts['pb-standard'];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um item aleatório em português (dificuldade: ${difficultyPrompts[difficulty - 1]}).
      NÃO use: ${excludedWords.join(', ')}.
      Transcreva para AFI (${dialectDescription}).
      Forneça 3 dicas fonéticas úteis sobre a pronúncia da palavra (ex: "A letra 'x' tem som de /s/", "Há nasalização na primeira sílaba", "O 'r' final é mudo"). NÃO revele a resposta.
      Retorne JSON:
      {"w": "palavra/frase", "t": ["transcrição"], "h": ["dica_fonetica1", "dica_fonetica2", "dica_fonetica3"], "p": booleano (true se frase)}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        word: parsed.w,
        difficulty: difficulty as any,
        transcriptions: parsed.t,
        hints: parsed.h,
        isPhrase: parsed.p
      };
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error fetching random word from AI", error);
    // Fallback to a random word from the local database if AI fails
    const filtered = WORD_DATABASE.filter(w => w.difficulty === difficulty || (difficulty === 5 && w.difficulty === 4));
    const word = filtered[Math.floor(Math.random() * filtered.length)];
    return {
      ...word,
      hints: ["Dica fonética indisponível no momento."]
    };
  }
}
