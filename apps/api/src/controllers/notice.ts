import { Request, Response, NextFunction } from 'express';
import * as NoticeService from '../services/notice';

export async function getNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const notices = await NoticeService.getNoticesBySociety(req.query.societyId as string);
    res.json(notices);
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const notice = await NoticeService.createNotice(req.body);
    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
}
