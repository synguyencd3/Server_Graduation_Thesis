import { Request, Response } from 'express';
import { getRepository } from "typeorm";

const apidocController = {
    homePage: async (req: Request, res: Response) => {
        res.json("Deploy successfully!");
      }
};

export default apidocController;
