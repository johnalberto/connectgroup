
import twilio from 'twilio';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_SENDER;
// Cambia esto por tu número para la prueba (debe estar unido al sandbox)
const to = '+573214300431';

const client = twilio(accountSid, authToken);

async function testTemplate() {
    console.log('--- Iniciando Prueba de Plantilla ---');
    console.log('Account SID:', accountSid);
    console.log('From:', from);
    console.log('To:', to);

    // El SID que proporcionó el usuario
    const templateSid = 'HX2dcb4ca34a30f5ce035f5cf56e78ca25';
    const variables = {
        '1': 'John Alberto' // Nombre de prueba
    };

    try {
        console.log('Enviando con ContentSid:', templateSid);
        console.log('Variables:', JSON.stringify(variables));

        const message = await client.messages.create({
            from: from?.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            contentSid: templateSid,
            contentVariables: JSON.stringify(variables)
        });

        console.log('✅ ÉXITO!');
        console.log('SID del mensaje:', message.sid);
        console.log('Status:', message.status);
    } catch (error: any) {
        console.error('❌ ERROR DETECTADO:');
        console.error('Mensaje:', error.message);
        console.error('Código Twilio:', error.code);
        console.error('Status HTTP:', error.status);
        if (error.moreInfo) console.error('Más info:', error.moreInfo);

        console.log('\n--- Análisis del Error ---');
        if (error.code === 20404) {
            console.log('Análisis: El SID de la plantilla no se encuentra. Verifica que el SID sea correcto y pertenezca a este Account SID.');
        } else if (error.code === 63016) {
            console.log('Análisis: Fallo al caer en modo "Texto Libre". Probablemente la plantilla falló primero.');
        }
    }
}

testTemplate();
