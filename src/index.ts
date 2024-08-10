import express, { NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import bodyPrser from 'body-parser';
import authRoutes from './routes/user.routes';
import { dbConnect } from './configDB/dbConfig';
import nodeMailer from 'nodemailer';
import { Request, Response, RequestHandler } from 'express';
import { swaggerUi,swaggerDocs } from './swagger';



const logRequestTime: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request took ${duration}ms`);
    });

    next();
};

dbConnect();
const app = express();
app.use(bodyPrser.json());
app.use(logRequestTime);
bodyPrser.urlencoded({ extended: true });
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.get('/', (req, res) => {
    setTimeout(() => {
        res.send('Request Time Logged');
    }
    , 1000);
});


app.use('/auth', authRoutes);

const server = app.listen(3000, () => console.log(`Server running on port 3000`));

export default server;