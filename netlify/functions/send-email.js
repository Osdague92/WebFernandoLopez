/**
 * Netlify Function: send-email
 *
 * Recibe { name, email, message } y envía correo utilizando Resend API.
 * Variables de entorno requeridas:
 * - RESEND_API_KEY
 * - CONTACT_TO_EMAIL
 * - CONTACT_FROM_EMAIL (ej: sitio@tudominio.com)
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido' });
  }

  try {
    const { name, email, message } = JSON.parse(event.body || '{}');

    if (!name || !email || !message) {
      return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return jsonResponse(400, { error: 'Correo electrónico inválido.' });
    }

    if (message.trim().length < 10) {
      return jsonResponse(400, { error: 'El mensaje es demasiado corto.' });
    }

    const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;

    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
      return jsonResponse(500, { error: 'Faltan variables de entorno para el envío de correo.' });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        subject: `Nuevo mensaje desde la web de ${name}`,
        reply_to: email,
        html: `
          <h2>Nuevo contacto desde la landing</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Error de Resend:', resendData);
      return jsonResponse(502, { error: 'No se pudo enviar el correo en este momento.' });
    }

    return jsonResponse(200, {
      message: 'Gracias por tu mensaje. Te responderé pronto.',
      id: resendData.id,
    });
  } catch (error) {
    console.error('Error interno send-email:', error);
    return jsonResponse(500, { error: 'Error interno al procesar la solicitud.' });
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
