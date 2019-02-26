import { GlobalConfig } from 'ef.lms365';

export class Helper {
    public static getAdalConfig(context: any): adal.Config {
        const globalConfig = GlobalConfig.instance;
        
        return {
            cacheLocation: 'localStorage',
            clientId: globalConfig.clientAppId,
            endpoints: {
                'https://graph.microsoft.com': 'https://graph.microsoft.com',
                [globalConfig.discoveryServerUrl]: globalConfig.apiAppId
            },
            extraQueryParameter: context != null ? '&login_hint=' + encodeURIComponent(context.upn) : null,
            instance: 'https://login.microsoftonline.com/',
            postLogoutRedirectUri: window.location.origin,
            redirectUri: window.location.origin + '/SignIn',
            tenant: 'common',
            navigateToLoginRequestUrl: false
        };
    }

    public static handleAuthenticationCallback() {
        const authenticationContext = new AuthenticationContext(this.getAdalConfig(null));
        authenticationContext.handleWindowCallback();
    }
}