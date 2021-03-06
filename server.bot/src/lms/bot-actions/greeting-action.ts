import { Message, Session } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';

export class GreetingAction implements Action {
    public async handle(session: Session, lmsContext: LmsContext, args: any, next: any) {
        const tenantInfo = await lmsContext.modelStorages.tenantInfo.get();
        const attachment = lmsContext.attachmentBuilders.greeting.build(tenantInfo);
        const message = new Message(session).addAttachment(attachment);

        session.send(message);

        session.endDialog();
    }
}