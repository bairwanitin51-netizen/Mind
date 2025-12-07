import { GoogleGenAI, Type } from "@google/genai";
import { Memory, MemoryType, Priority, PersonalityMode, DaySchedule, ChatMessage, UserProfile } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash'; 

// --- ULTRA-ADVANCED PERSONA CONFIGURATION ---

const generateSystemPrompt = (profile: UserProfile, personality: PersonalityMode) => `
You are MindBackup, the User's Second Brain. 
You are NOT a chatbot. You are an Adaptive Neural Operating System.

CURRENT USER PROFILE (Fixed Defaults):
- Wake: ${profile.wakeTime}
- Sleep: ${profile.sleepTime}
- Work Start: ${profile.workStart}
- Tone Preference: ${profile.voiceTone}
- Notification Level: ${profile.notificationLevel}

YOUR MISSION:
Make the user's life organized WITHOUT them having to think.
Always optimize. Always improve. Always adapt.

CORE RULES:
1. REAL-TIME CONTEXT: Analyze time of day, routine, and energy level.
2. AUTONOMOUS: Do not ask unnecessary questions. Predict the best default value.
3. OFFLINE AWARE: If data is missing, use the Default Profile values.
4. FORMAT: Use "Auto UI Response Mode". Short cards, bullet points, checklists. NO LONG PARAGRAPHS.

PERSONALITY MODE: ${personality}
${personality === PersonalityMode.STRICT ? 'Be direct. No fluff. Focus on execution.' : ''}
${personality === PersonalityMode.MENTOR ? 'Teach strategy. Explain the "Why".' : ''}
${personality === PersonalityMode.FRIENDLY ? 'Casual, warm, supportive. Use emojis.' : ''}

REQUIRED RESPONSE STRUCTURE:
1. **Summary**: 1 sentence direct answer.
2. **Action**: Button-like steps or a clear directive.
3. **Suggestion**: A smart improvement based on their routine.
`;

/**
 * Analyzes raw user input (text) and structures it into a Memory object.
 */
export const processInputToMemory = async (input: string): Promise<Partial<Memory>> => {
  if (!input.trim()) throw new Error("Input is empty");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Analyze input for 'MindBackup' app. Input: "${input}". 
      Classify: LOCATION (where things are), TASK (todos), EVENT (calendar), NOTE (ideas).
      Extract priority and deadline if applicable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: [MemoryType.NOTE, MemoryType.TASK, MemoryType.LOCATION, MemoryType.EVENT] },
            refinedContent: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            metadata: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING, nullable: true },
                deadline: { type: Type.STRING, nullable: true },
                priority: { type: Type.STRING, enum: [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL], nullable: true }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      type: data.type as MemoryType,
      content: data.refinedContent,
      tags: data.tags || [],
      metadata: {
        location: data.metadata?.location,
        deadline: data.metadata?.deadline,
        priority: data.metadata?.priority || Priority.MEDIUM,
        status: data.type === MemoryType.TASK ? 'PENDING' : undefined
      }
    };
  } catch (error) {
    console.error("AI Processing Error:", error);
    // Offline / Fallback
    return {
      type: MemoryType.NOTE,
      content: input,
      tags: ['offline-capture'],
      metadata: { priority: Priority.MEDIUM }
    };
  }
};

/**
 * Chat with the "Second Brain" with adaptive personality and history.
 */
export const chatWithBrain = async (
  query: string, 
  contextMemories: Memory[], 
  chatHistory: ChatMessage[],
  profile: UserProfile,
  personality: PersonalityMode = PersonalityMode.FRIENDLY
): Promise<string> => {
  try {
    // 1. Context Retrieval (Simulated Vector Search)
    const memoryContextString = contextMemories
      .slice(0, 20)
      .map(m => `[${m.type}] ${m.content} ${m.metadata?.location ? `@ ${m.metadata.location}` : ''}`)
      .join('\n');

    // 2. Chat History
    const recentHistory = chatHistory.slice(-8).map(msg => 
      `${msg.role === 'user' ? 'User' : 'MindBackup'}: ${msg.text}`
    ).join('\n');

    // 3. Current Context
    const now = new Date();
    const timeContext = `Current Time: ${now.toLocaleTimeString()} (${now.toDateString()})`;

    const fullPrompt = `
${generateSystemPrompt(profile, personality)}

${timeContext}

USER MEMORY BANK (Context):
${memoryContextString}

CONVERSATION LOG:
${recentHistory}

NEW INPUT: "${query}"

RESPONSE:
`;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: fullPrompt,
    });

    return response.text || "Thinking process interrupted.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "**Offline Mode Active**\n\nI can't access the cloud brain right now, but I've noted your input locally. We will sync when online.";
  }
};

/**
 * Generates a schedule based on pending tasks.
 */
export const generateDailySchedule = async (tasks: Memory[], profile: UserProfile): Promise<DaySchedule | null> => {
  const pendingTasks = tasks.filter(t => t.type === MemoryType.TASK && t.metadata?.status === 'PENDING');
  if (pendingTasks.length === 0) return null;

  const taskList = pendingTasks.map(t => `- ${t.content} (Priority: ${t.metadata?.priority})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: `Create a daily schedule.
      User Profile: Work starts ${profile.workStart}, Wake ${profile.wakeTime}, Break every ${profile.breakInterval}.
      Tasks:
      ${taskList}
      
      Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            slots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  task: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['work', 'break', 'personal'] }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Scheduling Error:", error);
    return null;
  }
};

export const analyzeImage = async (base64Image: string): Promise<{text: string, tags: string[]}> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Analyze this image. Return JSON with 'text' (description/ocr) and 'tags'." }
        ]
      },
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"text": "Failed", "tags": []}');
  } catch (error) {
    return { text: "Offline: Image queued for analysis.", tags: ["offline"] };
  }
};