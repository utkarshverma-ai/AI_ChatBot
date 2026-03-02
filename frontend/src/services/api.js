/**
 * API service for AI Chatbot communication
 */

/**
 * Sends a message to the AI backend and returns the response string.
 * 
 * @param {string} prompt - The user's input question/message.
 * @param {Array} history - The conversation history array.
 * @returns {Promise<string>} - The AI's response text.
 * @throws {Error} - Meaningful error message if the request fails.
 */
export const sendMessage = async (prompt, history = [], retries = 2) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, history }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || `Server responded with ${response.status}`;
                throw new Error(errorMessage);
            }

            if (data.success && data.data && data.data.response) {
                return data.data.response;
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries) throw error;
            // Wait 1s before retrying
            await new Promise(res => setTimeout(res, 1000));
        }
    }
};
