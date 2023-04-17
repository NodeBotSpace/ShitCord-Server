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
<<<<<<< HEAD
let online = JSON.parse('{}')
let IDTable = new Map()
let msg
wss.on('connection', ws =>{
    console.log('подключился какой-то клиент')
    ws.on('message', event => {
        if(event.type == 'nick') {
            msg = JSON.parse(event.data)
            console.log(msg)
=======
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
>>>>>>> parent of 1cc9d53 (2)
        }
           
        })
    ws.on('close', function () {
<<<<<<< HEAD
        console.log('кто-то отключился')
=======
        delete clients[ID]
        console.log(ID, 'отключился.')
>>>>>>> parent of 1cc9d53 (2)
    })
})