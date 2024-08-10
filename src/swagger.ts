import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJsDoc.Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'User Authentication API',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the user',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email of the user',
                        },
                        password: {
                            type: 'string',
                            description: 'Password of the user',
                        },
                        isEmailConfirmed: {
                            type: 'boolean',
                            description: 'Status of email confirmation',
                            default: false,
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'Refresh token associated with the user',
                        },
                    },
                    required: ['name', 'email', 'password'],
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], 
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);

export {
    swaggerUi,
    swaggerDocs,
};
