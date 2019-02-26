import * as React from 'react';
import * as microsoftTeams from '@microsoft/teams-js';
import { GlobalConfig } from 'ef.lms365';
import { Helper } from '../infrastructure/helper';

export class SignInView extends React.Component {
    public componentDidMount() {
        microsoftTeams.initialize();
        microsoftTeams.getContext(context => {
            const config = Helper.getAdalConfig(context);
            config.navigateToLoginRequestUrl = true;
            
            const authenticationContext = new AuthenticationContext(config);
            const resourceId = GlobalConfig.instance.apiAppId;

            if (authenticationContext.isCallback(window.location.hash)) {
                authenticationContext.handleWindowCallback();
            }
            else {
                var user = authenticationContext.getCachedUser();

                if (!user) {
                    authenticationContext.login();
                }
                else {
                    authenticationContext.acquireToken(resourceId, (error, token) => {
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