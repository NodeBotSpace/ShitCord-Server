const WebSocket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const msgcrypt = require('./msgcrypt.js')
const fs = require('node:fs')

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
    ws.send(msgcrypt.encryptMessage(message,"msg",key))

    ws.on('message', event => {
        const msg = JSON.parse(event)

        if (msg.type == "msg") {
            console.log('[Client]',msgcrypt.decryptMessage(msg,key))
        }
    })

    ws.on('close', function () {
        delete clients[id]
        console.log(id, 'отключился.')
    })
})