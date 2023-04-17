const WebSocket = require('ws')
const uuid = require('uuid').v4
const crypto = require('node:crypto')
const fs = require('node:fs')

const config = { port: 8080 }
const port = config.port

const wss = new WebSocket.Server({ port: port })

wss.on('listening', () => {
    console.log('прослушка порта ', port)
})
let online = JSON.parse('{}')
let IDTable = new Map()
let msg
wss.on('connection', ws =>{
    console.log('подключился какой-то клиент')
    ws.on('message', event => {
        if(event.type == 'nick') {
            msg = JSON.parse(event.data)
            console.log(msg)
        }
           
        })
    ws.on('close', function () {
        console.log('кто-то отключился')
    })
})
// ебашь