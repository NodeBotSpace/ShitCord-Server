const WebSocket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const fs = require('node:fs')

const config = { port: 8080 }
const port = config.port

const wss = new WebSocket.Server({ port: port })

wss.on('listening', () => {
    console.log('Прослушиваем порт', port)
})
let type
let clients = JSON.parse('{}'), uuids = []
wss.on('connection', ws => {
    let ID = uuid()
    clients[ID] = ws
    console.log(ID, 'присоединился.')
    ws.send(JSON.stringify({type: 'uuid', data: ID}))
    ws.on('message', msg => {
        console.log('получен месседж')
        type = JSON.parse(msg.type)
        console.log(type)
        console.log(msg.toString('utf-8'))
        if(type == 'nick') {
            console.log('получен никнеймус')
        }
    })
    ws.on('close', function () {
        delete clients[ID]
        console.log(ID, 'отключился.')
    })
})