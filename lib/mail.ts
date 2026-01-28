import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

const domain = process.env.NEXT_PUBLIC_APP_URL || "https://connectgroup.vercel.app";

// Microsoft Graph Auth
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const senderEmail = process.env.EMAIL_SENDER || "connect@per.livingscc.com";

let graphClient: Client | null = null;

function getGraphClient() {
    if (!graphClient) {
        if (!tenantId || !clientId || !clientSecret) {
            throw new Error("Azure credentials not found in environment variables");
        }

        const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        
        // Add an incremental retry mechanism or custom auth provider if needed
        // For simple backend usage, AuthProvider with ClientSecretCredential works best via TokenCredentialAuthenticationProvider
        // However, the graph-client supports simple custom auth provider too.
        // Easiest is using @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials which we might not have installed explicitly?
        // Actually, @azure/identity works with Client.initWithMiddleware if we use TokenCredentialAuthenticationProvider.
        // Let's implement a simple auth provider that calls getToken on the credential.
        
        graphClient = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                   const token = await credential.getToken("https://graph.microsoft.com/.default");
                   return token.token;
                }
            },
        });
    }
    return graphClient;
}


async function checkAndSendEmail(subject: string, to: string, htmlContent: string) {
    try {
        const client = getGraphClient();
        
        const mail = {
            subject: subject,
            toRecipients: [
                {
                    emailAddress: {
                        address: to,
                    },
                },
            ],
            from: {
                emailAddress: {
                    address: senderEmail,
                },
            },
            body: {
                content: htmlContent,
                contentType: "html",
            },
        };

        await client.api(`/users/${senderEmail}/sendMail`)
            .post({ message: mail, saveToSentItems: "false" }); // saveToSentItems is string "true" or "false" in older vers, boolean in newer. post accepts object.
            
    } catch (error) {
        console.error("Error sending email via Graph API:", error);
        throw new Error("Failed to send email");
    }
}


export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    await checkAndSendEmail("Reset your password", email, html);
};

export const sendInviteEmail = async (email: string, token: string) => {
    const inviteLink = `${domain}/auth/new-password?token=${token}`;
    const html = `<p>You have been invited to join the Connect Group app.</p>
                  <p>Click <a href="${inviteLink}">here</a> to set your password and activate your account.</p>`;
    await checkAndSendEmail("You've been invited to Connect Group", email, html);
};
