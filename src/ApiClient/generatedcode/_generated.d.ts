import {
    OpenAPIClient,
    Parameters,
    UnknownParamsObject,
    OperationResponse,
    AxiosRequestConfig
} from 'openapi-client-axios';

declare namespace Components {
    namespace Parameters {
        export type Api = string; // productheader
        export type Instance = number;
        export type UserAgent = string; // productheader
    }
    namespace Responses {
        export type $400 = Schemas.ErrorMessage;
        export type $401 = void;
        export type $403 = void;
        export type $409 = Schemas.ErrorMessage;
        export type $500 = Schemas.ErrorMessage;
        export type $501 = Schemas.ErrorMessage;
        export type $503 = void;
    }
    namespace Schemas {
        /**
         * Represents administrative server information
         */
        export interface Administration {
            /**
             * If the server is running on a windows operating system
             */
            windowsHost: boolean;
            /**
             * The GitHub repository the server is built to recieve updates from
             */
            trackedRepositoryUrl: string | null; // uri
            /**
             * The latest available version of the Tgstation.Server.Host assembly from the upstream repository. If System.Version.Major is higher than Tgstation.Server.Api.Models.Administration.NewVersion's the update cannot be applied due to API changes
             */
            latestVersion: string | null;
            /**
             * Changes the version of Tgstation.Server.Host to the given version from the upstream repository
             */
            newVersion: string | null;
        }
        /**
         * Rights for Tgstation.Server.Api.Models.Administration
         */
        export type AdministrationRights = 0 | 1 | 2 | 4 | 8 | 16 | 32; // int64
        /**
         * Represents a BYOND installation. Tgstation.Server.Api.Models.Internal.RawData.Content is used to upload custom BYOND version zip files, though Tgstation.Server.Api.Models.Byond.Version must still be set.
         */
        export interface Byond {
            /**
             * The System.Version of the Tgstation.Server.Api.Models.Byond installation used for new compiles. Will be <see langword="null" /> if the user does not have permission to view it or there is no BYOND version installed. Only considers the System.Version.Major and System.Version.Minor numbers.
             */
            version: string | null;
            installJob: Job;
            /**
             * The bytes of the Tgstation.Server.Api.Models.Internal.RawData.
             */
            content: string | null; // byte
        }
        /**
         * Rights for Tgstation.Server.Api.Models.Byond
         */
        export type ByondRights = 0 | 1 | 2 | 4 | 8; // int64
        export interface ChatBot {
            /**
             * Channels the Discord bot should listen/announce in
             */
            channels: ChatChannel[] | null;
            /**
             * The settings id
             */
            id: number; // int64
            /**
             * The name of the connection
             */
            name: string;
            /**
             * If the connection is enabled
             */
            enabled: boolean | null;
            /**
             * The time interval in minutes the chat bot attempts to reconnect if Tgstation.Server.Api.Models.Internal.ChatBot.Enabled and disconnected. Must not be zero.
             */
            reconnectionInterval: number; // int32
            /**
             * The maximum number of Tgstation.Server.Api.Models.ChatChannels the Tgstation.Server.Api.Models.Internal.ChatBot may contain.
             */
            channelLimit: number; // int32
            provider: ChatProvider; // int32
            /**
             * The information used to connect to the Tgstation.Server.Api.Models.Internal.ChatBot.Provider
             */
            connectionString: string;
        }
        /**
         * Rights for Tgstation.Server.Api.Models.ChatBot
         */
        export type ChatBotRights = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024; // int64
        /**
         * Indicates a chat channel
         */
        export interface ChatChannel {
            /**
             * The IRC channel name. Also potentially contains the channel passsword (if separated by a colon).
             * If multiple copies of the same channel with different keys are added to the server, the one that will be used is undefined.
             */
            ircChannel: string | null;
            /**
             * The Discord channel ID
             */
            discordChannelId: null | number; // int64
            /**
             * If the Tgstation.Server.Api.Models.ChatChannel is an admin channel
             */
            isAdminChannel: boolean;
            /**
             * If the Tgstation.Server.Api.Models.ChatChannel is a watchdog channel
             */
            isWatchdogChannel: boolean;
            /**
             * If the Tgstation.Server.Api.Models.ChatChannel is an updates channel
             */
            isUpdatesChannel: boolean;
            /**
             * A custom tag users can define to group channels together
             */
            tag: string | null;
        }
        /**
         * Represents a chat service provider
         */
        export type ChatProvider = 0 | 1; // int32
        export interface CompileJob {
            job: Job;
            revisionInformation: RevisionInformation;
            /**
             * The Tgstation.Server.Api.Models.Byond.Version the Tgstation.Server.Api.Models.CompileJob was made with
             */
            byondVersion: string | null;
            /**
             * The .dme file used for compilation
             */
            dmeName: string;
            /**
             * Textual output of DM
             */
            output: string;
            /**
             * The Game folder the results were compiled into
             */
            directoryName: string; // uuid
            minimumSecurityLevel: DreamDaemonSecurity; // int32
            /**
             * The DMAPI System.Version.
             */
            dmApiVersion: string | null;
            /**
             * The ID of the entity.
             */
            id: number; // int64
        }
        /**
         * Represents a game configuration file. Create and delete actions uncerimonuously overwrite/delete files
         */
        export interface ConfigurationFile {
            /**
             * The path to the Tgstation.Server.Api.Models.ConfigurationFile file
             */
            path: string | null;
            /**
             * If access to the Tgstation.Server.Api.Models.ConfigurationFile file was denied for the operation
             */
            accessDenied: boolean | null;
            /**
             * If Tgstation.Server.Api.Models.ConfigurationFile.Path represents a directory
             */
            isDirectory: boolean | null;
            /**
             * The MD5 hash of the file when last read by the user. If this doesn't match during update actions, the write will be denied with System.Net.HttpStatusCode.Conflict
             */
            lastReadHash: string | null;
            /**
             * The bytes of the Tgstation.Server.Api.Models.Internal.RawData.
             */
            content: string | null; // byte
        }
        /**
         * Rights for Tgstation.Server.Api.Models.ConfigurationFile
         */
        export type ConfigurationRights = 0 | 1 | 2 | 4 | 8; // int64
        /**
         * The type of configuration allowed on an Tgstation.Server.Api.Models.Instance
         */
        export type ConfigurationType = 0 | 1 | 2; // int32
        /**
         * Represents an instance of BYOND's DreamDaemon game server. Create action starts the server. Delete action shuts down the server
         */
        export interface DreamDaemon {
            activeCompileJob: CompileJob;
            stagedCompileJob: CompileJob;
            status: WatchdogStatus; // int32
            currentSecurity: DreamDaemonSecurity; // int32
            /**
             * The port the running Tgstation.Server.Api.Models.DreamDaemon instance is set to
             */
            currentPort: null | number; // int32
            /**
             * The webclient status the running Tgstation.Server.Api.Models.DreamDaemon instance is set to
             */
            currentAllowWebclient: boolean | null;
            /**
             * If the server is undergoing a soft reset. This may be automatically set by changes to other fields
             */
            softRestart: boolean | null;
            /**
             * If the server is undergoing a soft shutdown
             */
            softShutdown: boolean | null;
            /**
             * If a dump of the active DreamDaemon executable should be created.
             */
            createDump: boolean | null;
            /**
             * If Tgstation.Server.Api.Models.DreamDaemon starts when it's Tgstation.Server.Api.Models.Instance starts
             */
            autoStart: boolean;
            /**
             * If the BYOND web client can be used to connect to the game server
             */
            allowWebClient: boolean;
            securityLevel: DreamDaemonSecurity; // int32
            /**
             * The first port Tgstation.Server.Api.Models.DreamDaemon uses. This should be the publically advertised port
             */
            primaryPort: number; // int32
            /**
             * The second port Tgstation.Server.Api.Models.DreamDaemon uses
             */
            secondaryPort: number; // int32
            /**
             * The DreamDaemon startup timeout in seconds
             */
            startupTimeout: number; // int32
            /**
             * The number of seconds between each watchdog heartbeat. 0 disables.
             */
            heartbeatSeconds: number; // int32
            /**
             * The timeout for sending and receiving BYOND topics in milliseconds.
             */
            topicRequestTimeout: number; // int32
        }
        /**
         * Rights for Tgstation.Server.Api.Models.DreamDaemon
         */
        export type DreamDaemonRights =
            | 0
            | 1
            | 2
            | 4
            | 8
            | 16
            | 32
            | 64
            | 128
            | 256
            | 512
            | 1024
            | 2048
            | 4096
            | 8192
            | 16384; // int64
        /**
         * DreamDaemon's security level
         */
        export type DreamDaemonSecurity = 0 | 1 | 2; // int32
        /**
         * Represents the state of the DreamMaker compiler. Create action starts a new compile. Delete action cancels the current compile
         */
        export interface DreamMaker {
            /**
             * The .dme file Tgstation.Server.Api.Models.DreamMaker tries to compile with without the extension
             */
            projectName: string | null;
            /**
             * The port used during compilation to validate the DMAPI
             */
            apiValidationPort: number; // int32
            apiValidationSecurityLevel: DreamDaemonSecurity; // int32
        }
        /**
         * Rights for Tgstation.Server.Api.Models.DreamMaker
         */
        export type DreamMakerRights = 0 | 1 | 2 | 4 | 8 | 16 | 32 | 64; // int64
        /**
         * Common base of Tgstation.Server.Api.Models.Instances, Tgstation.Server.Api.Models.CompileJobs, and Tgstation.Server.Api.Models.Jobs.
         */
        export interface EntityId {
            /**
             * The ID of the entity.
             */
            id: number; // int64
        }
        /**
         * Types of Tgstation.Server.Api.Models.ErrorMessages that the API may return.
         */
        export type ErrorCode =
            | 0
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
            | 11
            | 12
            | 13
            | 14
            | 15
            | 16
            | 17
            | 18
            | 19
            | 20
            | 21
            | 22
            | 23
            | 24
            | 25
            | 26
            | 27
            | 28
            | 29
            | 30
            | 31
            | 32
            | 33
            | 34
            | 35
            | 36
            | 37
            | 38
            | 39
            | 40
            | 41
            | 42
            | 43
            | 44
            | 45
            | 46
            | 47
            | 48
            | 49
            | 50
            | 51
            | 52
            | 53
            | 54
            | 55
            | 56
            | 57
            | 58
            | 59
            | 60
            | 61
            | 62
            | 63
            | 64
            | 65
            | 66
            | 67
            | 68
            | 69
            | 70
            | 71
            | 72
            | 73
            | 74
            | 75
            | 76
            | 77
            | 78
            | 79
            | 80
            | 81
            | 82
            | 83
            | 84
            | 85
            | 86
            | 87
            | 88; // int32
        /**
         * Represents an error message returned by the server
         */
        export interface ErrorMessage {
            /**
             * The version of the API the server is using
             */
            serverApiVersion: string;
            /**
             * A human readable description of the error
             */
            message: string;
            /**
             * Additional data associated with the error message.
             */
            additionalData: string | null;
            errorCode: ErrorCode; // int32
        }
        /**
         * Metadata about a server instance
         */
        export interface Instance {
            /**
             * The name of the Tgstation.Server.Api.Models.Instance
             */
            name: string;
            /**
             * The path to where the Tgstation.Server.Api.Models.Instance is located. Can only be changed while the Tgstation.Server.Api.Models.Instance is offline. Must not exist when the instance is created
             */
            path: string;
            /**
             * If the Tgstation.Server.Api.Models.Instance is online
             */
            online: boolean;
            configurationType: ConfigurationType; // int32
            /**
             * The time interval in minutes the repository is automatically pulled and compiles. 0 disables
             */
            autoUpdateInterval: number; // int32
            /**
             * The maximum number of Tgstation.Server.Api.Models.ChatBots the Tgstation.Server.Api.Models.Instance may contain.
             */
            chatBotLimit: number; // int32
            moveJob: Job;
            /**
             * The ID of the entity.
             */
            id: number; // int64
        }
        /**
         * Rights for managing Tgstation.Server.Api.Models.Instances
         */
        export type InstanceManagerRights =
            | 0
            | 1
            | 2
            | 4
            | 8
            | 16
            | 32
            | 64
            | 128
            | 256
            | 512
            | 1024; // int64
        /**
         * Represents a Tgstation.Server.Api.Models.Users permissions in an Tgstation.Server.Api.Models.Instance
         */
        export interface InstanceUser {
            /**
             * The Tgstation.Server.Api.Models.Internal.User.Id of the Tgstation.Server.Api.Models.User the Tgstation.Server.Api.Models.InstanceUser belongs to
             */
            userId: number; // int64
            instanceUserRights: InstanceUserRights; // int64
            byondRights: ByondRights; // int64
            dreamDaemonRights: DreamDaemonRights; // int64
            dreamMakerRights: DreamMakerRights; // int64
            repositoryRights: RepositoryRights; // int64
            chatBotRights: ChatBotRights; // int64
            configurationRights: ConfigurationRights; // int64
        }
        /**
         * Rights for an Tgstation.Server.Api.Models.Instance
         */
        export type InstanceUserRights = 0 | 1 | 2 | 4; // int64
        /**
         * Represents a long running job on the server. Model is read-only, updates attempt to cancel the job
         */
        export interface Job {
            startedBy: User;
            cancelledBy: User;
            /**
             * Optional progress between 0 and 100 inclusive
             */
            progress: null | number; // int32
            /**
             * English description of the Tgstation.Server.Api.Models.Internal.Job
             */
            description: string;
            errorCode: ErrorCode; // int32
            /**
             * Details of any exceptions caught during the Tgstation.Server.Api.Models.Internal.Job
             */
            exceptionDetails: string | null;
            /**
             * When the Tgstation.Server.Api.Models.Internal.Job was started
             */
            startedAt: string; // date-time
            /**
             * When the Tgstation.Server.Api.Models.Internal.Job stopped
             */
            stoppedAt: string | null; // date-time
            /**
             * If the Tgstation.Server.Api.Models.Internal.Job was cancelled
             */
            cancelled: boolean;
            cancelRightsType: RightsType; // int64
            /**
             * The N:Tgstation.Server.Api.Rights required to cancel the Tgstation.Server.Api.Models.Internal.Job
             */
            cancelRight: null | number; // int64
            /**
             * The ID of the entity.
             */
            id: number; // int64
        }
        /**
         * Represents a server log file.
         */
        export interface LogFile {
            /**
             * The name of the log file.
             */
            name: string | null;
            /**
             * The System.DateTimeOffset of when the log file was modified.
             */
            lastModified: string; // date-time
            /**
             * The bytes of the Tgstation.Server.Api.Models.Internal.RawData.
             */
            content: string | null; // byte
        }
        /**
         * Represents a git repository
         */
        export interface Repository {
            /**
             * The origin URL. If <see langword="null" />, the Tgstation.Server.Api.Models.Repository does not exist
             */
            origin: string | null;
            /**
             * If submodules should be recursively cloned.
             */
            recurseSubmodules: boolean | null;
            /**
             * The commit HEAD should point to. Not populated in responses, use Tgstation.Server.Api.Models.Repository.RevisionInformation instead for retrieval
             */
            checkoutSha: string | null;
            revisionInformation: RevisionInformation;
            /**
             * If the repository was cloned from GitHub.com this will be set with the owner of the repository
             */
            gitHubOwner: string | null;
            /**
             * If the repository was cloned from GitHub.com this will be set with the name of the repository
             */
            gitHubName: string | null;
            activeJob: Job;
            /**
             * Do the equivalent of a git pull. Will attempt to merge unless Tgstation.Server.Api.Models.Repository.Reference is also specified in which case a hard reset will be performed after checking out
             */
            updateFromOrigin: boolean | null;
            /**
             * The branch or tag HEAD points to
             */
            reference: string | null;
            /**
             * Tgstation.Server.Api.Models.TestMergeParameters for new Tgstation.Server.Api.Models.TestMerges. Note that merges that conflict will not be performed
             */
            newTestMerges: TestMergeParameters[] | null;
            /**
             * The name of the committer
             */
            committerName: string;
            /**
             * The e-mail of the committer
             */
            committerEmail: string; // email
            /**
             * The username to access the git repository with
             */
            accessUser: string | null;
            /**
             * The token/password to access the git repository with
             */
            accessToken: string | null;
            /**
             * If commits created from testmerges are pushed to the remote
             */
            pushTestMergeCommits: boolean;
            /**
             * If test merge commits are signed with the username of the person who merged it. Note this only affects future commits
             */
            showTestMergeCommitters: boolean;
            /**
             * If test merge commits should be kept when auto updating. May cause merge conflicts which will block the update
             */
            autoUpdatesKeepTestMerges: boolean;
            /**
             * If synchronization should occur when auto updating
             */
            autoUpdatesSynchronize: boolean;
            /**
             * If test merging should create a comment
             */
            postTestMergeComment: boolean;
        }
        /**
         * Rights for a Tgstation.Server.Api.Models.Repository
         */
        export type RepositoryRights =
            | 0
            | 1
            | 2
            | 4
            | 8
            | 16
            | 32
            | 64
            | 128
            | 256
            | 512
            | 1024
            | 2048
            | 4096; // int64
        export interface RevisionInformation {
            primaryTestMerge: TestMerge;
            /**
             * The Tgstation.Server.Api.Models.TestMerges active in the Tgstation.Server.Api.Models.RevisionInformation
             */
            activeTestMerges: TestMerge[] | null;
            /**
             * The Tgstation.Server.Api.Models.CompileJobs made from the Tgstation.Server.Api.Models.RevisionInformation
             */
            compileJobs: EntityId[] | null;
            /**
             * The revision sha
             */
            commitSha: string;
            /**
             * The sha of the most recent remote commit
             */
            originCommitSha: string;
        }
        /**
         * The type of rights a model uses
         */
        export type RightsType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // int64
        /**
         * Represents basic server information.
         */
        export interface ServerInformation {
            /**
             * The version of the host
             */
            version: string | null;
            /**
             * The N:Tgstation.Server.Api version of the host
             */
            apiVersion: string | null;
            /**
             * The DMAPI version of the host.
             */
            dmApiVersion: string | null;
            /**
             * Minimum length of database user passwords.
             */
            minimumPasswordLength: number; // int32
            /**
             * The maximum number of Tgstation.Server.Api.Models.Instances allowed.
             */
            instanceLimit: number; // int32
            /**
             * The maximum number of Tgstation.Server.Api.Models.Users allowed.
             */
            userLimit: number; // int32
            /**
             * Limits the locations instances may be created or attached from.
             */
            validInstancePaths: string[] | null;
        }
        /**
         * Represents a server Tgstation.Server.Api.Models.Internal.User
         */
        export interface ShallowUser {
            /**
             * The ID of the Tgstation.Server.Api.Models.Internal.User
             */
            id: number; // int64
            /**
             * If the Tgstation.Server.Api.Models.Internal.User is enabled since users cannot be deleted. System users cannot be disabled
             */
            enabled: boolean;
            /**
             * When the Tgstation.Server.Api.Models.Internal.User was created
             */
            createdAt: string; // date-time
            /**
             * The SID/UID of the Tgstation.Server.Api.Models.Internal.User on Windows/POSIX respectively
             */
            systemIdentifier: string | null;
            /**
             * The name of the Tgstation.Server.Api.Models.Internal.User
             */
            name: string;
            administrationRights: AdministrationRights; // int64
            instanceManagerRights: InstanceManagerRights; // int64
        }
        export interface TestMerge {
            mergedBy: User;
            /**
             * The ID of the Tgstation.Server.Api.Models.Internal.TestMerge
             */
            id: number; // int64
            /**
             * When the Tgstation.Server.Api.Models.Internal.TestMerge was created
             */
            mergedAt: string; // date-time
            /**
             * The title of the pull request
             */
            titleAtMerge: string;
            /**
             * The body of the pull request
             */
            bodyAtMerge: string;
            /**
             * The URL of the pull request
             */
            url: string;
            /**
             * The author of the pull request
             */
            author: string;
            /**
             * The number of the pull request
             */
            number: number; // int32
            /**
             * The sha of the pull request revision to merge. If not specified, the latest commit shall be used (semi-unsafe)
             */
            pullRequestRevision: string;
            /**
             * Optional comment about the test
             */
            comment: string | null;
        }
        /**
         * Parameters for creating a Tgstation.Server.Api.Models.TestMerge
         */
        export interface TestMergeParameters {
            /**
             * The number of the pull request
             */
            number: number; // int32
            /**
             * The sha of the pull request revision to merge. If not specified, the latest commit shall be used (semi-unsafe)
             */
            pullRequestRevision: string;
            /**
             * Optional comment about the test
             */
            comment: string | null;
        }
        /**
         * Represents a JWT returned by the API
         */
        export interface Token {
            /**
             * The value of the JWT
             */
            bearer: string | null;
            /**
             * When the Tgstation.Server.Api.Models.Token expires
             */
            expiresAt: string; // date-time
        }
        export interface User {
            createdBy: ShallowUser;
            /**
             * The ID of the Tgstation.Server.Api.Models.Internal.User
             */
            id: number; // int64
            /**
             * If the Tgstation.Server.Api.Models.Internal.User is enabled since users cannot be deleted. System users cannot be disabled
             */
            enabled: boolean;
            /**
             * When the Tgstation.Server.Api.Models.Internal.User was created
             */
            createdAt: string; // date-time
            /**
             * The SID/UID of the Tgstation.Server.Api.Models.Internal.User on Windows/POSIX respectively
             */
            systemIdentifier: string | null;
            /**
             * The name of the Tgstation.Server.Api.Models.Internal.User
             */
            name: string;
            administrationRights: AdministrationRights; // int64
            instanceManagerRights: InstanceManagerRights; // int64
        }
        /**
         * For editing a given Tgstation.Server.Api.Models.User. Will never be returned by the API
         */
        export interface UserUpdate {
            /**
             * Cleartext password of the Tgstation.Server.Api.Models.User
             */
            password: string;
            createdBy: ShallowUser;
            /**
             * The ID of the Tgstation.Server.Api.Models.Internal.User
             */
            id: number; // int64
            /**
             * If the Tgstation.Server.Api.Models.Internal.User is enabled since users cannot be deleted. System users cannot be disabled
             */
            enabled: boolean;
            /**
             * When the Tgstation.Server.Api.Models.Internal.User was created
             */
            createdAt: string; // date-time
            /**
             * The SID/UID of the Tgstation.Server.Api.Models.Internal.User on Windows/POSIX respectively
             */
            systemIdentifier: string | null;
            /**
             * The name of the Tgstation.Server.Api.Models.Internal.User
             */
            name: string;
            administrationRights: AdministrationRights; // int64
            instanceManagerRights: InstanceManagerRights; // int64
        }
        /**
         * The current status of the watchdog.
         */
        export type WatchdogStatus = 0 | 1 | 2 | 3; // int32
    }
}
declare namespace Paths {
    namespace AdministrationControllerDelete {
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $422 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace AdministrationControllerGetLog {
        namespace Parameters {
            /**
             * The path to download.
             */
            export type Path = string | null;
        }
        export interface PathParameters {
            path: Parameters.Path;
        }
        namespace Responses {
            export type $200 = Components.Schemas.LogFile[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace AdministrationControllerListLogs {
        namespace Responses {
            export type $200 = Components.Schemas.LogFile[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace AdministrationControllerRead {
        namespace Responses {
            export type $200 = Components.Schemas.Administration;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $424 = Components.Schemas.ErrorMessage;
            export type $429 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace AdministrationControllerUpdate {
        export type RequestBody = Components.Schemas.Administration;
        namespace Responses {
            export type $202 = Components.Schemas.Administration;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $422 = Components.Schemas.ErrorMessage;
            export type $424 = Components.Schemas.ErrorMessage;
            export type $429 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ByondControllerList {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Byond[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ByondControllerRead {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Byond;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ByondControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.Byond;
        namespace Responses {
            export type $200 = Components.Schemas.Byond;
            export type $202 = Components.Schemas.Byond;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ChatControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.ChatBot;
        namespace Responses {
            export type $201 = Components.Schemas.ChatBot;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ChatControllerDelete {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.Internal.ChatBot.Id to delete.
             */
            export type Id = number; // int64
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ChatControllerGetId {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.Internal.ChatBot.Id to retrieve.
             */
            export type Id = number; // int64
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.ChatBot;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ChatControllerList {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ChatBot[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ChatControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.ChatBot;
        namespace Responses {
            export type $200 = Components.Schemas.ChatBot;
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.ConfigurationFile;
        namespace Responses {
            export type $200 = Components.Schemas.ConfigurationFile;
            export type $201 = Components.Schemas.ConfigurationFile;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerDelete {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.ConfigurationFile;
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerDirectory {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The path of the directory to get
             */
            export type DirectoryPath = string | null;
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            directoryPath: Parameters.DirectoryPath;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigurationFile[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerFile {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The path of the file to get
             */
            export type FilePath = string | null;
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            filePath: Parameters.FilePath;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigurationFile;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerList {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConfigurationFile[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace ConfigurationControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.ConfigurationFile;
        namespace Responses {
            export type $200 = Components.Schemas.ConfigurationFile;
            export type $201 = Components.Schemas.ConfigurationFile;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $202 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerCreateDump {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $202 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerDelete {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerRead {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.DreamDaemon;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerRestart {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $202 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamDaemonControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.DreamDaemon;
        namespace Responses {
            export type $200 = Components.Schemas.DreamDaemon;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamMakerControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $202 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamMakerControllerGetId {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.EntityId.Id.
             */
            export type Id = number; // int64
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.CompileJob;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $404 = Components.Schemas.ErrorMessage;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamMakerControllerList {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.EntityId[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamMakerControllerRead {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.DreamMaker;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace DreamMakerControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.DreamMaker;
        namespace Responses {
            export type $200 = Components.Schemas.DreamMaker;
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace HomeControllerCreateToken {
        namespace Responses {
            export type $200 = Components.Schemas.Token;
            export type $400 = Components.Responses.$400;
            export type $401 = void;
            export type $403 = void;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace HomeControllerHome {
        namespace Responses {
            export type $200 = Components.Schemas.ServerInformation;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerCreate {
        export type RequestBody = Components.Schemas.Instance;
        namespace Responses {
            export type $200 = Components.Schemas.Instance;
            export type $201 = Components.Schemas.Instance;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerDelete {
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.EntityId.Id of the instance to detach.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerGetId {
        namespace Parameters {
            /**
             * The instance Tgstation.Server.Api.Models.EntityId.Id to retrieve.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.Instance;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerGrantPermissions {
        namespace Parameters {
            /**
             * The instance Tgstation.Server.Api.Models.EntityId.Id to give permissions on.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerList {
        namespace Responses {
            export type $200 = Components.Schemas.Instance[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceControllerUpdate {
        export type RequestBody = Components.Schemas.Instance;
        namespace Responses {
            export type $200 = Components.Schemas.Instance;
            export type $202 = Components.Schemas.Instance;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.InstanceUser;
        namespace Responses {
            export type $201 = Components.Schemas.InstanceUser;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerDelete {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.InstanceUser.UserId to delete.
             */
            export type Id = number; // int64
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $204 = void;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerGetId {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.InstanceUser.UserId.
             */
            export type Id = number; // int64
            export type Instance = Components.Parameters.Instance;
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.InstanceUser;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerList {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.InstanceUser[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerRead {
        namespace Responses {
            export type $200 = Components.Schemas.InstanceUser;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace InstanceUserControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.InstanceUser;
        namespace Responses {
            export type $200 = Components.Schemas.InstanceUser;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace JobControllerDelete {
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.EntityId.Id of the Tgstation.Server.Api.Models.Job to cancel.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $202 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $404 = Components.Schemas.ErrorMessage;
            export type $409 = Components.Responses.$409;
            export type $410 = void;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace JobControllerGetId {
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.EntityId.Id of the Tgstation.Server.Api.Models.Job to retrieve.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.Job;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $404 = Components.Schemas.ErrorMessage;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace JobControllerList {
        namespace Responses {
            export type $200 = Components.Schemas.EntityId[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace JobControllerRead {
        namespace Responses {
            export type $200 = Components.Schemas.Job[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace RepositoryControllerCreate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.Repository;
        namespace Responses {
            export type $201 = Components.Schemas.Repository;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace RepositoryControllerDelete {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $202 = Components.Schemas.Repository;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace RepositoryControllerRead {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Repository;
            export type $201 = Components.Schemas.Repository;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace RepositoryControllerUpdate {
        export interface HeaderParameters {
            instance: Parameters.Instance;
        }
        namespace Parameters {
            export type Instance = Components.Parameters.Instance;
        }
        export type RequestBody = Components.Schemas.Repository;
        namespace Responses {
            export type $200 = Components.Schemas.Repository;
            export type $202 = Components.Schemas.Repository;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = Components.Schemas.ErrorMessage;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace UserControllerCreate {
        export type RequestBody = Components.Schemas.UserUpdate;
        namespace Responses {
            export type $201 = Components.Schemas.User;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $410 = void;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace UserControllerGetId {
        namespace Parameters {
            /**
             * The Tgstation.Server.Api.Models.Internal.User.Id to retrieve.
             */
            export type Id = number; // int64
        }
        export interface PathParameters {
            id: Parameters.Id; // int64
        }
        namespace Responses {
            export type $200 = Components.Schemas.User;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $404 = Components.Schemas.ErrorMessage;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace UserControllerList {
        namespace Responses {
            export type $200 = Components.Schemas.User[];
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace UserControllerRead {
        namespace Responses {
            export type $200 = Components.Schemas.User;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
    namespace UserControllerUpdate {
        export type RequestBody = Components.Schemas.UserUpdate;
        namespace Responses {
            export type $200 = Components.Schemas.User;
            export type $400 = Components.Responses.$400;
            export type $401 = Components.Responses.$401;
            export type $403 = Components.Responses.$403;
            export type $404 = Components.Schemas.ErrorMessage;
            export type $409 = Components.Responses.$409;
            export type $500 = Components.Responses.$500;
            export type $501 = Components.Responses.$501;
            export type $503 = Components.Responses.$503;
        }
    }
}

export interface OperationMethods {
    /**
     * AdministrationController_Read - Get Tgstation.Server.Api.Models.Administration server information.
     */
    AdministrationController_Read(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.AdministrationControllerRead.Responses.$200
        | Paths.AdministrationControllerRead.Responses.$400
        | Paths.AdministrationControllerRead.Responses.$401
        | Paths.AdministrationControllerRead.Responses.$403
        | Paths.AdministrationControllerRead.Responses.$409
        | Paths.AdministrationControllerRead.Responses.$424
        | Paths.AdministrationControllerRead.Responses.$429
        | Paths.AdministrationControllerRead.Responses.$500
        | Paths.AdministrationControllerRead.Responses.$501
        | Paths.AdministrationControllerRead.Responses.$503
    >;
    /**
     * AdministrationController_Update - Attempt to perform a server upgrade.
     */
    AdministrationController_Update(
        parameters?: Parameters<UnknownParamsObject>,
        data?: Paths.AdministrationControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.AdministrationControllerUpdate.Responses.$202
        | Paths.AdministrationControllerUpdate.Responses.$400
        | Paths.AdministrationControllerUpdate.Responses.$401
        | Paths.AdministrationControllerUpdate.Responses.$403
        | Paths.AdministrationControllerUpdate.Responses.$409
        | Paths.AdministrationControllerUpdate.Responses.$410
        | Paths.AdministrationControllerUpdate.Responses.$422
        | Paths.AdministrationControllerUpdate.Responses.$424
        | Paths.AdministrationControllerUpdate.Responses.$429
        | Paths.AdministrationControllerUpdate.Responses.$500
        | Paths.AdministrationControllerUpdate.Responses.$501
        | Paths.AdministrationControllerUpdate.Responses.$503
    >;
    /**
     * AdministrationController_Delete - Attempts to restart the server.
     */
    AdministrationController_Delete(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.AdministrationControllerDelete.Responses.$204
        | Paths.AdministrationControllerDelete.Responses.$400
        | Paths.AdministrationControllerDelete.Responses.$401
        | Paths.AdministrationControllerDelete.Responses.$403
        | Paths.AdministrationControllerDelete.Responses.$409
        | Paths.AdministrationControllerDelete.Responses.$422
        | Paths.AdministrationControllerDelete.Responses.$500
        | Paths.AdministrationControllerDelete.Responses.$501
        | Paths.AdministrationControllerDelete.Responses.$503
    >;
    /**
     * AdministrationController_ListLogs - List Tgstation.Server.Api.Models.LogFiles present.
     */
    AdministrationController_ListLogs(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.AdministrationControllerListLogs.Responses.$200
        | Paths.AdministrationControllerListLogs.Responses.$400
        | Paths.AdministrationControllerListLogs.Responses.$401
        | Paths.AdministrationControllerListLogs.Responses.$403
        | Paths.AdministrationControllerListLogs.Responses.$409
        | Paths.AdministrationControllerListLogs.Responses.$500
        | Paths.AdministrationControllerListLogs.Responses.$501
        | Paths.AdministrationControllerListLogs.Responses.$503
    >;
    /**
     * AdministrationController_GetLog - Download a Tgstation.Server.Api.Models.LogFile.
     */
    AdministrationController_GetLog(
        parameters?: Parameters<Paths.AdministrationControllerGetLog.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.AdministrationControllerGetLog.Responses.$200
        | Paths.AdministrationControllerGetLog.Responses.$400
        | Paths.AdministrationControllerGetLog.Responses.$401
        | Paths.AdministrationControllerGetLog.Responses.$403
        | Paths.AdministrationControllerGetLog.Responses.$409
        | Paths.AdministrationControllerGetLog.Responses.$500
        | Paths.AdministrationControllerGetLog.Responses.$501
        | Paths.AdministrationControllerGetLog.Responses.$503
    >;
    /**
     * ByondController_Read - Gets the active Tgstation.Server.Api.Models.Byond version.
     */
    ByondController_Read(
        parameters?: Parameters<Paths.ByondControllerRead.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ByondControllerRead.Responses.$200
        | Paths.ByondControllerRead.Responses.$400
        | Paths.ByondControllerRead.Responses.$401
        | Paths.ByondControllerRead.Responses.$403
        | Paths.ByondControllerRead.Responses.$409
        | Paths.ByondControllerRead.Responses.$500
        | Paths.ByondControllerRead.Responses.$501
        | Paths.ByondControllerRead.Responses.$503
    >;
    /**
     * ByondController_Update - Changes the active BYOND version to the one specified in a given model.
     */
    ByondController_Update(
        parameters?: Parameters<Paths.ByondControllerUpdate.HeaderParameters>,
        data?: Paths.ByondControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ByondControllerUpdate.Responses.$200
        | Paths.ByondControllerUpdate.Responses.$202
        | Paths.ByondControllerUpdate.Responses.$400
        | Paths.ByondControllerUpdate.Responses.$401
        | Paths.ByondControllerUpdate.Responses.$403
        | Paths.ByondControllerUpdate.Responses.$409
        | Paths.ByondControllerUpdate.Responses.$500
        | Paths.ByondControllerUpdate.Responses.$501
        | Paths.ByondControllerUpdate.Responses.$503
    >;
    /**
     * ByondController_List - Lists installed Tgstation.Server.Api.Models.Byond versions.
     */
    ByondController_List(
        parameters?: Parameters<Paths.ByondControllerList.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ByondControllerList.Responses.$200
        | Paths.ByondControllerList.Responses.$400
        | Paths.ByondControllerList.Responses.$401
        | Paths.ByondControllerList.Responses.$403
        | Paths.ByondControllerList.Responses.$409
        | Paths.ByondControllerList.Responses.$500
        | Paths.ByondControllerList.Responses.$501
        | Paths.ByondControllerList.Responses.$503
    >;
    /**
     * ChatController_Create - Create a new chat bot model.
     */
    ChatController_Create(
        parameters?: Parameters<Paths.ChatControllerCreate.HeaderParameters>,
        data?: Paths.ChatControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ChatControllerCreate.Responses.$201
        | Paths.ChatControllerCreate.Responses.$400
        | Paths.ChatControllerCreate.Responses.$401
        | Paths.ChatControllerCreate.Responses.$403
        | Paths.ChatControllerCreate.Responses.$409
        | Paths.ChatControllerCreate.Responses.$500
        | Paths.ChatControllerCreate.Responses.$501
        | Paths.ChatControllerCreate.Responses.$503
    >;
    /**
     * ChatController_Update - Updates a chat bot model.
     */
    ChatController_Update(
        parameters?: Parameters<Paths.ChatControllerUpdate.HeaderParameters>,
        data?: Paths.ChatControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ChatControllerUpdate.Responses.$200
        | Paths.ChatControllerUpdate.Responses.$204
        | Paths.ChatControllerUpdate.Responses.$400
        | Paths.ChatControllerUpdate.Responses.$401
        | Paths.ChatControllerUpdate.Responses.$403
        | Paths.ChatControllerUpdate.Responses.$409
        | Paths.ChatControllerUpdate.Responses.$410
        | Paths.ChatControllerUpdate.Responses.$500
        | Paths.ChatControllerUpdate.Responses.$501
        | Paths.ChatControllerUpdate.Responses.$503
    >;
    /**
     * ChatController_GetId - Get a specific Tgstation.Server.Api.Models.ChatBot.
     */
    ChatController_GetId(
        parameters?: Parameters<
            Paths.ChatControllerGetId.PathParameters & Paths.ChatControllerGetId.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ChatControllerGetId.Responses.$200
        | Paths.ChatControllerGetId.Responses.$400
        | Paths.ChatControllerGetId.Responses.$401
        | Paths.ChatControllerGetId.Responses.$403
        | Paths.ChatControllerGetId.Responses.$409
        | Paths.ChatControllerGetId.Responses.$410
        | Paths.ChatControllerGetId.Responses.$500
        | Paths.ChatControllerGetId.Responses.$501
        | Paths.ChatControllerGetId.Responses.$503
    >;
    /**
     * ChatController_Delete - Delete a Tgstation.Server.Api.Models.ChatBot.
     */
    ChatController_Delete(
        parameters?: Parameters<
            Paths.ChatControllerDelete.PathParameters & Paths.ChatControllerDelete.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ChatControllerDelete.Responses.$204
        | Paths.ChatControllerDelete.Responses.$400
        | Paths.ChatControllerDelete.Responses.$401
        | Paths.ChatControllerDelete.Responses.$403
        | Paths.ChatControllerDelete.Responses.$409
        | Paths.ChatControllerDelete.Responses.$500
        | Paths.ChatControllerDelete.Responses.$501
        | Paths.ChatControllerDelete.Responses.$503
    >;
    /**
     * ChatController_List - List Tgstation.Server.Api.Models.ChatBots.
     */
    ChatController_List(
        parameters?: Parameters<Paths.ChatControllerList.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ChatControllerList.Responses.$200
        | Paths.ChatControllerList.Responses.$400
        | Paths.ChatControllerList.Responses.$401
        | Paths.ChatControllerList.Responses.$403
        | Paths.ChatControllerList.Responses.$409
        | Paths.ChatControllerList.Responses.$500
        | Paths.ChatControllerList.Responses.$501
        | Paths.ChatControllerList.Responses.$503
    >;
    /**
     * ConfigurationController_Create - Create a configuration directory.
     */
    ConfigurationController_Create(
        parameters?: Parameters<Paths.ConfigurationControllerCreate.HeaderParameters>,
        data?: Paths.ConfigurationControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerCreate.Responses.$200
        | Paths.ConfigurationControllerCreate.Responses.$201
        | Paths.ConfigurationControllerCreate.Responses.$400
        | Paths.ConfigurationControllerCreate.Responses.$401
        | Paths.ConfigurationControllerCreate.Responses.$403
        | Paths.ConfigurationControllerCreate.Responses.$409
        | Paths.ConfigurationControllerCreate.Responses.$500
        | Paths.ConfigurationControllerCreate.Responses.$501
        | Paths.ConfigurationControllerCreate.Responses.$503
    >;
    /**
     * ConfigurationController_Update - Write to a configuration file.
     */
    ConfigurationController_Update(
        parameters?: Parameters<Paths.ConfigurationControllerUpdate.HeaderParameters>,
        data?: Paths.ConfigurationControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerUpdate.Responses.$200
        | Paths.ConfigurationControllerUpdate.Responses.$201
        | Paths.ConfigurationControllerUpdate.Responses.$400
        | Paths.ConfigurationControllerUpdate.Responses.$401
        | Paths.ConfigurationControllerUpdate.Responses.$403
        | Paths.ConfigurationControllerUpdate.Responses.$409
        | Paths.ConfigurationControllerUpdate.Responses.$500
        | Paths.ConfigurationControllerUpdate.Responses.$501
        | Paths.ConfigurationControllerUpdate.Responses.$503
    >;
    /**
     * ConfigurationController_Delete - Deletes an empty directory
     */
    ConfigurationController_Delete(
        parameters?: Parameters<Paths.ConfigurationControllerDelete.HeaderParameters>,
        data?: Paths.ConfigurationControllerDelete.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerDelete.Responses.$204
        | Paths.ConfigurationControllerDelete.Responses.$400
        | Paths.ConfigurationControllerDelete.Responses.$401
        | Paths.ConfigurationControllerDelete.Responses.$403
        | Paths.ConfigurationControllerDelete.Responses.$409
        | Paths.ConfigurationControllerDelete.Responses.$500
        | Paths.ConfigurationControllerDelete.Responses.$501
        | Paths.ConfigurationControllerDelete.Responses.$503
    >;
    /**
     * ConfigurationController_File - Get the contents of a file at a filePath
     */
    ConfigurationController_File(
        parameters?: Parameters<
            Paths.ConfigurationControllerFile.PathParameters &
                Paths.ConfigurationControllerFile.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerFile.Responses.$200
        | Paths.ConfigurationControllerFile.Responses.$400
        | Paths.ConfigurationControllerFile.Responses.$401
        | Paths.ConfigurationControllerFile.Responses.$403
        | Paths.ConfigurationControllerFile.Responses.$409
        | Paths.ConfigurationControllerFile.Responses.$410
        | Paths.ConfigurationControllerFile.Responses.$500
        | Paths.ConfigurationControllerFile.Responses.$501
        | Paths.ConfigurationControllerFile.Responses.$503
    >;
    /**
     * ConfigurationController_Directory - Get the contents of a directory at a directoryPath
     */
    ConfigurationController_Directory(
        parameters?: Parameters<
            Paths.ConfigurationControllerDirectory.PathParameters &
                Paths.ConfigurationControllerDirectory.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerDirectory.Responses.$200
        | Paths.ConfigurationControllerDirectory.Responses.$400
        | Paths.ConfigurationControllerDirectory.Responses.$401
        | Paths.ConfigurationControllerDirectory.Responses.$403
        | Paths.ConfigurationControllerDirectory.Responses.$409
        | Paths.ConfigurationControllerDirectory.Responses.$410
        | Paths.ConfigurationControllerDirectory.Responses.$500
        | Paths.ConfigurationControllerDirectory.Responses.$501
        | Paths.ConfigurationControllerDirectory.Responses.$503
    >;
    /**
     * ConfigurationController_List - Get the contents of the root configuration directory.
     */
    ConfigurationController_List(
        parameters?: Parameters<Paths.ConfigurationControllerList.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.ConfigurationControllerList.Responses.$200
        | Paths.ConfigurationControllerList.Responses.$400
        | Paths.ConfigurationControllerList.Responses.$401
        | Paths.ConfigurationControllerList.Responses.$403
        | Paths.ConfigurationControllerList.Responses.$409
        | Paths.ConfigurationControllerList.Responses.$500
        | Paths.ConfigurationControllerList.Responses.$501
        | Paths.ConfigurationControllerList.Responses.$503
    >;
    /**
     * DreamDaemonController_Read - Get the watchdog status.
     */
    DreamDaemonController_Read(
        parameters?: Parameters<Paths.DreamDaemonControllerRead.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerRead.Responses.$200
        | Paths.DreamDaemonControllerRead.Responses.$400
        | Paths.DreamDaemonControllerRead.Responses.$401
        | Paths.DreamDaemonControllerRead.Responses.$403
        | Paths.DreamDaemonControllerRead.Responses.$409
        | Paths.DreamDaemonControllerRead.Responses.$410
        | Paths.DreamDaemonControllerRead.Responses.$500
        | Paths.DreamDaemonControllerRead.Responses.$501
        | Paths.DreamDaemonControllerRead.Responses.$503
    >;
    /**
     * DreamDaemonController_Create - Launches the watchdog.
     */
    DreamDaemonController_Create(
        parameters?: Parameters<Paths.DreamDaemonControllerCreate.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerCreate.Responses.$202
        | Paths.DreamDaemonControllerCreate.Responses.$400
        | Paths.DreamDaemonControllerCreate.Responses.$401
        | Paths.DreamDaemonControllerCreate.Responses.$403
        | Paths.DreamDaemonControllerCreate.Responses.$409
        | Paths.DreamDaemonControllerCreate.Responses.$500
        | Paths.DreamDaemonControllerCreate.Responses.$501
        | Paths.DreamDaemonControllerCreate.Responses.$503
    >;
    /**
     * DreamDaemonController_Update - Update watchdog settings to be applied at next server reboot.
     */
    DreamDaemonController_Update(
        parameters?: Parameters<Paths.DreamDaemonControllerUpdate.HeaderParameters>,
        data?: Paths.DreamDaemonControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerUpdate.Responses.$200
        | Paths.DreamDaemonControllerUpdate.Responses.$400
        | Paths.DreamDaemonControllerUpdate.Responses.$401
        | Paths.DreamDaemonControllerUpdate.Responses.$403
        | Paths.DreamDaemonControllerUpdate.Responses.$409
        | Paths.DreamDaemonControllerUpdate.Responses.$410
        | Paths.DreamDaemonControllerUpdate.Responses.$500
        | Paths.DreamDaemonControllerUpdate.Responses.$501
        | Paths.DreamDaemonControllerUpdate.Responses.$503
    >;
    /**
     * DreamDaemonController_Restart - Creates a Tgstation.Server.Api.Models.Job to restart the Watchdog. It will start if it wasn't already running.
     */
    DreamDaemonController_Restart(
        parameters?: Parameters<Paths.DreamDaemonControllerRestart.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerRestart.Responses.$202
        | Paths.DreamDaemonControllerRestart.Responses.$400
        | Paths.DreamDaemonControllerRestart.Responses.$401
        | Paths.DreamDaemonControllerRestart.Responses.$403
        | Paths.DreamDaemonControllerRestart.Responses.$409
        | Paths.DreamDaemonControllerRestart.Responses.$500
        | Paths.DreamDaemonControllerRestart.Responses.$501
        | Paths.DreamDaemonControllerRestart.Responses.$503
    >;
    /**
     * DreamDaemonController_Delete - Stops the Watchdog if it's running.
     */
    DreamDaemonController_Delete(
        parameters?: Parameters<Paths.DreamDaemonControllerDelete.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerDelete.Responses.$204
        | Paths.DreamDaemonControllerDelete.Responses.$400
        | Paths.DreamDaemonControllerDelete.Responses.$401
        | Paths.DreamDaemonControllerDelete.Responses.$403
        | Paths.DreamDaemonControllerDelete.Responses.$409
        | Paths.DreamDaemonControllerDelete.Responses.$500
        | Paths.DreamDaemonControllerDelete.Responses.$501
        | Paths.DreamDaemonControllerDelete.Responses.$503
    >;
    /**
     * DreamDaemonController_CreateDump - Creates a Tgstation.Server.Api.Models.Job to generate a DreamDaemon process dump.
     */
    DreamDaemonController_CreateDump(
        parameters?: Parameters<Paths.DreamDaemonControllerCreateDump.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamDaemonControllerCreateDump.Responses.$202
        | Paths.DreamDaemonControllerCreateDump.Responses.$400
        | Paths.DreamDaemonControllerCreateDump.Responses.$401
        | Paths.DreamDaemonControllerCreateDump.Responses.$403
        | Paths.DreamDaemonControllerCreateDump.Responses.$409
        | Paths.DreamDaemonControllerCreateDump.Responses.$500
        | Paths.DreamDaemonControllerCreateDump.Responses.$501
        | Paths.DreamDaemonControllerCreateDump.Responses.$503
    >;
    /**
     * DreamMakerController_Read - Read current Tgstation.Server.Api.Models.DreamMaker status.
     */
    DreamMakerController_Read(
        parameters?: Parameters<Paths.DreamMakerControllerRead.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamMakerControllerRead.Responses.$200
        | Paths.DreamMakerControllerRead.Responses.$400
        | Paths.DreamMakerControllerRead.Responses.$401
        | Paths.DreamMakerControllerRead.Responses.$403
        | Paths.DreamMakerControllerRead.Responses.$409
        | Paths.DreamMakerControllerRead.Responses.$500
        | Paths.DreamMakerControllerRead.Responses.$501
        | Paths.DreamMakerControllerRead.Responses.$503
    >;
    /**
     * DreamMakerController_Create - Begin deploying repository code.
     */
    DreamMakerController_Create(
        parameters?: Parameters<Paths.DreamMakerControllerCreate.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamMakerControllerCreate.Responses.$202
        | Paths.DreamMakerControllerCreate.Responses.$400
        | Paths.DreamMakerControllerCreate.Responses.$401
        | Paths.DreamMakerControllerCreate.Responses.$403
        | Paths.DreamMakerControllerCreate.Responses.$409
        | Paths.DreamMakerControllerCreate.Responses.$500
        | Paths.DreamMakerControllerCreate.Responses.$501
        | Paths.DreamMakerControllerCreate.Responses.$503
    >;
    /**
     * DreamMakerController_Update - Update deployment settings.
     */
    DreamMakerController_Update(
        parameters?: Parameters<Paths.DreamMakerControllerUpdate.HeaderParameters>,
        data?: Paths.DreamMakerControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamMakerControllerUpdate.Responses.$200
        | Paths.DreamMakerControllerUpdate.Responses.$204
        | Paths.DreamMakerControllerUpdate.Responses.$400
        | Paths.DreamMakerControllerUpdate.Responses.$401
        | Paths.DreamMakerControllerUpdate.Responses.$403
        | Paths.DreamMakerControllerUpdate.Responses.$409
        | Paths.DreamMakerControllerUpdate.Responses.$410
        | Paths.DreamMakerControllerUpdate.Responses.$500
        | Paths.DreamMakerControllerUpdate.Responses.$501
        | Paths.DreamMakerControllerUpdate.Responses.$503
    >;
    /**
     * DreamMakerController_GetId - Get a Tgstation.Server.Api.Models.CompileJob specified by a given id.
     */
    DreamMakerController_GetId(
        parameters?: Parameters<
            Paths.DreamMakerControllerGetId.PathParameters &
                Paths.DreamMakerControllerGetId.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamMakerControllerGetId.Responses.$200
        | Paths.DreamMakerControllerGetId.Responses.$400
        | Paths.DreamMakerControllerGetId.Responses.$401
        | Paths.DreamMakerControllerGetId.Responses.$403
        | Paths.DreamMakerControllerGetId.Responses.$404
        | Paths.DreamMakerControllerGetId.Responses.$409
        | Paths.DreamMakerControllerGetId.Responses.$500
        | Paths.DreamMakerControllerGetId.Responses.$501
        | Paths.DreamMakerControllerGetId.Responses.$503
    >;
    /**
     * DreamMakerController_List - List all Tgstation.Server.Api.Models.CompileJobTgstation.Server.Api.Models.EntityIds for the instance.
     */
    DreamMakerController_List(
        parameters?: Parameters<Paths.DreamMakerControllerList.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.DreamMakerControllerList.Responses.$200
        | Paths.DreamMakerControllerList.Responses.$400
        | Paths.DreamMakerControllerList.Responses.$401
        | Paths.DreamMakerControllerList.Responses.$403
        | Paths.DreamMakerControllerList.Responses.$409
        | Paths.DreamMakerControllerList.Responses.$500
        | Paths.DreamMakerControllerList.Responses.$501
        | Paths.DreamMakerControllerList.Responses.$503
    >;
    /**
     * HomeController_Home - Main page of the Tgstation.Server.Host.Core.Application
     */
    HomeController_Home(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.HomeControllerHome.Responses.$200
        | Paths.HomeControllerHome.Responses.$400
        | Paths.HomeControllerHome.Responses.$401
        | Paths.HomeControllerHome.Responses.$403
        | Paths.HomeControllerHome.Responses.$409
        | Paths.HomeControllerHome.Responses.$500
        | Paths.HomeControllerHome.Responses.$501
        | Paths.HomeControllerHome.Responses.$503
    >;
    /**
     * HomeController_CreateToken - Attempt to authenticate a Tgstation.Server.Host.Models.User using Tgstation.Server.Host.Controllers.ApiController.ApiHeaders
     */
    HomeController_CreateToken(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.HomeControllerCreateToken.Responses.$200
        | Paths.HomeControllerCreateToken.Responses.$400
        | Paths.HomeControllerCreateToken.Responses.$401
        | Paths.HomeControllerCreateToken.Responses.$403
        | Paths.HomeControllerCreateToken.Responses.$409
        | Paths.HomeControllerCreateToken.Responses.$500
        | Paths.HomeControllerCreateToken.Responses.$501
        | Paths.HomeControllerCreateToken.Responses.$503
    >;
    /**
     * InstanceController_Create - Create or attach an Tgstation.Server.Api.Models.Instance.
     */
    InstanceController_Create(
        parameters?: Parameters<UnknownParamsObject>,
        data?: Paths.InstanceControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerCreate.Responses.$200
        | Paths.InstanceControllerCreate.Responses.$201
        | Paths.InstanceControllerCreate.Responses.$400
        | Paths.InstanceControllerCreate.Responses.$401
        | Paths.InstanceControllerCreate.Responses.$403
        | Paths.InstanceControllerCreate.Responses.$409
        | Paths.InstanceControllerCreate.Responses.$500
        | Paths.InstanceControllerCreate.Responses.$501
        | Paths.InstanceControllerCreate.Responses.$503
    >;
    /**
     * InstanceController_Update - Modify an Tgstation.Server.Api.Models.Instance's settings.
     */
    InstanceController_Update(
        parameters?: Parameters<UnknownParamsObject>,
        data?: Paths.InstanceControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerUpdate.Responses.$200
        | Paths.InstanceControllerUpdate.Responses.$202
        | Paths.InstanceControllerUpdate.Responses.$400
        | Paths.InstanceControllerUpdate.Responses.$401
        | Paths.InstanceControllerUpdate.Responses.$403
        | Paths.InstanceControllerUpdate.Responses.$409
        | Paths.InstanceControllerUpdate.Responses.$410
        | Paths.InstanceControllerUpdate.Responses.$500
        | Paths.InstanceControllerUpdate.Responses.$501
        | Paths.InstanceControllerUpdate.Responses.$503
    >;
    /**
     * InstanceController_GetId - Get a specific Tgstation.Server.Api.Models.Instance.
     */
    InstanceController_GetId(
        parameters?: Parameters<Paths.InstanceControllerGetId.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerGetId.Responses.$200
        | Paths.InstanceControllerGetId.Responses.$400
        | Paths.InstanceControllerGetId.Responses.$401
        | Paths.InstanceControllerGetId.Responses.$403
        | Paths.InstanceControllerGetId.Responses.$409
        | Paths.InstanceControllerGetId.Responses.$410
        | Paths.InstanceControllerGetId.Responses.$500
        | Paths.InstanceControllerGetId.Responses.$501
        | Paths.InstanceControllerGetId.Responses.$503
    >;
    /**
     * InstanceController_GrantPermissions - Gives the current user full permissions on a given instance id.
     */
    InstanceController_GrantPermissions(
        parameters?: Parameters<Paths.InstanceControllerGrantPermissions.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerGrantPermissions.Responses.$204
        | Paths.InstanceControllerGrantPermissions.Responses.$400
        | Paths.InstanceControllerGrantPermissions.Responses.$401
        | Paths.InstanceControllerGrantPermissions.Responses.$403
        | Paths.InstanceControllerGrantPermissions.Responses.$409
        | Paths.InstanceControllerGrantPermissions.Responses.$500
        | Paths.InstanceControllerGrantPermissions.Responses.$501
        | Paths.InstanceControllerGrantPermissions.Responses.$503
    >;
    /**
     * InstanceController_Delete - Detach an Tgstation.Server.Api.Models.Instance with the given id.
     */
    InstanceController_Delete(
        parameters?: Parameters<Paths.InstanceControllerDelete.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerDelete.Responses.$204
        | Paths.InstanceControllerDelete.Responses.$400
        | Paths.InstanceControllerDelete.Responses.$401
        | Paths.InstanceControllerDelete.Responses.$403
        | Paths.InstanceControllerDelete.Responses.$409
        | Paths.InstanceControllerDelete.Responses.$410
        | Paths.InstanceControllerDelete.Responses.$500
        | Paths.InstanceControllerDelete.Responses.$501
        | Paths.InstanceControllerDelete.Responses.$503
    >;
    /**
     * InstanceController_List - List Tgstation.Server.Api.Models.Instances.
     */
    InstanceController_List(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceControllerList.Responses.$200
        | Paths.InstanceControllerList.Responses.$400
        | Paths.InstanceControllerList.Responses.$401
        | Paths.InstanceControllerList.Responses.$403
        | Paths.InstanceControllerList.Responses.$409
        | Paths.InstanceControllerList.Responses.$500
        | Paths.InstanceControllerList.Responses.$501
        | Paths.InstanceControllerList.Responses.$503
    >;
    /**
     * InstanceUserController_Read - Read the active Tgstation.Server.Api.Models.InstanceUser.
     */
    InstanceUserController_Read(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerRead.Responses.$200
        | Paths.InstanceUserControllerRead.Responses.$400
        | Paths.InstanceUserControllerRead.Responses.$401
        | Paths.InstanceUserControllerRead.Responses.$403
        | Paths.InstanceUserControllerRead.Responses.$409
        | Paths.InstanceUserControllerRead.Responses.$500
        | Paths.InstanceUserControllerRead.Responses.$501
        | Paths.InstanceUserControllerRead.Responses.$503
    >;
    /**
     * InstanceUserController_Create - Create an Tgstation.Server.Api.Models.InstanceUser.
     */
    InstanceUserController_Create(
        parameters?: Parameters<Paths.InstanceUserControllerCreate.HeaderParameters>,
        data?: Paths.InstanceUserControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerCreate.Responses.$201
        | Paths.InstanceUserControllerCreate.Responses.$400
        | Paths.InstanceUserControllerCreate.Responses.$401
        | Paths.InstanceUserControllerCreate.Responses.$403
        | Paths.InstanceUserControllerCreate.Responses.$409
        | Paths.InstanceUserControllerCreate.Responses.$500
        | Paths.InstanceUserControllerCreate.Responses.$501
        | Paths.InstanceUserControllerCreate.Responses.$503
    >;
    /**
     * InstanceUserController_Update - Update the permissions for an Tgstation.Server.Api.Models.InstanceUser.
     */
    InstanceUserController_Update(
        parameters?: Parameters<Paths.InstanceUserControllerUpdate.HeaderParameters>,
        data?: Paths.InstanceUserControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerUpdate.Responses.$200
        | Paths.InstanceUserControllerUpdate.Responses.$400
        | Paths.InstanceUserControllerUpdate.Responses.$401
        | Paths.InstanceUserControllerUpdate.Responses.$403
        | Paths.InstanceUserControllerUpdate.Responses.$409
        | Paths.InstanceUserControllerUpdate.Responses.$410
        | Paths.InstanceUserControllerUpdate.Responses.$500
        | Paths.InstanceUserControllerUpdate.Responses.$501
        | Paths.InstanceUserControllerUpdate.Responses.$503
    >;
    /**
     * InstanceUserController_List - Lists Tgstation.Server.Api.Models.InstanceUsers for the instance.
     */
    InstanceUserController_List(
        parameters?: Parameters<Paths.InstanceUserControllerList.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerList.Responses.$200
        | Paths.InstanceUserControllerList.Responses.$400
        | Paths.InstanceUserControllerList.Responses.$401
        | Paths.InstanceUserControllerList.Responses.$403
        | Paths.InstanceUserControllerList.Responses.$409
        | Paths.InstanceUserControllerList.Responses.$500
        | Paths.InstanceUserControllerList.Responses.$501
        | Paths.InstanceUserControllerList.Responses.$503
    >;
    /**
     * InstanceUserController_GetId - Gets a specific Tgstation.Server.Api.Models.InstanceUser.
     */
    InstanceUserController_GetId(
        parameters?: Parameters<
            Paths.InstanceUserControllerGetId.PathParameters &
                Paths.InstanceUserControllerGetId.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerGetId.Responses.$200
        | Paths.InstanceUserControllerGetId.Responses.$400
        | Paths.InstanceUserControllerGetId.Responses.$401
        | Paths.InstanceUserControllerGetId.Responses.$403
        | Paths.InstanceUserControllerGetId.Responses.$409
        | Paths.InstanceUserControllerGetId.Responses.$410
        | Paths.InstanceUserControllerGetId.Responses.$500
        | Paths.InstanceUserControllerGetId.Responses.$501
        | Paths.InstanceUserControllerGetId.Responses.$503
    >;
    /**
     * InstanceUserController_Delete - Delete an Tgstation.Server.Api.Models.InstanceUser.
     */
    InstanceUserController_Delete(
        parameters?: Parameters<
            Paths.InstanceUserControllerDelete.PathParameters &
                Paths.InstanceUserControllerDelete.HeaderParameters
        >,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.InstanceUserControllerDelete.Responses.$204
        | Paths.InstanceUserControllerDelete.Responses.$400
        | Paths.InstanceUserControllerDelete.Responses.$401
        | Paths.InstanceUserControllerDelete.Responses.$403
        | Paths.InstanceUserControllerDelete.Responses.$409
        | Paths.InstanceUserControllerDelete.Responses.$500
        | Paths.InstanceUserControllerDelete.Responses.$501
        | Paths.InstanceUserControllerDelete.Responses.$503
    >;
    /**
     * JobController_Read - Get active Tgstation.Server.Api.Models.Jobs for the instance.
     */
    JobController_Read(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.JobControllerRead.Responses.$200
        | Paths.JobControllerRead.Responses.$400
        | Paths.JobControllerRead.Responses.$401
        | Paths.JobControllerRead.Responses.$403
        | Paths.JobControllerRead.Responses.$409
        | Paths.JobControllerRead.Responses.$500
        | Paths.JobControllerRead.Responses.$501
        | Paths.JobControllerRead.Responses.$503
    >;
    /**
     * JobController_List - List all Tgstation.Server.Api.Models.JobTgstation.Server.Api.Models.EntityIds for the instance in reverse creation order.
     */
    JobController_List(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.JobControllerList.Responses.$200
        | Paths.JobControllerList.Responses.$400
        | Paths.JobControllerList.Responses.$401
        | Paths.JobControllerList.Responses.$403
        | Paths.JobControllerList.Responses.$409
        | Paths.JobControllerList.Responses.$500
        | Paths.JobControllerList.Responses.$501
        | Paths.JobControllerList.Responses.$503
    >;
    /**
     * JobController_GetId - Get a specific Tgstation.Server.Api.Models.Job.
     */
    JobController_GetId(
        parameters?: Parameters<Paths.JobControllerGetId.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.JobControllerGetId.Responses.$200
        | Paths.JobControllerGetId.Responses.$400
        | Paths.JobControllerGetId.Responses.$401
        | Paths.JobControllerGetId.Responses.$403
        | Paths.JobControllerGetId.Responses.$404
        | Paths.JobControllerGetId.Responses.$409
        | Paths.JobControllerGetId.Responses.$500
        | Paths.JobControllerGetId.Responses.$501
        | Paths.JobControllerGetId.Responses.$503
    >;
    /**
     * JobController_Delete - Cancel a running Tgstation.Server.Api.Models.Job.
     */
    JobController_Delete(
        parameters?: Parameters<Paths.JobControllerDelete.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.JobControllerDelete.Responses.$202
        | Paths.JobControllerDelete.Responses.$400
        | Paths.JobControllerDelete.Responses.$401
        | Paths.JobControllerDelete.Responses.$403
        | Paths.JobControllerDelete.Responses.$404
        | Paths.JobControllerDelete.Responses.$409
        | Paths.JobControllerDelete.Responses.$410
        | Paths.JobControllerDelete.Responses.$500
        | Paths.JobControllerDelete.Responses.$501
        | Paths.JobControllerDelete.Responses.$503
    >;
    /**
     * RepositoryController_Read - Get Tgstation.Server.Api.Models.Repository status.
     */
    RepositoryController_Read(
        parameters?: Parameters<Paths.RepositoryControllerRead.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RepositoryControllerRead.Responses.$200
        | Paths.RepositoryControllerRead.Responses.$201
        | Paths.RepositoryControllerRead.Responses.$400
        | Paths.RepositoryControllerRead.Responses.$401
        | Paths.RepositoryControllerRead.Responses.$403
        | Paths.RepositoryControllerRead.Responses.$409
        | Paths.RepositoryControllerRead.Responses.$410
        | Paths.RepositoryControllerRead.Responses.$500
        | Paths.RepositoryControllerRead.Responses.$501
        | Paths.RepositoryControllerRead.Responses.$503
    >;
    /**
     * RepositoryController_Create - Begin cloning the repository if it doesn't exist.
     */
    RepositoryController_Create(
        parameters?: Parameters<Paths.RepositoryControllerCreate.HeaderParameters>,
        data?: Paths.RepositoryControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RepositoryControllerCreate.Responses.$201
        | Paths.RepositoryControllerCreate.Responses.$400
        | Paths.RepositoryControllerCreate.Responses.$401
        | Paths.RepositoryControllerCreate.Responses.$403
        | Paths.RepositoryControllerCreate.Responses.$409
        | Paths.RepositoryControllerCreate.Responses.$410
        | Paths.RepositoryControllerCreate.Responses.$500
        | Paths.RepositoryControllerCreate.Responses.$501
        | Paths.RepositoryControllerCreate.Responses.$503
    >;
    /**
     * RepositoryController_Update - Perform updats to the Tgstation.Server.Api.Models.Repository.
     */
    RepositoryController_Update(
        parameters?: Parameters<Paths.RepositoryControllerUpdate.HeaderParameters>,
        data?: Paths.RepositoryControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RepositoryControllerUpdate.Responses.$200
        | Paths.RepositoryControllerUpdate.Responses.$202
        | Paths.RepositoryControllerUpdate.Responses.$400
        | Paths.RepositoryControllerUpdate.Responses.$401
        | Paths.RepositoryControllerUpdate.Responses.$403
        | Paths.RepositoryControllerUpdate.Responses.$409
        | Paths.RepositoryControllerUpdate.Responses.$410
        | Paths.RepositoryControllerUpdate.Responses.$500
        | Paths.RepositoryControllerUpdate.Responses.$501
        | Paths.RepositoryControllerUpdate.Responses.$503
    >;
    /**
     * RepositoryController_Delete - Delete the Tgstation.Server.Api.Models.Repository.
     */
    RepositoryController_Delete(
        parameters?: Parameters<Paths.RepositoryControllerDelete.HeaderParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.RepositoryControllerDelete.Responses.$202
        | Paths.RepositoryControllerDelete.Responses.$400
        | Paths.RepositoryControllerDelete.Responses.$401
        | Paths.RepositoryControllerDelete.Responses.$403
        | Paths.RepositoryControllerDelete.Responses.$409
        | Paths.RepositoryControllerDelete.Responses.$410
        | Paths.RepositoryControllerDelete.Responses.$500
        | Paths.RepositoryControllerDelete.Responses.$501
        | Paths.RepositoryControllerDelete.Responses.$503
    >;
    /**
     * UserController_Read - Get information about the current Tgstation.Server.Api.Models.User.
     */
    UserController_Read(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UserControllerRead.Responses.$200
        | Paths.UserControllerRead.Responses.$400
        | Paths.UserControllerRead.Responses.$401
        | Paths.UserControllerRead.Responses.$403
        | Paths.UserControllerRead.Responses.$409
        | Paths.UserControllerRead.Responses.$500
        | Paths.UserControllerRead.Responses.$501
        | Paths.UserControllerRead.Responses.$503
    >;
    /**
     * UserController_Create - Create a Tgstation.Server.Api.Models.User.
     */
    UserController_Create(
        parameters?: Parameters<UnknownParamsObject>,
        data?: Paths.UserControllerCreate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UserControllerCreate.Responses.$201
        | Paths.UserControllerCreate.Responses.$400
        | Paths.UserControllerCreate.Responses.$401
        | Paths.UserControllerCreate.Responses.$403
        | Paths.UserControllerCreate.Responses.$409
        | Paths.UserControllerCreate.Responses.$410
        | Paths.UserControllerCreate.Responses.$500
        | Paths.UserControllerCreate.Responses.$501
        | Paths.UserControllerCreate.Responses.$503
    >;
    /**
     * UserController_Update - Update a Tgstation.Server.Api.Models.User.
     */
    UserController_Update(
        parameters?: Parameters<UnknownParamsObject>,
        data?: Paths.UserControllerUpdate.RequestBody,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UserControllerUpdate.Responses.$200
        | Paths.UserControllerUpdate.Responses.$400
        | Paths.UserControllerUpdate.Responses.$401
        | Paths.UserControllerUpdate.Responses.$403
        | Paths.UserControllerUpdate.Responses.$404
        | Paths.UserControllerUpdate.Responses.$409
        | Paths.UserControllerUpdate.Responses.$500
        | Paths.UserControllerUpdate.Responses.$501
        | Paths.UserControllerUpdate.Responses.$503
    >;
    /**
     * UserController_List - List all Tgstation.Server.Api.Models.Users in the server.
     */
    UserController_List(
        parameters?: Parameters<UnknownParamsObject>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UserControllerList.Responses.$200
        | Paths.UserControllerList.Responses.$400
        | Paths.UserControllerList.Responses.$401
        | Paths.UserControllerList.Responses.$403
        | Paths.UserControllerList.Responses.$409
        | Paths.UserControllerList.Responses.$500
        | Paths.UserControllerList.Responses.$501
        | Paths.UserControllerList.Responses.$503
    >;
    /**
     * UserController_GetId - Get a specific Tgstation.Server.Api.Models.User.
     */
    UserController_GetId(
        parameters?: Parameters<Paths.UserControllerGetId.PathParameters>,
        data?: any,
        config?: AxiosRequestConfig
    ): OperationResponse<
        | Paths.UserControllerGetId.Responses.$200
        | Paths.UserControllerGetId.Responses.$400
        | Paths.UserControllerGetId.Responses.$401
        | Paths.UserControllerGetId.Responses.$403
        | Paths.UserControllerGetId.Responses.$404
        | Paths.UserControllerGetId.Responses.$409
        | Paths.UserControllerGetId.Responses.$500
        | Paths.UserControllerGetId.Responses.$501
        | Paths.UserControllerGetId.Responses.$503
    >;
}

export interface PathsDictionary {
    ['/Administration']: {
        /**
         * AdministrationController_Read - Get Tgstation.Server.Api.Models.Administration server information.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.AdministrationControllerRead.Responses.$200
            | Paths.AdministrationControllerRead.Responses.$400
            | Paths.AdministrationControllerRead.Responses.$401
            | Paths.AdministrationControllerRead.Responses.$403
            | Paths.AdministrationControllerRead.Responses.$409
            | Paths.AdministrationControllerRead.Responses.$424
            | Paths.AdministrationControllerRead.Responses.$429
            | Paths.AdministrationControllerRead.Responses.$500
            | Paths.AdministrationControllerRead.Responses.$501
            | Paths.AdministrationControllerRead.Responses.$503
        >;
        /**
         * AdministrationController_Update - Attempt to perform a server upgrade.
         */
        post(
            parameters?: Parameters<UnknownParamsObject>,
            data?: Paths.AdministrationControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.AdministrationControllerUpdate.Responses.$202
            | Paths.AdministrationControllerUpdate.Responses.$400
            | Paths.AdministrationControllerUpdate.Responses.$401
            | Paths.AdministrationControllerUpdate.Responses.$403
            | Paths.AdministrationControllerUpdate.Responses.$409
            | Paths.AdministrationControllerUpdate.Responses.$410
            | Paths.AdministrationControllerUpdate.Responses.$422
            | Paths.AdministrationControllerUpdate.Responses.$424
            | Paths.AdministrationControllerUpdate.Responses.$429
            | Paths.AdministrationControllerUpdate.Responses.$500
            | Paths.AdministrationControllerUpdate.Responses.$501
            | Paths.AdministrationControllerUpdate.Responses.$503
        >;
        /**
         * AdministrationController_Delete - Attempts to restart the server.
         */
        delete(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.AdministrationControllerDelete.Responses.$204
            | Paths.AdministrationControllerDelete.Responses.$400
            | Paths.AdministrationControllerDelete.Responses.$401
            | Paths.AdministrationControllerDelete.Responses.$403
            | Paths.AdministrationControllerDelete.Responses.$409
            | Paths.AdministrationControllerDelete.Responses.$422
            | Paths.AdministrationControllerDelete.Responses.$500
            | Paths.AdministrationControllerDelete.Responses.$501
            | Paths.AdministrationControllerDelete.Responses.$503
        >;
    };
    ['/Administration/Logs']: {
        /**
         * AdministrationController_ListLogs - List Tgstation.Server.Api.Models.LogFiles present.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.AdministrationControllerListLogs.Responses.$200
            | Paths.AdministrationControllerListLogs.Responses.$400
            | Paths.AdministrationControllerListLogs.Responses.$401
            | Paths.AdministrationControllerListLogs.Responses.$403
            | Paths.AdministrationControllerListLogs.Responses.$409
            | Paths.AdministrationControllerListLogs.Responses.$500
            | Paths.AdministrationControllerListLogs.Responses.$501
            | Paths.AdministrationControllerListLogs.Responses.$503
        >;
    };
    ['/Administration/Logs/{path}']: {
        /**
         * AdministrationController_GetLog - Download a Tgstation.Server.Api.Models.LogFile.
         */
        get(
            parameters?: Parameters<Paths.AdministrationControllerGetLog.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.AdministrationControllerGetLog.Responses.$200
            | Paths.AdministrationControllerGetLog.Responses.$400
            | Paths.AdministrationControllerGetLog.Responses.$401
            | Paths.AdministrationControllerGetLog.Responses.$403
            | Paths.AdministrationControllerGetLog.Responses.$409
            | Paths.AdministrationControllerGetLog.Responses.$500
            | Paths.AdministrationControllerGetLog.Responses.$501
            | Paths.AdministrationControllerGetLog.Responses.$503
        >;
    };
    ['/Byond']: {
        /**
         * ByondController_Read - Gets the active Tgstation.Server.Api.Models.Byond version.
         */
        get(
            parameters?: Parameters<Paths.ByondControllerRead.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ByondControllerRead.Responses.$200
            | Paths.ByondControllerRead.Responses.$400
            | Paths.ByondControllerRead.Responses.$401
            | Paths.ByondControllerRead.Responses.$403
            | Paths.ByondControllerRead.Responses.$409
            | Paths.ByondControllerRead.Responses.$500
            | Paths.ByondControllerRead.Responses.$501
            | Paths.ByondControllerRead.Responses.$503
        >;
        /**
         * ByondController_Update - Changes the active BYOND version to the one specified in a given model.
         */
        post(
            parameters?: Parameters<Paths.ByondControllerUpdate.HeaderParameters>,
            data?: Paths.ByondControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ByondControllerUpdate.Responses.$200
            | Paths.ByondControllerUpdate.Responses.$202
            | Paths.ByondControllerUpdate.Responses.$400
            | Paths.ByondControllerUpdate.Responses.$401
            | Paths.ByondControllerUpdate.Responses.$403
            | Paths.ByondControllerUpdate.Responses.$409
            | Paths.ByondControllerUpdate.Responses.$500
            | Paths.ByondControllerUpdate.Responses.$501
            | Paths.ByondControllerUpdate.Responses.$503
        >;
    };
    ['/Byond/List']: {
        /**
         * ByondController_List - Lists installed Tgstation.Server.Api.Models.Byond versions.
         */
        get(
            parameters?: Parameters<Paths.ByondControllerList.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ByondControllerList.Responses.$200
            | Paths.ByondControllerList.Responses.$400
            | Paths.ByondControllerList.Responses.$401
            | Paths.ByondControllerList.Responses.$403
            | Paths.ByondControllerList.Responses.$409
            | Paths.ByondControllerList.Responses.$500
            | Paths.ByondControllerList.Responses.$501
            | Paths.ByondControllerList.Responses.$503
        >;
    };
    ['/Chat']: {
        /**
         * ChatController_Create - Create a new chat bot model.
         */
        put(
            parameters?: Parameters<Paths.ChatControllerCreate.HeaderParameters>,
            data?: Paths.ChatControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ChatControllerCreate.Responses.$201
            | Paths.ChatControllerCreate.Responses.$400
            | Paths.ChatControllerCreate.Responses.$401
            | Paths.ChatControllerCreate.Responses.$403
            | Paths.ChatControllerCreate.Responses.$409
            | Paths.ChatControllerCreate.Responses.$500
            | Paths.ChatControllerCreate.Responses.$501
            | Paths.ChatControllerCreate.Responses.$503
        >;
        /**
         * ChatController_Update - Updates a chat bot model.
         */
        post(
            parameters?: Parameters<Paths.ChatControllerUpdate.HeaderParameters>,
            data?: Paths.ChatControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ChatControllerUpdate.Responses.$200
            | Paths.ChatControllerUpdate.Responses.$204
            | Paths.ChatControllerUpdate.Responses.$400
            | Paths.ChatControllerUpdate.Responses.$401
            | Paths.ChatControllerUpdate.Responses.$403
            | Paths.ChatControllerUpdate.Responses.$409
            | Paths.ChatControllerUpdate.Responses.$410
            | Paths.ChatControllerUpdate.Responses.$500
            | Paths.ChatControllerUpdate.Responses.$501
            | Paths.ChatControllerUpdate.Responses.$503
        >;
    };
    ['/Chat/{id}']: {
        /**
         * ChatController_Delete - Delete a Tgstation.Server.Api.Models.ChatBot.
         */
        delete(
            parameters?: Parameters<
                Paths.ChatControllerDelete.PathParameters &
                    Paths.ChatControllerDelete.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ChatControllerDelete.Responses.$204
            | Paths.ChatControllerDelete.Responses.$400
            | Paths.ChatControllerDelete.Responses.$401
            | Paths.ChatControllerDelete.Responses.$403
            | Paths.ChatControllerDelete.Responses.$409
            | Paths.ChatControllerDelete.Responses.$500
            | Paths.ChatControllerDelete.Responses.$501
            | Paths.ChatControllerDelete.Responses.$503
        >;
        /**
         * ChatController_GetId - Get a specific Tgstation.Server.Api.Models.ChatBot.
         */
        get(
            parameters?: Parameters<
                Paths.ChatControllerGetId.PathParameters &
                    Paths.ChatControllerGetId.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ChatControllerGetId.Responses.$200
            | Paths.ChatControllerGetId.Responses.$400
            | Paths.ChatControllerGetId.Responses.$401
            | Paths.ChatControllerGetId.Responses.$403
            | Paths.ChatControllerGetId.Responses.$409
            | Paths.ChatControllerGetId.Responses.$410
            | Paths.ChatControllerGetId.Responses.$500
            | Paths.ChatControllerGetId.Responses.$501
            | Paths.ChatControllerGetId.Responses.$503
        >;
    };
    ['/Chat/List']: {
        /**
         * ChatController_List - List Tgstation.Server.Api.Models.ChatBots.
         */
        get(
            parameters?: Parameters<Paths.ChatControllerList.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ChatControllerList.Responses.$200
            | Paths.ChatControllerList.Responses.$400
            | Paths.ChatControllerList.Responses.$401
            | Paths.ChatControllerList.Responses.$403
            | Paths.ChatControllerList.Responses.$409
            | Paths.ChatControllerList.Responses.$500
            | Paths.ChatControllerList.Responses.$501
            | Paths.ChatControllerList.Responses.$503
        >;
    };
    ['/Config']: {
        /**
         * ConfigurationController_Update - Write to a configuration file.
         */
        post(
            parameters?: Parameters<Paths.ConfigurationControllerUpdate.HeaderParameters>,
            data?: Paths.ConfigurationControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerUpdate.Responses.$200
            | Paths.ConfigurationControllerUpdate.Responses.$201
            | Paths.ConfigurationControllerUpdate.Responses.$400
            | Paths.ConfigurationControllerUpdate.Responses.$401
            | Paths.ConfigurationControllerUpdate.Responses.$403
            | Paths.ConfigurationControllerUpdate.Responses.$409
            | Paths.ConfigurationControllerUpdate.Responses.$500
            | Paths.ConfigurationControllerUpdate.Responses.$501
            | Paths.ConfigurationControllerUpdate.Responses.$503
        >;
        /**
         * ConfigurationController_Create - Create a configuration directory.
         */
        put(
            parameters?: Parameters<Paths.ConfigurationControllerCreate.HeaderParameters>,
            data?: Paths.ConfigurationControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerCreate.Responses.$200
            | Paths.ConfigurationControllerCreate.Responses.$201
            | Paths.ConfigurationControllerCreate.Responses.$400
            | Paths.ConfigurationControllerCreate.Responses.$401
            | Paths.ConfigurationControllerCreate.Responses.$403
            | Paths.ConfigurationControllerCreate.Responses.$409
            | Paths.ConfigurationControllerCreate.Responses.$500
            | Paths.ConfigurationControllerCreate.Responses.$501
            | Paths.ConfigurationControllerCreate.Responses.$503
        >;
        /**
         * ConfigurationController_Delete - Deletes an empty directory
         */
        delete(
            parameters?: Parameters<Paths.ConfigurationControllerDelete.HeaderParameters>,
            data?: Paths.ConfigurationControllerDelete.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerDelete.Responses.$204
            | Paths.ConfigurationControllerDelete.Responses.$400
            | Paths.ConfigurationControllerDelete.Responses.$401
            | Paths.ConfigurationControllerDelete.Responses.$403
            | Paths.ConfigurationControllerDelete.Responses.$409
            | Paths.ConfigurationControllerDelete.Responses.$500
            | Paths.ConfigurationControllerDelete.Responses.$501
            | Paths.ConfigurationControllerDelete.Responses.$503
        >;
    };
    ['/Config/File/{filePath}']: {
        /**
         * ConfigurationController_File - Get the contents of a file at a filePath
         */
        get(
            parameters?: Parameters<
                Paths.ConfigurationControllerFile.PathParameters &
                    Paths.ConfigurationControllerFile.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerFile.Responses.$200
            | Paths.ConfigurationControllerFile.Responses.$400
            | Paths.ConfigurationControllerFile.Responses.$401
            | Paths.ConfigurationControllerFile.Responses.$403
            | Paths.ConfigurationControllerFile.Responses.$409
            | Paths.ConfigurationControllerFile.Responses.$410
            | Paths.ConfigurationControllerFile.Responses.$500
            | Paths.ConfigurationControllerFile.Responses.$501
            | Paths.ConfigurationControllerFile.Responses.$503
        >;
    };
    ['/Config/List/{directoryPath}']: {
        /**
         * ConfigurationController_Directory - Get the contents of a directory at a directoryPath
         */
        get(
            parameters?: Parameters<
                Paths.ConfigurationControllerDirectory.PathParameters &
                    Paths.ConfigurationControllerDirectory.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerDirectory.Responses.$200
            | Paths.ConfigurationControllerDirectory.Responses.$400
            | Paths.ConfigurationControllerDirectory.Responses.$401
            | Paths.ConfigurationControllerDirectory.Responses.$403
            | Paths.ConfigurationControllerDirectory.Responses.$409
            | Paths.ConfigurationControllerDirectory.Responses.$410
            | Paths.ConfigurationControllerDirectory.Responses.$500
            | Paths.ConfigurationControllerDirectory.Responses.$501
            | Paths.ConfigurationControllerDirectory.Responses.$503
        >;
    };
    ['/Config/List']: {
        /**
         * ConfigurationController_List - Get the contents of the root configuration directory.
         */
        get(
            parameters?: Parameters<Paths.ConfigurationControllerList.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.ConfigurationControllerList.Responses.$200
            | Paths.ConfigurationControllerList.Responses.$400
            | Paths.ConfigurationControllerList.Responses.$401
            | Paths.ConfigurationControllerList.Responses.$403
            | Paths.ConfigurationControllerList.Responses.$409
            | Paths.ConfigurationControllerList.Responses.$500
            | Paths.ConfigurationControllerList.Responses.$501
            | Paths.ConfigurationControllerList.Responses.$503
        >;
    };
    ['/DreamDaemon']: {
        /**
         * DreamDaemonController_Create - Launches the watchdog.
         */
        put(
            parameters?: Parameters<Paths.DreamDaemonControllerCreate.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerCreate.Responses.$202
            | Paths.DreamDaemonControllerCreate.Responses.$400
            | Paths.DreamDaemonControllerCreate.Responses.$401
            | Paths.DreamDaemonControllerCreate.Responses.$403
            | Paths.DreamDaemonControllerCreate.Responses.$409
            | Paths.DreamDaemonControllerCreate.Responses.$500
            | Paths.DreamDaemonControllerCreate.Responses.$501
            | Paths.DreamDaemonControllerCreate.Responses.$503
        >;
        /**
         * DreamDaemonController_Read - Get the watchdog status.
         */
        get(
            parameters?: Parameters<Paths.DreamDaemonControllerRead.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerRead.Responses.$200
            | Paths.DreamDaemonControllerRead.Responses.$400
            | Paths.DreamDaemonControllerRead.Responses.$401
            | Paths.DreamDaemonControllerRead.Responses.$403
            | Paths.DreamDaemonControllerRead.Responses.$409
            | Paths.DreamDaemonControllerRead.Responses.$410
            | Paths.DreamDaemonControllerRead.Responses.$500
            | Paths.DreamDaemonControllerRead.Responses.$501
            | Paths.DreamDaemonControllerRead.Responses.$503
        >;
        /**
         * DreamDaemonController_Delete - Stops the Watchdog if it's running.
         */
        delete(
            parameters?: Parameters<Paths.DreamDaemonControllerDelete.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerDelete.Responses.$204
            | Paths.DreamDaemonControllerDelete.Responses.$400
            | Paths.DreamDaemonControllerDelete.Responses.$401
            | Paths.DreamDaemonControllerDelete.Responses.$403
            | Paths.DreamDaemonControllerDelete.Responses.$409
            | Paths.DreamDaemonControllerDelete.Responses.$500
            | Paths.DreamDaemonControllerDelete.Responses.$501
            | Paths.DreamDaemonControllerDelete.Responses.$503
        >;
        /**
         * DreamDaemonController_Update - Update watchdog settings to be applied at next server reboot.
         */
        post(
            parameters?: Parameters<Paths.DreamDaemonControllerUpdate.HeaderParameters>,
            data?: Paths.DreamDaemonControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerUpdate.Responses.$200
            | Paths.DreamDaemonControllerUpdate.Responses.$400
            | Paths.DreamDaemonControllerUpdate.Responses.$401
            | Paths.DreamDaemonControllerUpdate.Responses.$403
            | Paths.DreamDaemonControllerUpdate.Responses.$409
            | Paths.DreamDaemonControllerUpdate.Responses.$410
            | Paths.DreamDaemonControllerUpdate.Responses.$500
            | Paths.DreamDaemonControllerUpdate.Responses.$501
            | Paths.DreamDaemonControllerUpdate.Responses.$503
        >;
        /**
         * DreamDaemonController_Restart - Creates a Tgstation.Server.Api.Models.Job to restart the Watchdog. It will start if it wasn't already running.
         */
        patch(
            parameters?: Parameters<Paths.DreamDaemonControllerRestart.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerRestart.Responses.$202
            | Paths.DreamDaemonControllerRestart.Responses.$400
            | Paths.DreamDaemonControllerRestart.Responses.$401
            | Paths.DreamDaemonControllerRestart.Responses.$403
            | Paths.DreamDaemonControllerRestart.Responses.$409
            | Paths.DreamDaemonControllerRestart.Responses.$500
            | Paths.DreamDaemonControllerRestart.Responses.$501
            | Paths.DreamDaemonControllerRestart.Responses.$503
        >;
    };
    ['/DreamDaemon/Diagnostics']: {
        /**
         * DreamDaemonController_CreateDump - Creates a Tgstation.Server.Api.Models.Job to generate a DreamDaemon process dump.
         */
        patch(
            parameters?: Parameters<Paths.DreamDaemonControllerCreateDump.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamDaemonControllerCreateDump.Responses.$202
            | Paths.DreamDaemonControllerCreateDump.Responses.$400
            | Paths.DreamDaemonControllerCreateDump.Responses.$401
            | Paths.DreamDaemonControllerCreateDump.Responses.$403
            | Paths.DreamDaemonControllerCreateDump.Responses.$409
            | Paths.DreamDaemonControllerCreateDump.Responses.$500
            | Paths.DreamDaemonControllerCreateDump.Responses.$501
            | Paths.DreamDaemonControllerCreateDump.Responses.$503
        >;
    };
    ['/DreamMaker']: {
        /**
         * DreamMakerController_Read - Read current Tgstation.Server.Api.Models.DreamMaker status.
         */
        get(
            parameters?: Parameters<Paths.DreamMakerControllerRead.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamMakerControllerRead.Responses.$200
            | Paths.DreamMakerControllerRead.Responses.$400
            | Paths.DreamMakerControllerRead.Responses.$401
            | Paths.DreamMakerControllerRead.Responses.$403
            | Paths.DreamMakerControllerRead.Responses.$409
            | Paths.DreamMakerControllerRead.Responses.$500
            | Paths.DreamMakerControllerRead.Responses.$501
            | Paths.DreamMakerControllerRead.Responses.$503
        >;
        /**
         * DreamMakerController_Create - Begin deploying repository code.
         */
        put(
            parameters?: Parameters<Paths.DreamMakerControllerCreate.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamMakerControllerCreate.Responses.$202
            | Paths.DreamMakerControllerCreate.Responses.$400
            | Paths.DreamMakerControllerCreate.Responses.$401
            | Paths.DreamMakerControllerCreate.Responses.$403
            | Paths.DreamMakerControllerCreate.Responses.$409
            | Paths.DreamMakerControllerCreate.Responses.$500
            | Paths.DreamMakerControllerCreate.Responses.$501
            | Paths.DreamMakerControllerCreate.Responses.$503
        >;
        /**
         * DreamMakerController_Update - Update deployment settings.
         */
        post(
            parameters?: Parameters<Paths.DreamMakerControllerUpdate.HeaderParameters>,
            data?: Paths.DreamMakerControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamMakerControllerUpdate.Responses.$200
            | Paths.DreamMakerControllerUpdate.Responses.$204
            | Paths.DreamMakerControllerUpdate.Responses.$400
            | Paths.DreamMakerControllerUpdate.Responses.$401
            | Paths.DreamMakerControllerUpdate.Responses.$403
            | Paths.DreamMakerControllerUpdate.Responses.$409
            | Paths.DreamMakerControllerUpdate.Responses.$410
            | Paths.DreamMakerControllerUpdate.Responses.$500
            | Paths.DreamMakerControllerUpdate.Responses.$501
            | Paths.DreamMakerControllerUpdate.Responses.$503
        >;
    };
    ['/DreamMaker/{id}']: {
        /**
         * DreamMakerController_GetId - Get a Tgstation.Server.Api.Models.CompileJob specified by a given id.
         */
        get(
            parameters?: Parameters<
                Paths.DreamMakerControllerGetId.PathParameters &
                    Paths.DreamMakerControllerGetId.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamMakerControllerGetId.Responses.$200
            | Paths.DreamMakerControllerGetId.Responses.$400
            | Paths.DreamMakerControllerGetId.Responses.$401
            | Paths.DreamMakerControllerGetId.Responses.$403
            | Paths.DreamMakerControllerGetId.Responses.$404
            | Paths.DreamMakerControllerGetId.Responses.$409
            | Paths.DreamMakerControllerGetId.Responses.$500
            | Paths.DreamMakerControllerGetId.Responses.$501
            | Paths.DreamMakerControllerGetId.Responses.$503
        >;
    };
    ['/DreamMaker/List']: {
        /**
         * DreamMakerController_List - List all Tgstation.Server.Api.Models.CompileJobTgstation.Server.Api.Models.EntityIds for the instance.
         */
        get(
            parameters?: Parameters<Paths.DreamMakerControllerList.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.DreamMakerControllerList.Responses.$200
            | Paths.DreamMakerControllerList.Responses.$400
            | Paths.DreamMakerControllerList.Responses.$401
            | Paths.DreamMakerControllerList.Responses.$403
            | Paths.DreamMakerControllerList.Responses.$409
            | Paths.DreamMakerControllerList.Responses.$500
            | Paths.DreamMakerControllerList.Responses.$501
            | Paths.DreamMakerControllerList.Responses.$503
        >;
    };
    ['/']: {
        /**
         * HomeController_Home - Main page of the Tgstation.Server.Host.Core.Application
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.HomeControllerHome.Responses.$200
            | Paths.HomeControllerHome.Responses.$400
            | Paths.HomeControllerHome.Responses.$401
            | Paths.HomeControllerHome.Responses.$403
            | Paths.HomeControllerHome.Responses.$409
            | Paths.HomeControllerHome.Responses.$500
            | Paths.HomeControllerHome.Responses.$501
            | Paths.HomeControllerHome.Responses.$503
        >;
        /**
         * HomeController_CreateToken - Attempt to authenticate a Tgstation.Server.Host.Models.User using Tgstation.Server.Host.Controllers.ApiController.ApiHeaders
         */
        post(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.HomeControllerCreateToken.Responses.$200
            | Paths.HomeControllerCreateToken.Responses.$400
            | Paths.HomeControllerCreateToken.Responses.$401
            | Paths.HomeControllerCreateToken.Responses.$403
            | Paths.HomeControllerCreateToken.Responses.$409
            | Paths.HomeControllerCreateToken.Responses.$500
            | Paths.HomeControllerCreateToken.Responses.$501
            | Paths.HomeControllerCreateToken.Responses.$503
        >;
    };
    ['/Instance']: {
        /**
         * InstanceController_Create - Create or attach an Tgstation.Server.Api.Models.Instance.
         */
        put(
            parameters?: Parameters<UnknownParamsObject>,
            data?: Paths.InstanceControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerCreate.Responses.$200
            | Paths.InstanceControllerCreate.Responses.$201
            | Paths.InstanceControllerCreate.Responses.$400
            | Paths.InstanceControllerCreate.Responses.$401
            | Paths.InstanceControllerCreate.Responses.$403
            | Paths.InstanceControllerCreate.Responses.$409
            | Paths.InstanceControllerCreate.Responses.$500
            | Paths.InstanceControllerCreate.Responses.$501
            | Paths.InstanceControllerCreate.Responses.$503
        >;
        /**
         * InstanceController_Update - Modify an Tgstation.Server.Api.Models.Instance's settings.
         */
        post(
            parameters?: Parameters<UnknownParamsObject>,
            data?: Paths.InstanceControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerUpdate.Responses.$200
            | Paths.InstanceControllerUpdate.Responses.$202
            | Paths.InstanceControllerUpdate.Responses.$400
            | Paths.InstanceControllerUpdate.Responses.$401
            | Paths.InstanceControllerUpdate.Responses.$403
            | Paths.InstanceControllerUpdate.Responses.$409
            | Paths.InstanceControllerUpdate.Responses.$410
            | Paths.InstanceControllerUpdate.Responses.$500
            | Paths.InstanceControllerUpdate.Responses.$501
            | Paths.InstanceControllerUpdate.Responses.$503
        >;
    };
    ['/Instance/{id}']: {
        /**
         * InstanceController_Delete - Detach an Tgstation.Server.Api.Models.Instance with the given id.
         */
        delete(
            parameters?: Parameters<Paths.InstanceControllerDelete.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerDelete.Responses.$204
            | Paths.InstanceControllerDelete.Responses.$400
            | Paths.InstanceControllerDelete.Responses.$401
            | Paths.InstanceControllerDelete.Responses.$403
            | Paths.InstanceControllerDelete.Responses.$409
            | Paths.InstanceControllerDelete.Responses.$410
            | Paths.InstanceControllerDelete.Responses.$500
            | Paths.InstanceControllerDelete.Responses.$501
            | Paths.InstanceControllerDelete.Responses.$503
        >;
        /**
         * InstanceController_GetId - Get a specific Tgstation.Server.Api.Models.Instance.
         */
        get(
            parameters?: Parameters<Paths.InstanceControllerGetId.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerGetId.Responses.$200
            | Paths.InstanceControllerGetId.Responses.$400
            | Paths.InstanceControllerGetId.Responses.$401
            | Paths.InstanceControllerGetId.Responses.$403
            | Paths.InstanceControllerGetId.Responses.$409
            | Paths.InstanceControllerGetId.Responses.$410
            | Paths.InstanceControllerGetId.Responses.$500
            | Paths.InstanceControllerGetId.Responses.$501
            | Paths.InstanceControllerGetId.Responses.$503
        >;
        /**
         * InstanceController_GrantPermissions - Gives the current user full permissions on a given instance id.
         */
        patch(
            parameters?: Parameters<Paths.InstanceControllerGrantPermissions.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerGrantPermissions.Responses.$204
            | Paths.InstanceControllerGrantPermissions.Responses.$400
            | Paths.InstanceControllerGrantPermissions.Responses.$401
            | Paths.InstanceControllerGrantPermissions.Responses.$403
            | Paths.InstanceControllerGrantPermissions.Responses.$409
            | Paths.InstanceControllerGrantPermissions.Responses.$500
            | Paths.InstanceControllerGrantPermissions.Responses.$501
            | Paths.InstanceControllerGrantPermissions.Responses.$503
        >;
    };
    ['/Instance/List']: {
        /**
         * InstanceController_List - List Tgstation.Server.Api.Models.Instances.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceControllerList.Responses.$200
            | Paths.InstanceControllerList.Responses.$400
            | Paths.InstanceControllerList.Responses.$401
            | Paths.InstanceControllerList.Responses.$403
            | Paths.InstanceControllerList.Responses.$409
            | Paths.InstanceControllerList.Responses.$500
            | Paths.InstanceControllerList.Responses.$501
            | Paths.InstanceControllerList.Responses.$503
        >;
    };
    ['/InstanceUser']: {
        /**
         * InstanceUserController_Create - Create an Tgstation.Server.Api.Models.InstanceUser.
         */
        put(
            parameters?: Parameters<Paths.InstanceUserControllerCreate.HeaderParameters>,
            data?: Paths.InstanceUserControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerCreate.Responses.$201
            | Paths.InstanceUserControllerCreate.Responses.$400
            | Paths.InstanceUserControllerCreate.Responses.$401
            | Paths.InstanceUserControllerCreate.Responses.$403
            | Paths.InstanceUserControllerCreate.Responses.$409
            | Paths.InstanceUserControllerCreate.Responses.$500
            | Paths.InstanceUserControllerCreate.Responses.$501
            | Paths.InstanceUserControllerCreate.Responses.$503
        >;
        /**
         * InstanceUserController_Update - Update the permissions for an Tgstation.Server.Api.Models.InstanceUser.
         */
        post(
            parameters?: Parameters<Paths.InstanceUserControllerUpdate.HeaderParameters>,
            data?: Paths.InstanceUserControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerUpdate.Responses.$200
            | Paths.InstanceUserControllerUpdate.Responses.$400
            | Paths.InstanceUserControllerUpdate.Responses.$401
            | Paths.InstanceUserControllerUpdate.Responses.$403
            | Paths.InstanceUserControllerUpdate.Responses.$409
            | Paths.InstanceUserControllerUpdate.Responses.$410
            | Paths.InstanceUserControllerUpdate.Responses.$500
            | Paths.InstanceUserControllerUpdate.Responses.$501
            | Paths.InstanceUserControllerUpdate.Responses.$503
        >;
        /**
         * InstanceUserController_Read - Read the active Tgstation.Server.Api.Models.InstanceUser.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerRead.Responses.$200
            | Paths.InstanceUserControllerRead.Responses.$400
            | Paths.InstanceUserControllerRead.Responses.$401
            | Paths.InstanceUserControllerRead.Responses.$403
            | Paths.InstanceUserControllerRead.Responses.$409
            | Paths.InstanceUserControllerRead.Responses.$500
            | Paths.InstanceUserControllerRead.Responses.$501
            | Paths.InstanceUserControllerRead.Responses.$503
        >;
    };
    ['/InstanceUser/List']: {
        /**
         * InstanceUserController_List - Lists Tgstation.Server.Api.Models.InstanceUsers for the instance.
         */
        get(
            parameters?: Parameters<Paths.InstanceUserControllerList.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerList.Responses.$200
            | Paths.InstanceUserControllerList.Responses.$400
            | Paths.InstanceUserControllerList.Responses.$401
            | Paths.InstanceUserControllerList.Responses.$403
            | Paths.InstanceUserControllerList.Responses.$409
            | Paths.InstanceUserControllerList.Responses.$500
            | Paths.InstanceUserControllerList.Responses.$501
            | Paths.InstanceUserControllerList.Responses.$503
        >;
    };
    ['/InstanceUser/{id}']: {
        /**
         * InstanceUserController_GetId - Gets a specific Tgstation.Server.Api.Models.InstanceUser.
         */
        get(
            parameters?: Parameters<
                Paths.InstanceUserControllerGetId.PathParameters &
                    Paths.InstanceUserControllerGetId.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerGetId.Responses.$200
            | Paths.InstanceUserControllerGetId.Responses.$400
            | Paths.InstanceUserControllerGetId.Responses.$401
            | Paths.InstanceUserControllerGetId.Responses.$403
            | Paths.InstanceUserControllerGetId.Responses.$409
            | Paths.InstanceUserControllerGetId.Responses.$410
            | Paths.InstanceUserControllerGetId.Responses.$500
            | Paths.InstanceUserControllerGetId.Responses.$501
            | Paths.InstanceUserControllerGetId.Responses.$503
        >;
        /**
         * InstanceUserController_Delete - Delete an Tgstation.Server.Api.Models.InstanceUser.
         */
        delete(
            parameters?: Parameters<
                Paths.InstanceUserControllerDelete.PathParameters &
                    Paths.InstanceUserControllerDelete.HeaderParameters
            >,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.InstanceUserControllerDelete.Responses.$204
            | Paths.InstanceUserControllerDelete.Responses.$400
            | Paths.InstanceUserControllerDelete.Responses.$401
            | Paths.InstanceUserControllerDelete.Responses.$403
            | Paths.InstanceUserControllerDelete.Responses.$409
            | Paths.InstanceUserControllerDelete.Responses.$500
            | Paths.InstanceUserControllerDelete.Responses.$501
            | Paths.InstanceUserControllerDelete.Responses.$503
        >;
    };
    ['/Job']: {
        /**
         * JobController_Read - Get active Tgstation.Server.Api.Models.Jobs for the instance.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.JobControllerRead.Responses.$200
            | Paths.JobControllerRead.Responses.$400
            | Paths.JobControllerRead.Responses.$401
            | Paths.JobControllerRead.Responses.$403
            | Paths.JobControllerRead.Responses.$409
            | Paths.JobControllerRead.Responses.$500
            | Paths.JobControllerRead.Responses.$501
            | Paths.JobControllerRead.Responses.$503
        >;
    };
    ['/Job/List']: {
        /**
         * JobController_List - List all Tgstation.Server.Api.Models.JobTgstation.Server.Api.Models.EntityIds for the instance in reverse creation order.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.JobControllerList.Responses.$200
            | Paths.JobControllerList.Responses.$400
            | Paths.JobControllerList.Responses.$401
            | Paths.JobControllerList.Responses.$403
            | Paths.JobControllerList.Responses.$409
            | Paths.JobControllerList.Responses.$500
            | Paths.JobControllerList.Responses.$501
            | Paths.JobControllerList.Responses.$503
        >;
    };
    ['/Job/{id}']: {
        /**
         * JobController_Delete - Cancel a running Tgstation.Server.Api.Models.Job.
         */
        delete(
            parameters?: Parameters<Paths.JobControllerDelete.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.JobControllerDelete.Responses.$202
            | Paths.JobControllerDelete.Responses.$400
            | Paths.JobControllerDelete.Responses.$401
            | Paths.JobControllerDelete.Responses.$403
            | Paths.JobControllerDelete.Responses.$404
            | Paths.JobControllerDelete.Responses.$409
            | Paths.JobControllerDelete.Responses.$410
            | Paths.JobControllerDelete.Responses.$500
            | Paths.JobControllerDelete.Responses.$501
            | Paths.JobControllerDelete.Responses.$503
        >;
        /**
         * JobController_GetId - Get a specific Tgstation.Server.Api.Models.Job.
         */
        get(
            parameters?: Parameters<Paths.JobControllerGetId.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.JobControllerGetId.Responses.$200
            | Paths.JobControllerGetId.Responses.$400
            | Paths.JobControllerGetId.Responses.$401
            | Paths.JobControllerGetId.Responses.$403
            | Paths.JobControllerGetId.Responses.$404
            | Paths.JobControllerGetId.Responses.$409
            | Paths.JobControllerGetId.Responses.$500
            | Paths.JobControllerGetId.Responses.$501
            | Paths.JobControllerGetId.Responses.$503
        >;
    };
    ['/Repository']: {
        /**
         * RepositoryController_Create - Begin cloning the repository if it doesn't exist.
         */
        put(
            parameters?: Parameters<Paths.RepositoryControllerCreate.HeaderParameters>,
            data?: Paths.RepositoryControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RepositoryControllerCreate.Responses.$201
            | Paths.RepositoryControllerCreate.Responses.$400
            | Paths.RepositoryControllerCreate.Responses.$401
            | Paths.RepositoryControllerCreate.Responses.$403
            | Paths.RepositoryControllerCreate.Responses.$409
            | Paths.RepositoryControllerCreate.Responses.$410
            | Paths.RepositoryControllerCreate.Responses.$500
            | Paths.RepositoryControllerCreate.Responses.$501
            | Paths.RepositoryControllerCreate.Responses.$503
        >;
        /**
         * RepositoryController_Delete - Delete the Tgstation.Server.Api.Models.Repository.
         */
        delete(
            parameters?: Parameters<Paths.RepositoryControllerDelete.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RepositoryControllerDelete.Responses.$202
            | Paths.RepositoryControllerDelete.Responses.$400
            | Paths.RepositoryControllerDelete.Responses.$401
            | Paths.RepositoryControllerDelete.Responses.$403
            | Paths.RepositoryControllerDelete.Responses.$409
            | Paths.RepositoryControllerDelete.Responses.$410
            | Paths.RepositoryControllerDelete.Responses.$500
            | Paths.RepositoryControllerDelete.Responses.$501
            | Paths.RepositoryControllerDelete.Responses.$503
        >;
        /**
         * RepositoryController_Read - Get Tgstation.Server.Api.Models.Repository status.
         */
        get(
            parameters?: Parameters<Paths.RepositoryControllerRead.HeaderParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RepositoryControllerRead.Responses.$200
            | Paths.RepositoryControllerRead.Responses.$201
            | Paths.RepositoryControllerRead.Responses.$400
            | Paths.RepositoryControllerRead.Responses.$401
            | Paths.RepositoryControllerRead.Responses.$403
            | Paths.RepositoryControllerRead.Responses.$409
            | Paths.RepositoryControllerRead.Responses.$410
            | Paths.RepositoryControllerRead.Responses.$500
            | Paths.RepositoryControllerRead.Responses.$501
            | Paths.RepositoryControllerRead.Responses.$503
        >;
        /**
         * RepositoryController_Update - Perform updats to the Tgstation.Server.Api.Models.Repository.
         */
        post(
            parameters?: Parameters<Paths.RepositoryControllerUpdate.HeaderParameters>,
            data?: Paths.RepositoryControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.RepositoryControllerUpdate.Responses.$200
            | Paths.RepositoryControllerUpdate.Responses.$202
            | Paths.RepositoryControllerUpdate.Responses.$400
            | Paths.RepositoryControllerUpdate.Responses.$401
            | Paths.RepositoryControllerUpdate.Responses.$403
            | Paths.RepositoryControllerUpdate.Responses.$409
            | Paths.RepositoryControllerUpdate.Responses.$410
            | Paths.RepositoryControllerUpdate.Responses.$500
            | Paths.RepositoryControllerUpdate.Responses.$501
            | Paths.RepositoryControllerUpdate.Responses.$503
        >;
    };
    ['/User']: {
        /**
         * UserController_Create - Create a Tgstation.Server.Api.Models.User.
         */
        put(
            parameters?: Parameters<UnknownParamsObject>,
            data?: Paths.UserControllerCreate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UserControllerCreate.Responses.$201
            | Paths.UserControllerCreate.Responses.$400
            | Paths.UserControllerCreate.Responses.$401
            | Paths.UserControllerCreate.Responses.$403
            | Paths.UserControllerCreate.Responses.$409
            | Paths.UserControllerCreate.Responses.$410
            | Paths.UserControllerCreate.Responses.$500
            | Paths.UserControllerCreate.Responses.$501
            | Paths.UserControllerCreate.Responses.$503
        >;
        /**
         * UserController_Update - Update a Tgstation.Server.Api.Models.User.
         */
        post(
            parameters?: Parameters<UnknownParamsObject>,
            data?: Paths.UserControllerUpdate.RequestBody,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UserControllerUpdate.Responses.$200
            | Paths.UserControllerUpdate.Responses.$400
            | Paths.UserControllerUpdate.Responses.$401
            | Paths.UserControllerUpdate.Responses.$403
            | Paths.UserControllerUpdate.Responses.$404
            | Paths.UserControllerUpdate.Responses.$409
            | Paths.UserControllerUpdate.Responses.$500
            | Paths.UserControllerUpdate.Responses.$501
            | Paths.UserControllerUpdate.Responses.$503
        >;
        /**
         * UserController_Read - Get information about the current Tgstation.Server.Api.Models.User.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UserControllerRead.Responses.$200
            | Paths.UserControllerRead.Responses.$400
            | Paths.UserControllerRead.Responses.$401
            | Paths.UserControllerRead.Responses.$403
            | Paths.UserControllerRead.Responses.$409
            | Paths.UserControllerRead.Responses.$500
            | Paths.UserControllerRead.Responses.$501
            | Paths.UserControllerRead.Responses.$503
        >;
    };
    ['/User/List']: {
        /**
         * UserController_List - List all Tgstation.Server.Api.Models.Users in the server.
         */
        get(
            parameters?: Parameters<UnknownParamsObject>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UserControllerList.Responses.$200
            | Paths.UserControllerList.Responses.$400
            | Paths.UserControllerList.Responses.$401
            | Paths.UserControllerList.Responses.$403
            | Paths.UserControllerList.Responses.$409
            | Paths.UserControllerList.Responses.$500
            | Paths.UserControllerList.Responses.$501
            | Paths.UserControllerList.Responses.$503
        >;
    };
    ['/User/{id}']: {
        /**
         * UserController_GetId - Get a specific Tgstation.Server.Api.Models.User.
         */
        get(
            parameters?: Parameters<Paths.UserControllerGetId.PathParameters>,
            data?: any,
            config?: AxiosRequestConfig
        ): OperationResponse<
            | Paths.UserControllerGetId.Responses.$200
            | Paths.UserControllerGetId.Responses.$400
            | Paths.UserControllerGetId.Responses.$401
            | Paths.UserControllerGetId.Responses.$403
            | Paths.UserControllerGetId.Responses.$404
            | Paths.UserControllerGetId.Responses.$409
            | Paths.UserControllerGetId.Responses.$500
            | Paths.UserControllerGetId.Responses.$501
            | Paths.UserControllerGetId.Responses.$503
        >;
    };
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>;
