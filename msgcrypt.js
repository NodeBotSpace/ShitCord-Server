const crypto = require('node:crypto')
function decryptMessage(content,key) {
    try{
        iv = Buffer.from(content.iv,'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc',key,iv)
        const decryptedBuffer = Buffer.concat([decipher.update(Buffer.from(content.data, 'hex')), decipher.final()]);
        return decryptedBuffer.toString('utf8')
    }catch{
        console.log('Decrypt failed!',err)
    }
}

function encryptMessage(content,type,key) {
    try{
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
        const encryptedBuffer = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
        const encryptedMessage = encryptedBuffer.toString('hex');
        return(JSON.stringify({type:type,data: encryptedMessage, iv:iv.toString('hex')}))
    }catch(err){
        console.log('Encrypt failed!',err)
    }
}

module.exports={
    decryptMessage:decryptMessage,
    encryptMessage:encryptMessage
}