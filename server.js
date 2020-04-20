const port = process.env.PORT || 8000;
const express = require('express');
const app = express();

const path = require('path');

const viewsURL = path.resolve(`${__dirname}/public`);

const database = require('./db.js');

const { prompts, prompts2 } = require('./prompts.js');

app.use(express.static(viewsURL));
app.use(express.json());

app.get('/', (request, response) => {
	response.sendFile(__dirname + '/views/index.html');
});

app.get('/find', (req, res) => {
	database.getConversation((err, docs) => {
		res.json(docs);
	});
});

app.delete('/find/:id', (req, res) => {
	const id = req.params.id;

	database.deleteById(id, (err, deletedObject) => {
		res.json({ deletedObject: deletedObject });
	});
});

const server = require('http').createServer(app).listen(port, () => {
	console.log(`Your app is listening on port ${port}`);
});

const io = require('socket.io').listen(server);

//Keep track of queue
let queue = [];
let q = -1;
let current = -1;

let queue2 = [];
let q2 = -1;
let current2 = -1;

const randomIndex = Math.floor(Math.random() * prompts.length);

let prompt = prompts[randomIndex];
let allMessages = [];

let prompt2 = prompts2[randomIndex];
let allMessages2 = [];

//individual connection
io.sockets.on('connection', (socket) => {
	console.log(`We have a new client ${socket.id}`);

	socket.on('join', function() {
		queue.push(socket);
		console.log(queue.length);
		if (queue.length == 1) {
			socket.emit('first');
		}
	});

	socket.on('start', function() {
		io.sockets.emit('inGame');

		for (let i = Math.floor(queue.length / 2); i < queue.length; i++) {
			queue2.push(queue[i]);
		}

		for (let i = 0; i < Math.floor(queue.length / 2); i++) {
			queue2.push(queue[i]);
		}

		for (let i in queue) {
			let visualizeDataOne = [ queue.length, i ];
			queue[i].emit('myPositionOne', visualizeDataOne);
		}
		io.sockets.emit('currentIndexOne', 0);

		for (let i in queue2) {
			let visualizeDataTwo = [ queue.length, i ];
			queue2[i].emit('myPositionTwo', visualizeDataTwo);
		}
		io.sockets.emit('currentIndexTwo', 0);

		console.log(`First queue is ${queue[0].id}`);
		console.log(`Second queue is ${queue2[0].id}`);

		next(true);

		next2(true);

		//give first one context of the conversation instead of the message
		if (current == queue[0]) {
			current.emit('prompt', prompt);
			console.log(prompt);
		}

		if (current2 == queue2[0]) {
			current2.emit('promptTwo', prompt2);
			console.log(prompt2);
		}
	});

	socket.on('message', (answer) => {
		// console.log(answer);
		allMessages.push(answer);
		for (let i = 0; i < q + 1; i++) {
			queue[i].emit('allMessages', allMessages);
		}

		next(true);

		io.sockets.emit('currentIndexOne', q);

		current.emit('message', answer);
		current.emit('go');
	});

	socket.on('messageTwo', (answer) => {
		// console.log(answer);
		allMessages2.push(answer);
		for (let i = 0; i < q2 + 1; i++) {
			queue2[i].emit('allMessages2', allMessages2);
		}

		next2(true);

		io.sockets.emit('currentIndexTwo', q2);

		current2.emit('messageTwo', answer);
		current2.emit('goTwo');
	});

	socket.on('disconnect', function() {
		console.log('Client has disconnected' + socket.id);

		io.sockets.emit('disconnected', socket.id);
		// remove disconnected socket from queue
		for (let s = 0; s < queue.length; s++) {
			if (queue[s].id == socket.id) {
				console.log('Remove' + socket.id);
				queue.splice(s, 1);
				if (socket === current) next(false);
			}
		}

		for (let s = 0; s < queue2.length; s++) {
			if (queue2[s].id == socket.id) {
				console.log('Remove' + socket.id);
				queue2.splice(s, 1);
				if (socket === current2) next2(false);
			}
		}
	});
});

function next(advance) {
	if (advance) {
		q++;

		if (q >= queue.length) {
			allMessages.unshift(prompt);
			io.sockets.emit('end', allMessages);
			database.saveConversation(allMessages);
			return;
		}
	}

	console.log('NEXT UP IN FIRST QUEUE: ', q, queue.length);
	current = queue[q];
}

function next2(advance) {
	if (advance) {
		q2++;

		if (q2 >= queue2.length) {
			allMessages2.unshift(prompt2);
			io.sockets.emit('endTwo', allMessages2);
			database.saveConversation(allMessages2);
			return;
		}
	}

	console.log('NEXT UP IN SECOND QUEUE: ', q2, queue2.length);
	current2 = queue2[q2];
}
