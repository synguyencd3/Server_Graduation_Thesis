import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import proxy from "express-http-proxy";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", proxy("http://localhost:5002/"));
app.use("/", (req: Request, res: Response) => {
  res.send("Not match every api.");
});

app.listen(5000, () => {
  console.log("Gateway is Listening to Port 5000");
});
