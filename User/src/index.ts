import express from 'express';
const expressApp = require('./express-app');
const { databaseConnection } = require('./database');

const StartServer = async() => {
    const app = express();
    expressApp(app);
    const PORT: number = parseInt(process.env.PORT as string, 10) || 5003;
    await databaseConnection();
    
    app.listen(PORT, () => {
          console.log(`User server is listening to port ${PORT}`);
    })
}

StartServer();
