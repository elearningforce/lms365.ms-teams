import { Course, CourseSession, CourseType } from './models';
import { ResourceSet } from './resource-set';
import { ModelFilterFactory } from './model-filters';
import { CommonHelper } from './helpers/common-helper';
import { DateFormat, Formatter } from '../common/formatter';
import { ArrayHelper } from '../common/helpers/array-helper';
import { DateTimeHelper } from '../common/helpers/date-time-helper';

const courseFields = CommonHelper.Fields.Course;
const courseSessionFields = CommonHelper.Fields.CourseSession;
const resourceSet = ResourceSet.instance;

export interface ModelMetadata<T> {
    titleGetter: (model: T) => string;
    valueGetter: (model: T) => string;
}

export interface ModelMetadataProvider<T> {
    get(field: string): ModelMetadata<T>;
}

export class CourseMetadataProvider implements ModelMetadataProvider<Course> {
    private _modelFilters: ModelFilterFactory;
    private _modelMetadataProviders: ModelMetadataProviderFactory;

    public constructor(modelFilters: ModelFilterFactory, modelMetadataProviders: ModelMetadataProviderFactory) {
        this._modelFilters = modelFilters;
        this._modelMetadataProviders = modelMetadataProviders;
    }

    private _metadataByField: { [field: string]: ModelMetadata<Course> } = {
        [courseFields.AdminNames]: {
            titleGetter: (course: Course) => resourceSet.Trainers,
            valueGetter: (course: Course) => course.admins.map(x => `<a class="ef-link" href="mailto:${x.email}">${x.title}</a>`).join(', ')
        },
        [courseFields.CategoryNames]: {
            titleGetter: (course: Course) => resourceSet.Category,
            valueGetter: (course: Course) => course.categories.map(x => x.name).join(', ')
        },
        [courseFields.CourseId]: {
            titleGetter: (course: Course) => course.type == CourseType.TrainingPlan ? resourceSet.TrainingPlanID : resourceSet.CourseID,
            valueGetter: (course: Course) => course.courseId
        },
        [courseFields.Duration]: {
            titleGetter: (course: Course) => resourceSet.Duration_Section_Title,
            valueGetter: (course: Course) => course.duration
        },
        [courseFields.Points]: {
            titleGetter: (course: Course) => resourceSet.CEU_Points_Field,
            valueGetter: (course: Course) => course.points ? course.points.toString() : null
        },
        [courseFields.Session_Location]: {
            titleGetter: (course: Course) => resourceSet.Location,
            valueGetter: (course: Course) => {
                const activeCourseSessions = ArrayHelper.distinct(
                    this._modelFilters.courseSessions
                        .byActiveStatus()(course.courseSessions),
                    (x, y) => x.room && y.room && x.room.title == y.room.title);
                const locationMetadata = this._modelMetadataProviders.courseSessions.get(courseSessionFields.Location);

                return (activeCourseSessions.length != 0)
                    ? (activeCourseSessions.length == 1)
                        ? locationMetadata.valueGetter(activeCourseSessions[0])
                        : resourceSet.MoreThanOneLocation
                    : null;
            }
        },
        [courseFields.Session_StartDate]: {
            titleGetter: (course: Course) => resourceSet.Reports_StartDate,
            valueGetter: (course: Course) => {
                const activeCourseSessions = this._modelFilters.courseSessions.byActiveStatus()(course.courseSessions);
                const startDateMetadata = this._modelMetadataProviders.courseSessions.get(courseSessionFields.StartDate);

                return (activeCourseSessions.length != 0)
                    ? ((activeCourseSessions.length == 1)
                        ? startDateMetadata.valueGetter(activeCourseSessions[0])
                        : resourceSet.MoreThanOneDate)
                    : null;
            }
        },
        [courseFields.Type]: {
            titleGetter: (course: Course) => resourceSet.Type_Section_Title,
            valueGetter: (course: Course) => resourceSet.getCourseTypeName(course.type)
        }
    };

    public get(field: string): ModelMetadata<Course> {
        return this._metadataByField[field];
    }
}

export class CourseSessionMetadataProvider implements ModelMetadataProvider<CourseSession> {
    private readonly _formatter: Formatter;

    private readonly _metadataByField: { [field: string]: ModelMetadata<CourseSession> } = {
        [courseSessionFields.Location]: {
            titleGetter: (courseSession: CourseSession) => resourceSet.Location,
            valueGetter: (courseSession: CourseSession) => 
                courseSession.room
                    ? courseSession.room.location ? `${courseSession.room.title} (${courseSession.room.location})` : courseSession.room.title
                    : null
        },
        [courseSessionFields.StartDate]: {
            titleGetter: (courseSession: CourseSession) => resourceSet.Reports_StartDate,
            valueGetter: (courseSession: CourseSession) => this._formatter.toStringAsLocal(courseSession.startDate, DateFormat.DateAnTime)
        },
        [courseSessionFields.EndDate]: {
            titleGetter: (courseSession: CourseSession) => resourceSet.Reports_EndDate,
            valueGetter: (courseSession: CourseSession) => this._formatter.toStringAsLocal(courseSession.endDate, DateFormat.DateAnTime)
        },
        [courseSessionFields.StartDateTimezoned]: {
            titleGetter: (courseSession: CourseSession) => resourceSet.Reports_StartDate,
            valueGetter: (courseSession: CourseSession) => this._formatter.toStringAsLocal(DateTimeHelper.utcDate(courseSession.startDate), DateFormat.DateAnTime, courseSession.startDateTimeZoneOffset)
        },
        [courseSessionFields.EndDateTimezoned]: {
            titleGetter: (courseSession: CourseSession) => resourceSet.Reports_EndDate,
            valueGetter: (courseSession: CourseSession) => this._formatter.toStringAsLocal(DateTimeHelper.utcDate(courseSession.endDate), DateFormat.DateAnTime, courseSession.endDateTimeZoneOffset)
        }
    };

    public constructor(formatter: Formatter) {
        this._formatter = formatter;
    }

    public get(field: string): ModelMetadata<CourseSession> {
        return this._metadataByField[field];
    }
}

export class ModelMetadataProviderFactory {
    private _courses: CourseMetadataProvider;
    private _courseSessions: CourseSessionMetadataProvider;

    public constructor(modelFilters: ModelFilterFactory, formatter: Formatter) {
        this._courses = new CourseMetadataProvider(modelFilters, this);
        this._courseSessions = new CourseSessionMetadataProvider(formatter);
    }

    public get courses(): CourseMetadataProvider {
        return this._courses;
    }

    public get courseSessions(): CourseSessionMetadataProvider {
        return this._courseSessions;
    }
}