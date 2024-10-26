const nameof = <T>(name: Extract<keyof T, string>): string => name;

export default nameof;
