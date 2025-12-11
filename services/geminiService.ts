import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { PurchaseRequest, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProposals = async (request: PurchaseRequest): Promise<AIAnalysisResult> => {
  if (request.proposals.length < 2) {
    throw new Error("É necessário pelo menos 2 propostas para realizar a equalização.");
  }

  const prompt = `
    Você é um especialista em compras e procurement sênior. 
    Sua tarefa é analisar solicitações de compras e equalizar propostas de fornecedores (Mapa Comparativo).
    
    Item Solicitado: ${request.title}
    Descrição: ${request.description}
    Quantidade: ${request.requiredQuantity}
    Especificações Técnicas Alvo: ${request.targetSpecs}

    Aqui estão as propostas dos fornecedores:
    ${JSON.stringify(request.proposals, null, 2)}

    Analise com base em:
    1. Custo Total (Menor é melhor, mas considere qualidade).
    2. Prazo de Entrega (Menor é melhor).
    3. Condições de Pagamento (Fluxo de caixa).
    4. Aderência Técnica (Comparando a especificação do fornecedor com a Alvo).

    Retorne uma análise detalhada em JSON indicando o melhor fornecedor e pontuando cada um.
  `;

  // Define the schema using the correct Type enum from @google/genai
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedSupplierId: { type: Type.STRING, description: "ID do fornecedor vencedor" },
          reasoning: { type: Type.STRING, description: "Resumo executivo explicando a decisão final" },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                supplierId: { type: Type.STRING },
                commercialScore: { type: Type.NUMBER, description: "Nota 0-10 para preço/pagamento" },
                technicalScore: { type: Type.NUMBER, description: "Nota 0-10 para aderência técnica" },
                deliveryScore: { type: Type.NUMBER, description: "Nota 0-10 para prazo" },
                totalScore: { type: Type.NUMBER, description: "Média ponderada" },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["supplierId", "commercialScore", "technicalScore", "deliveryScore", "totalScore", "pros", "cons"]
            }
          }
        },
        required: ["recommendedSupplierId", "reasoning", "scores"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Falha ao gerar análise da IA.");
  }

  try {
    return JSON.parse(response.text) as AIAnalysisResult;
  } catch (e) {
    console.error("Erro ao fazer parse do JSON da IA", response.text);
    throw new Error("Formato de resposta inválido da IA.");
  }
};
