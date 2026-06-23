const { z } = require('zod');
const { UserRoleEnum } = require('./common');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).regex(passwordRegex, passwordMessage),
    role: UserRoleEnum.optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }).regex(passwordRegex, passwordMessage),
  }),
  params: z.object({
    id: z.string({ required_error: 'ID is required' }),
    token: z.string({ required_error: 'Token is required' })
  })
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema, passwordRegex, passwordMessage };
