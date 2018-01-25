import * as env from 'dotenv-extended';
import * as restify from 'restify';
import { IMessage, Message, Session } from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import { Bot } from './bot';
import { LuisRecognizer } from './luis-recognizer';
import { ActionDefinition, wrapAction } from './lms/bot-actions/action-definition';
import { ActionDefinitionList } from './lms/bot-actions/action-definition-list';
import { LmsContextProvider } from './lms/lms-context-provider';

env.load();

const server = restify.createServer();
const port = process.env.port || process.env.PORT || 3978;
const appId = process.env.MICROSOFT_APP_ID;
const appPassword = process.env.MICROSOFT_APP_PASSWORD;
const luisModelUrl = process.env.LUIS_MODEL_URL;
const connector = new teamBuilder.TeamsChatConnector({ appId: appId, appPassword: appPassword });
const recognizer = new LuisRecognizer(luisModelUrl);

export const bot = new Bot(connector, [wrapAction(ActionDefinitionList.None)]);

bot.recognizer(recognizer);

function registerDialog(actionDefinition: ActionDefinition) {
    bot.dialog(actionDefinition.key, wrapAction(actionDefinition)).triggerAction({ matches: actionDefinition.key });
}

registerDialog(ActionDefinitionList.Greeting);
registerDialog(ActionDefinitionList.Help);
registerDialog(ActionDefinitionList.SearchCourseList);
registerDialog(ActionDefinitionList.SelectCourseCatalog);
registerDialog(ActionDefinitionList.ShowCourseCatalogList);
registerDialog(ActionDefinitionList.ShowCourseCategoryList);

connector.onQuery('searchCmd', (message: IMessage, query, callback) => {
    bot.loadSession(message.address, async (error, session: Session) => {
        const searchKeyword = (query.parameters[0].name == 'searchKeyword') ? query.parameters[0].value : null;
        const lmsContext = await LmsContextProvider.instance.get(session, message);
        const promise = searchKeyword
            ? lmsContext.modelStorages.courses.getByKeyword(searchKeyword)
            : lmsContext.modelStorages.courses.getAll();
        const courses = await promise;
        const cards = courses.map((x, i) => lmsContext.attachmentBuilders.courses.build(x).toAttachment());
        const response = teamBuilder.ComposeExtensionResponse.result('list').attachments(cards).toResponse();

        callback(null, response, 200);
    });
});

server.post('/api/messages', connector.listen());
server.listen(port, () => {
    console.log(`Server started (port: ${port}).`);
});