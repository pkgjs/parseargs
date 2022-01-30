interface Dictionary<T = any> {
  [key: string]: T;
}
export interface Options {
  withValue?: string[]
}
export interface Argv {
  flags: Dictionary<boolean>;
  values: Dictionary<string>;
  positionals: string[];
}
export function parseArgs(argv?: string[] | Options, options?: Options): Argv;
