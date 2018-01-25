import * as React from 'react';
import * as $ from 'jquery';
import { Context } from 'msteams-ui-components-react';
import { AppType, GlobalConfig } from 'ef.lms365';
import { View } from './view';

export enum WebPartType {
    Assignments,
    Course,
    CourseCatalog,
    CourseCatalogV2,
    CoursePageHeader,
    Dashboard,
    Mlap
}

interface WebPartProps {
    type: WebPartType;
};

const webPartNameByType = {
    [WebPartType.Assignments]: 'Assignments',
    [WebPartType.Course]: 'Course-page',
    [WebPartType.CourseCatalog]: 'Course-catalog',
    [WebPartType.CourseCatalogV2]: 'Course-catalog-v2',
    [WebPartType.CoursePageHeader]: 'Course-page-header',
    [WebPartType.Dashboard]: 'Dashboard',
    [WebPartType.Mlap]: 'Mlap'
};

export class WebPartView extends View<WebPartProps> {
    private registerScript() {
        const scriptElements = document.getElementsByClassName('--efLms365ScriptLoader');

        if (scriptElements.length) {
            const chunkName = webPartNameByType[this.props.type].toLowerCase();
            const assetsHost = GlobalConfig.instance.assetsHost;
            const webPartUrl = `/assets/js/${chunkName}`;
            const loaderUrl = `https://${assetsHost}/assets/js/script-loader?chunkUrl=${encodeURIComponent(webPartUrl)}&appType=${AppType.CourseCatalog}`;
            const scriptElement = document.createElement('script');

            scriptElement.src = loaderUrl;
            scriptElement.async = true;

            scriptElements[0].appendChild(scriptElement);
        }
    }

    protected renderContent(context: Context): JSX.Element {
        const webPartName = webPartNameByType[this.props.type];

        return (
            <div>
                <div className={`--efLms365${webPartName}`}></div>
                <div className="--efLms365ScriptLoader" style={{ display: 'none' }}></div>
            </div>
        );
    }

    public componentDidMount() {
        super.componentDidMount();
        this.registerScript();

        $(document).on('click', '.ef--link-course, a[target="_top"]', function () {
            const href = $(this).attr('href');

            if ($(this).hasClass('ef--link-course')) {
                document.location.href = 'Course?webUrl=' + encodeURIComponent(href);
            } else {
                document.location.href = href;
            }

            return false;
        });

        $(document).on('click', 'a.course-certificate, .lCoursesCertificate a', function () {
            return false;
        });
    }

    public componentDidUpdate() {
        this.registerScript();
    }

    protected get allowRenderPanel(): boolean {
        return false;
    }
}