const validar = (message, phone) => { 
    const regex = /^9\d+$/;  

    if (!message || !phone) {
        console.log('Faltan datos');
        const rpt = {
            "status": "error",
            "message": "Error al enviar el mensaje. Falta un parámetro.",
            "code": "PARAMETER_NOT_FOUND"
        }; 
        return rpt;
    }
    if(message.trim() === '' ){
        console.log('Faltan datos');
        const rpt = {
            "status": "error",
            "message": "Error al enviar el mensaje. El mensaje está vacío.",
            "code": "EMPTY_MESSAGE"
          }
          return rpt;
    }

    if(phone.trim() === '' ){
        console.log('Faltan datos');
        const rpt = {
            "status": "error",
            "message": "Error al enviar el mensaje. El número de teléfono está vacío.",
            "code": "EMPTY_PHONE"
          }
        return rpt;
    }

    if (!regex.test(phone)) {
        console.log('phone no valido');
        const rpt = {
            "status": "error",
            "message": "Error al enviar el mensaje. El número de teléfono es inválido.",
            "code": "INVALID_PHONE_NUMBER"
          }; 
          return rpt;
    }
    return true;
}

module.exports = validar;