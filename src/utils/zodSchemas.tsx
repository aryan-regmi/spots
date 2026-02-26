import * as z from 'zod';

/** Schema to parse username. */
export const UsernameSchema = z
  .string()
  .max(64, 'Username can be a max of 64 characters')
  .min(1, 'Username must not be empty')
  .min(3, 'Username must be at least 3 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username must not be empty and must be only alpha-numeric characters'
  );

/** Schema to parse password. */
export const PasswordSchema = z
  .string()
  .max(128, 'Password can be a max of 64 characters')
  .min(8, 'Password must be at least 8 characters long')
  .refine((value) => {
    const containsSpecialCharacter = /\W/.test(value);
    const containsUppercase = /[A-Z]/.test(value);
    return containsUppercase && containsSpecialCharacter;
  }, 'Password must contain a special character and and uppercase character');
