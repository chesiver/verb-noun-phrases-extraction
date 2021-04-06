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
sentences = [
    'sent meeting invite to Daisy and Jason to schedule our call',
    'called Daisy and spoke to her. Asked her for time next week for design call w/ Jason and got apptmt for next Thurs at 11 am our time',
    'had AR with Daisy. Was a good success. Set the lvl of expectation that she values our product and she is open to a copier w/ color, scanning and fax option. Perhaps interested in Autostore where we are able to label everything and send it to folders. Need to set up a follow up call with her and engage Garbo',
    'sent Daisy meeting invite for AR today',
    'spoke to Daisy as she is the office mgr. She agreed to an AR for tomorrow at 3:30 pm central time, 2:30 el paso time. Send her meeting invite at primaverahomehealth@gmail.com',
    'called and spoke to Andrea. Said Daisy is office mgr and she tried to reach her but was not free. Got my # and will have her call me abt leo.',
    'called and finally spoke to someone important. Her name was Sierra. Lef',
    'called for Alex since no response via email still. Kathie tried to get him but he was in a meeting with dr. Will pass my info along again.',
    'called for Alex. Not in so left message with staff.',
    'emailed Alex for intro discussion for upgrade.',
    'called and reached out for Alex, but he wasn’t in the office. Hope to catch him via email and try to get this upgrade early',
    'new account acquired from Carmen. Called to see if I can get in touch with Alex, but lead dc’d after being on hold.',
    'Spoke with Mike - was unwilling to continue in scheduling an AR. Setting task for 90 day follow up and reattempt AR.',
    'had a successful AR with Micki. She said she would like something faster maybe and maybe smaller. (But doesn\'t seem possible cuz desktop is other alternative)',
    'called Mickie and got an AR for Monday at 2:30 pm with office mgr. ',
]

for (const sentence of sentences) {
    const a = KeywordExtractor.extractSubject(sentence);
    console.log(a);
    console.log('-----------------')
}

/**
 * Problematic ones
 */
// sentence = 'Said Daisy is office mgr and she tried to reach her but was not free'
// sentence = 'called and spoke to Andrea'
// sentence = 'called and finally spoke to someone important'
// sentence = 'Called to see if I can get in touch with Alex, but lead dc’d after being on hold'
// sentence = 'Setting task for 90 day follow up and reattempt AR'
// sentence = "called for Michelle since she said she would be back today but wasn't in until noon today until like 4ish"
// sentence = "called and reached out to office staff to re-intro myself and ask for Michelle as it seems she's office mgr."
// sentence = 'Next Steps to meet w/ Brian Utrup to present high level proposal to start project in EMEA in Nov 2019'
