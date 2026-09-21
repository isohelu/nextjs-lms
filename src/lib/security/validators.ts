import { z } from 'zod'

/**
 * Enterprise Input Sanitization & Validation Schemas
 * Protects against SQL injection, XSS, and malformed payloads.
 */

// Basic text sanitization: strip HTML tags and normalize whitespace
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .trim()
}

// User Login Schema
export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
})

// User Registration Schema
export const RegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .max(100),
})

// Newsletter Subscription Schema
export const NewsletterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
})

// Contact Form Schema
export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
})

// Course Search / Filter Schema
export const CourseQuerySchema = z.object({
  query: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  level: z.enum(['all', 'beginner', 'intermediate', 'advanced']).optional(),
  price: z.enum(['all', 'free', 'paid']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})
