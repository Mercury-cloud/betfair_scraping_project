window.addEventListener('message', function (event) {
	console.log('Message arrived from Extention Content Script.');
   	console.log(event.data);
}, false);

// setInterval(function() {
	window.postMessage({action: 'GOT_DUCK', payload: 'duck'}, '*');	
// }, 3000);



