import { AttachmentLayout, IIsAttachment, Message, Session } from 'botbuilder';
import { ArrayHelper } from './array-helper';

export class SessionHelper {
    public static sendCards(session: Session, models: any[], attachmentCreator: (model: any, index: number, count: number) => IIsAttachment) {
        const chunks = ArrayHelper.split<any>(models, 10);

        for (let i = 0; i < chunks.length; i++) {
            const attachments: IIsAttachment[] = [];
            const chunk = chunks[i];
            const startPageIndex = i * 10;
            const endPageIndex = (((i + 1) * 10) > models.length)
                ? (i * 10 + models.length % 10)
                : ((i + 1) * 10);

            for (let j = 0; j < chunk.length; j++) {
                const model = chunk[j];
                const attachment = attachmentCreator(model, startPageIndex + j, endPageIndex);

                attachments.push(attachment);
            }

            const message = new Message(session)
                .attachmentLayout(AttachmentLayout.carousel)
                .attachments(attachments);

            session.send(message);
        }
    }
}