import { NextFunction, Request, Response } from "express";

import AuthService from "../services/auth-service";

module.exports = (app: any) => {
    
    const service = new AuthService();
    app.use('/app-events',async (req: Request,res: Response,next: NextFunction) => {

        const {payload} = req.body;

        //handle subscribe events
        service.SubscribeEvents(payload);

        console.log("============= Auth ================");
        console.log(payload);
        res.json({payload});

    });

}
