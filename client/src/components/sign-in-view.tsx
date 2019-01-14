import * as React from 'react';
import * as microsoftTeams from '@microsoft/teams-js';
import { AuthenticationConfig } from 'ef.lms365';
import { Helper } from '../infrastructure/helper';

export class SignInView extends React.Component {
    public componentDidMount() {
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
                            microsoftTeams.authentication.notifySuccess(JSON.stringify({
                                accessToken: token,
                                tenantId: authenticationContext.getCachedUser().profile.tid
                            }));
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