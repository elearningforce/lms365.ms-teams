import * as env from 'dotenv-extended';
import * as restify from 'restify';
import { IMessage, Message, Session } from 'botbuilder';
import * as teamBuilder from 'botbuilder-teams';
import { Bot } from './bot';
import { LuisRecognizer } from './luis-recognizer';
import { wrapAction } from './lms/bot-actions/action';
import { SearchCourseList } from './lms/bot-actions/search-course-list';
import { SelectCourseCatalog } from './lms/bot-actions/select-course-catalog';
import { ShowCourseCatalogList } from './lms/bot-actions/show-course-catalog-list';
import { ShowCourseCategoryList } from './lms/bot-actions/show-course-category-list';
import { Greeting, Help } from './lms/bot-actions/greeting';
import { LmsContextProvider } from './lms/lms-context-provider';
import { None } from './lms/bot-actions/none';

env.load();

const server = restify.createServer();
const port = process.env.port || process.env.PORT || 3978;
const appId = process.env.MICROSOFT_APP_ID;
const appPassword = process.env.MICROSOFT_APP_PASSWORD;
const luisModelUrl = process.env.LUIS_MODEL_URL;
const connector = new teamBuilder.TeamsChatConnector({ appId: appId, appPassword: appPassword });
const recognizer = new LuisRecognizer(luisModelUrl);

export const bot = new Bot(connector, [wrapAction(None)]);

bot.recognizer(recognizer);

bot.dialog(Greeting.key, wrapAction(Greeting)).triggerAction({ matches: Greeting.key });
bot.dialog(Help.key, wrapAction(Help)).triggerAction({ matches: Help.key });
bot.dialog(SearchCourseList.key, wrapAction(SearchCourseList)).triggerAction({ matches: SearchCourseList.key });
bot.dialog(SelectCourseCatalog.key, wrapAction(SelectCourseCatalog)).triggerAction({ matches : SelectCourseCatalog.key });
bot.dialog(ShowCourseCatalogList.key, wrapAction(ShowCourseCatalogList)).triggerAction({ matches: ShowCourseCatalogList.key });
bot.dialog(ShowCourseCategoryList.key, wrapAction(ShowCourseCategoryList)).triggerAction({ matches: ShowCourseCategoryList.key });

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