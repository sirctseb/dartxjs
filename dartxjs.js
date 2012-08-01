JSToDartCommunicator = (function() {

	var that = {};

	var handlers = [];
	var onceHandlers = [];

	// handle messages to check if they are for js,
	// and dispatch to handlers
	var dispatchMessage = function(event) {
		try {
			var pkt = JSON.parse(event.data);
			if(pkt.rcpt === "js") {
				// call handlers
				for(var handler in handlers) {
					handlers[handler](pkt.data);
				}
				// call once handlers
				for(var handler in onceHandlers) {
					onceHandlers[handlers](pkt.data);
				}
				// clear once handlers
				onceHandlers = [];
			}
		} catch (e) {
			// ignore exceptions
		}
	};

	// register for window message event
	if(window.addEventListener) {
		window.addEventListener.("message", dispatchMessage, false);
	} else if(window.attachEvent) {
		window.attachEvent("onmessage", dispatchMessage);
	} else {
		throw "Couldn't attach message event handler"
	}

	return {
		// send a message to dart
		sendMessage: function(data) {
			window.postMessage(JSON.stringify({"rcpt":"dart", "data":data}), window.location.href);
		},

		// add a function to be called when js gets a message
		addReceiver: function(f) {
			// add handler
			handlers.push(f);
		}
		// remove a function as a receiver
		removeReceiver: function(f) {
			// remove the function
			var index = handlers.indexOf(f);
			if(index !== -1) {
				handlers.splice(index, 1);
			}
		}

		// add a function to be called once when js gets a message
		receiveMessage: function(f) {
			// add handler
			onceHandlers.push(f);
		}
	}
})();

PostOffice = (function() {

	var that = {};

	var mailBoxes = {};

	// register with JSToDartCommunicator
	JSToDartCommunicator.addReceiver(deliverMail);

	var deliverMail = function(data) {
		if(data.address === undefined) return;
		if(mailBoxes[address] === undefined) return;
		mailBoxes[address](data.content);
	};

	return {
		sendMail: function(address, content) {
			JSToDartCommunicator.sendMessage({"address": address, "content": content});
		},

		registerMailBox: function(address, recipient) {
			mailBoxes[address] = recipient;
		},

		unregisterMailBox: function(address) {
			delete mailBoxes[address];
		}
	}
})();