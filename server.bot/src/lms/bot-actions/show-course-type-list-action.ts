import { AttachmentLayout, EntityRecognizer, Message, Session, IIsAttachment } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course, CourseCategory, CourseType } from '../models';
import { ResourceSet } from '../resource-set';
import { ArrayHelper } from '../../common/helpers/array-helper';
import { Comparer } from '../../common/comparer';
import { SortDirection } from '../../common/common';

const resourceSet = ResourceSet.instance;

export class ShowCourseTypeListAction {
    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        session.endDialog();
    }
}