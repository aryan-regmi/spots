import { z } from 'zod';

/** Username must start with letter or number and not contain spaces. */
export const usernameSchema = z
  .string()
  .nonempty('Username must not be empty')
  .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
  .regex(/^\S*$/, 'Username must not contain spaces');

/** Password must have 8 characters and contain at least one special character. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character'
  );
