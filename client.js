const WebScoket = require('ws')
const crypto = require('node:crypto')
const uuid = require('uuid').v4
const fs = require('node:fs')

const srv = new WebScoket('ws://localhost:8080')

let messg
let nickname = 'tikenshot'
const ID = uuid()
let IDs = new Map()
IDs.set(nickname, ID)
srv.onopen = event => {
    console.log('Подключено.')
    srv.send(JSON.stringify({type: 'nick', data: nickname}))
    srv.send(JSON.stringify({type: 'uuid', data: IDs.get(nickname)}))
}

srv.onmessage = msg =>{
    messg = JSON.parse(msg.data)
    console.log(messg)
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ')
}