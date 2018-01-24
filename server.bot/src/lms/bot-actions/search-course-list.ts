import { AttachmentLayout, EntityRecognizer, Message, Session, IIsAttachment } from 'botbuilder';
import { ActionDefinition } from './action';
import { LmsContext } from '../lms-context';
import { Course, CourseCategory, CourseType } from '../models';
import { ResourceSet } from '../resource-set';
import { ArrayHelper } from '../helpers/array-helper';

const resourceSet = ResourceSet.instance;

function getCourseType(value: string): CourseType {
    switch (value) {
        case 'e-Learning':
            return CourseType.ELearning;
        case 'Webinar':
            return CourseType.Webinar;
        case 'Training Plan':
            return CourseType.TrainingPlan;
        case 'Classroom & Blended':
            return CourseType.ClassRoom;
    }
}

export class SearchCourseListActionHandler {
    public static readonly instance: SearchCourseListActionHandler = new SearchCourseListActionHandler();

    private sendMessageAboutCategories(session: Session, lmsContext: LmsContext, queryableCourseType: CourseType, courses: Course[]) {
        const allCategories = ArrayHelper.selectMany(courses, x => x.categories);
        const uniqueCategories = ArrayHelper.groupBy<CourseCategory>(allCategories, x => x.id).map(x => x.values[0]);
        const message = new Message(session)
            .addAttachment(lmsContext.attachmentBuilders.courseCategories.buildListWithCourseTypeFilter(queryableCourseType, uniqueCategories));

        session.send(message);
    }

    private sendMessageAboutCourses(session: Session, lmsContext: LmsContext, queryableCourseType: CourseType, queryableCategoryName: string, courses: Course[]) {
        if (courses.length) {
            const attachments: IIsAttachment[] = [];
            const pagedCourses = courses.slice(0, 10);

            for (let i = 0; i < pagedCourses.length; i++) {
                const course = pagedCourses[i];
                const attachment = lmsContext.attachmentBuilders.courses.buildListItem(course, i, pagedCourses.length);

                attachments.push(attachment);
            }

            const message = new Message(session)
                .attachmentLayout(AttachmentLayout.carousel)
                .attachments(attachments);

            session.send(message);

            if (courses.length > 10 && !queryableCategoryName) {
                this.sendMessageAboutCategories(session, lmsContext, queryableCourseType, courses);
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
            ? getCourseType((courseTypeEntity as any).resolution.values[0])
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

export const SearchCourseList: ActionDefinition = {
    action: SearchCourseListActionHandler.instance.handle.bind(SearchCourseListActionHandler.instance),
    key: 'SearchCourseList',
    title: 'Search Courses'
};