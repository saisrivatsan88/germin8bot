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
var restify = require('restify');
//var builder = require('botbuilder');

var server = restify.createServer();
server.listen(3978, function() {
        console.log('Server started and listening to %s', server.url);
});

var connector = new builder.ChatConnector({
        appId: "767e605a-cb00-468d-93c5-d3005fb9aeda",
        appPassword: "jxBpCf7RP6FS8Wuhrkmp8gm"
});

// Create bot and bind to console
//var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Add global LUIS recognizer to bot
var model = process.env.model || 'https://api.projectoxford.ai/luis/v2.0/apps/28468b72-a422-491d-8d4f-2cec15f5590a?subscription-key=352e01ce45f24ce69b83de41793db8bb';
var recognizer = new builder.LuisRecognizer(model);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('Query', [
	function(session, args, next) {
		var anjan_bot = new Promise(function (resolve, reject) {
			request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=7344dc016a5240a9a794dd7cf6b4ef15&question='+ querystring.escape(session.message.text), 
				function (error, response, body) { 
					var json = JSON.parse(body);
					var answer = json.answer;
					if (error) {
						reject(error);
					} else {
						resolve(json);
					}
				});
		});
		
		var ashish_bot = new Promise(function (resolve, reject) {
			request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=3a8061b7aef841668082920e074f842e&question='+ querystring.escape(session.message.text), 
				function (error, response, body) {
					var json = JSON.parse(body);
					var answer = json.answer;

					if (error) {
						reject(error);
					} else {
						resolve(json);
					}
			});
		});

		Promise.all([anjan_bot, ashish_bot]).then(function (result, err) {
			if (!err) {
				var anjan_answer = result[0];
				var ashish_answer = result[1];
				if (anjan_answer.score > ashish_answer.score) {
					session.send(anjan_answer.answer);
				} else if (anjan_answer.score < ashish_answer.score) {
					session.send(ashish_answer.answer);
				} else {
					session.send("Hi. We could not understand your request. If you could DM your contact number. Our officials will get in touch with you.");
				}
			} else {
				session.send("Hi. We could not understand your request. If you could DM your contact number. Our officials will get in touch with you.");
			}
		});
	}
]);

intents.matches('Personal Information', [
	function(session, args, next) {
		var intent = args.intent;
		var entities = args.entities;
		//console.log("Log: " + args.entities);
		session.userData.number = args.entities[0].entity;
		session.send('Thank you for your contact information %s . Our official will soon get in touch with you to resolve your issue!!', session.userData.number);
		session.userData.number = null;	
	}
]);

intents.matches('Complaint', [
	function(session, args, next) {
                if(!session.userData.number) {
                        session.send('We regret the inconvenience caused. Please DM us your contact number so that our officials could get in touch with you!!');
                }
	}
]);

intents.matches('Appreciation', [
	function(session, args, next) {
                session.send("Thank you for your kind words!! You can contact us whenever you face any problem.");
		/*request('https://qnaservice.cloudapp.net/KBService.svc/GetAnswer?kbId=3a8061b7aef841668082920e074f842e&question=' + querystring.escape(session.message.text), function (error, response, body) { 
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
                 });*/
        }
]);

intents.matches('Greeting', [
	function(session, args, next) {
                session.send("Hello!! How may we assist you?");
        }
]);

intents.onDefault([
	function(session) {
                session.send('Hi. We could not understand your request. If you could DM your contact number. Our officials will get in touch with you.');
        }	
]);
