import { Components } from "../../generatedcode/_generated";
import { AxiosResponse } from "axios";
import CredentialsProvider from "../../util/CredentialsProvider";

export type GenericErrors =
    | ErrorCode.HTTP_BAD_REQUEST
    | ErrorCode.HTTP_DATA_INEGRITY
    | ErrorCode.HTTP_API_MISMATCH
    | ErrorCode.HTTP_SERVER_ERROR
    | ErrorCode.HTTP_UNIMPLEMENTED
    //    | ErrorCode.HTTP_SERVER_NOT_READY
    | ErrorCode.AXIOS
    | ErrorCode.UNHANDLED_RESPONSE
    | ErrorCode.UNHANDLED_GLOBAL_RESPONSE
    | ErrorCode.HTTP_ACCESS_DENIED
    | ErrorCode.HTTP_NOT_ACCEPTABLE
    | ErrorCode.OK;

export enum ErrorCode {
    OK = 'Isnt displayed but is used as an "error" when everything is ok', //void
    HTTP_BAD_REQUEST = "error.http.bad_request", //errmessage
    HTTP_DATA_INEGRITY = "error.http.data_integrity", //errmessage
    HTTP_API_MISMATCH = "error.http.api_mismatch", //void
    HTTP_SERVER_ERROR = "error.http.server_error", //errmessage
    HTTP_UNIMPLEMENTED = "error.http.unimplemented", //errmessage
    //auto retry    HTTP_SERVER_NOT_READY = 'error.http.server_not_ready', //void
    HTTP_ACCESS_DENIED = "error.http.access_denied", //void
    HTTP_NOT_ACCEPTABLE = "error.http.not_acceptable", //void
    UNHANDLED_RESPONSE = "error.unhandled_response", //axiosresponse
    UNHANDLED_GLOBAL_RESPONSE = "error.unhandled_global_response", //axiosresponse
    AXIOS = "error.axios", //jserror

    //Generic errors
    GITHUB_FAIL = "error.github", //jserror
    APP_FAIL = "error.app", //jserror

    //Login errors
    LOGIN_FAIL = "error.login.bad_user_pass", //void
    LOGIN_NOCREDS = "error.login.no_creds", //void
    LOGIN_DISABLED = "error.login.user_disabled", //void

    //User errors
    USER_NO_SYS_IDENT = "error.user.no_sys_ident", //errmessage
    USER_NOT_FOUND = "error.user.not_found", //errmessage

    //Administration errors
    ADMIN_GITHUB_RATE = "error.admin.rate", //errmessage
    ADMIN_GITHUB_ERROR = "error.admin.error", //errmessage
    ADMIN_WATCHDOG_UNAVAIL = "error.admin.watchdog.avail", //errmessage
    ADMIN_VERSION_NOT_FOUND = "error.admin.update.notfound", //errmessage
    ADMIN_LOGS_IO_ERROR = "error.admin.logs.io" //errmessage
}

type errorMessage = {
    errorMessage: Components.Schemas.ErrorMessage;
};
type axiosResponse = {
    axiosResponse: AxiosResponse;
};
type jsError = {
    jsError: Error;
};
type voidError = {
    void: true;
};

export enum DescType {
    LOCALE,
    TEXT
}
interface Desc {
    type: DescType;
    desc: string;
}

type allAddons = errorMessage | axiosResponse | jsError | voidError;

export default class InternalError<T extends ErrorCode> {
    public readonly code: T;
    public readonly desc?: Desc;
    public readonly extendedInfo: string;

    public constructor(code: T, addon: allAddons, origin?: AxiosResponse) {
        this.code = code;
        if ("errorMessage" in addon) {
            const err = addon.errorMessage;
            this.desc = {
                type: DescType.TEXT,
                desc: err.message + (err.additionalData ? ": " + err.additionalData : "")
            };
            if (!err.message) {
                this.desc = {
                    type: DescType.LOCALE,
                    desc: "error.api.emptyerror"
                };
            }
        }
        if ("jsError" in addon) {
            const err = addon.jsError;
            this.desc = {
                type: DescType.TEXT,
                desc: `${err.name}: ${err.message}`
            };
        }
        let debuginfo = JSON.stringify({ addon, origin });
        //@ts-expect-error //slander, replaceAll() exists >:(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        debuginfo = debuginfo.replaceAll(
            /Basic (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g,
            "Basic **************"
        ) as string;
        //@ts-expect-error //slander, replaceAll() exists >:(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        debuginfo = debuginfo.replaceAll(
            /{"username":".+?","password":".+?"}/g,
            '{"username":"*******","password":"*******"}'
        ) as string;
        if (CredentialsProvider.isTokenValid()) {
            //@ts-expect-error //slander, replaceAll() exists >:(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            debuginfo = debuginfo.replaceAll(
                CredentialsProvider.token?.bearer as string,
                "**************"
            ) as string;
        }
        this.extendedInfo = debuginfo;
    }
}
