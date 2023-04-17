const WebScoket = require('ws')
const msgcrypt = require('./msgcrypt.js')
const message = "далбаю"
let key //оставляем как есть, ключ будет определён при его получении

// Подключаемся к серверу
const srv = new WebScoket('ws://localhost:8080')

srv.onopen = event => {
    console.log('Connected.')
}

srv.onmessage = event => {
    const msg = JSON.parse(event.data)

    // Выполняем проверку на ключ
    if (msg.type == 'msgKey') {
        console.log('Server message:',msg)
        key = Buffer.from(msg.data,'hex')
        console.log('Key received:',key.toString('hex'))
    }
    
    // Иначе парсим как обычное сообщение
    else {
        const decryptedMessage = msgcrypt.decryptMessage(msg,key)
        console.log('[Server]',decryptedMessage)
        srv.send(msgcrypt.encryptMessage(message,"msg",key))
    }
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ', JSON.stringify(event))
}