import { Request, Response } from 'express';

const apidocController = {
    homePage: (req: Request, res: Response) => {
        res.send("Deploy successfully!");
      }
};

export default apidocController;
