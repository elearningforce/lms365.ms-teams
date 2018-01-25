interface Enum {
    [name: string]: any
}

export class EnumHelper {
    public static getValues<T>(enumType: Enum): T[] {
        const result = [];

        for (let propertyName in enumType) {
            const enumValue = parseInt(enumType[propertyName], 10);

            if (enumValue) {
                result.push(enumValue);
            }
        }

        return result;
    }

    public static parseValue<T>(enumType: Enum, value: any): T {
        if (!value && value != 0) {
            return null;
        }

        return isNaN(value) ? enumType[value as string] : value;
    }

    public static getEnumTypeId(enumType: Enum): string {
        return JSON.stringify(enumType);
    }
}