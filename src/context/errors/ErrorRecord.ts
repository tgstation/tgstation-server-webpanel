import { ErrorMessageFragment$data } from "@/components/graphql/__generated__/ErrorMessageFragment.graphql";

interface IErrorRecord {
    key: string;
    error: ErrorMessageFragment$data;
}

export default IErrorRecord;
