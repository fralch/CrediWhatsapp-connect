const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { launchBrowser, whatsappClient } = require('whatsapp-connect');
const { MessageMedia } = require('whatsapp-web.js');
const validar = require('./validar');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - ${responseTime}ms`);
  });
  next();
});


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function startWhatsAppBot() {
    const browserInstance = await launchBrowser();
    whatsappClient.on('qr', async qr => {
        console.log('Scan the following QR code with your phone:');
    });
    await whatsappClient.initialize();
}

startWhatsAppBot();

const SendMsg = async (targetNumber, message, media) => {
    console.log('Sending message...');
    const caption = message;
    try {
        const chat = await whatsappClient.getChatById(targetNumber);
        await chat.sendMessage(media, { caption });
        const numero = targetNumber.replace(/@c\.us/g, '');
        const rpt = {
            "status": "success",
            "message": `El mensaje fue enviado exitosamente a +${numero}.`,
        }; 
        
        console.log('Mensaje enviado correctamente');
        return rpt;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
const SendMsgJson = async (targetNumber, message) => {
    console.log('Sending message json...');
    try {
        await whatsappClient.sendMessage(targetNumber, message);
        console.log('Message sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

app.get('/', (req, res) => {
    res.send('Hello World whatsapp-connect!');
});

app.post('/api/whatsapp/text-image', upload.single('image'), async (req, res) => {
    if(!req.file){
        res.status(400).json({ error: 'La imagen es requerida' });
        return false;
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({ error: 'La imagen debe ser de tipo .jpg o .png' });
        return false;
    }
    const message = req.body.message;
    const phone = req.body.phone;
    const isValid = validar(message, phone);
    if (isValid?.status  === "error") {
        res.status(400).json({ error: isValid });
        return false;
    }
    
    const targetNumber = `51${phone}@c.us`;
    const imgData = req.file.buffer.toString('base64');
    const media = new MessageMedia('image/jpeg', imgData, 'image.jpg');
    
    try {
        const msg = await SendMsg(targetNumber, message, media);
        res.json(msg);
    } catch (error) {
        res.status(500).json({ error: 'Error sending message' });
    }
});

app.post('/api/whatsapp/text',  async (req, res) => {
    const message = req.body.message;
    const phone = req.body.phone;
     const isValid = validar(message, phone);
    if (isValid?.status  === "error") {
        res.status(400).json({ error: isValid });
        return false;
    }

    const targetNumber = `51${phone}@c.us`;

    try {
        const msg = await SendMsgJson(targetNumber, message);
        if(msg){
            const logData = {
                "phone": phone,
                "message": message,
                "status": "success",
                "date": new Date().toISOString()
              };
                fs.appendFileSync('log.json', JSON.stringify(logData) + '\n');

        }
        res.json(msg? { message: 'Message sent successfully' } : { message: 'Error sending message' });
    } catch (error) {
        fs.appendFileSync('log.json', JSON.stringify({
            "phone": phone,
            "message": message,
            "status": "error",
            "date": new Date().toISOString()
          }) + '\n');
          
        res.status(500).json({ error: 'Error sending message' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`REST API server listening on port ${PORT}`);
});
