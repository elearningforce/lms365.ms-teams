import { AttachmentLayout, Message, Session, EntityRecognizer, IIsAttachment } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course, CourseCatalog } from '../models';
import { ArrayHelper } from '../../common/helpers/array-helper';
import { SessionHelper } from '../../common/helpers/session-helper';
import { Comparer } from '../../common/comparer';

export class ShowCourseCatalogListAction implements Action {
    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        let courseCatalogs = await lmsContext.modelStorages.courseCatalogs.getAll();

        courseCatalogs = courseCatalogs.sort((x, y) => Comparer.instance.compare(x.title, y.title));

        SessionHelper.sendCards(
            session,
            courseCatalogs,
            (x, i, count) => lmsContext.attachmentBuilders.courseCatalogs.buildListItem(x, i, count));

        session.endDialog();
    }
};