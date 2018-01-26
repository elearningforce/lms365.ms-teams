import { AttachmentLayout, Message, Session, EntityRecognizer, IIsAttachment } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course, CourseCatalog } from '../models';
import { ArrayHelper } from '../../common/helpers/array-helper';

export class ShowCourseCatalogListAction implements Action {
    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        const courseCatalogs = await lmsContext.modelStorages.courseCatalogs.getAll();
        const chunks = ArrayHelper.split<CourseCatalog>(courseCatalogs, 10);

        for (let i = 0; i < chunks.length; i++) {
            const attachments: IIsAttachment[] = [];
            const chunk = chunks[i];
            const startPageIndex = i * 10;
            const endPageIndex = (((i + 1) * 10) > courseCatalogs.length)
                ? (i * 10 + courseCatalogs.length % 10)
                : ((i + 1) * 10);

            for (let j = 0; j < chunk.length; j++) {
                const courseCatalog = chunk[j];
                const attachment = lmsContext.attachmentBuilders.courseCatalogs.buildListItem(courseCatalog, startPageIndex + j, endPageIndex);

                attachments.push(attachment);
            }

            const message = new Message(session)
                .attachmentLayout(AttachmentLayout.carousel)
                .attachments(attachments);

            session.send(message);
        }

        session.endDialog();
    }
};