import { useContext } from "react";

import GitHubRelayContext from "./GitHubRelayContext";

const useGitHubRelay = () => useContext(GitHubRelayContext);

export default useGitHubRelay;
