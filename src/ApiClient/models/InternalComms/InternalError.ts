import { AxiosResponse } from "axios";

import { replaceAll } from "../../../utils/misc";
import { ErrorCode as TGSErrorCode, ErrorMessageResponse } from "../../generatedcode/generated";
import configOptions from "../../util/config";
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
    | ErrorCode.OK
    | ErrorCode.NO_APIPATH
    | ErrorCode.APP_FAIL;

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
    NO_APIPATH = "error.no_apipath", //void

    //Login errors
    LOGIN_FAIL = "error.login.bad_user_pass", //void
    LOGIN_NOCREDS = "error.login.no_creds", //void
    LOGIN_DISABLED = "error.login.user_disabled", //void
    LOGIN_BAD_OAUTH = "error.login.bad_oauth", //jserror
    LOGIN_RATELIMIT = "error.login.rate_limit", //errmessage
    LOGIN_LOGGING_IN = "error.auth.logging_in", // debounce msg // void

    //User errors
    USER_NO_SYS_IDENT = "error.user.no_sys_ident", //errmessage
    USER_NOT_FOUND = "error.user.not_found", //errmessage

    //Administration errors
    ADMIN_GITHUB_RATE = "error.admin.rate", //errmessage
    ADMIN_GITHUB_ERROR = "error.admin.error", //errmessage
    ADMIN_WATCHDOG_UNAVAIL = "error.admin.watchdog.avail", //errmessage
    ADMIN_VERSION_NOT_FOUND = "error.admin.update.notfound", //errmessage
    ADMIN_LOGS_IO_ERROR = "error.admin.logs.io", //errmessage

    //Job errors
    JOB_JOB_NOT_FOUND = "error.job.not_found", //errmessage
    JOB_JOB_COMPLETE = "error.job.complete", //void

    //Transfer errors
    TRANSFER_NOT_AVAILABLE = "error.transfer.not_available", //errmessage
    UPLOAD_FAILED = "error.transfer.upload_failed", //void

    GROUP_NOT_FOUND = "error.group.not_found", //errmessage
    GROUP_NOT_EMPTY = "error.group.not_empty", //errmessage

    //Watchdog errors
    NO_DB_ENTITY = "error.no_db_entity", //errmessage

    //DreamMaker errors
    COMPILE_JOB_NOT_FOUND = "error.compile_job_not_found" //errmessage
}

type errorMessage = {
    errorMessage: ErrorMessageResponse;
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

export default class InternalError<T extends ErrorCode = ErrorCode> {
    public readonly code: T;
    public readonly desc?: Desc;
    public readonly extendedInfo: string;
    public readonly originalErrorMessage?: ErrorMessageResponse;

    public constructor(code: T, addon: allAddons, origin?: AxiosResponse) {
        this.code = code;
        if ("errorMessage" in addon) {
            const err = addon.errorMessage;
            this.originalErrorMessage = err;
            this.desc = {
                type: DescType.TEXT,
                desc: `${TGSErrorCode[err.errorCode]}: ${err.message}${
                    err.additionalData ? ": " + err.additionalData : ""
                }`
            };
            if (!err.message) {
                this.desc = {
                    type: DescType.TEXT,
                    desc: TGSErrorCode[err.errorCode]
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
        const stack = new Error().stack;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (origin?.config.headers["Authorization"]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            origin.config.headers["Authorization"] = "*********";
        }

        let debuginfo = JSON.stringify({ addon, origin, config: configOptions, stack }, null, 2);
        debuginfo = debuginfo.replace(/\\n/g, String.fromCharCode(10)); // replace with a litteral newline
        debuginfo = debuginfo.replace(
            /Basic (?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g,
            "Basic **************"
        );
        debuginfo = debuginfo.replace(/"username":.".+?"/g, '"username": "*******"');
        debuginfo = debuginfo.replace(/"password":.".+?"/g, '"password": "*******"');

        if (!CredentialsProvider.getLatestToken()) {
            // no token
            debuginfo = replaceAll(
                debuginfo,
                CredentialsProvider.getLatestToken(),
                "**************"
            );
        }

        if (configOptions.githubtoken.value) {
            debuginfo = replaceAll(
                debuginfo,
                configOptions.githubtoken.value as string,
                "**************"
            );
        }
        this.extendedInfo = debuginfo;

        console.error(
            `Error occured within the application: ${this.code} (${
                this.desc?.desc ?? "No description"
            })`,
            this
        );

        //@ts-expect-error yeah well, i aint extending the window interface
        if (window.breakonerror) {
            // eslint-disable-next-line no-debugger
            debugger;
        }
    }
}
