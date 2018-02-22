import { IConnector, IConversationUpdate, IDialogWaterfallStep, IMessage, Session, UniversalBot } from 'botbuilder';
import { AzureBotStorage, AzureTableClient } from 'botbuilder-azure';
import { ComposeExtensionResponse, TeamsChatConnector } from 'botbuilder-teams';
import { ActionDefinition, wrapAction } from './lms/bot-actions/action-definition';
import { ActionDefinitionList } from './lms/bot-actions/action-definition-list';
import { LmsContextProvider } from './lms/lms-context-provider';
import { ResourceSet } from './lms/resource-set';

const resourceSet = ResourceSet.instance;

export class Bot extends UniversalBot {
    public constructor(connector?: IConnector, defaultDialog?: IDialogWaterfallStep | IDialogWaterfallStep[], libraryName?: string) {
        super(connector, defaultDialog, libraryName);

        this.initializeStorage();

        this.registerDialog(ActionDefinitionList.Greeting);
        this.registerDialog(ActionDefinitionList.Help);
        this.registerDialog(ActionDefinitionList.SearchCourseList);
        this.registerDialog(ActionDefinitionList.SelectCourseCatalog);
        this.registerDialog(ActionDefinitionList.ShowCourseCatalogList);
        this.registerDialog(ActionDefinitionList.ShowCourseCategoryList);

        this.on('conversationUpdate', event => this.handleConversationUpdate(event));

        (connector as TeamsChatConnector).onQuery('searchCmd', (message: IMessage, query, callback) => this.handleQuery(message, query, callback));
    }

    private handleConversationUpdate(event: IConversationUpdate) {
        console.dir(event);
        
        if (event.membersAdded) {
            this.loadSession(event.address, async (error, session: Session) => {
                wrapAction(ActionDefinitionList.Greeting, event)(session, null, null);
        
                session.endDialog();
            });
        }
    }

    private handleQuery(message: IMessage, query, callback) {
        this.loadSession(message.address, async (error, session: Session) => {
            try {
                const searchKeyword = (query.parameters[0].name == 'searchKeyword') ? query.parameters[0].value : null;
                const lmsContext = await LmsContextProvider.instance.get(session, message);
                const promise = searchKeyword
                    ? lmsContext.modelStorages.courses.getByKeyword(searchKeyword)
                    : lmsContext.modelStorages.courses.getAll();
                const courses = await promise;
                const cards = courses.map((x, i) => lmsContext.attachmentBuilders.courses.build(x).toAttachment());
                const response = ComposeExtensionResponse.result('list').attachments(cards).toResponse();
        
                callback(null, response, 200);
            } catch (error) {
                const response = ComposeExtensionResponse.message().text(resourceSet.TenantNotAccessible).toResponse();

                callback(null, response, 200);

                console.log(error.message);
            }
        });
    }

    private initializeStorage() {
        const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
        const storageTable = 'Conversations';

        const tableClient = new AzureTableClient(storageTable, storageAccountName, storageAccountKey);
        const botStorage = new AzureBotStorage({ gzipData: false }, tableClient);

        this.set('storage', botStorage);
    }

    private registerDialog(actionDefinition: ActionDefinition) {
        this.dialog(actionDefinition.key, wrapAction(actionDefinition)).triggerAction({ matches: actionDefinition.key });
    }
}