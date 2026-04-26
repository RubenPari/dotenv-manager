/**
 * API entrypoint
 * @module api/index
 * @description Creates and starts the Express server instance.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { projectsRouter } from './routes/projects.routes';
import { errorHandler } from './middleware/errorHandler';
import { getConfig } from './config';

const app = express();
const config = getConfig();
const PORT = config.PORT;

app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
