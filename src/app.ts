import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';

const app: Application = express();

// CORS setup
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3005',
    'http://192.168.18.4:5050',
    'http://127.0.0.1:5050',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logger middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Static folders
app.use('/profile_pictures', express.static(path.join(process.cwd(), 'public/profile_pictures')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);

// Default endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "GoalNepal API is running" });
});

export default app;
