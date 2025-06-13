import { Agent } from "alith";
import 'dotenv/config'; 

// This variable will hold our initialized agent
let tutorChatAI; 

/**
 * Initializes the conversational AI tutor agent.
 * This is called once when the agent service starts.
 */
export function initializeAgent() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`[TutorChatAgent] Initializing with API Key...`);

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined for TutorChatAgent.");
  }

  tutorChatAI = new Agent({
    model: "gemini-1.5-flash",
    apiKey: apiKey,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    // This preamble defines the agent's personality and instructions
    preamble: `
      You are an expert, friendly, and enthusiastic AI Tutor for the EduVerse platform. 🎓
      Your goal is to make learning fun and accessible.
      You will be given a course topic for context and a user's question.
      
      Your tasks are:
      1. Answer the user's question clearly and provide explanations.
      2. Use emojis to make your responses engaging and interactive. 🚀
      3. End your response with an open-ended question to encourage conversation, like "Does that make sense?" or "What would you like to explore next?".
      4. If a user asks something unrelated to the course topic, gently guide them back to the subject.
    `,
  });
  console.log('[TutorChatAgent] 🤖 Conversational AI Tutor initialized successfully.');
}


/**
 * The core logic for handling a chat request.
 * @param {object} task - The task object containing the user's question and course context.
 * @returns {Promise<object>} - A promise that resolves with the AI-generated chat response.
 */
async function handleChat(task) {
    if (!tutorChatAI) {
      throw new Error("TutorChatAgent has not been initialized.");
    }

    const { userQuestion, courseTitle } = task.data;
    console.log(`[TutorChatAgent] Received chat request for course "${courseTitle}"`);

    if (!userQuestion || !courseTitle) {
        throw new Error("Missing 'userQuestion' or 'courseTitle' in task data.");
    }
    
    // Construct a rich prompt for the AI model
    const prompt = `
      The user is in the "${courseTitle}" course and has asked the following question:
      
      User's Question: "${userQuestion}"

      Please provide a helpful, engaging, and detailed answer based on your role as their AI Tutor.
    `;

    try {
        console.log("[TutorChatAgent] Prompting Gemini model...");
        const response = await tutorChatAI.prompt(prompt);
        console.log("[TutorChatAgent] Received response from gemini.");
        
        return { success: true, answer: response };

    } catch (error) {
        console.error("[TutorChatAgent] Error calling AI model:", error);
        throw new Error("The AI tutor could not generate a response at this time.");
    }
}


// Export the agent's handler function and initializer
export const TutorChatAgent = {
    initialize: initializeAgent,
    handleTask: handleChat,
};
