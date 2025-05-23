declare module 'stremio-addon-sdk' {
  interface Manifest {
    stremioAddonsConfig?: {
      issuer: string;
      signature: string;
    };
  }
}

export type Stream = {
  name: string;
  url: string;
  description?: string;
  behaviorHints?: {
    notWebReady?: boolean;
    bingeGroup?: string;
    headers?: {
      [key: string]: string;
    };
    filename?: string;
  };
};

export enum VideoQuality {
  SD = 'SD',
  HD = 'HD',
  FULLHD = 'FULLHD',
  UHD_4K = '4K',
}
