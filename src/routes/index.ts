import { Express } from 'express';
import authRouter from './auth.r';
import userRouter from './user.r'

function router(app: Express) {
  app.use("/auth", authRouter);
  app.use("/users", userRouter)
}

export default router;

