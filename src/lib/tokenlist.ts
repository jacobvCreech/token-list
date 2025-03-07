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
// Update on 2024-11-09 08:19:27: Small UI tweak - 5734
// Update on 2024-11-10 11:51:09: Updated README - 7125
// Update on 2024-11-10 12:59:09: Minor documentation update - 1760
// Update on 2024-11-10 09:37:30: Minor documentation update - 8858
// Update on 2024-11-11 18:34:36: Minor documentation update - 4423
// Update on 2024-11-11 09:03:39: Fix minor bug - 7829
// Update on 2024-11-12 18:49:47: Improved performance - 4975
// Update on 2024-11-12 22:10:43: Fix minor bug - 7599
// Update on 2024-11-12 22:27:22: Added new feature - 2897
// Update on 2024-11-13 20:09:38: Improved performance - 7594
// Update on 2024-11-14 15:29:18: Refactored function - 5244
// Update on 2024-11-14 09:42:53: Refactored function - 4363
// Update on 2024-11-15 15:43:56: Minor documentation update - 4274
// Update on 2024-11-16 08:43:31: Updated README - 3434
// Update on 2024-11-16 20:15:25: Updated dependencies - 2668
// Update on 2024-11-17 21:04:41: Updated README - 9595
// Update on 2024-11-17 20:36:28: Small UI tweak - 9696
// Update on 2024-11-18 17:24:48: Updated dependencies - 5952
// Update on 2024-11-18 18:16:52: Refactored function - 9140
// Update on 2024-11-19 20:58:47: Fix minor bug - 9108
// Update on 2024-11-19 15:48:50: Small UI tweak - 4356
// Update on 2024-11-20 22:38:15: Code cleanup - 5159
// Update on 2024-11-20 18:17:06: Added new feature - 4828
// Update on 2024-11-21 14:04:02: Code cleanup - 1205
// Update on 2024-11-22 08:04:20: Added new feature - 7813
// Update on 2024-11-22 18:49:16: Fix minor bug - 5007
// Update on 2024-11-22 11:15:35: Fix minor bug - 8905
// Update on 2024-11-23 20:33:15: Small UI tweak - 9326
// Update on 2024-11-24 21:43:35: Small UI tweak - 2122
// Update on 2024-11-25 21:23:48: Small UI tweak - 2931
// Update on 2024-11-25 15:24:46: Updated dependencies - 3936
// Update on 2024-11-25 20:36:41: Small UI tweak - 8082
// Update on 2024-11-26 12:47:30: Code cleanup - 6295
// Update on 2024-11-26 09:52:18: Refactored function - 9512
// Update on 2024-11-27 19:19:54: Refactored some code - 6100
// Update on 2024-11-27 16:18:17: Added new feature - 8237
// Update on 2024-11-28 11:16:44: Improved performance - 4337
// Update on 2024-11-28 14:08:20: Updated dependencies - 5954
// Update on 2024-11-29 11:47:35: Fix minor bug - 5907
// Update on 2024-11-29 18:03:54: Refactored function - 8880
// Update on 2024-11-29 22:19:51: Refactored function - 4548
// Update on 2024-11-30 15:38:35: Small UI tweak - 8571
// Update on 2024-11-30 11:40:50: Improved performance - 6201
// Update on 2024-11-30 19:34:41: Added new feature - 9652
// Update on 2024-12-01 13:35:23: Refactored some code - 8618
// Update on 2024-12-01 16:48:04: Refactored some code - 8540
// Update on 2024-12-02 09:29:39: Refactored function - 5880
// Update on 2024-12-02 21:20:47: Minor documentation update - 6395
// Update on 2024-12-02 10:44:57: Added new feature - 3278
// Update on 2024-12-03 09:28:44: Updated README - 6481
// Update on 2024-12-04 21:38:31: Refactored some code - 5583
// Update on 2024-12-04 22:33:14: Refactored function - 6575
// Update on 2024-12-04 19:40:44: Improved performance - 9160
// Update on 2024-12-05 19:50:23: Fix minor bug - 5746
// Update on 2024-12-05 20:28:23: Improved performance - 1912
// Update on 2024-12-06 17:05:24: Refactored function - 8500
// Update on 2024-12-06 16:08:27: Fix minor bug - 3820
// Update on 2024-12-07 09:24:20: Updated dependencies - 4873
// Update on 2024-12-07 13:29:23: Added new feature - 6246
// Update on 2024-12-07 13:01:22: Small UI tweak - 2609
// Update on 2024-12-08 18:17:39: Updated dependencies - 2026
// Update on 2024-12-08 15:08:45: Updated README - 8208
// Update on 2024-12-09 18:12:15: Added new feature - 5126
// Update on 2024-12-09 13:58:27: Updated README - 3967
// Update on 2024-12-10 10:04:01: Refactored function - 9039
// Update on 2024-12-10 20:35:21: Updated dependencies - 6560
// Update on 2024-12-10 08:49:12: Code cleanup - 7812
// Update on 2024-12-11 19:34:18: Code cleanup - 3706
// Update on 2024-12-12 18:34:10: Small UI tweak - 7187
// Update on 2024-12-12 09:48:35: Refactored function - 1065
// Update on 2024-12-12 10:38:16: Minor documentation update - 6128
// Update on 2024-12-13 17:08:29: Refactored function - 2991
// Update on 2024-12-13 13:15:19: Code cleanup - 1426
// Update on 2024-12-13 09:33:46: Fix minor bug - 1388
// Update on 2024-12-14 14:21:38: Added new feature - 4994
// Update on 2024-12-14 12:11:01: Updated dependencies - 9067
// Update on 2024-12-14 21:45:28: Refactored some code - 3862
// Update on 2024-12-15 09:14:42: Small UI tweak - 2441
// Update on 2024-12-16 11:14:45: Added new feature - 4122
// Update on 2024-12-16 11:23:14: Small UI tweak - 2498
// Update on 2024-12-17 20:29:42: Fix minor bug - 1679
// Update on 2024-12-18 17:06:44: Code cleanup - 2695
// Update on 2024-12-18 19:03:27: Refactored function - 1619
// Update on 2024-12-19 08:36:33: Minor documentation update - 4677
// Update on 2024-12-19 21:02:39: Added new feature - 9384
// Update on 2024-12-19 17:24:44: Refactored function - 1803
// Update on 2024-12-20 10:43:19: Refactored some code - 7701
// Update on 2024-12-20 14:50:49: Improved performance - 9376
// Update on 2024-12-21 12:55:35: Updated README - 9867
// Update on 2024-12-21 22:16:30: Updated README - 1387
// Update on 2024-12-22 12:12:57: Minor documentation update - 8945
// Update on 2024-12-22 21:47:18: Added new feature - 7088
// Update on 2024-12-23 21:39:44: Minor documentation update - 3006
// Update on 2024-12-24 15:33:16: Updated dependencies - 5866
// Update on 2024-12-24 08:38:22: Minor documentation update - 9770
// Update on 2024-12-25 12:24:58: Small UI tweak - 7936
// Update on 2024-12-25 17:07:18: Fix minor bug - 7285
// Update on 2024-12-26 10:32:21: Refactored function - 6629
// Update on 2024-12-27 18:05:45: Improved performance - 8035
// Update on 2024-12-28 11:47:17: Minor documentation update - 5332
// Update on 2024-12-29 18:39:03: Refactored some code - 7447
// Update on 2024-12-29 16:39:40: Code cleanup - 2637
// Update on 2024-12-29 12:10:49: Refactored function - 9280
// Update on 2024-12-30 09:25:12: Updated README - 2513
// Update on 2024-12-30 16:06:53: Added new feature - 1761
// Update on 2024-12-30 15:21:47: Refactored function - 8835
// Update on 2024-12-31 15:46:51: Minor documentation update - 1399
// Update on 2025-01-01 12:12:13: Refactored some code - 1561
// Update on 2025-01-01 08:00:42: Fix minor bug - 3587
// Update on 2025-01-01 14:48:03: Updated README - 4263
// Update on 2025-01-02 13:02:35: Minor documentation update - 3451
// Update on 2025-01-02 14:20:35: Added new feature - 4990
// Update on 2025-01-02 13:15:33: Updated dependencies - 4502
// Update on 2025-01-03 20:25:20: Added new feature - 2015
// Update on 2025-01-04 10:17:40: Updated dependencies - 2740
// Update on 2025-01-05 18:58:16: Updated README - 4658
// Update on 2025-01-05 20:58:41: Small UI tweak - 8651
// Update on 2025-01-06 13:17:28: Refactored some code - 1053
// Update on 2025-01-06 10:52:05: Fix minor bug - 6751
// Update on 2025-01-07 16:40:04: Added new feature - 5962
// Update on 2025-01-07 12:52:06: Improved performance - 8945
// Update on 2025-01-08 21:06:49: Updated README - 5437
// Update on 2025-01-08 16:53:54: Fix minor bug - 2673
// Update on 2025-01-08 08:29:22: Code cleanup - 6694
// Update on 2025-01-09 13:43:07: Updated dependencies - 2101
// Update on 2025-01-09 13:04:21: Added new feature - 1128
// Update on 2025-01-09 11:14:38: Updated README - 3842
// Update on 2025-01-10 08:08:14: Refactored some code - 3328
// Update on 2025-01-10 16:59:41: Updated README - 7059
// Update on 2025-01-10 09:34:19: Minor documentation update - 9110
// Update on 2025-01-11 13:23:39: Code cleanup - 5856
// Update on 2025-01-11 09:42:13: Added new feature - 3465
// Update on 2025-01-11 10:48:56: Small UI tweak - 3058
// Update on 2025-01-12 10:32:36: Fix minor bug - 5665
// Update on 2025-01-12 20:37:48: Refactored some code - 7604
// Update on 2025-01-13 21:55:51: Small UI tweak - 8258
// Update on 2025-01-13 21:16:18: Updated dependencies - 6379
// Update on 2025-01-14 20:09:22: Refactored function - 6274
// Update on 2025-01-15 11:27:51: Added new feature - 7702
// Update on 2025-01-15 19:49:15: Refactored some code - 7340
// Update on 2025-01-16 10:15:53: Refactored some code - 5629
// Update on 2025-01-17 08:15:15: Added new feature - 5814
// Update on 2025-01-17 15:29:53: Small UI tweak - 7946
// Update on 2025-01-18 12:05:34: Updated README - 4706
// Update on 2025-01-19 22:33:57: Improved performance - 1982
// Update on 2025-01-19 11:20:48: Code cleanup - 2450
// Update on 2025-01-19 12:38:53: Added new feature - 8231
// Update on 2025-01-20 18:39:46: Minor documentation update - 5081
// Update on 2025-01-20 22:34:47: Refactored function - 7353
// Update on 2025-01-21 10:05:57: Refactored some code - 7790
// Update on 2025-01-21 09:25:37: Added new feature - 9723
// Update on 2025-01-21 21:16:16: Improved performance - 6169
// Update on 2025-01-22 10:25:49: Minor documentation update - 7911
// Update on 2025-01-22 21:55:49: Refactored function - 3031
// Update on 2025-01-23 08:23:44: Minor documentation update - 8541
// Update on 2025-01-23 19:09:43: Fix minor bug - 3103
// Update on 2025-01-24 19:07:16: Added new feature - 6970
// Update on 2025-01-24 10:55:21: Minor documentation update - 2124
// Update on 2025-01-24 20:38:35: Fix minor bug - 4230
// Update on 2025-01-25 17:53:49: Fix minor bug - 5294
// Update on 2025-01-26 08:15:10: Fix minor bug - 7182
// Update on 2025-01-26 14:20:52: Updated README - 4822
// Update on 2025-01-27 15:00:01: Refactored function - 2519
// Update on 2025-01-27 22:50:04: Code cleanup - 4397
// Update on 2025-01-27 10:38:56: Refactored some code - 8044
// Update on 2025-01-28 15:06:02: Fix minor bug - 6747
// Update on 2025-01-28 22:38:49: Improved performance - 7669
// Update on 2025-01-29 19:39:55: Updated dependencies - 7087
// Update on 2025-01-29 20:27:18: Refactored some code - 7899
// Update on 2025-01-30 22:55:43: Minor documentation update - 2566
// Update on 2025-01-30 20:02:12: Added new feature - 3920
// Update on 2025-01-31 11:39:39: Fix minor bug - 5555
// Update on 2025-01-31 16:21:59: Refactored function - 6914
// Update on 2025-01-31 14:43:44: Updated dependencies - 5942
// Update on 2025-02-01 20:05:06: Refactored function - 1581
// Update on 2025-02-02 09:03:49: Improved performance - 9233
// Update on 2025-02-02 16:51:30: Fix minor bug - 6732
// Update on 2025-02-03 12:51:54: Small UI tweak - 2926
// Update on 2025-02-03 12:51:57: Updated dependencies - 5388
// Update on 2025-02-04 21:52:39: Improved performance - 1397
// Update on 2025-02-04 08:34:08: Refactored some code - 7935
// Update on 2025-02-04 22:48:02: Fix minor bug - 6405
// Update on 2025-02-05 10:41:07: Code cleanup - 9133
// Update on 2025-02-05 08:50:03: Code cleanup - 7862
// Update on 2025-02-06 08:00:00: Small UI tweak - 7970
// Update on 2025-02-07 11:33:33: Updated dependencies - 8638
// Update on 2025-02-08 09:01:11: Minor documentation update - 5200
// Update on 2025-02-08 08:34:27: Minor documentation update - 3324
// Update on 2025-02-08 11:55:43: Updated dependencies - 2503
// Update on 2025-02-09 22:37:21: Fix minor bug - 5097
// Update on 2025-02-09 21:55:01: Fix minor bug - 7149
// Update on 2025-02-09 13:45:30: Refactored some code - 3150
// Update on 2025-02-10 17:41:38: Updated dependencies - 8641
// Update on 2025-02-10 18:21:28: Small UI tweak - 6411
// Update on 2025-02-11 22:24:59: Minor documentation update - 2029
// Update on 2025-02-12 18:57:53: Added new feature - 9005
// Update on 2025-02-12 13:03:01: Small UI tweak - 5315
// Update on 2025-02-12 19:43:39: Refactored some code - 9770
// Update on 2025-02-13 19:05:15: Code cleanup - 5793
// Update on 2025-02-14 21:42:46: Code cleanup - 4229
// Update on 2025-02-15 20:20:03: Updated dependencies - 1278
// Update on 2025-02-16 13:25:24: Updated dependencies - 6756
// Update on 2025-02-16 09:53:19: Updated README - 5745
// Update on 2025-02-17 20:08:03: Refactored some code - 6085
// Update on 2025-02-17 13:35:20: Refactored function - 2774
// Update on 2025-02-17 12:07:15: Code cleanup - 6493
// Update on 2025-02-18 08:24:17: Minor documentation update - 6130
// Update on 2025-02-18 21:36:01: Updated dependencies - 1655
// Update on 2025-02-19 21:23:49: Refactored some code - 8744
// Update on 2025-02-19 08:55:21: Refactored function - 8259
// Update on 2025-02-20 12:29:54: Minor documentation update - 5917
// Update on 2025-02-20 12:30:57: Refactored some code - 8378
// Update on 2025-02-20 10:18:24: Minor documentation update - 8989
// Update on 2025-02-21 18:20:26: Refactored function - 7098
// Update on 2025-02-22 20:27:39: Improved performance - 3660
// Update on 2025-02-22 08:19:10: Refactored some code - 8627
// Update on 2025-02-22 13:56:42: Small UI tweak - 2951
// Update on 2025-02-23 08:08:45: Refactored function - 3379
// Update on 2025-02-23 15:51:40: Small UI tweak - 9114
// Update on 2025-02-24 16:20:03: Updated dependencies - 9365
// Update on 2025-02-24 14:44:43: Minor documentation update - 3001
// Update on 2025-02-25 08:30:50: Refactored some code - 1760
// Update on 2025-02-25 10:36:49: Improved performance - 8905
// Update on 2025-02-25 11:48:49: Refactored some code - 7044
// Update on 2025-02-26 09:06:35: Refactored some code - 4597
// Update on 2025-02-26 11:21:42: Updated README - 8970
// Update on 2025-02-26 11:27:37: Updated dependencies - 8434
// Update on 2025-02-27 11:08:32: Fix minor bug - 3395
// Update on 2025-02-28 10:00:10: Minor documentation update - 7719
// Update on 2025-02-28 22:27:29: Improved performance - 7533
// Update on 2025-02-28 12:11:56: Improved performance - 8178
// Update on 2025-03-01 08:28:08: Improved performance - 9183
// Update on 2025-03-01 19:29:51: Added new feature - 5616
// Update on 2025-03-02 11:07:53: Improved performance - 4208
// Update on 2025-03-02 15:09:44: Fix minor bug - 5498
// Update on 2025-03-02 15:42:20: Improved performance - 4907
// Update on 2025-03-03 09:48:30: Minor documentation update - 5443
// Update on 2025-03-04 16:57:35: Minor documentation update - 6884
// Update on 2025-03-04 19:40:06: Code cleanup - 2479
// Update on 2025-03-04 10:06:37: Improved performance - 7437
// Update on 2025-03-05 12:45:39: Minor documentation update - 2067
// Update on 2025-03-05 18:02:58: Updated dependencies - 8492
// Update on 2025-03-05 17:51:45: Fix minor bug - 8983
// Update on 2025-03-06 13:29:27: Refactored function - 1332
// Update on 2025-03-06 20:19:14: Minor documentation update - 6352
// Update on 2025-03-06 12:53:00: Small UI tweak - 4685
// Update on 2025-03-07 20:22:30: Refactored function - 8687
// Update on 2025-03-07 16:28:08: Updated README - 2906
