const WebSocket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const fs = require('node:fs')

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});


const config = { port: 8080 }
const port = config.port

const wss = new WebSocket.Server({ port: port })

wss.on('listening', () => {
    console.log('Прослушиваем порт', port)
})

let clients = JSON.parse('{}'), uuids = []
wss.on('connection', ws => {
    let id = uuid()
    clients[id] = ws
    ws.send(JSON.stringify({type:'pubKey',data: publicKey}))
    console.log(id, 'присоединился.')
    ws.on('message', msg => {
        console.log('[',id,']',msg)
        try{
            const decryptData = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
                },
                Buffer.from(JSON.parse(msg).data,'base64')
            );
            console.log('[',id,']',decryptData.toString())
        }catch(err){console.log('Не удалось расшифровать:',err)}
    })
    let cryptData = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    Buffer.from('HELLO WORLD!!!','utf-8'))
    ws.send(JSON.stringify({type:'cryptData',data: cryptData.toString('base64')}))
    ws.on('close', function () {
        delete clients[id]
        console.log(id, 'отключился.')
    })
})