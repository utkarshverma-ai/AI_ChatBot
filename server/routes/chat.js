import express from 'express';
import genAI from '../services/gemini.js';

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Get AI response with message history
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { prompt, history = [] } = req.body;

        // 1. Input Validation
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Prompt is required'
            });
        }

        // 2. Limit history to last 10 messages (5 pairs of user/model)
        // Gemini history format is usually: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
        const historyLimit = 10;
        const truncatedHistory = history.slice(-historyLimit);

        // 3. Initialize Gemini Model with Dynamic System Instructions (Including Time)
        const systemInstruction = `You are a helpful AI assistant. Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. The current time is ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}. Respond to the user accurately and clearly.`;
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            systemInstruction
        });

        // 4. Start Chat with History
        const chat = model.startChat({
            history: truncatedHistory,
        });

        // 5. Generate Response
        const result = await chat.sendMessage(prompt);
        const response = await result.response;

        // Check if the response was blocked by safety filters
        if (response.promptFeedback?.blockReason) {
            return res.status(400).json({
                success: false,
                error: 'SAFETY_BLOCKED',
                message: 'The message was blocked due to safety concerns.'
            });
        }

        const text = response.text();

        // 6. Success Response
        res.status(200).json({
            success: true,
            data: {
                response: text,
                historyUsed: truncatedHistory.length
            }
        });

    } catch (error) {
        console.error('Chat Route Error:', error);

        // 7. Structured Error Response
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            error: 'AI_RESPONSE_ERROR',
            message: error.message || 'An error occurred while communicating with the AI'
        });
    }
});

export default router;
