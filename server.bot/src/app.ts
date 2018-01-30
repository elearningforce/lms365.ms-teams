import * as env from 'dotenv-extended';
import * as restify from 'restify';
import { TeamsChatConnector } from 'botbuilder-teams';
import { Bot } from './bot';
import { LuisRecognizer } from './luis-recognizer';
import { wrapAction } from './lms/bot-actions/action-definition';
import { ActionDefinitionList } from './lms/bot-actions/action-definition-list';

env.load();

const server = restify.createServer();
const port = process.env.port || process.env.PORT || 3978;
const appId = process.env.MICROSOFT_APP_ID;
const appPassword = process.env.MICROSOFT_APP_PASSWORD;
const luisModelUrl = process.env.LUIS_MODEL_URL;
const connector = new TeamsChatConnector({ appId: appId, appPassword: appPassword });
const recognizer = new LuisRecognizer(luisModelUrl);

export const bot = new Bot(connector, [wrapAction(ActionDefinitionList.None)]);

bot.recognizer(recognizer);

server.post('/api/messages', connector.listen());
server.listen(port, () => {
    console.log(`Server started (port: ${port}).`);
});