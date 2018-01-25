export enum DateFormat {
    Date,
    DateAnTime,
    Time
}

export interface RegionalSettings {
    uiCultureName: string;
    cultureName: string;
    monthEndDate?: Date;
    monthStartDate?: Date;
    weekEndDate?: Date;
    weekStartDate?: Date;
}

export class Formatter {
    private _regionalSettings: RegionalSettings;

    public static readonly instance: Formatter = new Formatter();

    public constructor(regionalSettings?: RegionalSettings) {
        if (regionalSettings) {
            this._regionalSettings = regionalSettings;
            this._regionalSettings.monthStartDate = this.parseDate(this._regionalSettings.monthStartDate as any);
            this._regionalSettings.monthEndDate = this.parseDate(this._regionalSettings.monthEndDate as any);
            this._regionalSettings.weekStartDate = this.parseDate(this._regionalSettings.weekStartDate as any);
            this._regionalSettings.weekEndDate = this.parseDate(this._regionalSettings.weekEndDate as any);
        }
    }

    public parseDate(value: string): Date {
        if (!value) {
            return null;
        }
        return new Date(value);
    }

 

    public toStringAsLocal(value: Date, format: DateFormat = DateFormat.Date, timeZoneOffset?: number): string {
        let result = '';

        if (value) {
            value = (typeof value == 'string') ? new Date(value) : value;

            if (timeZoneOffset) {
                value = new Date(value.getTime() + timeZoneOffset);
            }

            switch (format) {
                case DateFormat.Date:
                    result = value.toLocaleDateString();
                    break;
                case DateFormat.DateAnTime:
                    result = value.toLocaleDateString() + ' - ' + value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    break;
                case DateFormat.DateAnTime:
                    result = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    break;
            }
        }
        return result;
    }
}