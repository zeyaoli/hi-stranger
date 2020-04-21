// Open and connect input socket
let socket = io();

let gameState = 'preGame';
let firstPerson = false;
//all the components are in the component js
function pageChange() {
	if (gameState == 'preGame') {
		document.getElementById('root').innerHTML = FrontPage();
	} else if (gameState == 'waiting' && firstPerson == false) {
		document.getElementById('root').innerHTML = WaitingPage();
	} else if (gameState == 'waiting' && firstPerson == true) {
		document.getElementById('root').innerHTML = StartPage();
	} else if (gameState == 'inGame') {
		document.getElementById('root').innerHTML = InGamePage();
	}
}

pageChange();

let myPositionOne = -1;
let myPositionTwo = -1;

let prevOne;
let submitFormOne;
let contentOne;

let prevTwo;
let submitFormTwo;
let contentTwo;

let ended = 0;

let queueLength;

let currentIndexOne = -1;
let currentIndexTwo = -1;

// Listen for confirmation of connection
socket.on('connect', function() {
	console.log('Connected', socket.id);
});

// Listen for this client's position in the queue
socket.on('myPositionOne', function(data) {
	length = data[0];
	myPositionOne = data[1];
	createQueue('positionOne', length, myPositionOne);
});

socket.on('myPositionTwo', function(data) {
	length = data[0];
	myPositionTwo = data[1];
	createQueue('positionTwo', length, myPositionTwo);
});

socket.on('first', function() {
	firstPerson = true;
	pageChange();

	document.getElementById('start').addEventListener('click', function() {
		socket.emit('start');
		gameState = 'inGame';
		pageChange();
	});
});

socket.on('inGame', function(data) {
	gameState = 'inGame';
	pageChange();

	prevOne = document.getElementById('prev-one');
	submitFormOne = document.getElementById('submit-form-one');
	contentOne = document.getElementById('contentOne');

	prevTwo = document.getElementById('prev-two');
	submitFormTwo = document.getElementById('submit-form-two');
	contentTwo = document.getElementById('contentTwo');
});

// On button press, send input message to the server

window.addEventListener('DOMContentLoaded', (event) => {
	//join the game, change the game state, and render the page
	document.getElementById('join').onclick = function() {
		socket.emit('join');
		gameState = 'waiting';
		pageChange();
	};

	document.getElementById('prevConversation').onclick = () => {
		fetch('find')
			.then((res) => res.json())
			.then((data) => {
				// console.log(data);
				document.getElementById('root').innerHTML = PreviousConversationPage(data);
			})
			.catch((err) => {
				console.log(err);
			});
	};
});

// first prompt
socket.on('prompt', function(data) {
	prevOne = document.getElementById('prev-one');
	submitFormOne = document.getElementById('submit-form-one');
	contentOne = document.getElementById('contentOne');
	// add prompt to the first one
	prevOne.innerHTML = `${data}`;

	if (prevOne.classList.contains('hiddenClassOne')) {
		prevOne.classList.remove('hiddenClassOne');
	}

	if (submitFormOne.classList.contains('hiddenClassOne')) {
		submitFormOne.classList.remove('hiddenClassOne');
	}

	submitFormOne.addEventListener('submit', (event) => {
		event.preventDefault();
		submitFormOne.classList.add('hiddenClassOne');

		let answer = document.getElementById('answer-input-one').value;

		socket.emit('message', answer);

		return false;
	});
});

// second prompt
socket.on('promptTwo', function(data) {
	prevTwo = document.getElementById('prev-two');
	submitFormTwo = document.getElementById('submit-form-two');
	contentTwo = document.getElementById('contentTwo');
	// add prompt to the first one
	prevTwo.innerHTML = `${data}`;

	if (prevTwo.classList.contains('hiddenClassTwo')) {
		prevTwo.classList.remove('hiddenClassTwo');
	}

	if (submitFormTwo.classList.contains('hiddenClassTwo')) {
		submitFormTwo.classList.remove('hiddenClassTwo');
	}

	submitFormTwo.addEventListener('submit', function(event) {
		event.preventDefault();
		submitFormTwo.classList.add('hiddenClassTwo');

		let answer2 = document.getElementById('answer-input-two').value;

		socket.emit('messageTwo', answer2);

		return false;
	});
});

