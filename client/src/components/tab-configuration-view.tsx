import * as React from 'react';
import { Context, Input, Radiobutton, RadiobuttonGroup, ThemeStyle, Surface } from 'msteams-ui-components-react';
import { View } from './view';
import { EnvironmentConfigProvider } from '../infrastructure/environment-config-provider';
import * as $ from 'jquery';

enum ViewType {
    Course,
    CourseCatalog,
    Dashboard
}

export interface TabConfigurationState {
    theme?: ThemeStyle;
    url?: string;
    viewType?: ViewType;
    name?: string;
    renderNameInput: boolean;
    validationMessage?: string;
}

const viewPropsByViewType = {
    [ViewType.Course]: { key: 'course', title: 'Course / Training Plan' },
    [ViewType.CourseCatalog]: { key: 'course-catalog', title: 'Course Catalog' },
    [ViewType.Dashboard]: { key: 'dashboard', title: 'Dashboard' },
};

export class TabConfigurationView extends View<any, TabConfigurationState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            theme: ThemeStyle.Light,
            viewType: ViewType.Dashboard,
            name: 'Dashboard',
            renderNameInput: false
        };
    }

    private renderNameInputSection(styles: any): JSX.Element[] {
        if (this.state.renderNameInput) {
            return [
                <div style={styles.section}>Tab name:</div>,
                <Input onChange={x => this.setState({ name: x.target.value })} placeholder="Tab name" style={styles.input} value={this.state.name} />
            ];
        }
    }

    private renderUrlInputSection(styles: any): JSX.Element[] {
        return this.state.viewType != ViewType.Dashboard
            ? [
                <div style={styles.section}>Site url:</div>,
                this.validateUrlFormat(this.state.url) ? null : <div style={styles.error}>That isn't a valid URL.</div>,
                <Input onChange={x => this.setState({ url: x.target.value, validationMessage: null })}
                    placeholder="Site url"
                    style={styles.input}
                    value={this.state.url}
                />,
            ]
            : null;
    }

    private renderValidationMessage(styles: any) {
        if (this.state.validationMessage) {
            return <div style={styles.error}>{this.state.validationMessage}</div>;
        }
    }

    private renderRadioButton(viewType: ViewType): JSX.Element {
        const viewProps = viewPropsByViewType[viewType];

        return <Radiobutton label={viewProps.title} onSelected={() => this.onRadioButtonSelected(viewType)} selected={this.state.viewType == viewType} value={viewType} />;
    }

    private onRadioButtonSelected(viewType: ViewType) {
        const name = viewType == ViewType.Dashboard
            ? 'Dashboard'
            : '';
        const url = viewType == ViewType.Dashboard
            ? ''
            : 'https://';
        this.setState({ viewType: viewType, name: name, url: url, validationMessage: null });
    }

    protected initialize() {
        super.initialize();

        const microsoftTeams = (window as any).microsoftTeams;

        microsoftTeams.settings.registerOnSaveHandler(async (saveEvent) => {
            const viewType = this.state.viewType;
            const tabName = this.state.name;
            let webUrl = this.state.url;

            if (((viewType != ViewType.Dashboard) && !webUrl) || (this.state.renderNameInput && !tabName)) {
                saveEvent.notifyFailure();
            } else {
                webUrl = this.trimUrl(webUrl);

                if (!await this.validateCourseUrl(webUrl)) {
                    saveEvent.notifyFailure();
                }
                else {
                    const viewProps = viewPropsByViewType[viewType];

                    let queryParams = viewType == ViewType.Dashboard
                        ? 'LeaderBoard=false&Transcript=false&CoursesEnded=false'
                        : 'webUrl=' + encodeURIComponent(webUrl);

                    microsoftTeams.settings.setSettings({
                        entityId: `lms365${viewProps.key}${encodeURIComponent(webUrl)}`,
                        contentUrl: `${document.location.origin}/Tab?view=${viewProps.key}&${queryParams}`,
                        suggestedDisplayName: tabName
                    });

                    saveEvent.notifySuccess();
                }
            }
        });

        microsoftTeams.settings.getSettings(settings => {
            if (!settings || !settings.entityId) {
                this.setState({ renderNameInput: true });
            }
        });
    }

    protected renderContent(context: Context): JSX.Element {
        const { rem, font } = context;
        const { sizes } = font;
        const styles = {
            section: { ...sizes.title2, marginTop: rem(1.4), marginBottom: rem(1.4) },
            input: {
                paddingLeft: rem(0.5),
                paddingRight: rem(0.5)
            },
            surface: { backgroundColor: 'transparent' },
            error: { ...sizes.caption, color: 'red' }
        };

        this.validateInput();

        return (
            <Surface style={styles.surface}>
                {this.renderNameInputSection(styles)}
                <div style={styles.section}>View:</div>
                <RadiobuttonGroup>
                    {this.renderRadioButton(ViewType.Dashboard)}
                    {/* {this.renderRadioButton(ViewType.CourseCatalog)} */}
                    {this.renderRadioButton(ViewType.Course)}
                </RadiobuttonGroup>
                {this.renderUrlInputSection(styles)}
                {this.renderValidationMessage(styles)}
            </Surface>
        );
    }

    private trimUrl(value: string): string {
        if (!value) {
            return value;
        }
        value = decodeURI(value);
        if (value.indexOf('#') > -1) {
            value = value.split('#')[0];
        }
        if (value.indexOf('?') > -1) {
            value = value.split('?')[0];
        }
        if (value.lastIndexOf('.aspx') == value.length - '.aspx'.length) {
            value = value.substring(0, value.lastIndexOf('/') + 1);
        }
        value = this.trimEnd(value, '/SitePages/');
        value = this.trimEnd(value, '/');

        return value;
    }

    private trimEnd(value: string, trim: string): string {
        if (value.lastIndexOf(trim) == value.length - trim.length) {
            value = value.substring(0, value.length - trim.length);
        }
        return value;
    }

    private validateInput() {
        const microsoftTeams = (window as any).microsoftTeams;
        if (microsoftTeams) {
            let valid = true;
            if (this.state.renderNameInput && !this.state.name) {
                valid = false;
            }
            if (this.state.viewType != ViewType.Dashboard && (!this.state.url || this.state.url == 'https://' || !this.validateUrlFormat(this.state.url))) {
                valid = false;
            }
            microsoftTeams.settings.setValidityState(valid);
        }
    }

    private validateUrlFormat(value: string): boolean {
        return !value || value.indexOf('https://') === 0;
    }

    private async validateCourseUrl(url: string): Promise<boolean> {
        this.setState({ validationMessage: null });
        if (this.state.viewType == ViewType.Dashboard) {
            return true;
        }
        const environmentConfig = await EnvironmentConfigProvider.instance.getById(this.tenantId);
        const escapedUrl = encodeURIComponent(url.replace("'", "''"));
        const requestUrl = `${environmentConfig.apiUrl}/odata/v2/Courses?$expand=SharepointWeb&$filter=SharepointWeb/Url eq '${escapedUrl}'`;        
        return await $.ajax(
            {
                url: requestUrl,
                headers: { Authorization: 'Bearer ' + this.accessToken },
            })
            .then(x => {                
                if (x && x.value && x.value.length) {
                    return true;
                }
                this.setState({ validationMessage: 'Sorry we cannot find a course with that URL in our system. Please recheck the entered value.' });
                return false;
            });
    }
}