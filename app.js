
import express from 'express';
import { getDb } from './src/db/connect.js';
import createRouter from './src/router.js';

const createApp = (getDatabase = getDb) => {
    const app = express();

    app.use(express.json());

    // Homepage route
    app.get('/', (req, res) => {
        return res.status(200).json({
            message: 'Server is running'
        });
    });

    // Register book routes
    app.use(createRouter(getDatabase));

    return app;
};

const app = createApp();

export { createApp };
export default app;
