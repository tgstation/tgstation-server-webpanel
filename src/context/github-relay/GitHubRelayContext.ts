import { createContext } from "react";
import { Environment } from "relay-runtime";

const GitHubRelayContext = createContext<Environment | null>(null);

export default GitHubRelayContext;
