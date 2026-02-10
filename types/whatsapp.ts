export type MessageDirection = 'outbound' | 'inbound';
export type MessageSenderType = 'admin' | 'user' | 'system';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
export type TemplateCategory = 'notification' | 'invitation' | 'reminder' | 'general';
export type TemplateApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface WhatsAppMessage {
    id: string;
    userId: string;
    twilioMessageSid: string | null;
    direction: MessageDirection;
    senderType: MessageSenderType;
    messageBody: string;
    status: MessageStatus;
    templateUsed?: string | null;
    templateVariables?: any | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    mediaUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageTemplate {
    id: string;
    name: string;
    twilioContentSid: string | null;
    category: TemplateCategory;
    language: string;
    templateBody: string;
    variables: any | null;
    isActive: boolean;
    approvalStatus: TemplateApprovalStatus;
    createdAt: Date;
    updatedAt: Date;
}
