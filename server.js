//импорты
const WebSocket = require('ws')
const uuid = require('uuid').v4
const wt = require('node:worker_threads')
const fs = require('node:fs')
const MongoClient = require('mongodb').MongoClient
const format = require('util').format
const colors = require('colors')
let userListDB, chatDB
let lpeers = []

//присоединение к бд
MongoClient.connect('mongodb://127.0.0.1:27017', function (err, db) {
    if (err) {throw err}
    console.log('подключилися к БД')
    //коллекции для чата
    userListDB = db.collection('users')
    chatDB = db.collection('chat')
})
//вебсоцкет сервер
const wss = new WebSocket.Server({port: 9000})
console.log('сделали прикольный сервер 9000 порт'.magenta)

//функции нужные

//проверка пользователя на существование в дб
function existUser (user, callback) {
	userListDB.find({login: user}).toArray(function (error, list) {
		callback (list.length !== 0);
	});
}
//система аккаунтов
function checkUser (user, password, callback) {
	// проверяем, есть ли такой пользователь
	existUser(user, function (exist) {
		// если пользователь существует
		if (exist) {
			// то найдем в БД записи о нем
			userListDB.find({login: user}).toArray(function (error, list) {
				// проверяем пароль
				callback (list.pop().password === password);
			});
		} else {
			// если пользователя нет, то регистрируем его
			userListDB.insert ({login: user, password: password}, {w:1}, function (err) {
				if (err) {throw err}
			});
			// не запрашиваем авторизацию, пускаем сразу
			callback (true);
		}
	});
}
//сообщения всем участникам чата
function broadcast (by, message) {
	
	// запишем в переменную, чтоб не расходилось время
	let time = new Date().getTime();
	
	// отправляем по каждому соединению
	peers.forEach (function (ws) {
		ws.send (JSON.stringify ({
			type: 'message',
			message: message,
			from: by,
			time: time
		}));
	});
	
	// сохраняем сообщение в истории
	chatDB.insert ({message: message, from: by, time: time}, {w:1}, function (err) {
		if (err) {throw err}
	});
}
//отправка старых мессегов новым участникам
function sendNewMessages (ws) {
	chatDB.find().toArray(function(error, entries) {
		if (error) {throw error}
		entries.forEach(function (entry){
			entry.type = 'message';
			ws.send (JSON.stringify (entry));
		});
	});
}
// убрать из массива элемент по его значению
Array.prototype.exterminate = function (value) {
	this.splice(this.indexOf(value), 1);
}

wss.on('connection', function (ws) {	
	// проинициализируем переменные
	let login = '';
	let registered = false;
	
	// при входящем сообщении
	ws.on('message', function (message) {
        console.log('получен жоский мессег')
		// получаем событие в пригодном виде
		let msg = JSON.parse(message);
		
		// если человек хочет авторизироваться, проверим его данные
		if (msg.type === 'authorize') {
            console.log('попытка авторизации хуле')
			// проверяем данные
			checkUser(msg.user, msg.password, function (success) {
				// чтоб было видно в другой области видимости
				registered = success;
				
				// подготовка ответного события
				let returning = {type:'authorize', success: success};
				
				// если успех, то
				if (success) {
					// добавим к ответному событию список людей онлайн
					returning.online = lpeers;
					
					// добавим самого человека в список людей онлайн
					lpeers.push (msg.user);
					
					// добавим ссылку на сокет в список соединений
					peers.push (ws);
					
					// чтобы было видно в другой области видимости
					login = msg.user;
					
					//  если человек вышел
					ws.on ('close', function () {
						peers.exterminate(ws);
						lpeers.exterminate(login);
					});
				}
				
				// ну и, наконец, отправим ответ
				ws.send (JSON.stringify(returning));
			
				// отправим старые сообщения новому участнику
				if (success) {
					sendNewMessages(ws);
				}
			});
		} else {
			// если человек не авторизирован, то игнорим его
            console.log('ебланчик неавторизован игнорим его хуле')
			if (registered) {
				// проверяем тип события
				switch (msg.type) {
					// если просто сообщение
					case 'message':
						// рассылаем его всем
                        console.log('ебать сообщение, рассылаем его всем клиентусам')
						broadcast (login, event.message)
						break;
				}	
			}
		}
	});
});