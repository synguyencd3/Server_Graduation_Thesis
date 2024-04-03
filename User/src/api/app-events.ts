import { NextFunction, Request, Response } from "express";

import UserService from "../services/user-service";

export const appEvents = (app: any) => {
    
    const service = new UserService();
    
    app.use('/app-events', async (req: Request,res: Response,next: NextFunction) => {
        console.log("============= User ================");


        const {payload} = req.body;

        //handle subscribe events
        service.SubscribeEvents(payload);

        console.log(payload);
        res.json({payload});

    });

}
