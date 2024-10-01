import 'dotenv/config';
import express, { Express } from 'express';
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
