declare module 'node-qpdf' {
  interface EncryptOptions {
    keyLength: 40 | 128 | 256;
    password: string | {
      user: string;
      owner: string;
    };
    restrictions?: {
      print?: 'none' | 'low' | 'full';
      modify?: 'none' | 'all';
      extract?: 'y' | 'n';
      annotate?: 'y' | 'n';
      useAes?: 'y' | 'n';
    };
  }

  export function encrypt(inputPath: string, options: EncryptOptions, outputPath: string): void;
  export function decrypt(inputPath: string, password: string, outputPath?: string): void;
} 