socket.on('message', function(answer) {
	// add message innerHTML
	prevOne.innerHTML = `${answer}`;
	console.log(answer);

	if (prevOne.classList.contains('hiddenClassOne')) {
		prevOne.classList.remove('hiddenClassOne');
	}

	submitFormOne.addEventListener('submit', (event) => {
		event.preventDefault();
		submitFormOne.classList.add('hiddenClassOne');

		let answer = document.getElementById('answer-input-one').value;

		socket.emit('message', answer);

		return false;
	});
});

socket.on('messageTwo', function(answer) {
	// add message innerHTML
	prevTwo.innerHTML = `${answer}`;
	console.log(answer);

	if (prevTwo.classList.contains('hiddenClassTwo')) {
		prevTwo.classList.remove('hiddenClassTwo');
	}

	submitFormTwo.addEventListener('submit', function(event) {
		event.preventDefault();
		submitFormTwo.classList.add('hiddenClassTwo');

		let answer2 = document.getElementById('answer-input-two').value;

		socket.emit('messageTwo', answer2);

		return false;
	});
});

socket.on('allMessages', (data) => {
	prevOne.innerHTML = '';

	for (let index in data) {
		let element = data[index];
		if (index % 2 == 0) {
			prevOne.innerHTML += `<p class = "evenMsgs"> ${element} </p>`;
		} else {
			prevOne.innerHTML += `<p class = "oddMsgs"> ${element} </p>`;
		}
	}
});

socket.on('allMessages2', (data) => {
	prevTwo.innerHTML = '';

	for (let index in data) {
		let element = data[index];
		if (index % 2 == 0) {
			prevTwo.innerHTML += `<p class = "evenMsgs"> ${element} </p>`;
		} else {
			prevTwo.innerHTML += `<p class = "oddMsgs"> ${element} </p>`;
		}
	}
});

socket.on('go', function() {
	if (submitFormOne.classList.contains('hiddenClassOne')) {
		submitFormOne.classList.remove('hiddenClassOne');
	}
});

socket.on('goTwo', function() {
	if (submitFormTwo.classList.contains('hiddenClassTwo')) {
		submitFormTwo.classList.remove('hiddenClassTwo');
	}
});

socket.on('currentIndexOne', function(data) {
	currentIndexOne = data;

	setCurrent('positionOne', currentIndexOne);
});

socket.on('currentIndexTwo', function(data) {
	currentIndexTwo = data;
	setCurrent('positionTwo', currentIndexTwo);
});

socket.on('end', function(data) {
	contentOne.innerHTML = '';

	for (let index in data) {
		let element = data[index];

		if (index == 0) {
			contentOne.innerHTML += `<h3 class="prompt"> ${element} </h3>`;
		} else {
			if (index % 2 == 0) {
				contentOne.innerHTML += `<p class = "evenMsgs"> ${element} </p>`;
			} else {
				contentOne.innerHTML += `<p class = "oddMsgs"> ${element} </p>`;
			}
		}
	}
});

socket.on('endTwo', function(data) {
	contentTwo.innerHTML = '';

	for (let index in data) {
		let element = data[index];

		if (index == 0) {
			contentTwo.innerHTML += `<h3 class="prompt"> ${element} </h3>`;
		} else {
			if (index % 2 == 0) {
				contentTwo.innerHTML += `<p class = "evenMsgs"> ${element} </p>`;
			} else {
				contentTwo.innerHTML += `<p class = "oddMsgs"> ${element} </p>`;
			}
		}
	}
});

function createQueue(div, length, myPos) {
	let visualizeDiv = document.getElementById(div);
	for (let i = 0; i < length; i++) {
		const newDiv = document.createElement('div');
		let newContent;
		if (i == myPos) {
			newContent = document.createTextNode('Me ');
		} else {
			newContent = document.createTextNode('Player ' + (i + 1));
		}
		newDiv.appendChild(newContent);
		newDiv.classList.add('queue-element');
		visualizeDiv.appendChild(newDiv);
	}
}

function setCurrent(div, currentIndex) {
	let visualizeDiv = document.getElementById(div);
	let allDivs = visualizeDiv.children;
	for (let i = 0; i < allDivs.length; i++) {
		if (allDivs[i].classList.contains('current-player')) {
			allDivs[i].classList.remove('current-player');
		}
		if (i == currentIndex) {
			allDivs[i].classList.add('current-player');
		}
	}
}
