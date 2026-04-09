import { Injectable } from "@nestjs/common";
import { OpenAIService } from "./openai.service";

export interface Scene {
  scene: number;
  visual: string;
  narration: string;
}

export interface SceneSplitResult {
  voice: "male" | "female";
  scenes: Scene[];
}

@Injectable()
export class SceneSplitterService {
  constructor(private readonly openaiService: OpenAIService) {}

  async splitIntoScenes(
    title: string,
    content: string,
    customStyle?: string,
  ): Promise<SceneSplitResult> {
    const client = this.openaiService.getClient();

    const systemPrompt = `You are an AI assistant that analyzes diary entries and splits them into video scenes.

Your response MUST be a valid JSON object with this exact structure:
{
  "voice": "male" or "female",
  "scenes": [
    {
      "scene": 1,
      "visual": "English description for image generation",
      "narration": "Korean narration text"
    }
  ]
}

Scene rules:
- Create 1-6 scenes based on the diary content length and complexity
- CRITICAL: ONLY use information explicitly written in the diary. NEVER invent, imagine, or add content that is not in the original diary.
- If the diary is very short (1-2 sentences), create just 1 scene with the exact content
- Short diary (1-2 paragraphs): 1-2 scenes
- Medium diary (3-4 paragraphs): 3-4 scenes
- Long diary (5+ paragraphs): 4-6 scenes
- visual: English description for DALL-E image generation. Describe the scene through OBJECTS, ENVIRONMENT, ATMOSPHERE, LIGHTING, and PROPS only — NEVER include people.
- narration: Convert the diary content to natural conversational Korean (반말/대화체). Example: "오늘 퇴근길에 힘들었다" → "오늘 퇴근길에 진짜 힘들었어". Keep the SAME meaning and information, just change the tone to casual speech. Do NOT add new details or emotions not in the original.
- FORBIDDEN: Adding backstory, context, emotions, or details not in the original diary
- If the diary says "오늘은 힘들었다. 끝." then narration should be exactly that, not an expanded version

CRITICAL - NO PEOPLE RULE (MUST FOLLOW for visual field):
- NEVER include people, faces, hands, bodies, silhouettes, shadows of people, or any human figures
- NEVER use words like: person, man, woman, boy, girl, people, face, hand, body, character, someone, figure, silhouette, crowd, he, she, they
- Instead, capture the FEELING of the diary moment through OBJECTS, ENVIRONMENT, LIGHTING, MOOD, and PROPS
- Think of it as a still life photograph or empty landscape
- Use atmospheric details: time of day, weather, lighting, textures, colors, small symbolic objects
- Good subjects: rooms, streets, nature, food, books, tools, furniture, sky, plants, windows, desks
- Examples:
  - "퇴근길에 힘들었다" → "Empty city street at dusk, warm streetlights, blurred neon reflections on wet asphalt, lonely atmosphere"
  - "카페에서 책 읽었다" → "Open book on a wooden cafe table, steaming coffee cup, soft window light, cozy ambiance"
  - "운동하고 왔다" → "Running shoes and water bottle on gym floor, dumbbells in soft light, energetic still life"
  - "아이와 놀았다" → "Scattered colorful toy blocks on a warm wooden floor, sunlight through curtains, playful and tender mood"

Voice selection:
- Infer gender from diary content
- If unclear, default to "female"`;

    const userPrompt = `Diary Title: ${title}
Diary Content: ${content}

Analyze this diary and split it into scenes based on the diary length:
- Use ONLY the exact content from the diary
- DO NOT add any information not explicitly written
- If the diary is short, create fewer scenes (even just 1 scene is fine)
- Narration must be the original Korean text, not a rewritten version${
      customStyle
        ? `\n\nUser style request (apply to all visual descriptions, but the NO PEOPLE rule still overrides this): ${customStyle}`
        : ""
    }`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("GPT 응답이 비어있습니다");
      }

      const result = JSON.parse(responseContent) as SceneSplitResult;

      // 장면 검증
      if (!result.scenes || result.scenes.length === 0) {
        throw new Error("장면 분할 결과가 비어있습니다");
      }

      // voice 기본값
      if (!result.voice) {
        result.voice = "female";
      }

      // 장면 필드 검증
      for (const scene of result.scenes) {
        if (!scene.visual || !scene.narration) {
          throw new Error(
            `장면 ${scene.scene} 데이터가 불완전합니다: visual, narration 필수`,
          );
        }
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`장면 분할 실패: ${message}`);
    }
  }
}
