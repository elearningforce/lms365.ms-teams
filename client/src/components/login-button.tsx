import * as React from 'react';
import { Context, PrimaryButton, SecondaryButton, Surface } from 'msteams-ui-components-react';

interface LoginButtonProps {
    context: Context;

    onAuthenticate: (result: { accessToken: string, tenantId: string }) => void;
}

export class LoginButton extends React.Component<LoginButtonProps, any> {
    public constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    private handleClick() {
        const microsoftTeams = (window as any).microsoftTeams;

        microsoftTeams.authentication.authenticate({
            height: 400,
            failureCallback: (err) => {
                alert('Error: ' + err);
                console.log(err);
            },
            successCallback: this.props.onAuthenticate,
            url: '/SignIn',
            width: 400
        });
    }

    public render(): JSX.Element {
        const { rem, font } = this.props.context;
        const { sizes } = font;
        const styles = {
            section: {...sizes.title2, marginTop: rem(1.4), marginBottom: rem(1.4)}
        };

        return (
            <Surface>
                <div style={styles.section}>Whoops, it looks like we need you to sign in to LMS365 again!</div>
                <PrimaryButton onClick={this.handleClick}>Sign in</PrimaryButton>
                <div style={styles.section}>Or just in case you only installed the LMS365 app but don't have LMS365 yet why not visit our website for further information on how to get LMS365 for your organisation?</div>
                <SecondaryButton onClick={()=>window.open('https://www.elearningforce.com/teams')}>Tell me More</SecondaryButton> 
            </Surface>
        );
    }
}