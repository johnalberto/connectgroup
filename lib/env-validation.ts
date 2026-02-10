// lib/env-validation.ts

/**
 * Validación de variables de entorno
 * Se ejecuta al inicio de la aplicación
 */

type Environment = 'development' | 'production' | 'test';

interface EnvConfig {
    NODE_ENV: Environment;
    DATABASE_URL: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_WHATSAPP_SENDER: string;
    TWILIO_USE_SANDBOX: boolean;
    NEXT_PUBLIC_APP_URL: string;
    WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
}

class EnvValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvValidationError';
    }
}

export function validateEnv(): EnvConfig {
    const requiredVars = [
        'DATABASE_URL',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_SENDER',
    ];

    // Verificar variables requeridas
    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new EnvValidationError(
            `❌ Missing required environment variables:\n${missing.join('\n')}\n\nCheck your .env.local file`
        );
    }

    const env = process.env.NODE_ENV || 'development';

    // PROTECCIÓN CRÍTICA: Evitar usar BD de producción en desarrollo
    if (env === 'production') {
        // En producción, la BD NO debe contener 'dev', 'development', 'staging'
        if (
            process.env.DATABASE_URL?.includes('dev') ||
            process.env.DATABASE_URL?.includes('development')
        ) {
            throw new EnvValidationError(
                '🚨 CRITICAL: Production environment is using a DEVELOPMENT database!\n' +
                'This is extremely dangerous. Check your Vercel environment variables.'
            );
        }

        // En producción, NO usar sandbox
        if (process.env.TWILIO_USE_SANDBOX === 'true') {
            console.warn(
                '⚠️  WARNING: Production is configured to use Twilio Sandbox.\n' +
                'This should only be temporary for testing.'
            );
        }
    }

    // En desarrollo, advertir si se está usando BD de producción
    if (env === 'development') {
        if (
            process.env.DATABASE_URL?.includes('prod') ||
            process.env.DATABASE_URL?.includes('production') ||
            process.env.DATABASE_URL?.includes('main')
        ) {
            throw new EnvValidationError(
                '🚨 DANGER: Development environment is pointing to PRODUCTION database!\n' +
                'This could cause data loss. Update your .env.local file.'
            );
        }
    }

    console.log(`✅ Environment validated: ${env}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}`);
    console.log(`📱 WhatsApp Mode: ${process.env.TWILIO_USE_SANDBOX === 'true' ? 'Sandbox' : 'Production'}`);

    return {
        NODE_ENV: env as Environment,
        DATABASE_URL: process.env.DATABASE_URL!,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID!,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
        TWILIO_WHATSAPP_SENDER: process.env.TWILIO_WHATSAPP_SENDER!,
        TWILIO_USE_SANDBOX: process.env.TWILIO_USE_SANDBOX === 'true',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID, // Add this
    };
}

// Singleton para acceder a env validado
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
    if (!envConfig) {
        envConfig = validateEnv();
    }
    return envConfig;
}

// Helper para saber en qué ambiente estamos
export function isDevelopment(): boolean {
    return getEnv().NODE_ENV === 'development';
}

export function isProduction(): boolean {
    return getEnv().NODE_ENV === 'production';
}

export function useSandbox(): boolean {
    return getEnv().TWILIO_USE_SANDBOX;
}