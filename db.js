const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const viewsURL = path.resolve(`${__dirname}/public`);

require('dotenv').config({ path: '.env' });
// const MONGO_URL = process.env.MONGO_URL;
const app = express();
app.use(express.static(viewsURL));
app.use(express.json());

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

// let allMessages = [ 'this is the first messsage', 'this is the second one', 'this is the third one' ];

// const newConv = new Conversation({ conversations: allMessages });

// console.log(newConv);
// let conversationObject = {
// 	conversations : allMessages
// };

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

// let newCon = saveConversation(conversationObject);
// console.log(newCon);

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
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server is listening on port 3000`);
});
