type TokenHeader = Record<string, string>;

export interface AlgoNextClientConfig {
  server: string;
  port?: string | number;
  token?: string | TokenHeader;
  network: string;
}

export interface AlgoNextKMDConfig {
  server: string;
  port?: string | number;
  token?: string | TokenHeader;
  wallet: string;
  password: string;
}
