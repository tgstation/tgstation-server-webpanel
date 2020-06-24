export enum RightsType {
    Administration = 1 << 0,
    InstanceManager = 1 << 1,
    Repository = 1 << 2,
    Byond = 1 << 3,
    DreamMaker = 1 << 4,
    DreamDaemon = 1 << 5,
    ChatBots = 1 << 6,
    Configuration = 1 << 7,
    InstanceUser = 1 << 8
}

export enum AdministrationRights {
    None = 1 << 0,
    WriteUsers = 1 << 1,
    RestartHost = 1 << 2,
    ChangeVersion = 1 << 3,
    EditOwnPassword = 1 << 4,
    ReadUsers = 1 << 5
}

export enum InstanceManagerRights {
    None = 1 << 0,
    Read = 1 << 1,
    Create = 1 << 2,
    Rename = 1 << 3,
    Relocate = 1 << 4,
    SetOnline = 1 << 5,
    Delete = 1 << 6,
    List = 1 << 7,
    SetConfiguration = 1 << 8,
    SetAutoUpdate = 1 << 9,
    SetChatBotLimit = 1 << 10
}

export enum InstanceUserRights {
    None = 1 << 0,
    ReadUsers = 1 << 1,
    WriteUsers = 1 << 2,
    CreateUsers = 1 << 3
}

export enum ByondRights {
    None = 1 << 0,
    ReadActive = 1 << 1,
    ListInstalled = 1 << 2,
    ChangeVersion = 1 << 3,
    CancelInstall = 1 << 4
}

export enum DreamDaemonRights {
    None = 1 << 0,
    ReadRevision = 1 << 1,
    SetPorts = 1 << 2,
    SetAutoStart = 1 << 3,
    SetSecurity = 1 << 4,
    ReadMetadata = 1 << 5,
    SetWebClient = 1 << 6,
    SoftRestart = 1 << 7,
    SoftShutdown = 1 << 8,
    Restart = 1 << 9,
    Shutdown = 1 << 10,
    Start = 1 << 11,
    SetStartupTimeout = 1 << 12,
    SetHeartbeatInterval = 1 << 13
}

export enum DreamMakerRights {
    None = 1 << 0,
    Read = 1 << 1,
    Compile = 1 << 2,
    CancelCompile = 1 << 3,
    SetDme = 1 << 4,
    SetApiValidationPort = 1 << 5,
    CompileJobs = 1 << 6,
    SetSecurityLevel = 1 << 7
}

export enum RepositoryRights {
    None = 1 << 0,
    CancelPendingChanges = 1 << 1,
    SetOrigin = 1 << 2,
    SetSha = 1 << 3,
    MergePullRequest = 1 << 4,
    UpdateBranch = 1 << 5,
    ChangeCommitter = 1 << 6,
    ChangeTestMergeCommits = 1 << 7,
    ChangeCredentials = 1 << 8,
    SetReference = 1 << 9,
    Read = 1 << 10,
    ChangeAutoUpdateSettings = 1 << 11,
    Delete = 1 << 12,
    CancelClone = 1 << 13
}

export enum ChatBotRights {
    None = 1 << 0,
    WriteEnabled = 1 << 1,
    WriteProvider = 1 << 2,
    WriteChannels = 1 << 3,
    WriteConnectionString = 1 << 4,
    ReadConnectionString = 1 << 5,
    Read = 1 << 6,
    Create = 1 << 7,
    Delete = 1 << 8,
    WriteName = 1 << 9,
    WriteReconnectionInterval = 1 << 10,
    WriteChannelLimit = 1 << 11
}

export enum ConfigurationRights {
    None = 1 << 0,
    Read = 1 << 1,
    Write = 1 << 2,
    List = 1 << 3,
    Delete = 1 << 4
}

/////////////////

export enum ChatProvider {
    Irc = 1 << 0,
    Discord = 1 << 1
}

export enum DreamDaemonSecurity {
    Trusted = 1 << 0,
    Safe = 1 << 1,
    Ultrasafe = 1 << 2
}

export enum ConfigurationType {
    Disallowed = 1 << 0,
    HostWrite = 1 << 1,
    SystemIdentityWrite = 1 << 2
}
