export const formatPhoneNumber = (phone: string): string => {
    // Simple sanitation: remove spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
};

export const parseTemplate = (template: string, variables: Record<string, string>): string => {
    let parsed = template;
    for (const [key, value] of Object.entries(variables)) {
        // Replace {key} with value globally
        const regex = new RegExp(`{${key}}`, 'g');
        parsed = parsed.replace(regex, value);
    }
    return parsed;
};

export const isValidInternationalPhone = (phone: string): boolean => {
    // Basic regex for international phone number E.164 format
    // + followed by 1 to 15 digits
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(phone);
};
