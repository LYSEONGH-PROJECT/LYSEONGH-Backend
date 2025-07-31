// src/utils/jwt.ts
import { SignOptions, SignCallback } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export const generateToken = (
  payload: { [key: string]: string }, // Generalized payload
  expiresIn: string = '15m'
): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: SignOptions = { expiresIn: expiresIn as any }; // Using as any as a workaround
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): Promise<any> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return Promise.reject(new Error('JWT_SECRET is not defined in environment variables'));
  }
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};