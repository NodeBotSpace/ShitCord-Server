const WebScoket = require('ws')
const crypto = require('node:crypto')
const message = "далбаю"
let key //оставляем как есть, ключ будет определён при его получении

// Функции ========
    // для расшифровки сообщения
    function decryptMessage(content) {
        iv = Buffer.from(content.iv,'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc',key,iv)
        const decryptedBuffer = Buffer.concat([decipher.update(Buffer.from(content.data, 'hex')), decipher.final()]);
        return decryptedBuffer.toString('utf8');
    }

    // для шифрования сообщения
    function encryptMessage(content) {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
        const encryptedBuffer = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
        const encryptedMessage = encryptedBuffer.toString('hex');
        return(JSON.stringify({type:'msg',data: encryptedMessage, iv:iv.toString('hex')}))
    }

// Подключаемся к серверу
const srv = new WebScoket('ws://localhost:8080')

srv.onopen = event => {
    console.log('Подключено.')
}

srv.onmessage = event => {
    const msg = JSON.parse(event.data)

    // Выполняем проверку на ключ
    if (msg.type == 'msgKey') {
        console.log(msg)
        key = Buffer.from(msg.data,'hex')
        console.log('Ключ получен.',key)
    }
    
    // Иначе парсим как обычное сообщение
    else {
        console.log('[Server]',decryptMessage(msg))
        srv.send(encryptMessage(message))
    }
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ', JSON.stringify(event))
}