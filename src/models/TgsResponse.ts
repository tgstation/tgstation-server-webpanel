import ServerResponse from './ServerResponse';

type TgsResponse<TModel> = Promise<ServerResponse<TModel> | null>;

export default TgsResponse;
