import { NextFunction, Request, Response } from "express";

export const CatchAsyncError =
  (ErrorFunction: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(ErrorFunction(req, res, next)).catch(next);
  };
