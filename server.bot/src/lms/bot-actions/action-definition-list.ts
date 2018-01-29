import { ActionDefinition } from './action-definition';
import { GreetingAction } from './greeting-action';
import { CourseCatalog } from '../models';
import { NoneAction } from './none-action';
import { SearchCourseListAction } from './search-course-list-action';
import { SelectCourseCatalogAction } from './select-course-catalog-action';
import { ShowCourseCatalogListAction } from './show-course-catalog-list-action';
import { SearchCourseCategoryListAction } from './show-course-category-list-action';

export class ActionDefinitionList {
    public static Greeting: ActionDefinition = {
        action: new GreetingAction(),
        key: 'Greeting',
        title: 'Greeting'
    };
    public static Help: ActionDefinition = {
        action: new GreetingAction(),
        key: 'Help',
        title: 'Help'
    };
    public static None: ActionDefinition = {
        action: new NoneAction(),
        key: 'None',
        title: 'None'
    };
    public static SearchCourseList: ActionDefinition = {
        action: new SearchCourseListAction(),
        key: 'SearchCourseList',
        title: 'Search Courses'
    };
    public static SelectCourseCatalog: ActionDefinition = {
        action: new SelectCourseCatalogAction(),
        key: 'SelectCourseCatalog',
        title: 'Select Course Catalog',
        titleFormat: (courseCatalog: CourseCatalog) => `Select Course Catalog by ${encodeURI(courseCatalog.url)}`
    };
    public static ShowCourseCatalogList: ActionDefinition = {
        action: new ShowCourseCatalogListAction(),
        key: 'ShowCourseCatalogList',
        title: 'Show Course Catalogs'
    };
    public static ShowCourseCategoryList: ActionDefinition = {
        action: new SearchCourseCategoryListAction(),
        key: 'ShowCourseCategoryList',
        title: 'Show Course Categories',
        titleFormat: (count: number) => `Show Course Categories (${count})`
    };
}