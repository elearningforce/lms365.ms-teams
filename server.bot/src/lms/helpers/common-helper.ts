import { AppType, EnvironmentConfig } from 'ef.lms365';
import { Course, CourseType } from '../models';

const courseUrlQueryParameters = '$select=CEU,CourseID,CourseType,Description,Duration,Id,ImageUrl,LongDescription,Title,Rating&$expand=Admins,Categories,CourseSessions,SharepointWeb,Rating';

function getFilterByCourseCatalogId(courseCatalogId: string) {
    return courseCatalogId ? `CourseCatalogId eq ${encodeURIComponent(courseCatalogId)} and ` : '';
}

export class CommonHelper {
    public static Fields = {
        Course: {
            AdminNames: 'admins.title',
            Categories: 'categories',
            CategoryIds: 'categories.id',
            CategoryNames: 'categories.name',
            CourseId: 'courseId',
            CreationDate: 'creationDate',
            Description: 'description',
            Duration: 'duration',
            Id: 'id',
            Points: 'points',
            LongDescription: 'longDescriptionText',
            Dates: 'Dates',
            Session_Location: 'sessions.location',
            Session_StartDate: 'sessions.startDate',
            Tags: 'tags',
            TagNames: 'tags.name',
            Title: 'title',
            Type: 'type',
            Rating: 'rating.rating'
        },
        CourseSession: {
            EndDate: 'endDate',
            EndDateTimezoned: 'endDateTimezoned',
            Location: 'location',
            StartDate: 'startDate',
            StartDateTimezoned: 'startDateTimezoned'
        }
    };

    public static Keys = {
        CourseCatalog: 'ef.lms365.course-catalog',
        UserToken: 'ef.lms365.user-token'
    }

    public static Urls = {
        Course: {
            getAll: (courseCatalogId: string) => {
                return `odata/v2/Courses?$filter=${getFilterByCourseCatalogId(courseCatalogId)}IsPublished eq true and ShowInCatalog eq true&${courseUrlQueryParameters}`;
            },
            getCountByType: (courseCatalogId: string, type: CourseType) => {
                return `odata/v2/Courses/$count?$filter=${getFilterByCourseCatalogId(courseCatalogId)}IsPublished eq true and ShowInCatalog eq true and CourseType eq '${CourseType[type]}'`;
            },
            getByCategoryName: (courseCatalogId: string, categoryName: string) => {
                return `odata/v2/Courses?$filter=${getFilterByCourseCatalogId(courseCatalogId)}IsPublished eq true and ShowInCatalog eq true and Categories/any(x:x/Name eq '${encodeURIComponent(categoryName)}')&${courseUrlQueryParameters}`;
            },
            getByType: (courseCatalogId: string, courseType: CourseType) => {
                return `odata/v2/Courses?$filter=${getFilterByCourseCatalogId(courseCatalogId)}CourseType eq '${CourseType[courseType]}' and IsPublished eq true and ShowInCatalog eq true&${courseUrlQueryParameters}`;
            },
            getByTypeAndCategoryName: (courseCatalogId: string, courseType: CourseType, categoryName: string) => {
                return `odata/v2/Courses?$filter=${getFilterByCourseCatalogId(courseCatalogId)}CourseType eq '${CourseType[courseType]}' and IsPublished eq true and ShowInCatalog eq true and Categories/any(x:x/Name eq '${encodeURIComponent(categoryName)}')&${courseUrlQueryParameters}`;
            },
            getByKeyword: (courseCatalogId: string, keyword: string) => {
                return `odata/v2/Courses?$filter=${getFilterByCourseCatalogId(courseCatalogId)}contains(Title,'${keyword}') and IsPublished eq true and ShowInCatalog eq true&${courseUrlQueryParameters}`;
            },
            getImage: (tenantId: string, environmentConfig: EnvironmentConfig, course: Course) => {
                const appInfo = environmentConfig.getAppInfo(AppType.CourseCatalog);

                return course.imageUrl
                    ? `${environmentConfig.apiUrl}courseCatalogImages/getCourseImage?tenantId=${encodeURIComponent(tenantId)}&courseId=${encodeURIComponent(course.id)}`
                    : `https://${appInfo.host}/images/head_edu.png`;
            }
        },
        CourseCatalog: {
            getAll: () => `odata/v2/CourseCatalogs?$expand=Courses($select=Id),SharepointWeb&$filter=Courses/any(x:x/IsPublished eq true and x/ShowInCatalog eq true)&$select=Id,Title`,
            getByUrl: (url: string) => `odata/v2/CourseCatalogs?$select=Id,Title&$expand=SharepointWeb&$filter=SharepointWeb/Url eq '${CommonHelper.encodeURIComponent(url)}'`,
            getCount: () => `odata/v2/CourseCatalogs/$count?$expand=Courses($select=Id)&$filter=Courses/any(x:x/IsPublished eq true and x/ShowInCatalog eq true)`
        },
        CourseCategory: {
            getAll: (courseCatalogId: string) => {
                return `odata/v2/CourseCategories?$expand=Courses($select=Id,IsDeleted,IsPublished,ShowInCatalog)&$filter=${getFilterByCourseCatalogId(courseCatalogId)}Courses/any(x:x/IsPublished eq true and x/ShowInCatalog eq true and x/IsDeleted eq false)`;
            },
            getCount: (courseCatalogId: string) => {
                return `odata/v2/CourseCategories/$count?$expand=Courses($select=Id)&$filter=${getFilterByCourseCatalogId(courseCatalogId)}Courses/any(x:x/IsPublished eq true and x/ShowInCatalog eq true and x/IsDeleted eq false)`;
            }
        }
    }

    public static encodeURIComponent(value: string) {
        return encodeURIComponent(value).replace(/'/g, '\'\'');
    }

    public static escape(value: string): string {
        return value.replace(/&/, 'and');
    }
}