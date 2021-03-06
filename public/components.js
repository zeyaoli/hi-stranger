function Title() {
	return `<h1> Hi Stranger </h1>`;
}

function FrontPage() {
	return `
  <div id="front">
    ${Title()}
  <div class="instruction">
     <h3> Instruction </h3>
     <p>There are two conversations happening at the same time. 
        Each conversation has its own context, or feeling.
        Only the first person in each queue will see the context prompt.</p>
    <p>When the conversation gets to you, you will see the last person's message. 
        Please continue the conversation by answering their message and asking a new question for the next person, 
        keeping in mind what the general context seems to be (based on the message you received).</p>
    <p>Join the conversation by clicking the button below.
        When all players have joined, the first person can start the conversation.</p>
  </div>
    <button class="front-button" id="join">Join Room</button>
    <button class="front-button" id="prevConversation">Previous Conversation</button>
  </div>
`;
}

function getConversationElement(conversationData) {
	let singleConversation = document.getElementsByClassName('singleConversation');
	for (let index in conversationData.conversations) {
		let element = conversationData.conversations[index];
		console.log(`index ${index} : ${element}`);
		if (index == 0) {
			singleConversation.innerHTML += `<h3 class="prompt> ${element} </h3>`;
			//  `<h3 class="prompt> ${element} </h3>`;
		} else {
			if (index % 2 == 0) {
				singleConversation.innerHTML += `<p class="evenMsgs"> ${element} </p>`;
			} else {
				singleConversation.innerHTML += `<p class="oddMsgs"> ${element} </p>`;
			}
		}
	}
}

// ${getConversationElement(conversationData)}

function Conversation(conversationData) {
	return `<div class="singleConversation">
      ${conversationData.conversations
			.map((item, i) => {
				// console.log(`index ${i}:${item}`);
				return `${i == 0
					? `<h3 class="prompt">${item}</h3>`
					: i % 2 == 0 ? `<p class="evenMsgs"> ${item} </p>` : `<p class="oddMsgs"> ${item} </p>`}`;
			})
			.join('')}
  </div>
  `;
}

function Conversations(conversation) {
	return `<div class="conversations">
              ${conversation.map(Conversation).join('')}
          </div>
  `;
}

function PreviousConversationPage(conversationData) {
	return `
    ${Title()}
    ${Conversations(conversationData)}
  `;
}

function WaitingPage() {
	return `
    <div class="page">
    ${Title()}
    <div class="instruction">
    <p>Waiting For the Host (Player One) to Start the Conversation</p>
    </div>
    </div>
  `;
}

function StartPage() {
	return `
    <div class="page">
    ${Title()}
    <div class="instruction">You are the host, please start the game after everyone joins the room</div>
    <button id="start">Start Conversation</button>
    </div>
  `;
}

function InGamePage() {
	return `
    <div class="page">
      ${Title()}
      <div id="content">
      <div id="contentOne" class="contents">
        <!--       after the game, we will replace the whole content div with conversation and reset button -->
        <div id="positionOne">
          <!--       display each one's position here -->
        </div>

        <div id="prev-one"  class="hiddenClassOne">
          <!--         display context for the first person and prev message for rest of players -->
        </div>

        <form id="submit-form-one" class="hiddenClassOne">
          <h3>
            Now it's your turn to keep the conversation going
          </h3>
          <input type="text" name="answer" id="answer-input-one" />
          <button id="submit-button-one">
            Submit
          </button>
        </form>
      </div>

      <div id="contentTwo" class="contents">
        <div id="positionTwo">
          <!--       display each one's position here -->
        </div>

        <div id="prev-two" class="hiddenClassTwo">
          <!--         display context for the first person and prev message for rest of players -->
        </div>

        <form id="submit-form-two" class="hiddenClassTwo">
          <h3>
            Now it's your turn to keep the conversation going
          </h3>
          <input type="text" name="answer" id="answer-input-two" />
          <button id="submit-button-two">
            Submit
          </button>
        </form>
      </div>
      </div>

  </div>
  `;
}
