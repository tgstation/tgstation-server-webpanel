/**
 * File which routes all jsx components. So you don't have to do something like
 * ```
 * import x from "./cmp/x";
 * import y from "./cmp/y";
 * ```
 * now, you can do something like
 * import { x, y } from "./cmp"
 */

import AccessDenied from "./AccessDenied";
import ErrorAlert from "./ErrorAlert";
import ErrorBoundary from "./ErrorBoundary";
import InputField from "./InputField";
import JobCard from "./JobCard";
import JobsList from "./JobsList";
import Loading from "./Loading";
import NotFound from "./NotFound";
import Reload from "./Reload";
import WIPNotice from "./WIPNotice";

// can't do the `export X from "./X"` due to >>unnamed
export {
    AccessDenied,
    ErrorAlert,
    ErrorBoundary,
    InputField,
    JobCard,
    JobsList,
    Loading,
    NotFound,
    Reload,
    WIPNotice
};
