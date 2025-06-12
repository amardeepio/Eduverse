import { Agent } from "alith";

// We will no longer initialize the agent here at the top level.
let tutorAI; 

/**
 * UPDATED: An initialization function that now creates the Gemini agent.
 * This function will only be called after we confirm the .env file has been loaded.
 */
export function initializeAgent() {
  // CHANGED: Use the GEMINI_API_KEY from your .env file
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`[TutorAgent] Initializing with Gemini API Key...`);

  if (!apiKey) {
    // CHANGED: Updated error message
    throw new Error("GEMINI_API_KEY is not defined. Check your .env file and server startup order.");
  }

  tutorAI = new Agent({
    // CHANGED: Use a valid Gemini model name
    model: "gemini-1.5-flash",
    
    apiKey: apiKey,
    
    // CHANGED: Use the Google Gemini OpenAI-compatible endpoint
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    
    // The preamble is excellent and model-agnostic, so it stays the same.
    preamble: `
      You are an expert, friendly, and encouraging AI Tutor for the EduVerse platform.
      Your role is to help students who are stuck on a quiz question.
      You will be given the question and the multiple-choice options.
      Your task is to provide a single, short, conceptual hint that guides the student toward the correct answer WITHOUT revealing the answer itself.
      Do not mention which option is correct.
      Focus on the underlying concept.
      Keep your hint to one or two sentences.
    `,
  });
  console.log('[TutorAgent] AI Tutor Agent (Gemini) initialized successfully.');
}


/**
 * The core logic for handling a hint request.
 * It now checks if the agent has been initialized before using it.
 * @param {object} task - The task object containing the quiz question data.
 * @returns {Promise<object>} - A promise that resolves with the AI-generated hint.
 */
async function handleGetHint(task) {
    if (!tutorAI) {
      throw new Error("TutorAI agent has not been initialized.");
    }

    const { question, options } = task.data;
    console.log(`[TutorAgent] Received AI hint request for question: "${question}"`);

    if (!question || !options) {
        throw new Error("Missing 'question' or 'options' in task data.");
    }
    
    const prompt = `
      The user is stuck on the following quiz question:
      Question: "${question}"
      Options: ${options.join(', ')}

      Please provide a subtle, conceptual hint.
    `;

    try {
        // CHANGED: Updated log message
        console.log("[TutorAgent] Prompting Gemini model via compatibility layer...");
        const response = await tutorAI.prompt(prompt);
        // CHANGED: Updated log message
        console.log("[TutorAgent] Received response from Gemini:", response);
        
        return { success: true, hint: response };

    } catch (error) {
        console.error("[TutorAgent] Error calling AI model:", error);
        throw new Error("The AI tutor could not generate a hint at this time.");
    }
}


// Export the agent's handler function and the new initializer
// No changes needed here.
export const TutorAgent = {
    initialize: initializeAgent,
    handleTask: handleGetHint,
};