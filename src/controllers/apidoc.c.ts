import { Request, Response } from "express";
const path = require("path");

const apidocController = {
  homePage: (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../public/api.html"));
  },
};

export default apidocController;
