import { Request, Response } from 'express';
import * as MessageService from '../services/message';

export async function getMessages(req: Request, res: Response) {
  try {
    const messages = await MessageService.getMessagesWithUser(req.query.withUser as string);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createMessage(req: Request, res: Response) {
  try {
    const message = await MessageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
