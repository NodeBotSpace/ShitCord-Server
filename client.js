const WebScoket = require('ws')
const crypto = require('node:crypto')

const srv = new WebScoket('ws://localhost:8080')

let publicKey

srv.onopen = event => {
    console.log('Соединён',event)
}

srv.onmessage = msg =>{
    // console.log('[SERVER]',msg)
    if(JSON.parse(msg).type=='pubKey'){
        publicKey=JSON.parse(msg).data
        console.log('public key updated.')
    }

}

srv.onclose = event => {
    console.log('SERVER CLOSED',JSON.stringify(event))
}