import { AttachmentLayout, EntityRecognizer, Message, Session, IIsAttachment } from 'botbuilder';
import { ActionDefinition } from './action';
import { LmsContext } from '../lms-context';
import { Course, CourseCategory, CourseType } from '../models';
import { ResourceSet } from '../resource-set';
import { ArrayHelper } from '../../common/helpers/array-helper';
import { Comparer } from '../../common/comparer';
import { SortDirection } from '../../common/common';

const resourceSet = ResourceSet.instance;

export class SearchCourseCategoryListActionHandler {
    public static readonly instance: SearchCourseCategoryListActionHandler = new SearchCourseCategoryListActionHandler();

    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        const courseCategories = await lmsContext.modelStorages.courseCategories.getAll();
        const comparer = (x, y) => Comparer.instance.compare(x.courses.length, y.courses.length, SortDirection.Descending);
        const courseCategoryChunks = ArrayHelper.split(courseCategories.sort(comparer), 6);

        for (let i = 0; i < courseCategoryChunks.length; i++) {
            const attachment = lmsContext.attachmentBuilders.courseCategories
                .buildList(i == 0 ? resourceSet.CourseCategoryList_Title : null, courseCategoryChunks[i]);
            const message = new Message(session).addAttachment(attachment);

            session.send(message);
        }

        session.endDialog();
    }
}

export const ShowCourseCategoryList: ActionDefinition = {
    action: SearchCourseCategoryListActionHandler.instance.handle.bind(SearchCourseCategoryListActionHandler.instance),
    key: 'ShowCourseCategoryList',
    title: 'Show Course Categories'
};