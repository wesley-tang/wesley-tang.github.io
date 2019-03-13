	/*			SENG 513 CHAT APP 		*/

//const BACKEND_URL = "http://localhost:3000";
 const BACKEND_URL = "https://chitrchatr.glitch.me/";

let user;
let onlineUsers = [];

function sanitize(message) {
	// Removing all html tag brackets
	return message.replace(/</g, "&lt").replace(/>/g, "&gt");
}

function setup(user){
	// If the user did not previously have a cookie set, set it now
	localStorage.setItem("session-token", user.id);

	$('#user').append(user.username);

	console.log("userid:" + user.id);
}

function setChatlog(chatlog){
	console.log("Received chatlog: " + chatlog);

	allMessages = "";

	for (let i = 0; i < chatlog.length; i++){
		allMessages += chatlog[i];
	}

	$('#messages').html(allMessages);
}

function setOnlineUsers(){
	onlineUsers.sort();

	allUsers = "";

	for (let i = 0; i < onlineUsers.length; i++){
		allUsers += "<li>" + onlineUsers[i] + "</li>";
	}

	console.log(onlineUsers);

	$('#other-users').html(allUsers);
}

function setUserName(name, socket){
	user.username = name;

	$('#user').text("Signed in as: " + name);

	socket.emit('user update', user);
}

function setColor(colour, socket){
	user.colour = colour;
	console.log(colour);

	socket.emit('user update', user);
}

function addMessage(author, timestamp, content){
	if (author) {

		console.log("Adding message");

		if (author.id === user.id)
			$('#messages').append("<li>" + timestamp + " " + "<strong style=\"color:#" + author.colour + ";\">" + author.username + "</strong> " + content +"</li>");
		
		else // DONT USE SPAN INT EH REAL THING LOL
			$('#messages').append("<li>" + timestamp + " " + "<span style=\"color:#" + author.colour + ";\">" + author.username + "</span> " + content +"</li>");
		}
	else {
		// If no user is given, then we assume it was a system generated message

		//todo gen special message

	}
}

// (Using jquery) Once the doc is ready, execute the following code
$(function () {
	// not specifying any URL defaults to trying to connect to the host that serves the page.
	// Connect to url
	let socket = io(BACKEND_URL);

	let token = localStorage.getItem("session-token");
	if (token !== "") {
		console.log("user exists, token:" + token);
		socket.emit('user login', token);
	} else {
		console.log("no token, creating new user");
		socket.emit('create user');
	}

	// Find the form and do the following when the user hits enter
	$('form').submit(function(e){
	  	e.preventDefault(); // prevents page reloading

	  	if ($('#input-box').val().length === 0) return;

	  	let message = sanitize($('#input-box').val());


	  	if (message[0].charAt(0) === "/") {
		// Retrieve input 
		let inp = message.substring(1, message.length);
		let inpArray = inp.split(" ");

		switch (inpArray[0]) {
			case "nick":
				console.log("Attempting to change username");
				if (inpArray.length < 2) {
					// addMessage(null, null, "Please provide the username you wish to switch to.");
					alert("Please provide the username you wish to switch to.");
				}
				else {
					if (inpArray[1].length > 20){
						// addMessage(null, null, "Username must be shorter than 21 characters");
						alert("Username must be shorter than 21 characters");
					}
					else if (inpArray[1].length < 1){
						// addMessage(null, null, "Invalid username, cannot be whitespace");
						alert("Invalid username, cannot be whitespace");
					}
					else {
						setUserName(inpArray[1], socket);
					}
				}
				
				break;
			case "nickcolour":
				if (inpArray.length < 2) {
					alert("Please provide the colour you wish to switch to.");
				}
				else {
					setColor(inpArray[1], socket);
				}
				break;
			}
		}
		else {

			console.log("Sending new message to server: " + message);

		  // Send the message to the server
		  socket.emit('new chat msg', {
		  	"author": user,
		  	"content": message
		  });
		}

		// Clear the form
		$('#input-box').val('');
		return false;
	});

	socket.on('user authed', function(chatState){

		console.log("User authed");

		user = chatState.user;

		setChatlog(chatState.chatlog);

		onlineUsers = chatState.onlineUsers;

		setOnlineUsers();

		setup(user);
		
	});


	socket.on('update chatlog', function(msg){
		console.log("MEssage received from server" + msg.content);

		addMessage(msg.author, msg.timestamp, msg.content);
	});

	socket.on('userlist update', function(userlist){
		console.log("Userlist updated");

		onlineUsers = userlist;

		setOnlineUsers();
	});

});