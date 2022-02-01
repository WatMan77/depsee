import { Request, Response } from 'express';

export const tokenExtractor = (
    req: Request,
    res: Response,
    next: (param?: unknown) => void
): void => {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        req.token = authorization.substring(7);
    }
    next();
};
