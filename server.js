const WebScoket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const fs = require('node:fs')

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {modulusLength: 4096,publicKeyEncoding: {type: 'spki',format: 'pem'},privateKeyEncoding: {type: 'pkcs8',format: 'pem'}});

const key = crypto.randomBytes(32)
console.log('Ключ:',key.toString('hex'))

const config = { port: 8080 }
const port = config.port

const wss = new WebScoket.Server({ port: port })

wss.on('listening', () => {
    console.log('Прослушиваем порт', port)
})

let clients = JSON.parse('{}')
wss.on('connection', ws => {
    let id = uuid()
    clients[id] = ws
    ws.send(JSON.stringify({type:'msgKey',data: key.toString('hex')})) // Крайне небезопасный способ передачи ключа. Переделать. Когда нибудь...
    console.log(id, 'присоединился.')
    
    // Отправляем всякую хуйню

    const message = "HELLO WORLD!!!!"
    const iv = crypto.randomBytes(16)
    cipher = crypto.createCipheriv('aes-256-cbc',key,iv)
    const encryptedBuffer = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
    const encryptedMessage = encryptedBuffer.toString('hex');
    ws.send(JSON.stringify({type:'msg',data: encryptedMessage, iv:iv.toString('hex')}))

    ws.on('message', msg => {
        // console.log('[',id,']',msg)
        // try{const decryptData = crypto.privateDecrypt({key: privateKey,padding: crypto.constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(JSON.parse(msg).data,'base64'));console.log('[',id,']',decryptData.toString())}catch(err){console.log('Не удалось расшифровать:',err)}});let cryptData = crypto.publicEncrypt({key: publicKey,padding: crypto.constants.RSA_PKCS1_OAEP_PADDING},Buffer.from('HELLO WORLD!!!','utf-8'));ws.send(JSON.stringify({type:'cryptData',data: cryptData.toString('base64')}

    })

    ws.on('close', function () {
        delete clients[id]
        console.log(id, 'отключился.')
    })
})