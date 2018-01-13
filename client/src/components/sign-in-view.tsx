import * as React from 'react';
import { AuthenticationConfig } from 'ef.lms365';
import { Helper } from '../infrastructure/helper';

export class SignInView extends React.Component {
    public componentDidMount() {
        const microsoftTeams = (window as any).microsoftTeams;

        microsoftTeams.initialize();
        microsoftTeams.getContext(context => {
            const config = Helper.getAdalConfig(context);
            const authenticationContext = new AuthenticationContext(config);
            const authenticationConfig = AuthenticationConfig.instance;

            if (authenticationContext.isCallback(window.location.hash)) {
                authenticationContext.handleWindowCallback();
            }
            else {
                var user = authenticationContext.getCachedUser();

                if (!user) {
                    authenticationContext.login();
                }
                else {
                    authenticationContext.acquireToken(authenticationConfig.resourceId, (error, token) => {
                        if (error || !token) {
                            if (error.indexOf('AADSTS50058') > -1) { //login_required
                                authenticationContext.login();
                            } else {
                                microsoftTeams.authentication.notifyFailure(error);
                            }
                        } else {
                            microsoftTeams.authentication.notifySuccess(token);
                        }
                    });
                }
            }
        });
    }

    public render(): JSX.Element {
        return <div />;
    }
}