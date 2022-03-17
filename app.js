require("dotenv").config()
const express = require('express');
const { App, ExpressReceiver} = require('@slack/bolt');



const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
receiver.router.use(express.json());
receiver.router.use(express.urlencoded({ extended: true }));
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
//   customRoutes: [
//     {
//       path: '/slack/menu',
//       method: ['POST']
//     },
//   ],
//  s
});



// app.action('/slack/menu', async({ack, say}) => {
// 	console.log(payload);
// 	await ack();
// 	await say('Request approved 👍');
// })


// Other web requests are methods on receiver.router

  


  app.shortcut({ callback_id: 'emojiclicker', type: 'message_action' }, async ({ shortcut, ack, client, logger }) => {
    try {
      // Acknowledge shortcut request
      await ack();

      // Call the views.open method using one of the built-in WebClients
      const result = await client.views.open({
        trigger_id: shortcut.trigger_id,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "My App"
          },
          close: {
            type: "plain_text",
            text: "Close"
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
                }
              ]
            }
          ]
        }
      });

      logger.info(result);
    }
    catch (error) {
      logger.error(error);
    }
  });

receiver.router.post('/', async (req, res) => {
	
	const payload = JSON.parse(req.body.payload)
	console.log(payload);
	// You're working with an express req and res now.
	res.status(200).send({text: "hey buddy"});
  });



// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
	console.log('something happening approve botton');
	await ack();
	// Update the message to reflect the action
  });


// reaction_added
// reaction_removed
app.event('reaction_added', async({event, client, logger}) => {

	console.log(event);
	
	const user = await client.users.profile.get({user: event.user})
	console.log(user.profile.display_name);

	const result = await client.conversations.history({
		channel: event.item.channel,
		latest: event.item.ts,
		inclusive: true,
		limit: 1
	})

	const peopleInChat = await client.conversations.members({channel: event.item.channel})
	console.log(result.messages[0])
	console.log(peopleInChat.members, ' peopel in chat members')

	// // have to filter non bots
	// const users = await client.users.profile.get({users: peopleInChat.members})

	// const promisesUserInfo = peopleInChat.members.map((personId) => client.users.profile.get({user: personId}));
	// const userInfo = await Promise.all(promisesUserInfo)
	// console.log(userInfo)

})


// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
	console.log(message);
	// say() sends a message to the channel where the event was triggered
	await say(`Hey there <@${message.user}>!`);
  });

(async () => {
	// Start your app
	await app.start(process.env.PORT || 5001);
  
	console.log('⚡️ Bolt app is running!');
  })();