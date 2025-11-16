import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

export interface ChartData {
  label: string;
  value: number;
}

export interface Definitions {
  term: string;
  awan: string;
  dasar: string;
  lengkap: string;
  visualizationData?: {
    title: string;
    data: ChartData[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  
  constructor() {
    // IMPORTANT: This is a placeholder for the API key.
    // In a real-world Applet environment, process.env.API_KEY would be available.
    // For local development or testing, you might need to replace this.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.error('API key is not available. GeminiService will not be initialized.');
    }
  }

  async getDefinitions(term: string): Promise<Definitions | null> {
    if (!this.ai) {
      throw new Error('Gemini AI client is not initialized. Please check your API key.');
    }
    if (!term.trim()) {
      throw new Error('Search term cannot be empty.');
    }

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Berikan definisi untuk istilah medis atau farmasi berikut: "${term}". Harap berikan jawaban dalam format JSON yang mematuhi skema yang diberikan. Definisi 'awan' harus sangat sederhana untuk orang awam (maksimal 1 kalimat). Definisi 'dasar' harus cocok untuk pelajar (3-5 kalimat). Definisi 'lengkap' harus merupakan definisi medis yang komprehensif dan teknis. Jika definisi lengkap mengandung data statistik atau numerik yang dapat divisualisasikan (misalnya, persentase efektivitas, tingkat insiden, perbandingan angka), ekstrak data ini ke dalam objek 'visualizationData'. Objek ini harus memiliki judul ('title') dan array data ('data') dengan pasangan 'label' dan 'value'. Jika tidak ada data yang cocok, jangan sertakan bidang 'visualizationData'.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              awan: {
                type: Type.STRING,
                description:
                  'Definisi istilah dalam bahasa awam yang mudah dipahami, maksimal satu kalimat.',
              },
              dasar: {
                type: Type.STRING,
                description:
                  'Definisi dasar yang cocok untuk pelajar, terdiri dari 3-5 kalimat.',
              },
              lengkap: {
                type: Type.STRING,
                description: 'Definisi medis yang komprehensif dan teknis.',
              },
              visualizationData: {
                type: Type.OBJECT,
                description: "Data terstruktur untuk visualisasi, jika ada.",
                nullable: true,
                properties: {
                    title: { type: Type.STRING, description: "Judul untuk bagan." },
                    data: {
                        type: Type.ARRAY,
                        description: "Array titik data untuk bagan.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                value: { type: Type.NUMBER }
                            },
                            required: ['label', 'value']
                        }
                    }
                },
                required: ['title', 'data']
              }
            },
            required: ['awan', 'dasar', 'lengkap'],
          },
        },
      });
      
      const jsonText = response.text.trim();
      const parsed = JSON.parse(jsonText);
      
      return {
        term: term,
        ...parsed,
      };
    } catch (error) {
      console.error('Error fetching definitions from Gemini API:', error);
      return null;
    }
  }
}