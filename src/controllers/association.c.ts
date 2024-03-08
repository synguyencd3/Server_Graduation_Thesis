import { Request, Response } from 'express';

const associationcController = {
  google: async (req: Request, res: Response) => {
    let userFe: any = req.user;

    switch (userFe.aso) {
      case 0: {
        
      }
    }

    if (userFe.aso) {

      return res.json({
        google: userFe.google,
        status: "success",
        msg: "login successfully!",
      });
    }
    return res.json({
      status: "failed",
      msg: "Authentication failed",
    });
  },

  facebook: async (req: Request, res: Response) => {
    let userFe: any = req.user;

    switch (userFe.aso) {
      case 0:
    }

    if (userFe.aso) {

      return res.json({
        facebook: userFe.google,
        status: "success",
        msg: "login successfully!",
      });
    }
    return res.json({
      status: "failed",
      msg: "Authentication failed",
    });
  },
};

export default associationcController;
