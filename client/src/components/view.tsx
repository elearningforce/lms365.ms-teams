import * as React from 'react';
import { Context, ThemeStyle, TeamsComponentContext, ConnectedComponent, Panel, PanelBody, Surface } from 'msteams-ui-components-react';
import { AuthenticationConfig } from 'ef.lms365';
import { Loading } from './loading';
import { LoginButton } from './login-button';
import { EnvironmentConfigProvider } from '../infrastructure/environment-config-provider';
import { Helper } from '../infrastructure/helper';

enum UserAuthenticationStatus {
    AccessDenied,
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
    private _accessToken: string;
    private _tenantId: string;

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

        authenticationContext.acquireToken(authenticationConfig.resourceId, async (error, token) => {
            if (error || !token) {
                this.setState({ userAuthenticationStatus: UserAuthenticationStatus.NotAuthenticated });
            } else {
                const cachedUser = authenticationContext.getCachedUser();
                this.onAuthenticated(token, cachedUser.profile.tid);                
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

    protected getRedirectViewUrl(configJson: string): string {
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

    private async onAuthenticated(token: string, tenantId: string) {
        this._tenantId = tenantId;
        this._accessToken = token;
        try {
            const environmentConfig = await EnvironmentConfigProvider.instance.getById(this._tenantId);

            if (environmentConfig != null) {
                this.setState({ userAuthenticationStatus: UserAuthenticationStatus.Authenticated });
            }
        } catch (error) {
            this.setState({ userAuthenticationStatus: UserAuthenticationStatus.AccessDenied });
        }
    }

    protected renderContent(context: Context): JSX.Element {
        return this.props.children as any;
    }

    protected get accessToken(): string {
        return this._accessToken;
    }

    protected get tenantId(): string {
        return this._tenantId;
    }

    public componentDidMount() {
        this.initialize();
    }

    public render(): JSX.Element {
        let content: (contenxt: Context) => JSX.Element = null;

        switch (this.state.userAuthenticationStatus) {
            case UserAuthenticationStatus.AccessDenied:
                content = x => (
                    <Surface style={{ backgroundColor: 'transparent' }}>Doh, it would appear you do not have LMS365 installed on your Office 365 Tenant! Please visit our <a href="https://www.elearningforce.com/teams" target="_blank">website</a> on how to get LMS365 for your organisation.</Surface>
                );
                break;
            case UserAuthenticationStatus.Authenticated:
                content = x => this.renderContent(x);
                break;
            case UserAuthenticationStatus.NotAuthenticated:
                content = (x) => <LoginButton context={x} onAuthenticate={x => this.onAuthenticated(x.accessToken, x.tenantId)} />;
                break;
        }

        return (
            <div>
                <style>
                    {
                        `
                            body { overflow: auto !important; }
                            #lms365 .lbUserInfo .user-photo { display: none; }
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
                        : <Loading />
                }
            </div>
        );
    }

    protected get allowRenderPanel(): boolean {
        return true;
    }
}