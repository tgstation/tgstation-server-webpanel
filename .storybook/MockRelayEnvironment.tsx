/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeDecorator } from "@storybook/preview-api";
import { RelayEnvironmentProvider } from "react-relay";
import { GraphQLTaggedNode, OperationType } from "relay-runtime";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { OperationMockResolver } from "relay-test-utils/lib/RelayModernMockEnvironment";
import { PartialDeep } from "type-fest";
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type ResolverReturnType<T> = T extends { resolve: infer U }
    ? ResolverReturnType<U>
    : T extends (...args: any[]) => infer U
    ? U
    : never;

type InferMockResolverFieldReturnType<T> = {
    [K in keyof T]: ResolverReturnType<T[K]> extends infer FieldResolverReturnType
        ? FieldResolverReturnType extends Primitive
            ? FieldResolverReturnType
            : PartialDeep<FieldResolverReturnType, { recurseIntoArrays: true }>
        : never;
};

type InferMockResolvers<T> = T extends object
    ? T extends infer U
        ? U extends (...args: any[]) => any
            ? never
            : U extends object
            ? {
                  [K in keyof U]?: (
                      context: MockPayloadGenerator.MockResolverContext,
                      generateId: () => string
                  ) => InferMockResolverFieldReturnType<U[K]>;
              }
            : never
        : never
    : never;

export type WithRelayParameters<TQuery extends OperationType, TResolvers = object> = {
    /**
     * A GraphQLTaggedNode returned by the relay's graphql`...` template literal.
     */
    query: GraphQLTaggedNode;

    /**
     * Optional. Variables to pass to the query.
     */
    variables?: TQuery["variables"];

    /**
     * Optional. Mock resolver object pass to the relay-test-utils MockPayloadGenerator.generate function.
     * If you use TResolver type argument, you can get type safety <3
     */
    mockResolvers?: InferMockResolvers<TResolvers>;

    setArgsSetter?: (newSetter: () => any) => void;
    /**
     * A function that returns an entry to be added to the story's args.
     *
     * @param queryResult Result of the useLazyLoadQuery hook with the query passed as parameter.
     * @returns An entry to be added to the story's args.
     */
};

export let MockRelayEnvironment = createMockEnvironment();

const AddMockRelayEnvironment = makeDecorator({
    name: "AddMockRelayEnvironment",
    parameterName: "relay",
    skipIfNoParametersOrOptions: true,
    wrapper: (getStory, context, { parameters }) => {
        const pars = parameters as WithRelayParameters<any>;

        const { query, variables = {}, mockResolvers = {} } = pars;

        const Renderer = () => {
            return getStory(context) as any;
        };

        MockRelayEnvironment = createMockEnvironment();

        const resolver: OperationMockResolver = operation =>
            MockPayloadGenerator.generate(operation, mockResolvers);
        MockRelayEnvironment.mock.queueOperationResolver(resolver);
        MockRelayEnvironment.mock.queuePendingOperation(query, variables);

        return (
            <RelayEnvironmentProvider environment={MockRelayEnvironment}>
                <Renderer />
            </RelayEnvironmentProvider>
        );
    }
});

export default AddMockRelayEnvironment;
