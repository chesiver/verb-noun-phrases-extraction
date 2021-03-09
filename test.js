const KeywordExtractor = require('./KeywordExtractor')

// var natural = require('natural');
// var tokenizer = new natural.SentenceTokenizer();
// console.log(tokenizer.tokenize('remind me buy eggs next monday'));

let sentence = 'create a task to make a proposal at 1pm tomorrow';
// sentence = 'get tasks with the subject organize a meeting with pinnacle'
// sentence = 'get task where the subject is send john his forms'
// sentence = 'create a reminder to buy eggs next monday'; 
// sentence = 'create reminder to call john at 2pm next week'
// sentence = 'create the task send the note to pinnacle'

// sentence = 'show the task details where organize a meeting with pinnacle systems is the subject and london is the location'
// sentence = 'create reminder to call amy'; // amy is 'N'
// sentence = 'create task due on 9/10/2020 called draw up proposal' //proposal is JJ
// sentence = 'get me the details for the task buy myself eggs' // not work... how to break ties? 

// sentence = 'set a reminder to call the guy from pyramid systems at 3:30pm'
// sentence = 'create task to buy ticket for Pinnacle as a gift and set a reminder to call the guy from pyramid systems at 3:30pm'
// sentence = 'create task to buy ticket for Pinnacle as a gift'

// sentence  = 'send for a demo for a demo'
// sentence = 'create a task to call Habitat for Humanity'
// sentence = 'create a task to send many pins'
// sentence = 'create a task with the subject send for a demo';
// sentence = 'create a task with send for a demo as the subject';
// sentence = 'for a demo for a demo'
// sentence = 'create reminder to call pinnacle next week';
// sentence = 'create a task with the subject as send for a demo';
// sentence = 'create task to ask Bob about his plans'
// sentence = 'create task ask pinnacle to fly to Seattle'
// sentence = 'get reminder with the subject meet with pinnacle'
// sentence = 'create a reminder that is called buy eggs at 5pm'

// sentence = 'create a proposal to invoice for a demo 3pm';
// sentence = 'create a task with the subject send for a demo as the subject'
// sentence = 'create a task with plan for a demo as the subject'
// sentence = 'create a task to call Bob at 3 pm'
// sentence = 'create task called invoice note'
// sentence = 'create a task to plan for a demo at 2pm tomorrow'
// sentence = 'create a task to plan for a demo at 2pm'
// sentence = 'create a reminder to call Bob at 2 pm'
// sentence = 'create a task to invoice the orders'
// sentence = 'create a task to review the proposal'
// sentence = 'create a task to call Habitat for Humanity'
// sentence = 'create a task called buy eggs'
// sentence = 'create a task called plan for a demo for a demo for a demo'
// // sentence = 'amy'

// sentence = "as the next steps, call support to escalate the critical SRS"
// sentence = 'create a task to plan for a demo next week'
// sentence = 'create a task to plan for a demo'

/**
 * From confluence page
 */

// sentence = 'sent meeting invite to Daisy and Jason to schedule our call'
// sentence = 'Asked her for time next week for design call w/ Jason and got apptmt for next Thurs at 11 am our time'
// sentence = 'Perhaps interested in Autostore where we are able to label everything and send it to folders'
// sentence = 'Need to set up a follow up call with her and engage Garbo'
// sentence = 'sent Daisy meeting invite for AR today'
/**
 * Problematic ones
 */
// sentence = 'Set the lvl of expectation that she values our product and she is open to a copier w/ color, scanning and fax option';
// sentence = 'Said Daisy is office mgr and she tried to reach her but was not free'
// sentence = 'called and spoke to Andrea'

let a = KeywordExtractor.extractSubject(sentence);
console.log(a);
