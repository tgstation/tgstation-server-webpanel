import { GraphQLTaggedNode, useMutation, UseMutationConfig } from "react-relay";
import { Disposable, MutationParameters } from "relay-runtime";

import { ErrorMessageArrayFragment$key } from "@/components/graphql/__generated__/ErrorMessageArrayFragment.graphql";
import useMutationErrors from "@/contexts/errors/useMutationErrors";

type OverriddenMutationConfig<TMutation extends MutationParameters> = Omit<
    Omit<UseMutationConfig<TMutation>, "onCompleted">,
    "onErrors"
>;

const useStandardMutation = <TMutation extends MutationParameters>(
    mutation: GraphQLTaggedNode,
    responseErrorsSelector: (
        response: TMutation["response"]
    ) => ErrorMessageArrayFragment$key | null | undefined
): [(config: OverriddenMutationConfig<TMutation>) => Disposable, boolean] => {
    const [commit, inFlight] = useMutation<TMutation>(mutation);
    const [requestErrorHandler, payloadErrorsHandler, mutationErrorsHandler] = useMutationErrors();

    const overriddenCommit = (config: OverriddenMutationConfig<TMutation>) =>
        commit({
            onCompleted: (response, errors) => {
                mutationErrorsHandler(responseErrorsSelector(response));
                payloadErrorsHandler(errors);
            },
            onError: requestErrorHandler,
            ...config
        });

    return [overriddenCommit, inFlight];
};

export default useStandardMutation;
