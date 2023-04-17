const WebScoket = require('ws')
const crypto = require('node:crypto')

const srv = new WebScoket('ws://localhost:8080')

let UUID
let messg
let nickname = ''
srv.onopen = event => {
    console.log('Подключено.')
    srv.send(JSON.stringify({type: 'nick', data: nickname}))
}

srv.onmessage = msg =>{
    messg = JSON.parse(msg.data)
    console.log(messg)
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ')
}
