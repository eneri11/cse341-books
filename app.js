
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { getDb } from './src/db/connect.js';
import createRouter from './src/router.js';
import swaggerSpec from './src/docs/swagger.js';

const createApp = (getDatabase = getDb) => {
    const app = express();

    app.use(express.json());

    // Swagger API documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Homepage route
    app.get('/', (req, res) => {
        return res.status(200).json({
            message: 'Server is running'
        });
    });

    // Register book and author routes
    app.use(createRouter(getDatabase));

    return app;
};

const app = createApp();

export { createApp };
export default app;
