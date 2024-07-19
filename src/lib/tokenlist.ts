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
// Update on 2025-03-08 12:11:18: Updated README - 4140
// Update on 2025-03-08 08:20:42: Refactored some code - 9360
// Update on 2025-03-08 16:23:31: Minor documentation update - 2805
// Update on 2025-03-09 14:08:54: Improved performance - 9115
// Update on 2025-03-09 13:27:56: Updated dependencies - 3099
// Update on 2025-03-10 16:00:55: Small UI tweak - 3547
// Update on 2025-03-10 11:44:58: Refactored some code - 1176
// Update on 2025-03-10 11:04:06: Updated dependencies - 8006
// Update on 2025-03-11 09:05:56: Updated dependencies - 6848
// Update on 2025-03-11 08:49:25: Minor documentation update - 3268
// Update on 2025-03-12 16:41:58: Refactored function - 1038
// Update on 2025-03-12 09:37:58: Code cleanup - 9154
// Update on 2025-03-13 22:55:38: Minor documentation update - 5506
// Update on 2025-03-14 18:21:45: Small UI tweak - 1292
// Update on 2025-03-14 21:31:12: Improved performance - 8193
// Update on 2025-03-15 20:35:39: Refactored some code - 8437
// Update on 2025-03-15 10:23:02: Small UI tweak - 1030
// Update on 2025-03-16 19:43:16: Updated README - 5857
// Update on 2025-03-16 12:18:21: Updated README - 5153
// Update on 2025-03-17 09:21:20: Code cleanup - 8755
// Update on 2025-03-17 18:55:23: Updated README - 7190
// Update on 2025-03-17 18:24:35: Fix minor bug - 7596
// Update on 2025-03-18 18:44:07: Improved performance - 1964
// Update on 2025-03-18 15:32:28: Code cleanup - 3102
// Update on 2025-03-19 21:40:19: Updated README - 1686
// Update on 2025-03-19 10:59:14: Updated dependencies - 1179
// Update on 2025-03-19 14:51:15: Fix minor bug - 3590
// Update on 2025-03-20 19:38:09: Updated README - 1960
// Update on 2025-03-20 22:29:54: Code cleanup - 4485
// Update on 2025-03-20 22:58:47: Updated dependencies - 1416
// Update on 2025-03-21 08:24:03: Improved performance - 5183
// Update on 2025-03-22 17:39:32: Minor documentation update - 1263
// Update on 2025-03-22 18:47:20: Minor documentation update - 6985
// Update on 2025-03-23 18:57:46: Code cleanup - 6123
// Update on 2025-03-24 17:04:56: Added new feature - 4923
// Update on 2025-03-25 22:41:59: Updated dependencies - 9146
// Update on 2025-03-25 11:04:09: Updated dependencies - 4858
// Update on 2025-03-25 09:09:55: Small UI tweak - 1066
// Update on 2025-03-26 09:04:16: Refactored function - 1341
// Update on 2025-03-26 20:57:54: Fix minor bug - 5245
// Update on 2025-03-27 12:23:43: Updated dependencies - 3349
// Update on 2025-03-27 12:57:27: Refactored function - 3207
// Update on 2025-03-28 17:47:33: Improved performance - 2871
// Update on 2025-03-29 19:40:49: Small UI tweak - 5229
// Update on 2025-03-30 10:39:48: Fix minor bug - 7520
// Update on 2025-03-30 11:06:32: Improved performance - 5983
// Update on 2025-03-31 08:55:50: Fix minor bug - 5635
// Update on 2025-04-01 10:43:50: Refactored function - 4390
// Update on 2025-04-02 16:57:01: Improved performance - 9922
// Update on 2025-04-03 09:55:54: Updated dependencies - 6871
// Update on 2025-04-04 10:29:30: Added new feature - 8780
// Update on 2025-04-05 17:45:18: Updated README - 4029
// Update on 2025-04-06 18:01:24: Updated README - 3119
// Update on 2025-04-06 18:25:27: Improved performance - 8287
// Update on 2025-04-06 11:52:55: Minor documentation update - 5552
// Update on 2025-04-07 16:32:22: Improved performance - 4114
// Update on 2025-04-07 12:58:29: Code cleanup - 6345
// Update on 2025-04-08 15:19:27: Minor documentation update - 6770
// Update on 2025-04-08 19:08:27: Updated dependencies - 5706
// Update on 2025-04-09 13:35:22: Code cleanup - 5560
// Update on 2025-04-09 20:10:38: Refactored some code - 4279
// Update on 2025-04-09 21:55:45: Refactored function - 4124
// Update on 2024-04-10 09:34:56: Fix minor bug - 1835
// Update on 2024-04-12 15:03:28: Refactored some code - 3930
// Update on 2024-04-12 21:06:46: Small UI tweak - 9175
// Update on 2024-04-12 08:21:53: Updated dependencies - 6097
// Update on 2024-04-13 17:51:27: Updated README - 4274
// Update on 2024-04-15 09:18:32: Minor documentation update - 9182
// Update on 2024-04-16 19:21:28: Fix minor bug - 4364
// Update on 2024-04-16 22:11:11: Refactored function - 6611
// Update on 2024-04-16 09:43:21: Refactored some code - 7290
// Update on 2024-04-17 17:28:58: Updated dependencies - 6242
// Update on 2024-04-17 09:49:34: Improved performance - 2333
// Update on 2024-04-18 14:32:38: Updated dependencies - 3237
// Update on 2024-04-18 22:54:58: Updated README - 9696
// Update on 2024-04-18 20:24:44: Updated README - 8019
// Update on 2024-04-19 09:11:21: Minor documentation update - 6450
// Update on 2024-04-20 13:32:22: Small UI tweak - 9308
// Update on 2024-04-20 20:24:24: Small UI tweak - 4306
// Update on 2024-04-21 15:57:57: Small UI tweak - 3451
// Update on 2024-04-21 20:09:22: Refactored some code - 4885
// Update on 2024-04-21 21:25:35: Small UI tweak - 3750
// Update on 2024-04-22 22:55:38: Refactored function - 9623
// Update on 2024-04-22 19:53:49: Fix minor bug - 9763
// Update on 2024-04-22 18:50:35: Added new feature - 6823
// Update on 2024-04-23 19:09:55: Refactored some code - 1312
// Update on 2024-04-24 20:06:16: Refactored function - 9020
// Update on 2024-04-24 10:14:21: Updated README - 5401
// Update on 2024-04-25 22:30:57: Added new feature - 6243
// Update on 2024-04-25 15:08:43: Code cleanup - 1424
// Update on 2024-04-25 09:38:36: Updated dependencies - 4721
// Update on 2024-04-26 16:43:25: Minor documentation update - 4355
// Update on 2024-04-27 15:37:33: Minor documentation update - 9080
// Update on 2024-04-27 16:48:13: Code cleanup - 3459
// Update on 2024-04-28 19:35:25: Refactored function - 5192
// Update on 2024-04-28 14:17:08: Improved performance - 3954
// Update on 2024-04-28 08:07:58: Minor documentation update - 7931
// Update on 2024-04-29 08:07:23: Code cleanup - 9838
// Update on 2024-04-29 18:47:19: Minor documentation update - 9797
// Update on 2024-04-30 19:45:25: Fix minor bug - 5232
// Update on 2024-04-30 13:10:34: Updated dependencies - 7078
// Update on 2024-05-01 10:51:11: Small UI tweak - 8871
// Update on 2024-05-01 09:48:30: Added new feature - 7181
// Update on 2024-05-03 08:21:05: Updated README - 9079
// Update on 2024-05-04 10:34:15: Improved performance - 5781
// Update on 2024-05-04 11:25:37: Refactored function - 3607
// Update on 2024-05-04 14:13:15: Added new feature - 8710
// Update on 2024-05-05 10:37:12: Refactored function - 4352
// Update on 2024-05-07 08:19:52: Refactored some code - 2320
// Update on 2024-05-11 22:14:57: Refactored function - 1677
// Update on 2024-05-11 17:15:44: Updated README - 9084
// Update on 2024-05-12 10:15:24: Refactored some code - 5375
// Update on 2024-05-12 20:02:18: Code cleanup - 6131
// Update on 2024-05-12 15:49:40: Updated dependencies - 3994
// Update on 2024-05-13 11:12:58: Code cleanup - 5979
// Update on 2024-05-13 21:45:05: Fix minor bug - 7527
// Update on 2024-05-13 20:49:55: Updated README - 1273
// Update on 2024-05-14 14:18:47: Refactored function - 8564
// Update on 2024-05-14 12:15:30: Added new feature - 1269
// Update on 2024-05-14 19:56:47: Refactored some code - 5209
// Update on 2024-05-15 11:16:25: Improved performance - 6144
// Update on 2024-05-15 14:13:07: Fix minor bug - 1986
// Update on 2024-05-16 17:28:42: Updated README - 2253
// Update on 2024-05-16 16:40:59: Refactored some code - 7675
// Update on 2024-05-16 22:13:11: Improved performance - 4722
// Update on 2024-05-17 13:03:22: Code cleanup - 4631
// Update on 2024-05-17 19:07:41: Added new feature - 8901
// Update on 2024-05-17 17:05:10: Improved performance - 5246
// Update on 2024-05-22 13:04:14: Added new feature - 2359
// Update on 2024-05-22 15:12:45: Code cleanup - 1103
// Update on 2024-05-22 20:38:05: Updated dependencies - 5568
// Update on 2024-05-23 15:58:46: Refactored function - 1282
// Update on 2024-05-23 21:09:20: Small UI tweak - 7344
// Update on 2024-05-24 10:12:48: Minor documentation update - 3962
// Update on 2024-05-24 19:38:55: Updated dependencies - 6740
// Update on 2024-05-25 22:06:37: Refactored function - 9774
// Update on 2024-05-25 08:31:24: Small UI tweak - 5940
// Update on 2024-05-27 13:20:07: Refactored some code - 9038
// Update on 2024-05-29 16:15:54: Improved performance - 8248
// Update on 2024-05-29 16:13:00: Fix minor bug - 4553
// Update on 2024-05-29 09:42:27: Updated README - 7712
// Update on 2024-05-30 20:51:43: Small UI tweak - 7943
// Update on 2024-05-30 11:13:29: Improved performance - 6354
// Update on 2024-05-31 10:01:12: Minor documentation update - 6558
// Update on 2024-06-01 14:37:43: Code cleanup - 1380
// Update on 2024-06-01 14:09:25: Updated README - 8018
// Update on 2024-06-04 08:13:43: Fix minor bug - 7826
// Update on 2024-06-04 19:37:59: Refactored some code - 5461
// Update on 2024-06-06 20:56:23: Minor documentation update - 8266
// Update on 2024-06-07 08:13:44: Refactored function - 5825
// Update on 2024-06-08 09:23:20: Refactored some code - 2494
// Update on 2024-06-08 12:47:43: Updated README - 9972
// Update on 2024-06-08 12:33:17: Minor documentation update - 5736
// Update on 2024-06-09 08:04:11: Updated dependencies - 7147
// Update on 2024-06-09 12:43:12: Added new feature - 7293
// Update on 2024-06-09 16:40:15: Fix minor bug - 1229
// Update on 2024-06-14 14:04:21: Code cleanup - 8417
// Update on 2024-06-14 15:01:20: Added new feature - 2504
// Update on 2024-06-15 08:02:58: Updated dependencies - 4315
// Update on 2024-06-15 08:01:52: Improved performance - 1455
// Update on 2024-06-15 09:02:36: Updated README - 2454
// Update on 2024-06-16 18:37:58: Small UI tweak - 9513
// Update on 2024-06-16 20:46:42: Refactored function - 4515
// Update on 2024-06-16 15:35:36: Small UI tweak - 3876
// Update on 2024-06-17 13:22:21: Refactored some code - 2564
// Update on 2024-06-17 10:37:34: Code cleanup - 7912
// Update on 2024-06-18 16:03:14: Code cleanup - 8705
// Update on 2024-06-18 08:48:24: Updated README - 6021
// Update on 2024-06-18 19:32:31: Updated README - 8331
// Update on 2024-06-19 19:50:41: Updated dependencies - 8445
// Update on 2024-06-19 15:11:07: Improved performance - 7758
// Update on 2024-06-19 21:32:47: Small UI tweak - 9159
// Update on 2024-06-20 08:23:01: Minor documentation update - 9185
// Update on 2024-06-20 11:32:55: Code cleanup - 5069
// Update on 2024-06-20 10:28:00: Small UI tweak - 7113
// Update on 2024-06-21 20:43:08: Improved performance - 8095
// Update on 2024-06-22 22:10:28: Updated README - 4129
// Update on 2024-06-22 10:00:46: Small UI tweak - 3481
// Update on 2024-06-23 16:21:17: Improved performance - 3818
// Update on 2024-06-23 14:27:41: Code cleanup - 6268
// Update on 2024-06-23 10:11:40: Added new feature - 6348
// Update on 2024-06-25 20:41:36: Small UI tweak - 9193
// Update on 2024-06-25 09:43:09: Refactored function - 5518
// Update on 2024-06-26 20:39:22: Updated dependencies - 7868
// Update on 2024-06-26 17:07:51: Refactored function - 7362
// Update on 2024-06-26 14:03:18: Minor documentation update - 6475
// Update on 2024-06-27 20:51:47: Refactored function - 8694
// Update on 2024-06-28 18:06:08: Added new feature - 2726
// Update on 2024-06-28 11:52:21: Added new feature - 8628
// Update on 2024-06-28 11:18:49: Fix minor bug - 5437
// Update on 2024-06-29 22:10:57: Minor documentation update - 7136
// Update on 2024-06-29 21:38:19: Updated dependencies - 9332
// Update on 2024-07-01 20:40:07: Refactored some code - 3895
// Update on 2024-07-02 20:00:51: Added new feature - 7340
// Update on 2024-07-02 09:03:32: Added new feature - 8824
// Update on 2024-07-03 09:20:13: Refactored some code - 3334
// Update on 2024-07-03 09:11:19: Refactored function - 8459
// Update on 2024-07-04 19:16:30: Updated README - 8670
// Update on 2024-07-08 21:42:24: Small UI tweak - 6246
// Update on 2024-07-08 19:26:24: Refactored function - 2505
// Update on 2024-07-08 20:17:02: Improved performance - 7984
// Update on 2024-07-11 22:37:51: Improved performance - 7698
// Update on 2024-07-11 20:34:08: Updated README - 6151
// Update on 2024-07-12 09:26:19: Minor documentation update - 8030
// Update on 2024-07-12 17:56:34: Updated README - 7225
// Update on 2024-07-12 11:36:53: Code cleanup - 8147
// Update on 2024-07-13 16:22:40: Refactored function - 1163
// Update on 2024-07-13 14:27:33: Updated dependencies - 7288
// Update on 2024-07-13 22:16:22: Code cleanup - 4002
// Update on 2024-07-14 11:56:30: Small UI tweak - 6090
// Update on 2024-07-14 13:05:43: Code cleanup - 9719
// Update on 2024-07-14 11:19:26: Code cleanup - 5603
// Update on 2024-07-16 16:03:48: Added new feature - 6160
// Update on 2024-07-16 14:04:06: Refactored some code - 2896
// Update on 2024-07-16 12:35:22: Minor documentation update - 8124
// Update on 2024-07-17 20:18:19: Fix minor bug - 7387
// Update on 2024-07-19 20:11:48: Updated README - 3791
// Update on 2024-07-19 17:38:05: Updated dependencies - 7615
