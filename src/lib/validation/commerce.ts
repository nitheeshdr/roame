import { z } from 'zod';
import { latLngSchema, paginationQuerySchema } from './common';

/** Venues */
export const createVenueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  addressLine: z.string().trim().max(240).optional(),
  city: z.string().trim().max(80).optional(),
  location: latLngSchema.optional(),
  phone: z.string().trim().max(20).optional(),
  website: z.string().url().optional(),
  capacity: z.number().int().positive().max(100000).optional(),
});
export type CreateVenueInput = z.infer<typeof createVenueSchema>;

export const updateVenueSchema = createVenueSchema.partial().extend({
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'CLOSED']).optional(),
});
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;

export const listVenuesQuerySchema = paginationQuerySchema.extend({
  city: z.string().trim().max(80).optional(),
  q: z.string().trim().max(120).optional(),
});
export type ListVenuesQuery = z.infer<typeof listVenuesQuerySchema>;

/** Bookings */
export const createBookingSchema = z
  .object({
    venueId: z.string().min(1),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    partySize: z.number().int().min(1).max(1000).default(1),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: 'endsAt must be after startsAt',
    path: ['endsAt'],
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Payments (Razorpay — adapter) */
export const createOrderSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default('INR'),
  description: z.string().trim().max(200).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/** Subscriptions */
export const subscribeSchema = z.object({
  planSlug: z.string().min(1),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;
