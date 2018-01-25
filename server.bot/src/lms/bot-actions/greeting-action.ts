import { Message, Session, EntityRecognizer } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course } from '../models';

export class GreetingAction implements Action {
    public async handle(session: Session, lmsContext: LmsContext, args: any, next: any) {
        const attachment = lmsContext.attachmentBuilders.greeting.build();
        const message = new Message(session).addAttachment(attachment);

        session.send(message);

        session.endDialog();
    }
}