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
let clients = JSON.parse('{}')
let online = JSON.parse('{}')
let IDTable = new Map()
wss.on('connection', ws =>{
    let ID = uuid()
    let nick
    console.log(`какой то ${ID} присоединился`)
    ws.send(JSON.stringify({ type: 'uuid', data: ID}))
    ws.on('message', event => {
        let msg
        try{
            msg = JSON.parse(event.toString('utf-8'))
        }catch{msg=event.toString('utf-8')}
        console.log('msg:',msg)
        if(msg.type == 'nick') {
           console.log('получен никнейм')
           nick = msg.data
           if(online[nick]==msg.data) {
            wss.close
            console.log('такой челик уже есть понял да?')
           } else {
            IDTable.set(nick, ID) 
            console.log(IDTable.get(nick))
            online[nick] = msg.data
            console.log(IDTable.size)
           } 
        }
    })
    ws.on('close', function () {
        console.log(nick, ' отключился')
        delete online[nick]
    })
})