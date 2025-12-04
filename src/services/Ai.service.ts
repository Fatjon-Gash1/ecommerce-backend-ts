import util from 'node:util';
import { exec } from 'node:child_process';
import { redisClient } from '@/config/redis';
import { Message } from '@/types';

const pExec = util.promisify(exec);

const LLM_API_KEY = process.env.LLM_API_KEY;
const MODEL_NAME = process.env.LLM_NAME;
const LLM_PROVIDER_API = process.env.LLM_PROVIDER_API as string;

/**
 * Service that provides AI capabilities.
 */
export class AiService {
    /**
     * Sends a message to the AI model and returns the response in audio and text format.
     *
     * @param userId - The ID of the user.
     * @param message - The message to send to the AI model.
     * @returns A promise that resolves to the text response.
     */
    async sendMessage(userId: number, message: string) {
        const conversationHistory: Message[] = [];
        const userData = await redisClient.hget('ai:chat', `user:${userId}`);

        if (userData) {
            conversationHistory.push(...JSON.parse(userData));
        }

        conversationHistory.push({ role: 'user', content: message });

        const response = await fetch(LLM_PROVIDER_API, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${LLM_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: conversationHistory,
            }),
        });

        let jsonData = '';

        for await (const chunk of response.body!) {
            const decodedChunk = new TextDecoder().decode(chunk);
            jsonData += decodedChunk;
        }

        const dataObject = JSON.parse(jsonData);
        const assistantMessage = dataObject.choices[0].message.content;

        await pExec(
            `edge-playback --text "${assistantMessage}" --voice en-US-AvaNeural --volume=+50%`
        );

        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage,
        });

        await redisClient.hset(
            'ai:chat',
            `user:${userId}`,
            JSON.stringify(conversationHistory)
        );

        return assistantMessage;
    }
}
