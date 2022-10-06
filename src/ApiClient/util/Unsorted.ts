import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
    Api,
    ErrorMessageResponse,
    HttpClient
} from "./generatedcode/generated";

export const ApiResponseInterceptor = {
	onFulfilled: (val: AxiosResponse) => val,
	// it is real, we do not know what type though
	onRejected: async (error: AxiosError, axiosServer: HttpClient): Promise<AxiosResponse> => {
		//THIS IS SNOWFLAKE KEKW
		//As the above comment mentions, this shitcode is very snowflake
		// it tries to typecast the "response" we got into an error then tries to check if that "error" is
		// the snowflake no apipath github error, if it is, it rejects the promise to send it to the catch block
		// all endpoints have which simply returns the error wrapped in a status object
		const snowflake = (error as unknown) as InternalError<ErrorCode.NO_APIPATH>;
		if (snowflake?.code === ErrorCode.NO_APIPATH) {
			return Promise.reject(snowflake);
		}

		//This was originally an else clause at the bottom but it made it hard to find
		// if the promise rejected and its not because its a globally handled status code
		// it means that axios created an error itself for an unknown reason(network failure,
		// cors failure, user is navigating away, aborting requests, etc). Simply return the error
		// as a globally handled error.
		if (
			!(
				error.response &&
				error.response.status &&
				AuthController.globalHandledCodes.includes(error.response.status)
			)
		) {
			const err = error as Error;
			const errorobj = new InternalError(
				ErrorCode.AXIOS,
				{ jsError: err },
				error.response
			);
			return Promise.reject(errorobj);
		}

		//I am sorry, this is the bulk of the shitcode, its a massive switch that handles every single
		// globally handled status code and sometimes not so globally because one endpoint decided it would be
		const res = error.response as AxiosResponse<unknown>;
		switch (error.response.status) {
			//Error code 400: Bad request, show message to user and instruct them to report it as its probably a bug
			case 400: {
				const errorMessage = res.data as ErrorMessageResponse;
				const errorobj = new InternalError(
					ErrorCode.HTTP_BAD_REQUEST,
					{ errorMessage },
					res
				);
				return Promise.reject(errorobj);
			}
			//Error code 401: Access Denied, fired whenever a token expires, in that case, attempt to reauthenticate
			// using the last known working credentials, if that succeeds, reissue the request, otherwise logout the
			// user and kick them to the login page. Snowflake behaviour: Acts as a failed login for the login endpoint
			case 401: {
				const request = error.config;
				if ((request.url === "/" || request.url === "") && request.method === "post") {
					return Promise.resolve(error.response);
				}

				// do not autologin if the user deliberitely logged out
				const errorobj = new InternalError(
					ErrorCode.HTTP_ACCESS_DENIED,
					{ void: true },
					res
				);
				return Promise.reject(errorobj);
			}
			case 403: {
				const request = error.config;
				if ((request.url === "/" || request.url === "") && request.method === "post") {
					return Promise.resolve(error.response);
				}
				const errorobj = new InternalError(
					ErrorCode.HTTP_ACCESS_DENIED,
					{ void: true },
					res
				);
				return Promise.reject(errorobj);
			}
			case 406: {
				const errorobj = new InternalError(
					ErrorCode.HTTP_NOT_ACCEPTABLE,
					{ void: true },
					res
				);
				return Promise.reject(errorobj);
			}
			case 409: {
				const errorMessage = res.data as ErrorMessageResponse;

				//Thanks for reusing a global erorr status cyber. Log operations can return 409
				const request = error.config;
				if (request.url === "/Administration/Logs" && request.method === "get") {
					return Promise.resolve(error.response);
				}

				const errorobj = new InternalError(
					ErrorCode.HTTP_DATA_INEGRITY,
					{ errorMessage },
					res
				);
				return Promise.reject(errorobj);
			}
			case 426: {
				const errorMessage = res.data as ErrorMessageResponse;
				const errorobj = new InternalError(
					ErrorCode.HTTP_API_MISMATCH,
					{ errorMessage },
					res
				);
				return Promise.reject(errorobj);
			}
			case 500: {
				const errorMessage = res.data as ErrorMessageResponse;
				const errorobj = new InternalError(
					ErrorCode.HTTP_SERVER_ERROR,
					{ errorMessage },
					res
				);
				return Promise.reject(errorobj);
			}
			case 501: {
				const errorMessage = res.data as ErrorMessageResponse;
				const errorobj = new InternalError(
					ErrorCode.HTTP_UNIMPLEMENTED,
					{ errorMessage },
					res
				);
				return Promise.reject(errorobj);
			}
			case 503: {
				console.log("Server not ready, delaying request", error.config);
				await new Promise(resolve => {
					setTimeout(resolve, 5000);
				});
				return await axiosServer.request({
					secure: true,
					path: error.config.url!,
					...error.config
				});
			}
			default: {
				const errorobj = new InternalError(
					ErrorCode.UNHANDLED_GLOBAL_RESPONSE,
					{ axiosResponse: res },
					res
				);
				return Promise.reject(errorobj);
			}
		}
	}
};
