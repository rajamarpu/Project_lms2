const { z } = require('zod');

const UserRoleEnum = z.enum(['user', 'instructor', 'admin']);
const UserStatusEnum = z.enum(['pending', 'approved', 'rejected', 'suspended']);
const CourseStatusEnum = z.enum(['pending', 'approved', 'rejected']);
const CourseLevelEnum = z.enum(['Beginner', 'Intermediate', 'Advanced']);

const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

const SortSchema = (allowedSortFields) => z.object({
  sortBy: z.enum(allowedSortFields).default(allowedSortFields[0]),
  order: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  UserRoleEnum,
  UserStatusEnum,
  CourseStatusEnum,
  CourseLevelEnum,
  PaginationSchema,
  SortSchema
};
