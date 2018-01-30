import { AttachmentLayout, EntityRecognizer, Message, Session, IIsAttachment } from 'botbuilder';
import { Action } from './action-definition';
import { LmsContext } from '../lms-context';
import { Course, CourseCategory, CourseType } from '../models';
import { ResourceSet } from '../resource-set';
import { SortDirection } from '../../common/common';
import { Comparer } from '../../common/comparer';
import { ArrayHelper } from '../../common/helpers/array-helper';
import { SessionHelper } from '../../common/helpers/session-helper';

const resourceSet = ResourceSet.instance;

function getCourseType(value: string): CourseType {
    switch (value.toLowerCase()) {
        case 'e-learning':
            return CourseType.ELearning;
        case 'webinar':
            return CourseType.Webinar;
        case 'training plan':
            return CourseType.TrainingPlan;
        default:
            return CourseType.ClassRoom;
    }
}

export class SearchCourseListAction implements Action {
    private static attachCoursesToCategories(categories: CourseCategory[], courses: Course[]) {
        for (let category of categories) {
            const coursesByCategory = courses.filter(x => x.categories.find(y => y.id == category.id));

            category.courses = coursesByCategory;
        }
    }

    private sendMessageAboutCategories(session: Session, lmsContext: LmsContext, queryableCourseType: CourseType, courses: Course[]) {
        const allCourseCategories = ArrayHelper.selectMany(courses, x => x.categories);
        const uniqueCourseCategories = ArrayHelper.groupBy<CourseCategory>(allCourseCategories, x => x.id).map(x => x.values[0]);
        const comparer = (x, y) => Comparer.instance.compare(x.courses.length, y.courses.length, SortDirection.Descending);

        SearchCourseListAction.attachCoursesToCategories(uniqueCourseCategories, courses);

        const courseCategoryChunks = ArrayHelper.split(uniqueCourseCategories.sort(comparer), 6);

        for (let i = 0; i < courseCategoryChunks.length; i++) {
            const message = new Message(session);
            const attachment = lmsContext.attachmentBuilders.courseCategories
                .buildListWithCourseTypeFilter(i == 0 ? resourceSet.MoreThanPageCourseCount : null, queryableCourseType, courseCategoryChunks[i]);

            message.addAttachment(attachment);

            session.send(message);
        }
    }

    private sendMessageAboutCourses(session: Session, lmsContext: LmsContext, queryableCourseType: CourseType, queryableCategoryName: string, courses: Course[]) {
        courses = courses.sort((x, y) => Comparer.instance.compare(x.title, y.title));

        if (courses.length) {
            const attachments: IIsAttachment[] = [];

            if (!queryableCategoryName) {
                if (courses.length > 10) {
                    this.sendMessageAboutCategories(session, lmsContext, queryableCourseType, courses);
                } else {
                    for (let i = 0; i < courses.length; i++) {
                        const course = courses[i];
                        const attachment = lmsContext.attachmentBuilders.courses.buildListItem(course, i, courses.length);

                        attachments.push(attachment);
                    }

                    const message = new Message(session)
                        .attachmentLayout(AttachmentLayout.carousel)
                        .attachments(attachments);

                    session.send(message);
                }
            } else {
                SessionHelper.sendCards(session, courses, (x, i, count) => lmsContext.attachmentBuilders.courses.buildListItem(x, i, count));
            }
        } else {
            session.send(resourceSet.CourseList_NoItems);
        }
    }

    public async handle(session: Session, lmsContext: LmsContext, args: any) {
        const categoryEntity = EntityRecognizer.findEntity(args.intent.entities, 'Category');
        const courseTypeEntity = EntityRecognizer.findEntity(args.intent.entities, 'CourseType');
        const categoryName: string = categoryEntity ? (categoryEntity as any).entity : null;
        const courseType: CourseType = courseTypeEntity
            ? getCourseType((courseTypeEntity as any).resolution ? (courseTypeEntity as any).resolution.values[0] : courseTypeEntity.entity)
            : null;
        let promise: Promise<Course[]>;

        if (courseType && categoryName) {
            promise = lmsContext.modelStorages.courses.getByTypeAndCategoryName(courseType, categoryName);
        } else if (courseType) {
            promise = lmsContext.modelStorages.courses.getByType(courseType);
        } else if (categoryName) {
            promise = lmsContext.modelStorages.courses.getByCategoryName(categoryName);
        } else {
            promise = lmsContext.modelStorages.courses.getAll();
        }

        const courses = await promise;

        if (courseType && categoryName) {
            session.send(resourceSet.CourseList_LoadingByCourseTypeAndCategoryName(courseType, categoryName));
        } else if (courseType) {
            session.send(resourceSet.CourseList_LoadingByCourseType(courseType));
        } else if (categoryName) {
            session.send(resourceSet.CourseList_LoadingByCategoryName(categoryName));
        } else {
            session.send(resourceSet.CourseList_LoadingAll);
        }

        this.sendMessageAboutCourses(session, lmsContext, courseType, categoryName, courses);

        session.endDialog();
    }
}