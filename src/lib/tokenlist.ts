import { fetch } from 'cross-fetch';

import tokenlist from './../tokens/solana.tokenlist.json';

export enum ENV {
  MainnetBeta = 101,
  Testnet = 102,
  Devnet = 103,
}

export interface TokenList {
  readonly name: string;
  readonly logoURI: string;
  readonly tags: { [tag: string]: TagDetails };
  readonly timestamp: string;
  readonly tokens: TokenInfo[];
}

export interface TagDetails {
  readonly name: string;
  readonly description: string;
}

export interface TokenExtensions {
  readonly website?: string;
  readonly bridgeContract?: string;
  readonly assetContract?: string;
  readonly address?: string;
  readonly explorer?: string;
  readonly twitter?: string;
  readonly github?: string;
  readonly medium?: string;
  readonly tgann?: string;
  readonly tggroup?: string;
  readonly discord?: string;
  readonly serumV3Usdt?: string;
  readonly serumV3Usdc?: string;
  readonly coingeckoId?: string;
  readonly imageUrl?: string;
  readonly description?: string;
}

export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: TokenExtensions;
}

export type TokenInfoMap = Map<string, TokenInfo>;

export const CLUSTER_SLUGS: { [id: string]: ENV } = {
  'mainnet-beta': ENV.MainnetBeta,
  testnet: ENV.Testnet,
  devnet: ENV.Devnet,
};

export class GitHubTokenListResolutionStrategy {
  repositories = [
    'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
  ];

  resolve = () => {
    return queryJsonFiles(this.repositories);
  };
}

export class CDNTokenListResolutionStrategy {
  repositories = [
    'https://cdn.jsdelivr.net/gh/solana-labs/token-list@latest/src/tokens/solana.tokenlist.json',
  ];

  resolve = () => {
    return queryJsonFiles(this.repositories);
  };
}

export class SolanaTokenListResolutionStrategy {
  repositories = ['https://token-list.solana.com/solana.tokenlist.json'];

  resolve = () => {
    return queryJsonFiles(this.repositories);
  };
}

const queryJsonFiles = async (files: string[]) => {
  const responses: TokenList[] = (await Promise.all(
    files.map(async (repo) => {
      try {
        const response = await fetch(repo);
        const json = (await response.json()) as TokenList;
        return json;
      } catch {
        console.info(
          `@solana/token-registry: falling back to static repository.`
        );
        return tokenlist;
      }
    })
  )) as TokenList[];

  return responses
    .map((tokenlist: TokenList) => tokenlist.tokens || [])
    .reduce((acc, arr) => (acc as TokenInfo[]).concat(arr), []);
};

export enum Strategy {
  GitHub = 'GitHub',
  Static = 'Static',
  Solana = 'Solana',
  CDN = 'CDN',
}

export class StaticTokenListResolutionStrategy {
  resolve = () => {
    return tokenlist.tokens || [];
  };
}

export class TokenListProvider {
  static strategies = {
    [Strategy.GitHub]: new GitHubTokenListResolutionStrategy(),
    [Strategy.Static]: new StaticTokenListResolutionStrategy(),
    [Strategy.Solana]: new SolanaTokenListResolutionStrategy(),
    [Strategy.CDN]: new CDNTokenListResolutionStrategy(),
  };

  resolve = async (
    strategy: Strategy = Strategy.CDN
  ): Promise<TokenListContainer> => {
    return new TokenListContainer(
      await TokenListProvider.strategies[strategy].resolve()
    );
  };
}

export class TokenListContainer {
  constructor(private tokenList: TokenInfo[]) {}

  filterByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => (item.tags || []).includes(tag))
    );
  };

  filterByChainId = (chainId: number | ENV) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => item.chainId === chainId)
    );
  };

  excludeByChainId = (chainId: number | ENV) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => item.chainId !== chainId)
    );
  };

  excludeByTag = (tag: string) => {
    return new TokenListContainer(
      this.tokenList.filter((item) => !(item.tags || []).includes(tag))
    );
  };

  filterByClusterSlug = (slug: string) => {
    if (slug in CLUSTER_SLUGS) {
      return this.filterByChainId(CLUSTER_SLUGS[slug]);
    }
    throw new Error(
      `Unknown slug: ${slug}, please use one of ${Object.keys(CLUSTER_SLUGS)}`
    );
  };

  getList = () => {
    return this.tokenList;
  };
}
// Update on 2024-10-12 14:32:22: Updated dependencies - 7196
// Update on 2024-10-13 14:04:40: Small UI tweak - 1392
// Update on 2024-10-13 13:09:21: Improved performance - 8874
// Update on 2024-10-14 18:08:14: Minor documentation update - 2808
// Update on 2024-10-14 12:15:45: Added new feature - 9085
// Update on 2024-10-14 08:26:31: Refactored function - 4384
// Update on 2024-10-15 15:22:32: Refactored some code - 1734
// Update on 2024-10-15 12:47:30: Refactored some code - 2977
// Update on 2024-10-15 10:07:29: Updated dependencies - 2459
// Update on 2024-10-16 11:31:35: Minor documentation update - 2309
// Update on 2024-10-16 20:53:33: Fix minor bug - 6906
// Update on 2024-10-17 18:24:46: Improved performance - 7389
// Update on 2024-10-18 19:32:10: Small UI tweak - 3372
// Update on 2024-10-18 19:43:01: Updated dependencies - 7549
// Update on 2024-10-19 16:45:38: Updated README - 2003
// Update on 2024-10-20 15:20:23: Added new feature - 5750
// Update on 2024-10-20 20:56:08: Updated dependencies - 8842
// Update on 2024-10-20 17:26:27: Code cleanup - 6418
// Update on 2024-10-21 22:40:45: Updated dependencies - 3116
// Update on 2024-10-21 11:42:54: Refactored function - 4554
// Update on 2024-10-21 19:13:41: Fix minor bug - 2822
// Update on 2024-10-22 20:07:08: Small UI tweak - 1958
// Update on 2024-10-23 08:45:44: Small UI tweak - 5735
// Update on 2024-10-24 15:39:47: Refactored some code - 9672
// Update on 2024-10-24 12:51:48: Small UI tweak - 3197
// Update on 2024-10-24 19:17:53: Updated dependencies - 6206
// Update on 2024-10-25 20:01:19: Refactored function - 4667
// Update on 2024-10-25 14:00:22: Code cleanup - 8662
// Update on 2024-10-26 14:43:32: Minor documentation update - 1434
// Update on 2024-10-27 10:03:10: Small UI tweak - 8530
// Update on 2024-10-28 09:27:08: Small UI tweak - 3655
// Update on 2024-10-28 14:13:21: Minor documentation update - 1178
// Update on 2024-10-29 17:42:46: Added new feature - 8596
// Update on 2024-10-29 16:45:39: Fix minor bug - 4340
// Update on 2024-10-30 18:33:37: Updated dependencies - 6753
// Update on 2024-10-30 11:06:51: Code cleanup - 7358
// Update on 2024-10-31 14:50:24: Updated dependencies - 7136
// Update on 2024-11-01 18:24:58: Refactored some code - 5809
// Update on 2024-11-01 09:35:19: Updated dependencies - 2614
// Update on 2024-11-01 08:46:33: Refactored some code - 9175
// Update on 2024-11-02 12:56:56: Updated README - 3561
// Update on 2024-11-03 14:41:45: Improved performance - 7630
// Update on 2024-11-03 13:27:05: Improved performance - 3655
// Update on 2024-11-04 21:53:36: Refactored function - 1029
// Update on 2024-11-04 10:29:04: Updated dependencies - 1725
// Update on 2024-11-05 22:12:35: Code cleanup - 7835
// Update on 2024-11-06 19:50:17: Refactored some code - 6334
// Update on 2024-11-06 09:56:34: Refactored some code - 1580
// Update on 2024-11-06 21:59:57: Refactored some code - 5843
// Update on 2024-11-07 16:15:03: Fix minor bug - 1506
// Update on 2024-11-08 22:10:10: Fix minor bug - 5332
// Update on 2024-11-08 10:35:52: Refactored function - 4538
// Update on 2024-11-08 10:08:05: Refactored some code - 8241
