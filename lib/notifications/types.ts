import type { MessageChannel, MessageStatus } from "@/types";

export interface NotificationPayload {
  channel: MessageChannel;
  to: string;
  content: string;
  businessId: string;
  clientId?: string;
  metadata?: Record<string, string>;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  status: MessageStatus;
  provider: string;
  error?: string;
  warning?: string;
}

export interface NotificationProvider {
  readonly name: string;
  readonly channel: MessageChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
