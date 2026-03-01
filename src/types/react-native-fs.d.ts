declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export const CachesDirectoryPath: string;
  
  export interface StatResult {
    path: string;
    ctime: Date;
    mtime: Date;
    size: number;
    mode: number;
    originalFilepath: string;
    isFile: () => boolean;
    isDirectory: () => boolean;
  }
  
  export function writeFile(
    filepath: string,
    contents: string,
    encoding?: string
  ): Promise<void>;
  
  export function readFile(
    filepath: string,
    encoding?: string
  ): Promise<string>;
  
  export function exists(filepath: string): Promise<boolean>;
  
  export function unlink(filepath: string): Promise<void>;
  
  export function mkdir(filepath: string): Promise<void>;
  
  export function readDir(dirpath: string): Promise<any[]>;
  
  export function stat(filepath: string): Promise<StatResult>;
}
