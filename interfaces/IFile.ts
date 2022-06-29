interface IFile {
    name: string;
    size: number;
    birthtime: Date;
    isDirectory: boolean;
    path:string
  }

  export {IFile}