import * as dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { sequelize, connectToMongoDB } from './config/db';
import indexRoutes from './routes';

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log('Sequelize models synced with database');
    })
    .catch((err: Error) => {
        console.error('Error syncing Sequelize models:', err);
    });

connectToMongoDB();

app.use('/', indexRoutes);

app.use((error: Error, _req: Request, res: Response) => {
    console.error('Unknown error: ', error);
    res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
