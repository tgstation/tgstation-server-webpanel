export enum ErrorCode {
    InternalServerError = 0,
    ApiMismatch = 1,
    ModelValidationFailure = 2,
    IOError = 3,
    BadHeaders = 4,
    TokenWithToken = 5,
    DatabaseIntegrityConflict = 6,
    MissingHostWatchdog = 7,
    CannotChangeServerSuite = 8,
    GitHubApiError = 9,
    ServerUpdateInProgress = 10,
    UserNameChange = 11,
    UserSidChange = 12,
    UserMismatchNameSid = 13,
    UserMismatchPasswordSid = 14,
    UserPasswordLength = 15,
    UserColonInName = 16,
    UserMissingName = 17,
    InstanceRelocateOnline = 18,
    InstanceAtExistingPath = 19,
    InstanceDetachOnline = 20,
    InstanceAtConflictingPath = 21,
    InstanceLimitReached = 22,
    InstanceWhitespaceName = 23,
    InstanceHeaderRequired = 24,
    RequiresPosixSystemIdentity = 25,
    ConfigurationFileUpdated = 26,
    ConfigurationDirectoryNotEmpty = 27,
    RepoMissingOrigin = 28,
    RepoMismatchUserAndAccessToken = 29,
    RepoCloning = 30,
    RepoBusy = 31,
    RepoExists = 32,
    RepoMissing = 33,
    RepoMismatchShaAndReference = 34,
    RepoMismatchShaAndUpdate = 35,
    RepoCantChangeOrigin = 36,
    RepoDuplicateTestMerge = 37,
    RepoWhitespaceCommitterName = 38,
    RepoWhitespaceCommitterEmail = 39,
    DreamDaemonDuplicatePorts = 40,
    InvalidSecurityLevel = 41,
    ChatBotWrongChannelType = 42,
    ChatBotWhitespaceConnectionString = 43,
    ChatBotWhitespaceName = 44,
    ChatBotProviderMissing = 45,
    UserMissingId = 46,
    ChatBotMax = 47,
    ChatBotMaxChannels = 48,
    ByondDirectXInstallFail = 49,
    ByondDownloadFail = 50,
    ByondNoVersionsInstalled = 51,
    DreamMakerNeverValidated = 52,
    DreamMakerInvalidValidation = 53,
    DreamMakerValidationTimeout = 54,
    DreamMakerNoDme = 55,
    DreamMakerMissingDme = 56,
    DreamMakerExitCode = 57,
    DreamMakerCompileJobInProgress = 58,
    InstanceMissingDreamDaemonSettings = 59,
    InstanceMissingDreamMakerSettings = 60,
    InstanceMissingRepositorySettings = 61,
    InstanceUpdateTestMergeConflict = 62,
    RepoCredentialsRequired = 63,
    RepoCannotAuthenticate = 64,
    RepoReferenceRequired = 65,
    WatchdogRunning = 66,
    WatchdogCompileJobCorrupted = 67,
    WatchdogStartupFailed = 68,
    WatchdogStartupTimeout = 69,
    RepoUnsupportedTestMergeRemote = 70,
    RepoSwappedShaOrReference = 71,
    RepoMergeConflict = 72,
    RepoReferenceNotTracking = 73,
    RepoTestMergeConflict = 74,
    InstanceNotAtWhitelistedPath = 75,
    DreamDaemonDoubleSoft = 76,
    DeploymentPagerRunning = 77,
    DreamDaemonPortInUse = 78,
    PostDeployFailure = 79,
    WatchdogNotRunning = 80,
    ResourceNotPresent = 81,
    ResourceNeverPresent = 82,
    GitHubApiRateLimit = 83,
    JobStopped = 84,
    MissingGCore = 85,
    GCoreFailure = 86,
    RepoTestMergeInvalidRemote = 87,
    ByondNonExistentCustomVersion = 88
}

export enum AdministrationRights {
    None = 0,
    WriteUsers = 1,
    RestartHost = 2,
    ChangeVersion = 4,
    EditOwnPassword = 8,
    ReadUsers = 16,
    DownloadLogs = 32
}

export enum InstanceManagerRights {
    None = 0,
    Read = 1,
    Create = 2,
    Rename = 4,
    Relocate = 8,
    SetOnline = 16,
    Delete = 32,
    List = 64,
    SetConfiguration = 128,
    SetAutoUpdate = 256,
    SetChatBotLimit = 512,
    GrantPermissions = 1024
}

export enum RightsType {
    Administration = 0,
    InstanceManager = 1,
    Repository = 2,
    Byond = 3,
    DreamMaker = 4,
    DreamDaemon = 5,
    ChatBots = 6,
    Configuration = 7,
    InstanceUser = 8
}

export enum ChatProvider {
    Irc = 0,
    Discord = 1
}

export enum DreamDaemonSecurity {
    Trusted = 0,
    Safe = 1,
    Ultrasafe = 2
}

export enum WatchdogStatus {
    Offline = 0,
    Restoring = 1,
    Online = 2,
    DelayedRestart = 3
}

export enum ConfigurationType {
    Disallowed = 0,
    HostWrite = 1,
    SystemIdentityWrite = 2
}

export enum InstanceUserRights {
    None = 0,
    ReadUsers = 1,
    WriteUsers = 2,
    CreateUsers = 4
}

export enum ByondRights {
    None = 0,
    ReadActive = 1,
    ListInstalled = 2,
    ChangeVersion = 4,
    CancelInstall = 8
}

export enum DreamDaemonRights {
    None = 0,
    ReadRevision = 1,
    SetPorts = 2,
    SetAutoStart = 4,
    SetSecurity = 8,
    ReadMetadata = 16,
    SetWebClient = 32,
    SoftRestart = 64,
    SoftShutdown = 128,
    Restart = 256,
    Shutdown = 512,
    Start = 1024,
    SetStartupTimeout = 2048,
    SetHeartbeatInterval = 4096,
    CreateDump = 8192,
    SetTopicTimeout = 16384
}

export enum DreamMakerRights {
    None = 0,
    Read = 1,
    Compile = 2,
    CancelCompile = 4,
    SetDme = 8,
    SetApiValidationPort = 16,
    CompileJobs = 32,
    SetSecurityLevel = 64
}

export enum RepositoryRights {
    None = 0,
    CancelPendingChanges = 1,
    SetOrigin = 2,
    SetSha = 4,
    MergePullRequest = 8,
    UpdateBranch = 16,
    ChangeCommitter = 32,
    ChangeTestMergeCommits = 64,
    ChangeCredentials = 128,
    SetReference = 256,
    Read = 512,
    ChangeAutoUpdateSettings = 1024,
    Delete = 2048,
    CancelClone = 4096
}

export enum ChatBotRights {
    None = 0,
    WriteEnabled = 1,
    WriteProvider = 2,
    WriteChannels = 4,
    WriteConnectionString = 8,
    ReadConnectionString = 16,
    Read = 32,
    Create = 64,
    Delete = 128,
    WriteName = 256,
    WriteReconnectionInterval = 512,
    WriteChannelLimit = 1024
}

export enum ConfigurationRights {
    None = 0,
    Read = 1,
    Write = 2,
    List = 4,
    Delete = 8
}
