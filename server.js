const WebSocket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const fs = require('node:fs')

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

// Генерируем ключ
const key = crypto.randomBytes(32)
console.log('Ключ:',key.toString('hex'))

// Конфигурируем сервер
const config = { port: 8080 }
const port = config.port
const wss = new WebSocket.Server({ port: port })

wss.on('listening', () => {
    console.log('Прослушиваем порт', port)
})

let clients = JSON.parse('{}')
wss.on('connection', ws => {
    let id = uuid()
    clients[id] = ws
    ws.send(JSON.stringify({type:'msgKey',data: key.toString('hex')}))
    // Строка выше - крайне небезопасный способ передачи ключа.
    // Для неё и была создана отдельная ветка, чтобы не портить основную.
    console.log(id, 'присоединился.')
    
    // Отправляем всякую фигню для проверки шифрования
    const message = "HELLO WORLD!!!!"
    ws.send(encryptMessage(message, 0))

    ws.on('message', event => {
        const msg = JSON.parse(event)

        if (msg.type == "msg") {
            console.log('[Client]',decryptMessage(msg))
        }
    })

    ws.on('close', function () {
        delete clients[id]
        console.log(id, 'отключился.')
    })
})