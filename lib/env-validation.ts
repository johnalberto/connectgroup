
/**
 * Environment Validation System
 * 
 * Prevents accidental connection to Production DB from Non-Production environments.
 * 
 * VERCEL_ENV can be: 'production' | 'preview' | 'development'
 * NODE_ENV can be: 'production' | 'development' | 'test'
 */

export function isProduction(): boolean {
    return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export function isPreview(): boolean {
    return process.env.VERCEL_ENV === 'preview';
}

export function isDevelopment(): boolean {
    return process.env.VERCEL_ENV === 'development' || (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'development');
}

export function validateEnvironment() {
    // Skip validation during build time to avoid breaking static generation if DB not present
    if (process.env.CI || process.env.NEXT_PHASE === 'phase-production-build') {
        return;
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.warn("⚠️  DATABASE_URL is missing. Skipping URL validation, but this might cause runtime errors.");
        return;
    }

    const envState = {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local',
        isProd: isProduction(),
        isPreview: isPreview(),
        isDev: isDevelopment()
    };

    console.log("🛡️  Validating Environment Safety:", JSON.stringify(envState, null, 2));

    // DANGER KEYWORDS
    // Hostnames associated with Development/Preview/Test branches
    const DEV_KEYWORDS = ['development', 'dev-branch', 'misty-tree'];

    // Hostnames associated with Production branches
    const PROD_KEYWORDS = ['plain-cherry', 'production', 'main-branch'];

    // 1. Check if PREVIEW/DEV is trying to access PROD DB
    if (envState.isPreview || envState.isDev) {
        const hasProdKeyword = PROD_KEYWORDS.some(k => dbUrl.includes(k));
        if (hasProdKeyword) {
            const errorMsg = `
            🚨 CRITICAL SECURITY ALERT 🚨
            
            You are in a NON-PRODUCTION environment (${envState.vercelEnv}) 
            but DATABASE_URL seems to point to a PRODUCTION database.
            
            Detected Keyword in URL: ${PROD_KEYWORDS.find(k => dbUrl.includes(k))}
            
            Action Blocked to prevent data loss.
            Please check your .env or Vercel Environment Variables.
            `;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    // 2. Check if PRODUCTION is trying to access DEV DB
    // (Less critical for data loss, but bad for reliability)
    if (envState.isProd && !envState.isPreview) { // Vercel 'production' env
        const hasDevKeyword = DEV_KEYWORDS.some(k => dbUrl.includes(k));
        if (hasDevKeyword) {
            const errorMsg = `
            🚨 CONFIGURATION ALERT 🚨
            
            You are in PRODUCTION environment
            but DATABASE_URL seems to point to a DEVELOPMENT database.
            
            Detected Keyword in URL: ${DEV_KEYWORDS.find(k => dbUrl.includes(k))}
            
            Action Blocked to prevent reliability issues.
            `;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }

    console.log("✅ Environment Database Safety Check Passed.");
}