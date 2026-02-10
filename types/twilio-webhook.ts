export interface TwilioWebhookInbound {
    MessageSid: string;
    AccountSid: string;
    MessagingServiceSid?: string;
    From: string; // whatsapp:+61XXXXXXXXX
    To: string;
    Body: string;
    NumMedia: string;
    MediaUrl0?: string;
    MediaContentType0?: string;
    SmsStatus?: string;
    MessageStatus?: string;
    FromCity?: string;
    FromState?: string;
    FromCountry?: string;
    ToCity?: string;
    ToState?: string;
    ToCountry?: string;
}

export interface TwilioWebhookStatus {
    MessageSid: string;
    MessageStatus: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
    ErrorCode?: string;
    ErrorMessage?: string;
    To: string;
    From: string;
}
