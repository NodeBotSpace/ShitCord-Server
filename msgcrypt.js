const crypto = require('node:crypto');
function decryptMessage(content, key) {
    try {
        content = JSON.parse(content)
        let iv = Buffer.from(content.iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decryptedBuffer = Buffer.concat([decipher.update(Buffer.from(content.data, 'hex')), decipher.final()]);
        return decryptedBuffer.toString('utf8');
    } catch (err){
        console.log('[msgcrypt.js] Decrypt failed! Content: '+content,'\n',err);
    }
}

function encryptMessage(message, key) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encryptedBuffer = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
        const encryptedMessage = encryptedBuffer.toString('hex');
        return (JSON.stringify({data: encryptedMessage, iv: iv.toString('hex') }));
    } catch (err) {
        console.log('[msgcrypt.js] Encrypt failed! Content: '+message,'\n',err);
    };
};

module.exports = {
    decryptMessage,
    encryptMessage
};