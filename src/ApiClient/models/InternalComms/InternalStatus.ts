import InternalError, { ErrorCode } from "./InternalError";

export enum StatusCode {
    OK,
    ERROR
}

export interface InternalStatusErr<Codes extends ErrorCode> {
    code: StatusCode.ERROR;
    error: InternalError<Codes>;
}

export interface InternalStatusOK<T> {
    code: StatusCode.OK;
    payload: T;
}

type InternalStatus<T, Codes extends ErrorCode> = InternalStatusOK<T> | InternalStatusErr<Codes>;

const InternalStatus = (function InternalStatus<T, Codes extends ErrorCode>(
    this: InternalStatus<T, Codes>,
    args: InternalStatus<T, Codes>
): Readonly<InternalStatus<T, Codes>> {
    return Object.freeze(Object.assign({}, args));
} as unknown) as {
    new <T, Codes extends ErrorCode>(args: InternalStatus<T, Codes>): Readonly<
        InternalStatus<T, Codes>
    >;
};

export default InternalStatus;
