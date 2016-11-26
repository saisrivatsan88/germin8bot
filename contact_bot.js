/*-----------------------------------------------------------------------------
This Bot demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. The example also shows how to use 
UniversalBot.send() to push notifications to a user.

For a complete walkthrough of creating this bot see the article below.

    http://docs.botframework.com/builder/node/guides/understanding-natural-language/

-----------------------------------------------------------------------------*/

var builder = require('../../core/');
var request = require('request');
var querystring = require('querystring');

// Create bot and bind to console
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

// Add global LUIS recognizer to bot
var model = process.env.model || 'https://api.projectoxford.ai/luis/v2.0/apps/28468b72-a422-491d-8d4f-2cec15f5590a?subscription-key=352e01ce45f24ce69b83de41793db8bb';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

dialog.onDefault(builder.DialogAction.send("Hi. We could not understand your request. If you could DM your contact number. Our officials will get in touch with you."));

dialog.matches('Query', [
	function(session, args, next) {
		request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=3a8061b7aef841668082920e074f842e&question=' + querystring.escape(session.message.text), function (error, response, body) { 
			var json = JSON.parse(body);
			var answer = json.answer;
			if(answer == "No good match found in the KB") {
				request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=7344dc016a5240a9a794dd7cf6b4ef15&question=' + querystring.escape(session.message.text), function (error, response, body) {
					var json = JSON.parse(body);
        	        	        var answer = json.answer;
					if(answer == "No good match found in the KB") {
                		                session.send("We could not understand your request. If you could DM your contact number. Our officials will get in touch with you.");
                        		} else {
		                                session.send(json.answer);
                		        }
				})
			} else {
				session.send(json.answer);
			}
		 });
	}
]);

dialog.matches('Personal Information', [
	function(session, args, next) {
		var intent = args.intent;
		var entities = args.entities;
		session.userData.number = args.entities[0].entity;
		session.send('Thank you for your contact information %s . Our official will soon get in touch with you to resolve your issue!!', session.userData.number);
		session.userData.number = null;	
	}
]);

dialog.matches('Complaint', [
	function(session, args, next) {
                if(!session.userData.number) {
                        session.send('We regret the inconvenience caused. Please DM us your contact number so that our officials could get in touch with you!!');
                }
	}
]);

dialog.matches('Appreciation', [
	function(session, args, next) {
                session.send("Thank you for your kind words!!");
		request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=3a8061b7aef841668082920e074f842e&question=' + querystring.escape(session.message.text), function (error, response, body) { 
                        var json = JSON.parse(body);
                        var answer = json.answer;
                        if(answer != "No good match found in the KB") {
                                session.send(json.answer);
                        } else {
				request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=7344dc016a5240a9a794dd7cf6b4ef15&question=' + querystring.escape(session.message.text), function (error, response, body) {
					var json = JSON.parse(body);
                		        var answer = json.answer;
					if(answer != "No good match found in the KB") {
						session.send(json.answer);
		                        }
				})
			}
                 });
        }
]);

dialog.matches('Greeting', [
	function(session, args, next) {
                session.send("Hello!! How may we assist you?");
        }
]);


