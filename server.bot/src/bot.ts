import { IDialogWaterfallStep, IConnector, Message, Session, UniversalBot } from 'botbuilder';

export class Bot extends UniversalBot {
    public constructor(connector?: IConnector, defaultDialog?: IDialogWaterfallStep | IDialogWaterfallStep[], libraryName?: string) {
        super(connector, defaultDialog, libraryName);

        this.handleConversationUpdate = this.handleConversationUpdate.bind(this);

        //this.on('conversationUpdate', this.handleConversationUpdate);
    }

    private async handleConversationUpdate(message: any) {
    }
}