import { Express } from 'express';
import authRouter from './auth.r';
import userRouter from './user.r';
import apidocrRouter from './apidoc.r';

function router(app: Express) {
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  // app.use("/", apidocrRouter);
}

export default router;

