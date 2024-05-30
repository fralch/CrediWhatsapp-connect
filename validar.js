const validar = (message, phone) => {
  const regex = /^9\d+$/;
  const rpt = {
    status: 'error',
    code: '',
  };

  if (!message || !phone) {
    rpt.message = 'Error al enviar el mensaje. Falta un parámetro.';
    rpt.code = 'PARAMETER_NOT_FOUND';
    return rpt;
  }

  if (message.trim() === '') {
    rpt.message = 'Error al enviar el mensaje. El mensaje está vacío.';
    rpt.code = 'EMPTY_MESSAGE';
    return rpt;
  }

  if (phone.trim() === '') {
    rpt.message =
      'Error al enviar el mensaje. El número de teléfono está vacío.';
    rpt.code = 'EMPTY_PHONE';
    return rpt;
  }

  if (!regex.test(phone)) {
    rpt.message =
      'Error al enviar el mensaje. El número de teléfono es inválido.';
    rpt.code = 'INVALID_PHONE_NUMBER';
    return rpt;
  }

  return true;
};

module.exports = validar;
