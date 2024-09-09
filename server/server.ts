import 'dotenv/config'; // Load environment variables from .env
import express, { Express } from 'express';
import cors from 'cors';
import { sequelize, connectToMongoDB } from './config/db'; // Import database configurations

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(cors());
// Middleware to parse JSON
app.use(express.json());

// Sync the Sequelize models with the database
sequelize
    .sync()
    .then(() => {
        console.log('Sequelize models synced with database');
    })
    .catch((err: Error) => {
        console.error('Error syncing Sequelize models:', err);
    });

connectToMongoDB();

// Use the routes defined in the routes directory
import indexRoutes from './routes/index';
app.use('/', indexRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
