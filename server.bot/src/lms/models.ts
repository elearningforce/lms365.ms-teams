export interface Course {
    admins: User[];
    categories: CourseCategory[];
    courseId?: string;
    courseSessions?: CourseSession[];
    description: string;
    duration?: string;
    id?: string;
    imageUrl?: string;
    longDescription?: string;
    points?: string;
    type: CourseType;
    title: string;
    url: string;
}

export interface CourseCatalog {
    description: string;
    id: string;
    title: string;
    url: string;
}

export interface CourseCategory {
    courses?: Course[];
    id: string;
    name: string;
}

export interface CourseSession {
    courseId?: string;
    endDate?: Date;
    endDateTimeZoneOffset?: number;
    id: string;
    meetingUrl?: string;
    room?: Room;
    startDate?: Date;
    startDateTimeZoneOffset?: number;
    timeZone?: string;
    timeZoneName?: string;
}

export enum CourseType {
    ELearning = 1,
    ClassRoom = 3,
    TrainingPlan = 4,
    Webinar = 5
}

export interface Room {
    emailAddress?: string;
    location?: string;
    title: string;
}

export interface TenantInfo {
    courseCatalogCount: number;
    courseCategoryCount: number;
    courseCountByType: { [type: number]: number };
}

export interface User {
    email?: string;
    loginName: string;
    title: string;
}