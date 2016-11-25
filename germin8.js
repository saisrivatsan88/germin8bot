/*-----------------------------------------------------------------------------
This Bot demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. The example also shows how to use 
UniversalBot.send() to push notifications to a user.

For a complete walkthrough of creating this bot see the article below.

    http://docs.botframework.com/builder/node/guides/understanding-natural-language/

-----------------------------------------------------------------------------*/

var builder = require('../../core/');

// Create bot and bind to console
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

// Add global LUIS recognizer to bot
var model = process.env.model || 'https://api.projectoxford.ai/luis/v2.0/apps/67d5502a-9512-467f-bebd-d5e8324cb08b?subscription-key=352e01ce45f24ce69b83de41793db8bb';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

dialog.onDefault(builder.DialogAction.send("Hi... I could not understand your request. If you could DM your contact number. Our officials will get in touch with you."));

dialog.matches('Query', [
	function(session, args, next) {
		session.send("We are looking into your query in our FAQs section. We shall get back to you!!");
	}
]);

dialog.matches('Complaint', [
	function(session, args, next) {
                session.send("We regret the inconvenience caused. Please DM us your contact number so that our officials could get in touch with you!!");
        }
]);

dialog.matches('Appreciation', [
	function(session, args, next) {
                session.send("Thank you for your kind words!!");
        }
]);

dialog.matches('Greeting', [
	function(session, args, next) {
                session.send("Hello!! How may we assist you?");
        }
]);


