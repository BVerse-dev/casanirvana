import { Request, Response } from 'express';
import * as NoticeService from '../services/notice';

export async function getNotices(req: Request, res: Response) {
  try {
    const notices = await NoticeService.getNoticesBySociety(req.query.societyId as string);
    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createNotice(req: Request, res: Response) {
  try {
    const notice = await NoticeService.createNotice(req.body);
    res.status(201).json(notice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
