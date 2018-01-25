import * as React from 'react';
import { Context, Input, Radiobutton, RadiobuttonGroup, ThemeStyle, Surface } from 'msteams-ui-components-react';
import { View } from './view';

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
            name: 'Dashboard'
        };
    }

    private renderInputSection(styles: any): JSX.Element[] {
        return this.state.viewType != ViewType.Dashboard
            ? [
                <div style={styles.section}>Site url:</div>,
                this.validateUrlFormat(this.state.url) ? null : <div style={styles.error}>That isn't a valid URL.</div>,
                <Input onChange={x => this.setState({ url: x.target.value })}
                    placeholder="Site url"
                    style={styles.input}
                    value={this.state.url}
                />,
            ]
            : null;
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
        this.setState({ viewType: viewType, name: name, url: url });
    }

    protected initialize() {
        super.initialize();

        const microsoftTeams = (window as any).microsoftTeams;

        microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
            const viewType = this.state.viewType;
            const tabName = this.state.name;
            let webUrl = this.state.url;

            if (((viewType != ViewType.Dashboard) && !webUrl) || !tabName) {
                saveEvent.notifyFailure();
            } else {
                webUrl = this.trimUrl(webUrl);
                const viewProps = viewPropsByViewType[viewType];

                let queryParams = viewType == ViewType.Dashboard
                    ? 'LeaderBoard=false&Transcript=false&CoursesEnded=false'
                    : 'webUrl=' + encodeURIComponent(webUrl);

                microsoftTeams.settings.setSettings({
                    entityId: `lms365${viewProps.key}${encodeURIComponent(webUrl)}`,
                    contentUrl: `${document.location.origin}/Tab?view=${viewProps.key}&${queryParams}`,
                    suggestedDisplayName: tabName
                });
            }

            saveEvent.notifySuccess();
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
                <div style={styles.section}>Tab name:</div>
                <Input onChange={x => this.setState({ name: x.target.value })} placeholder="Tab name" style={styles.input} value={this.state.name} />

                <div style={styles.section}>View:</div>
                <RadiobuttonGroup>
                    {this.renderRadioButton(ViewType.Dashboard)}
                    {/* {this.renderRadioButton(ViewType.CourseCatalog)} */}
                    {this.renderRadioButton(ViewType.Course)}
                </RadiobuttonGroup>

                {this.renderInputSection(styles)}
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
            if (!this.state.name) {
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
}