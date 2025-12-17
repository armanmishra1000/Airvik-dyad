declare module "@fast-csv/parse" {
  import type { Transform } from "stream";

  export interface ParserOptionsArgs {
    headers?: boolean | string[];
    ignoreEmpty?: boolean;
    trim?: boolean;
    renameHeaders?: boolean;
    discardUnmappedColumns?: boolean;
    [key: string]: unknown;
  }

  export function parse(options?: ParserOptionsArgs): Transform;
}
