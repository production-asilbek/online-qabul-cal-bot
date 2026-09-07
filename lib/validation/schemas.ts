import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Use +998 XX XXX XX XX"),
  telegramUsername: z.string().optional(),
  telegramId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const appointmentSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  serviceId: z.string().min(1, "Select a service"),
  staffId: z.string().min(1, "Select staff"),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a time"),
  durationMin: z.number().min(10, "Duration is too short"),
  notes: z.string().optional(),
  reminderEnabled: z.boolean(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  durationMin: z.number().min(5, "Duration is required"),
  active: z.boolean(),
});

export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  color: z.string().min(1),
});

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.enum(["clinic", "dental", "beauty", "barber", "fitness", "massage", "repair", "other"]),
});

export const messageSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  channel: z.enum(["sms", "telegram", "whatsapp"]),
  templateId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty"),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
