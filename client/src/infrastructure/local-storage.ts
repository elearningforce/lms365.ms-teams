import { Storage } from 'ef.lms365';

export class LocalStorage implements Storage {
    public set(key: string, value: any) {
        try {
            if (window.localStorage) {
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (exception) {
            console.log(exception);
        }
    }

    public get(key: string): any {
        try {
            return window.localStorage ? JSON.parse(window.localStorage.getItem(key)) : null;
        }
        catch (exception) {
            console.log(exception);

            return null;
        }
    }
}