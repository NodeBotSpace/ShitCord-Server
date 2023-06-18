const WebSocket = require('ws')
const uuid = require('uuid').v4
let clients = JSON.parse('{}')
let users = JSON.parse('{}')
let userData = []
const wss = new WebSocket.Server({ port: 3000})

wss.on('listening', () => {
    console.log('слушаем порт 3000')
})

wss.on('connection', ws => {
    let id = uuid()
    clients[id] = ws
    console.log(`${id} присоединился.`)
    ws.on('message', event => {
        //const msg = event.toString('utf-8')
        const msg = JSON.parse(event)
        console.log(`Пришло сообщение: ${msg}`)
        switch(msg.type) {
            case 'auth':
                userData.push(msg.login, msg.password)
                if(users[userData[0]]) {
                    if(users[userData[0]] === userData[1]) {
                        ws.send(sendMessage("msg", "зарегались"))
                    }
                } else {
                    users[userData[0]] = userData[1]
                    ws.send(sendMessage("msg", "зарегистрирован"))
                }
                break
            case 'msg':
                console.log(`[Клиент] ${msg.data}`)
                wss.clients.forEach(function each(client) {
                    if(client.readyState === WebSocket.OPEN) {
                        client.send(sendMessage("msg", msg.data))
                    }
                })
            
        }
    })
    ws.on('close', eventcode => {
        console.log(`${id} вышел. ${eventcode}`)
        delete clients[id]
    })
})

const sendMessage = (type, data) => {
    return JSON.stringify({ type: type, data: data})
}