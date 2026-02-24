import twilio from 'twilio';
import { MessageStatus } from '@/types/whatsapp';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
// Fallback: direct number for free-text replies (keeps backward compat)
const whatsappNumber = process.env.TWILIO_WHATSAPP_SENDER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

// Types
interface SendTemplateParams {
    to: string;
    templateSid: string;
    variables: Record<string, string>;
    userId?: string;
}

interface SendTextParams {
    to: string;
    body: string;
    userId?: string;
    mediaUrl?: string[];
}

interface TwilioResponse {
    success: boolean;
    messageSid?: string;
    status?: string;
    error?: string;
    errorCode?: number;
}

export const TwilioService = {
    /**
     * Send a WhatsApp message using a Content Template (Required for business initiated)
     */
    async sendTemplateMessage({ to, templateSid, variables }: SendTemplateParams): Promise<TwilioResponse> {
        if (!client) return { success: false, error: 'Twilio client not initialized' };

        try {
            const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

            console.log('--- Twilio Template Send Attempt ---');
            console.log('MessagingServiceSid:', messagingServiceSid);
            console.log('To:', toNumber);
            console.log('ContentSid:', templateSid);
            console.log('Variables:', JSON.stringify(variables));

            if (!messagingServiceSid) throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set');

            const message = await client.messages.create({
                messagingServiceSid,
                to: toNumber,
                contentSid: templateSid,
                contentVariables: JSON.stringify(variables),
                statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
            });

            console.log('--- Twilio Send Success ---');
            console.log('MessageSid:', message.sid);
            console.log('Status:', message.status);

            return {
                success: true,
                messageSid: message.sid,
                status: message.status,
            };
        } catch (error: any) {
            console.error('--- Twilio Send FAILED ---');
            console.error('Error Message:', error.message);
            console.error('Twilio Code:', error.code);
            console.error('HTTP Status:', error.status);
            if (error.moreInfo) console.error('More Info:', error.moreInfo);

            return {
                success: false,
                error: error.message,
                errorCode: error.code,
            };
        }
    },

    /**
     * Send a freeform text message (Only allowed within 24h window of user message)
     */
    async sendFreeTextMessage({ to, body, mediaUrl }: SendTextParams): Promise<TwilioResponse> {
        if (!client) return { success: false, error: 'Twilio client not initialized' };

        try {
            const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

            // Use Messaging Service if available, fallback to direct number
            const senderArgs = messagingServiceSid
                ? { messagingServiceSid }
                : { from: whatsappNumber?.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}` };

            const message = await client.messages.create({
                ...senderArgs,
                to: toNumber,
                body,
                mediaUrl,
                statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
            });

            return {
                success: true,
                messageSid: message.sid,
                status: message.status,
            };
        } catch (error: any) {
            console.error('Twilio Text Error:', error);
            return {
                success: false,
                error: error.message,
                errorCode: error.code,
            };
        }
    },

    /**
     * Validate phone number format (Simple check, use libphonenumber for strict)
     */
    validatePhoneNumber(phone: string): boolean {
        // Basic E.164 check: + followed by 10-15 digits
        return /^\+[1-9]\d{10,14}$/.test(phone);
    },

    /**
     * Format phone to E.164
     */
    formatPhoneToE164(phone: string): string {
        let clean = phone.replace(/[^\d+]/g, '');
        if (!clean.startsWith('+')) {
            // Default to AU if no country code (Assumption)
            // Ideally we should verify country code
            if (clean.startsWith('04')) {
                clean = '+61' + clean.substring(1);
            } else {
                clean = '+' + clean;
            }
        }
        return clean;
    },

    async sendReminderTemplate({ to, userName, groupName, date, time, address, description }: { to: string, userName: string, groupName: string, date: string, time: string, address: string, description?: string }): Promise<TwilioResponse> {
        return this.sendTemplateMessage({
            to,
            templateSid: 'HXdebbbeffdc326c2dfb57a72aa2b5501d',
            variables: {
                '1': userName,
                '2': groupName,
                '3': date,
                '4': time,
                '5': address
                // '1' = User Name
                // '2' = Group Name
                // '3' = Date
                // '4' = Time
                // '5' = Location
            }
        });
    },

    async sendWelcomeInvitation({ to, userName }: { to: string, userName: string }): Promise<TwilioResponse> {
        return this.sendTemplateMessage({
            to,
            templateSid: 'HX2dcb4ca34a30f5ce035f5cf56e78ca25',
            variables: {
                '1': userName
            }
        });
    }
};
