import { Router, type Request, type Response } from "express";

const healthRouter = Router();

healthRouter.get("/ping", (_request: Request, response: Response) => {
  response.status(200).json({
    message: "pong",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };
