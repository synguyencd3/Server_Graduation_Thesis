import { Express } from 'express';
import authRouter from './auth.r';
import userRouter from './user.r';
import featureRouter from './feature.r';
import apidocrRouter from './apidoc.r';

function router(app: Express) {
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/features", featureRouter);
  // app.use("/", apidocrRouter);
}

export default router;

