import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'eCommerce API',
            version: '1.0.0',
            description: 'API documentation for the eCommerce backend',
        },
        servers: [
            {
                url: process.env.HOST,
            },
        ],
    },
    apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
