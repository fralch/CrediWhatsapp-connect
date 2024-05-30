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
app.use(bodyParser.json({ limit: '1mb' }));

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

let browserInstance;
let isWhatsAppClientInitialized = false;

async function startWhatsAppBot() {
  if (!browserInstance) {
    browserInstance = await launchBrowser();
  }
  if (!isWhatsAppClientInitialized) {
    whatsappClient.on('qr', async (qr) => {
      console.log('Scan the following QR code with your phone:');
    });
    await whatsappClient.initialize();
    isWhatsAppClientInitialized = true;
  }
}

startWhatsAppBot();

const sendMsg = async (targetNumber, message, media) => {
  console.log('Sending message...');
  const caption = message;
  try {
    const chat = await whatsappClient.getChatById(targetNumber);
    await chat.sendMessage(media, { caption });
    const numero = targetNumber.replace(/@c\.us/g, '');
    console.log('Mensaje enviado correctamente');
    return {
      status: 'success',
      message: `El mensaje fue enviado exitosamente a +${numero}.`,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const sendMsgJson = async (targetNumber, message) => {
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

app.post(
  '/api/whatsapp/text-image',
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ error: 'La imagen debe ser de tipo .jpg o .png' });
    }

    const { message, phone } = req.body;
    const isValid = validar(message, phone);
    if (isValid?.status === 'error') {
      return res.status(400).json({ error: isValid });
    }

    const targetNumber = `51${phone}@c.us`;
    const imgData = req.file.buffer.toString('base64');
    const media = new MessageMedia('image/jpeg', imgData, 'image.jpg');

    try {
      const msg = await sendMsg(targetNumber, message, media);
      res.json(msg);
    } catch (error) {
      res.status(500).json({ error: 'Error sending message' });
    }
  }
);

app.post('/api/whatsapp/text', async (req, res) => {
  const { message, phone } = req.body;
  const isValid = validar(message, phone);
  if (isValid?.status === 'error') {
    return res.status(400).json({ error: isValid });
  }

  const targetNumber = `51${phone}@c.us`;

  try {
    const msg = await sendMsgJson(targetNumber, message);
    if (msg) {
      const logData = {
        phone,
        message,
        status: 'success',
        date: new Date().toISOString(),
      };
      fs.appendFile('log.json', JSON.stringify(logData) + '\n', (err) => {
        if (err) console.error('Error writing log:', err);
      });
    }
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`REST API server listening on port ${PORT}`);
});
