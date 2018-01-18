import { ModelFilterFactory } from './model-filters';
import { Course, CourseType, User, CourseCategory, CourseSession, CourseCatalog } from './models';
import { EnumHelper } from './helpers/enum-helper';
import { Formatter } from './formatter';

export class ModelCreator {
    private _formatter: Formatter;
    private _modelFilter: ModelFilterFactory;
    private static _statusMap;

    public constructor(formatter?: Formatter, modelFilter?: ModelFilterFactory) {
        this._formatter = formatter;
        this._modelFilter = modelFilter;
    }

    public createCourse(source: any): Course {
        const publishing = source.Publishing
            ? {
                endDate: this.formatter.parseDate(source.Publishing.EndDate),
                isEnabled: source.Publishing.IsEnabled,
                startDate: this.formatter.parseDate(source.Publishing.StartDate)
            }
            : null;

        return {
            admins: source.Admins ? source.Admins.map(x => this.createUser(x)) : [],
            categories: source.Categories ? source.Categories.map(x => this.createCourseCategory(x)) : [],
            courseId: source.CourseID,
            description: source.Description,
            duration: source.Duration,
            id: source.Id,
            imageUrl: source.ImageUrl,
            longDescription: source.LongDescription,
            points: source.CEU,
            title: source.Title,
            type: EnumHelper.parseValue<CourseType>(CourseType, source.CourseType),
            url: source.SharepointWeb ? source.SharepointWeb.Url : (source.Web ? source.Web.Url : null),
            courseSessions: source.CourseSessions ? source.CourseSessions.map(x => this.createCourseSession(x)) : []
        };
    }

    public createCourseCatalog(source: any): CourseCatalog {
        if (!source) {
            return null;
        }

        return {
            id: source.Id,
            title: source.Title,
            url: source.SharepointWeb ? source.SharepointWeb.Url : (source.Web ? source.Web.Url : null)
        };
    }

    public createCourseCategory(source: any): CourseCategory {
        return source
            ? {
                id: source.Id,
                name: source.Name
            }
            : null;
    }

    public createCourseSession(source: any): CourseSession {
        return source
            ? {
                courseId: source.courseId,
                endDate: this.formatter.parseDate(source.EndDate),
                endDateTimeZoneOffset: source.EndDateTimeZoneOffset,
                id: source.Id,
                meetingUrl: source.MeetingUrl,
                room: source.Room
                    ? {
                    emailAddress: source.Room.EmailAddress,
                    location: source.Room.Location,
                    title: source.Room.Title,
                    }
                    : null,
                startDate: this.formatter.parseDate(source.StartDate),
                startDateTimeZoneOffset: source.StartDateTimeZoneOffset,
                timeZone: source.TimeZone,
                timeZoneName: source.TimeZoneName
            }
            : null;
    }

    public createUser(source: any, sourceExtension?: any): User {
        return source
            ? {
                email: source.Email,
                loginName: source.LoginName,
                title: source.Title,
            }
            : null;
    }

    protected get formatter(): Formatter {
        return this._formatter = this._formatter || new Formatter(null);
    }

    private get modelFilter(): ModelFilterFactory {
        return this._modelFilter = this._modelFilter || new ModelFilterFactory();
    }
}