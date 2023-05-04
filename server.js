const WebSocket = require('ws');
const uuid = require('uuid').v4;
const crypto = require('node:crypto');
const msgcrypt = require('./msgcrypt.js');
const fs = require('node:fs');

// Получаем список пользователей

if(!fs.existsSync('./serverdata')) fs.mkdirSync('./serverdata')
let users = JSON.parse('{}')
try{
    console.log('importing users')
    users=require('./serverdata/usrDb.json')
}catch{
    fs.writeFileSync('./serverdata/usrDb.json','{}')
}

// Генерируем ключ
const key = crypto.randomBytes(32);
console.log('Ключ:', key.toString('hex'));

// Конфигурируем сервер
const config = { port: 8080 };
const port = config.port;
const wss = new WebSocket.Server({ port: port });

function constrcutMsg(type,data){
    return JSON.stringify({type: type, data: msgcrypt.encryptMessage(data,key)})
}

wss.on('listening', () => {
    console.log('Прослушиваем порт', port);
})

let clients = JSON.parse('{}');
wss.on('connection', ws => {
    let id = uuid();
    clients[id] = ws;
    ws.send(JSON.stringify({ type: 'key', data: key.toString('hex') }));
    // Строка выше - крайне небезопасный способ передачи ключа.
    // Для неё и была создана отдельная ветка, чтобы не портить основную.
    console.log(id, 'присоединился.');

    ws.send(constrcutMsg("uuid",id))
    ws.send(constrcutMsg("msg",'Your UUID: ' + id));

    ws.on('message', event => {
        const msg = JSON.parse(event);

        if(msg.type=="auth"){
            let userData=[]
            userData.push(msgcrypt.decryptMessage(msg.login,key),msgcrypt.decryptMessage(msg.password,key))
            if(users[userData[0]]){
                if(users[userData[0]]===userData[1]){ws.send(constrcutMsg('msg','Залогинилисьб лять'))}
                console.log(users)
            }
            else{
                users[userData[0]]=userData[1]
                ws.send(constrcutMsg('msg','Зарегалисьс ука'))
            }
        }

        if (msg.type == "msg") {
            let decryptedMessage = msgcrypt.decryptMessage(msg.data,key)
            console.log('[Client]',decryptedMessage)
            ws.send(constrcutMsg("msg", 'client msg: '+msgcrypt.decryptMessage(msg.data,key)))
            if(decryptedMessage=="/kickme"){ws.close(1000,"Причина посылания нахуй: Еблан")}
        }
    })

    ws.on('close', eventcode => {
        delete clients[id]
        console.log(id,'отключился.',eventcode)
    })
})