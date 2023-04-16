const WebScoket = require('ws')
const crypto = require('node:crypto')

const srv = new WebScoket('ws://localhost:8080')

let key, iv, cipher, decipher

srv.onopen = event => {
    console.log('Подключено.')
}

srv.onmessage = event => {
    const msg = JSON.parse(event.data)
    //Выполняем проверку на публичный ключ
    if (msg.type == 'msgKey') {
        key = msg.data
        cipher = crypto.createCipheriv('aes-256-ccm',key,iv)
        decipher = crypto.createDecipheriv('aes-256-ccm',key,iv)
        console.log('Ключ получен.')
    } else {
        // try {const decryptData = crypto.publicDecrypt({key: publicKey,padding: crypto.constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(JSON.parse(msg.data).data, 'base64'));console.log('[Server]', decryptData.toString())} catch (err) {console.log('Не удалось расшифровать:', err)}
    }
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ', JSON.stringify(event))
}