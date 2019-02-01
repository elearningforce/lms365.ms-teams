import * as React from 'react';
import * as $ from 'jquery';
import { Context } from 'msteams-ui-components-react';
import { AppType, GlobalConfig } from 'ef.lms365';
import { View } from './view';

export enum WebPartType {
    Course,
    CourseCatalog,
    Dashboard
}

interface WebPartProps {
    type: WebPartType;
};

const webPartNameByType = {
    [WebPartType.Course]: 'Course-page-spfx',
    [WebPartType.CourseCatalog]: 'Course-catalog-spfx',
    [WebPartType.Dashboard]: 'Dashboard-spfx'
};

const webPartIdByType = {
    [WebPartType.Course]: '4AA6D32E-1110-447C-B448-D0D5C8BE7421',
    [WebPartType.CourseCatalog]: 'C38FA808-FBDD-4C19-A1F0-2F4E20285CCE',
    [WebPartType.Dashboard]: 'F46BF6D7-FC44-4691-B3EF-56F3BD3B5149',
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
        const webPartId = webPartIdByType[this.props.type];

        return (
            <div {...{ webpartid: webPartId }}>
                <div className={`--efLms365${webPartName} ef-teams`}></div>
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