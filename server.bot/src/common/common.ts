export enum SortDirection {
    Ascending = 1 << 0,
    Descending = 1 << 1
}

export enum DataType {
    Date,
    Enum,
    String,
    Number
}

export interface ApiError {
    code: string;
    message: string;
    innererror?: {
        message?: string,
        stacktrace?: string,
        type?: string
    }
}