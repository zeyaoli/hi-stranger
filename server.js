// use import/require to include the db js file
//const db = require("db.js")
// in another file -> module.exports{}
const port = process.env.PORT || 8000;
const express = require('express');
const app = express();

// most of the code below here until io are database, will leave this comment before i clean up the code!

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const viewsURL = path.resolve(`${__dirname}/public`);

require('dotenv').config({ path: '.env' });

mongoose.connect(
	'mongodb+srv://admin:SIB!crip7flis@hi-strangers-db-mzlay.gcp.mongodb.net/test?retryWrites=true&w=majority',
	{ useNewUrlParser: true }
);

const db = mongoose.connection;
db.on = ('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('connected to database');
});

const ConversationSchema = mongoose.Schema({
	time          : { type: Date, default: Date.now },
	conversations : [ String ]
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

const handleError = (err) => {
	console.log(err);
};

const getConversation = (cb) => {
	Conversation.find().exec((err, docs) => {
		cb(err, docs);
	});
};

const saveConversation = (messages) => {
	let conversationObject = {
		conversations : messages
	};

	Conversation.create(conversationObject, function(err, newConversation) {
		if (err) return handleError(err);
	});
};

// const deleteById = (id, cb) => {
// 	Conversation.findByIdAndDelete(id, (err, deletedObject) => {
// 		cb(err, deletedObject);
// 	});
// };

// const database = require('db.js');

app.use(express.static('public'));
app.use(express.json());

app.get('/', (request, response) => {
	response.sendFile(__dirname + '/views/index.html');
});

app.get('/find', (req, res) => {
	getConversation((err, docs) => {
		res.json(docs);
	});
});

app.delete('/find/:id', (req, res) => {
	const id = req.params.id;

	Conversation.findByIdAndDelete(id, (err, deletedObject) => {
		res.json({ deletedObject: deletedObject });
	});

	// deleteById(id, (err, deletedObject) => {
	// 	res.json({ deletedObject: deletedObject });
	// });
});

// listen for requests :)
const server = require('http').createServer(app).listen(port, () => {
	console.log(`Your app is listening on port ${port}`);
});

// io thing all goes here!!!!!!!!!!

const io = require('socket.io').listen(server);

//Keep track of queue
let queue = [];
let q = -1;
let current = -1;

let queue2 = [];
let q2 = -1;
let current2 = -1;

//two prompts has to be different
const prompts = [
	'You are feeling so blue right now and you need someone to comfort you',
	'You are mad at your parents but you can not argue with them. Now, you want to express your feeling with someone on the internet.',
	'You are extremely home sick at this moment and you need to share this feeling with someone',
	'You got selected to be a part of your dream project. You extremely want to tell the world about it',
	'You are stuck in a building, the only thing you can do is to sending one sentence for someone to rescue you',
	'You found a wallet with a lot of money in it. You want to tell your friend about that'
];

const prompts2 = [
	'You are so annoy about your mournful friend who express everything with you and you want to gossip with others',
	'You are worried about your child (?)',
	'You wish you could leave your home and explore the world.',
	'You missed out on another job that you wanted. You are complaining about it to a friend.',
	'You received a strange call asking you to rescue them',
	'You lost you wallet with your rent in it. You want someone to help you find it'
];

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

	//socket.emit("position", queue.length - 1);

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

		// for (let i in queue) {
		// 	let visualizeDataOne = [ queue.length, i ];
		// 	queue[i].emit('myPositionOne', visualizeDataOne);
		// }
		// io.sockets.emit('currentIndexOne', q);

		// for (let i in queue2) {
		// 	let visualizeDataTwo = [ queue.length, i ];
		// 	queue2[i].emit('myPositionTwo', visualizeDataTwo);
		// }
		// io.sockets.emit('currentIndexTwo', q);
	});
});

function next(advance) {
	if (advance) {
		q++;
	}

	if (q >= queue.length) {
		allMessages.unshift(prompt);
		io.sockets.emit('end', allMessages);
		saveConversation(allMessages);
		allMessages = [];
		//write the function that push the data to the db
		return;
	}

	console.log('NEXT UP IN FIRST QUEUE: ', q, queue.length);
	current = queue[q];
}

function next2(advance) {
	if (advance) {
		q2++;
	}

	if (q2 >= queue2.length) {
		allMessages2.unshift(prompt2);
		io.sockets.emit('endTwo', allMessages2);
		saveConversation(allMessages2);
		allMessages2 = [];
		//write the function that push the data to the db
		return;
	}

	console.log('NEXT UP IN SECOND QUEUE: ', q2, queue2.length);
	current2 = queue2[q2];
}
