import { graphql } from "react-relay";

const OpenPullRequestsData = graphql`
    query OpenPullRequestsDataQuery($repoOwner: String!, $repoName: String!) {
        repository(name: $repoName, owner: $repoOwner) {
            pullRequests(states: [OPEN]) {
                nodes {
                    author {
                        login
                    }
                    body
                    labels {
                        nodes {
                            name
                        }
                    }
                    mergeable
                    number
                    url
                    commits {
                        nodes {
                            commit {
                                message
                                id
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default OpenPullRequestsData;
