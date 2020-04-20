// const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
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

function getConversation(cb) {
	Conversation.find().exec((err, docs) => {
		cb(err, docs);
	});
}

function saveConversation(messages) {
	let conversationObject = {
		conversations : messages
	};

	Conversation.create(conversationObject, function(err, newConversation) {
		if (err) return handleError(err);
	});
}

function deleteById(id, cb) {
	Conversation.findByIdAndDelete(id, (err, deletedObject) => {
		cb(err, deletedObject);
	});
}

module.exports = {
	getConversation  : getConversation,
	saveConversation : saveConversation,
	deleteById       : deleteById
};
