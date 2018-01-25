import { CourseSession } from './models';
import { DateTimeHelper } from '../common/helpers/date-time-helper';

export type ModelFilterExpression<T> = (x: T[]) => T[];

export class CourseSessionFilter {
    public byActiveStatus(): ModelFilterExpression<CourseSession> {
        const currentDate = DateTimeHelper.utcNow();

        return courseSessions => courseSessions.filter(x => x.endDate >= currentDate);
    }
}

export class ModelFilterFactory {
    private _courseSessions: CourseSessionFilter;

    public constructor() {
        this._courseSessions = new CourseSessionFilter();
    }

    public get courseSessions(): CourseSessionFilter {
        return this._courseSessions;
    }
}
