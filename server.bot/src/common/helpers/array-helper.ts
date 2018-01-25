export interface Grouping<T> {
    key: any;
    values: T[];
}

export class ArrayHelper {
    public static distinct<T>(array: T[], comparer: (x: T, y: T) => boolean) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
            const element = array[i];
            const foundElement = result.find(x => comparer(x, element));

            if (!foundElement) {
                result.push(element);
            }
        }

        return result;
    }

    public static groupBy<T>(array: any[], keyGetter: (x) => any): Grouping<T>[] {
        const result = [];

        for (let i = 0; i < array.length; i++) {
            let grouping: Grouping<T> = null;
            const groupKey = keyGetter(array[i]);
            const groupings = result.filter(x => x.key == groupKey);

            if (groupings.length == 1) {
                grouping = groupings[0];
            } else {
                grouping = {
                    key: groupKey,
                    values: []
                };

                result.push(grouping);
            }

            grouping.values.push(array[i]);
        }

        return result;
    }

    public static move(array: any[], fromIdx: number, toIdx: number) {
        array.splice(toIdx, 0, array.splice(fromIdx, 1)[0]);
    }

    public static remove(array: any[], element) {
        const idxToRemove = array.findIndex(x => x == element);

        if (idxToRemove >= 0) {
            array.splice(idxToRemove, 1);
        }
    }

    public static selectMany<TSource, TResult>(array: TSource[], selector: (x: TSource) => TResult[]): TResult[] {
        const result = [];

        for (let i = 0; i < array.length; i++) {
            const value = array[i];

            result.push(...selector(value));
        }

        return result;
    }

    public static split<T>(source: T[], chunkSize: number): T[][] {
        const splittedArray: T[][] = [[]];

        if (!source || !source.length) {
            return splittedArray;
        }

        if (chunkSize <= 0) {
            chunkSize = source.length;
        }

        for (let i = 0, row = 0; i < source.length; i++) {
            row = Math.floor(i / chunkSize);

            if (!splittedArray[row]) {
                splittedArray.push([]);
            }

            splittedArray[row].push(source[i]);
        }

        return splittedArray;
    }

    public static toArray<T>(object: { [name: string]: T }): { key: string, value: T }[] {
        const items = [];

        for (let key in object) {
            items.push({ key: key, value: object[key] });
        }

        return items;
    }
}