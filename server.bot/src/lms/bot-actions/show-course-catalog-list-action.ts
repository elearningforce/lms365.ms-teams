import { AttachmentLayout, Message, Session, EntityRecognizer, IIsAttachment } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course, CourseCatalog } from '../models';
import { ArrayHelper } from '../../common/helpers/array-helper';

export class ShowCourseCatalogListAction implements Action {
    public handle(session: Session, lmsContext: LmsContext, args: any) {
        lmsContext.modelStorages.courseCatalogs.getAll()
            .then(courseCatalogs => {
                const chunks = ArrayHelper.split<CourseCatalog>(courseCatalogs, 10);

                for (let i = 0; i < chunks.length; i++) {
                    const attachments: IIsAttachment[] = [];
                    const chunk = chunks[i];

                    for (let j = 0; j < chunk.length; j++) {
                        const courseCatalog = chunk[j];
                        const attachment = lmsContext.attachmentBuilders.courseCatalogs.buildListItem(courseCatalog, i * 10 + j, courseCatalogs.length);

                        attachments.push(attachment);
                    }

                    const message = new Message(session)
                        .attachmentLayout(AttachmentLayout.carousel)
                        .attachments(attachments);

                    session.send(message);
                }

                session.endDialog();
            });
    }
};