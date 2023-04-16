const WebScoket = require('ws')
const crypto = require('node:crypto')

const srv = new WebScoket('ws://localhost:8080')

let key

srv.onopen = event => {
    console.log('Подключено.')
}

srv.onmessage = event => {
    const msg = JSON.parse(event.data)
    //Выполняем проверку на публичный ключ
    if (msg.type == 'msgKey') {
        console.log(msg)
        key = Buffer.from(msg.data,'hex')
        // cipher = crypto.createCipheriv('aes-256-ccm',key,iv)
        console.log('Ключ получен.',key)
    } else {
        iv = Buffer.from(msg.iv,'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc',key,iv)
        const decryptedBuffer = Buffer.concat([decipher.update(Buffer.from(msg.data, 'hex')), decipher.final()]);
        const decryptedMessage = decryptedBuffer.toString('utf8');
        console.log('[Server]',decryptedMessage)
    }
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ', JSON.stringify(event))
}