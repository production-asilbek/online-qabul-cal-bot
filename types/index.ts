export type BusinessType =
  | "clinic"
  | "dental"
  | "beauty"
  | "barber"
  | "fitness"
  | "massage"
  | "repair"
  | "other";

export type MemberRole = "owner" | "manager" | "staff";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export type MessageChannel = "sms" | "telegram" | "whatsapp";

export type MessageStatus = "draft" | "queued" | "sent" | "delivered" | "failed";

export type NotificationJobStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";

export type AnalyticsEventName =
  | "appointment_created"
  | "appointment_completed"
  | "appointment_cancelled"
  | "client_created"
  | "message_sent"
  | "message_failed"
  | "client_viewed"
  | "appointment_viewed";

export interface AppUser {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  category?: string;
  timezone: string;
  currency: string;
  phone?: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessMember {
  id: string;
  businessId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
}

export interface Tag {
  id: string;
  businessId: string;
  name: string;
  color: string;
}

export interface Client {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  phone: string;
  telegramId?: number;
  telegramUsername?: string;
  dateOfBirth?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTag {
  clientId: string;
  tagId: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  active: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  businessId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  title: string;
  color: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffService {
  staffId: string;
  serviceId: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface WorkingHours {
  id: string;
  businessId: string;
  staffId?: string;
  weekday: number;
  isClosed: boolean;
  ranges: TimeRange[];
  breaks: TimeRange[];
}

export interface Holiday {
  id: string;
  businessId: string;
  staffId?: string;
  date: string;
  name: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentNote {
  id: string;
  appointmentId: string;
  content: string;
  createdAt: string;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  fromStatus?: AppointmentStatus;
  toStatus: AppointmentStatus;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  businessId: string;
  name: string;
  channel: MessageChannel;
  content: string;
  isSystem: boolean;
}

export interface Message {
  id: string;
  businessId: string;
  clientId: string;
  channel: MessageChannel;
  templateId?: string;
  content: string;
  status: MessageStatus;
  provider: string;
  providerMessageId?: string;
  error?: string;
  sentAt?: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  messageId: string;
  status: MessageStatus;
  detail?: string;
  createdAt: string;
}

export interface NotificationJob {
  id: string;
  businessId: string;
  appointmentId?: string;
  clientId?: string;
  channel: MessageChannel;
  type: "appointment_reminder" | "appointment_confirmation" | "follow_up" | "custom";
  content: string;
  runAt: string;
  status: NotificationJobStatus;
  messageId?: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  businessId: string;
  name: AnalyticsEventName;
  entityId?: string;
  createdAt: string;
}

export interface BusinessSettings {
  businessId: string;
  reminderOffsetsMin: number[];
  defaultChannel: MessageChannel;
}

export interface Subscription {
  id: string;
  businessId: string;
  plan: "free" | "pro";
  status: "active" | "trialing" | "past_due" | "canceled";
  createdAt: string;
}

export interface AppointmentDisplay {
  appointment: Appointment;
  client: Client;
  service: Service;
  staff: StaffMember;
}

export interface ClientListItem extends Client {
  lastVisitAt?: string;
  nextAppointmentAt?: string;
  tags: Tag[];
}

export interface DatabaseSnapshot {
  users: AppUser[];
  businesses: Business[];
  members: BusinessMember[];
  tags: Tag[];
  clients: Client[];
  clientTags: ClientTag[];
  services: Service[];
  staff: StaffMember[];
  staffServices: StaffService[];
  workingHours: WorkingHours[];
  holidays: Holiday[];
  appointments: Appointment[];
  appointmentNotes: AppointmentNote[];
  appointmentStatusHistory: AppointmentStatusHistory[];
  templates: MessageTemplate[];
  messages: Message[];
  messageLogs: MessageLog[];
  notificationJobs: NotificationJob[];
  analyticsEvents: AnalyticsEvent[];
  settings: BusinessSettings[];
  subscriptions: Subscription[];
  currentUserId: string;
  currentBusinessId: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type TemplateVariables = {
  client_name?: string;
  business_name?: string;
  date?: string;
  time?: string;
  service?: string;
  staff?: string;
};
