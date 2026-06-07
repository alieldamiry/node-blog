import session from 'express-session';
import connectRedis from 'connect-redis';
import redis from './redis.js';

export const sessionMiddleware = session({
  store: new connectRedis({ client: redis }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 },
});