import * as React from 'react';
import { Context, ThemeStyle, TeamsComponentContext, ConnectedComponent, Panel, PanelBody } from 'msteams-ui-components-react';
import { AuthenticationConfig } from 'ef.lms365';
import { LoginButton } from './login-button';
import { Helper } from '../infrastructure/helper';

enum UserAuthenticationStatus {
    Authenticated,
    NotAuthenticated,
    Undefined
}

export interface ViewState {
    userAuthenticationStatus?: UserAuthenticationStatus;
    theme?: ThemeStyle;
}

const themeByName = {
    'contrast': ThemeStyle.HighContrast,
    'dark': ThemeStyle.Dark,
    'default': ThemeStyle.Light
};

export class View<P = any, S extends ViewState = ViewState> extends React.Component<P, S> {
    public constructor(props: any) {
        super(props);

        this.state = { userAuthenticationStatus: UserAuthenticationStatus.Undefined } as any;
    }

    protected initialize() {
        const microsoftTeams = (window as any).microsoftTeams;

        microsoftTeams.initialize();
        microsoftTeams.getContext(context => {
            this.initializeMsTeams(context);
        });
    }

    protected initializeMsTeams(context: any) {
        const redirectViewUrl = this.getRedirectViewUrlFromContext(context);
        if (redirectViewUrl) {
            document.location.href = redirectViewUrl;
            return;
        }

        const authenticationConfig = AuthenticationConfig.instance;
        const config = Helper.getAdalConfig(context);

        if (context) {
            window['_spPageContextInfo'] = {
                currentCultureName: context.locale,
                currentUICultureName: context.locale
            };
        }

        const authenticationContext = new AuthenticationContext(config);

        authenticationContext.acquireToken(authenticationConfig.resourceId, (error, token) => {
            if (error || !token) {
                this.setState({ userAuthenticationStatus: UserAuthenticationStatus.NotAuthenticated });
            } else {
                this.setState({ userAuthenticationStatus: UserAuthenticationStatus.Authenticated });
            }
        });

        this.setState({ theme: themeByName[context.theme] || ThemeStyle.Light });
    }

    protected getRedirectViewUrlFromContext(context: any): string {
        const pathName = window.location.pathname;

        if (context && context.subEntityId && (pathName.indexOf('Tab') != -1)) {
            return this.getRedirectViewUrl(context.subEntityId);
        }
    }

    protected getRedirectViewUrl(configJson: string):string {
        const config = JSON.parse(configJson);
        const viewName = config.view;
        const webUrl = config.webUrl;

        switch (viewName) {
            case 'dashboard':
                return 'Dashboard';                
            case 'course-catalog':
                return 'CourseCatalog?webUrl=' + encodeURIComponent(webUrl);                
            case 'course':
                return 'Course?webUrl=' + encodeURIComponent(webUrl);                
        }        
    }

    protected renderContent(context: Context): JSX.Element {
        return this.props.children as any;
    }

    public componentDidMount() {
        this.initialize();
    }

    public render(): JSX.Element {
        let content: (contenxt: Context) => JSX.Element = null;

        switch (this.state.userAuthenticationStatus) {
            case UserAuthenticationStatus.Authenticated:
                content = x => this.renderContent(x);
                break;
            case UserAuthenticationStatus.NotAuthenticated:
                content = (x) => <LoginButton context={x} onAuthenticate={() => this.setState({ userAuthenticationStatus: UserAuthenticationStatus.Authenticated })} />;
                break;
        }

        return (
            <div>
                <style>
                    {
                        `
                            body { overflow: auto !important; }
                            #lms365 .user-photo { display: none; }
                            .k-grid .k-hierarchy-cell { padding: 0 0 0 0.6em; }
                            #lms365 .courseCertificateDownload a { cursor: default; }
                            #lms365 .courseCertificateDownload .course-icon-text { display: none; }
                            #lms365 .lCoursesCertificate a { cursor: default; }
                            .course-certificate a { display: none; }
                            .course-management-button { display: none; }
                        `
                    }
                </style>
                {
                    ((this.state.theme != null) && content)
                        ? (
                            <TeamsComponentContext fontSize={16} theme={this.state.theme}>
                                <ConnectedComponent render={(props) => {
                                    return (
                                        this.allowRenderPanel
                                        ? (
                                            <Panel>
                                                <PanelBody>
                                                    {content(props.context)}
                                                </PanelBody>
                                            </Panel>
                                        )
                                        : content(props.context)
                                    );
                                }} />
                            </TeamsComponentContext>
                        )
                        : null
                }
            </div>
        );
    }

    protected get allowRenderPanel(): boolean {
        return true;
    }
}