import { Router, Request, Response } from 'express';
import { processAIChat } from '../services/aiAssistant.js';

const router = Router();

router.post('/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await processAIChat(message, history || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process AI chat query', details: err.message });
  }
});

export default router;
