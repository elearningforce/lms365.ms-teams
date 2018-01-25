export class DateTimeHelper {
    public static addDays(date: Date, days: number): Date {
        let temp = new Date(date.getTime());
        temp.setDate(date.getDate() + days);

        return temp;
    }

    public static utcNow(): Date {
        const now = new Date();

        return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    }

    public static utcDate(value: string | Date): Date {
        if(!value){
            return null;
        }

        const local = new Date(value as any);

        return new Date(local.getTime() + local.getTimezoneOffset() * 60000);
    }
}