declare var process: {
  env: Record<string, string | undefined>;
};

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

export {};
