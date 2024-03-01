const express = require('express');
const { launchBrowser, whatsappClient } = require('whatsapp-connect');
const app = express();

app.use(express.json());


async function startWhatsAppBot() {
    const browserInstance = await launchBrowser();
    whatsappClient.on('qr', async qr => {
        console.log('Scan the following QR code with your phone:');
    });
    await whatsappClient.initialize();
}

startWhatsAppBot();

const SendMsg = async (targetNumber, message) => {
    console.log('Sending message...');
    try {
        await whatsappClient.sendMessage(targetNumber, message);
        console.log('Message sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};


app.post('/api/whatsapp',  async (req, res) => {
    const message = req.body.message;
    const phone = req.body.phone;
    const targetNumber = `51${phone}@c.us`;

    try {
        const msg = await SendMsg(targetNumber, message);
        res.json(msg? { message: 'Message sent successfully' } : { message: 'Error sending message' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending message' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`REST API server listening on port ${PORT}`);
});
