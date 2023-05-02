const WebSocket = require('ws');
const uuid = require('uuid').v4;
const crypto = require('node:crypto');
const msgcrypt = require('./msgcrypt.js');
const fs = require('node:fs');

// Генерируем ключ
const key = crypto.randomBytes(32);
console.log('Ключ:', key.toString('hex'));

// Получаем список пользователей

if(fs.existsSync('./serverdata')) fs.mkdirSync('./serverdata')
let users
try{
    console.log('importing users')
    users=require('./serverdata/usrDb.json')
}catch{
    fs.writeFileSync('./serverdata/usrDb.json','{}')
    users=JSON.parse('{}')
}

// Конфигурируем сервер
const config = { port: 8080 };
const port = config.port;
const wss = new WebSocket.Server({ port: port });

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
    ws.send(msgcrypt.encryptMessage(id,'uuid',key))
    ws.send(msgcrypt.encryptMessage('Your UUID: ' + id, 'msg', key));

    ws.on('message', event => {
        const msg = JSON.parse(event);

        if(msg.type=="auth"){
            let decryptedData=[]
            decryptedData.push(msgcrypt.decryptMessage(msg.login),msgcrypt.decryptMessage(msg.password))
            if(users.find('')){}
        }

        if (msg.type == "msg") {
            let decryptedMessage = msgcrypt.decryptMessage(msg.data,msg.iv,key)
            console.log('[Client]',decryptedMessage)
            ws.send(msgcrypt.encryptMessage('client msg: '+msgcrypt.decryptMessage(msg.data,msg.iv,key),'msg',key))
            if(decryptedMessage=="/kickme"){ws.close(1000,"Причина посылания нахуй: Еблан")}
        }
    })

    ws.on('close', eventcode => {
        delete clients[id]
        console.log(id,'отключился.',eventcode)
    })
})