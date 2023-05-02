const crypto = require('node:crypto');
function decryptMessage(data, iv, key) {
    try {
        iv = Buffer.from(iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decryptedBuffer = Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]);
        return decryptedBuffer.toString('utf8');
    } catch {
        console.log('[msgcrypt.js] Decrypt failed!', err);
    }
}

function encryptMessage(data, type, key) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encryptedBuffer = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
        const encryptedMessage = encryptedBuffer.toString('hex');
        return (JSON.stringify({ type: type, data: encryptedMessage, iv: iv.toString('hex') }));
    } catch (err) {
        console.log('[msgcrypt.js] Encrypt failed!', err);
    }
}

module.exports = {
    decryptMessage,
    encryptMessage
}