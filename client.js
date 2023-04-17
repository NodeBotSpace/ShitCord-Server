const WebScoket = require('ws')
const crypto = require('node:crypto')

const srv = new WebScoket('ws://localhost:8080')

let publicKey
let messg

srv.onopen = event => {
    console.log('Подключено.')
}

srv.onmessage = msg =>{
    // console.log('[SERVER]',msg)
    if(msg.type=='pubKey'){
        publicKey=JSON.parse(msg).data
        console.log('Публичный ключ создан.')
    }
    if(msg.type=='cryptData') {
        messg=JSON.parse(msg).data
        console.log('пришло сообщение: ',messg)
    }
}

srv.onclose = event => {
    console.log('СЕРВЕР ЗАКРЫТ',JSON.stringify(event))
}