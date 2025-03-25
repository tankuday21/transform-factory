declare module 'hummus' {
  interface PDFWriterOptions {
    modifiedFilePath?: string;
    userPassword?: string;
    ownerPassword?: string;
    userProtectionFlag?: number;
  }

  interface PDFWriter {
    end(): void;
  }

  export function createWriterToModify(inputPath: string, options?: PDFWriterOptions): PDFWriter;
} 