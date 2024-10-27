import { PayloadError } from "relay-runtime";

import { ErrorMessageSingleFragment$data } from "@/components/graphql/__generated__/ErrorMessageSingleFragment.graphql";

interface IErrorRecord {
    key: string;
    error: ErrorMessageSingleFragment$data | Error | PayloadError;
}

export default IErrorRecord;
