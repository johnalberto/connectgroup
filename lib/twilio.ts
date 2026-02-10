import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Initialize Twilio client only if credentials are present to avoid runtime errors during build
// provided they are not critical for build.
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export const sendWhatsAppMessage = async (to: string, body: string) => {
    if (!client) {
        console.warn('Twilio client not initialized. Missing credentials.');
        return { success: false, error: 'Twilio credentials missing' };
    }

    if (!whatsappNumber) {
        console.warn('Twilio WhatsApp number not configured.');
        return { success: false, error: 'Twilio WhatsApp number missing' };
    }

    try {
        // Twilio WhatsApp numbers must be prefixed with "whatsapp:"
        const from = whatsappNumber.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}`;
        const toWithPrefix = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        console.log(`[Twilio] Sending message from ${from} to ${toWithPrefix}`);

        const message = await client.messages.create({
            from,
            to: toWithPrefix,
            body,
        });

        return { success: true, messageId: message.sid, status: message.status };
    } catch (error: any) {
        console.error('Error sending WhatsApp message:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
};
