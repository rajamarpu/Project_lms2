const { z } = require('zod');
const { UserRoleEnum, UserStatusEnum } = require('./common');

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    role: UserRoleEnum.optional(),
    status: UserStatusEnum.optional()
  }),
  params: z.object({
    id: z.string({ required_error: 'ID is required' })
  })
});

const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    sortBy: z.enum(['createdAt', 'name', 'email']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
    role: UserRoleEnum.optional(),
    status: UserStatusEnum.optional()
  })
});

module.exports = { updateUserSchema, getUsersSchema };
