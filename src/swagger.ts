import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { refreshToken } from './controllers/user.controller';

const swaggerOptions: swaggerJsDoc.Options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'http://userauth-60c0.up.railway.app',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'userauth-60c0.up.railway.app',
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
                        isEmialConfirmed: {
                            type: 'boolean',
                            description: 'Email confirmation status',
                            default: false,
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT Refresh Token',
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
