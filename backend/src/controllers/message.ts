import { Request, Response, NextFunction } from 'express';
import * as MessageService from '../services/message';

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await MessageService.getMessagesWithUser(req.query.withUser as string);
    res.json(messages);
  } catch (error) {
    next(error);
  }
}

export async function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await MessageService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
}
