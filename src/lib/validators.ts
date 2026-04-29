import { z } from 'zod';

export const roadmapGenerationSchema = z.object({
  career_goal: z.string().min(3, 'Career goal must be at least 3 characters'),
  target_company: z.string().min(1, 'Please select a target company'),
  timeline: z.string().min(1, 'Please select a timeline'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RoadmapGenerationInput = z.infer<typeof roadmapGenerationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
