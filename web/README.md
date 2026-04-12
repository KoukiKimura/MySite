# GameSite Web

Vite で構成されたフロントエンドです。
ポータルサイトと各ゲームを `src` 配下のコンテキストごとに分けて実装しています。

## 開発コマンド

```bash
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
npm install
npm run dev
npm run build
npm run preview
npm test
```

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | Vite 開発サーバーを起動します。既定ポートは `3000` です。 |
| `npm run build` | 本番用ファイルを `dist/` に出力します。 |
| `npm run preview` | `dist/` の内容をローカルで確認します。 |
| `npm test` | Vitest のテストを実行します。 |
| `npm run coverage` | カバレッジ付きでテストを実行します。 |
| `npm run deploy` | ビルド後、FTP で `dist/` をアップロードします。 |

## プロジェクト構造

```text
web/
|-- public/                 # 静的ファイル。ビルド時に配信ルートへコピーされます
|   |-- .htaccess           # ConoHa Wing / Apache 向け設定
|   |-- assets/             # サムネイルなどの静的アセット
|   `-- data/               # 配信用 JSON データ
|-- src/
|   |-- main.js             # アプリケーションのエントリーポイント
|   |-- portal/             # サイト領域
|   |-- games/              # 各ゲーム領域
|   |-- shared/             # 共通 UI・ルーター・スタイル
|   `-- user/               # ユーザー関連ページとモックリポジトリ
|-- deploy.mjs              # FTP デプロイスクリプト
|-- index.html              # Vite の HTML エントリー
|-- package.json            # npm scripts と依存関係
|-- vite.config.js          # Vite 設定
`-- vitest.config.js        # Vitest 設定
```

## サイト領域

サイト共通のページ・ゲーム一覧・ナビゲーション周りは `src/portal` と `src/shared` に配置しています。

| パス | 役割 |
| --- | --- |
| `src/portal/pages/home.js` | トップページ。ゲーム一覧の入口です。 |
| `src/portal/pages/about.js` | サイト説明ページです。 |
| `src/portal/pages/contact.js` | 問い合わせページです。 |
| `src/portal/pages/not-found.js` | 未定義ルート用のページです。 |
| `src/portal/data/games.json` | ポータルに表示するゲーム情報です。 |
| `src/shared/router/router.js` | Hash ルーティングを管理します。 |
| `src/shared/components/` | ヘッダー、フッター、カードなどの共通 UI です。 |
| `src/shared/styles/` | サイト全体の共通 CSS です。 |

主なルートは次の通りです。

| ルート | 表示内容 |
| --- | --- |
| `#/` | トップページ |
| `#/about` | サイト説明 |
| `#/contact` | 問い合わせ |
| `#/ranking` | ランキング |
| `#/login` | ログイン |
| `#/games/typing` | タイピングゲーム説明 |
| `#/games/typing/play` | タイピングゲーム本編 |
| `#/games/breakout` | ブロック崩し説明 |
| `#/games/breakout/play` | ブロック崩し本編 |

## 各ゲーム領域

ゲームは `src/games/<game-id>/` 配下に分けています。
各ゲームは DDD を意識して、ドメイン・アプリケーション・インフラ・プレゼンテーションを分離しています。

```text
src/games/
|-- typing/                 # タイピングゲーム
`-- breakout/               # ブロック崩し
```

### 共通レイヤー

| パス | 役割 |
| --- | --- |
| `domain/` | エンティティ、値オブジェクト、ドメインサービスなどのゲームルールを配置します。 |
| `application/` | ユースケース、アプリケーションサービス、リポジトリインターフェースを配置します。 |
| `infrastructure/` | JSON や静的データ、リポジトリ実装を配置します。 |
| `presentation/` | Canvas 描画、入力制御、画面 UI、ゲーム固有 CSS を配置します。 |
| `pages/` | ルーターから読み込まれる説明ページ・プレイページを配置します。 |
| `__tests__/` | 各レイヤーのテストを配置します。 |

### タイピングゲーム

`src/games/typing` に実装しています。
ローマ字入力、難易度、出題モード、スコア計算、Canvas 表示、キーボード入力を扱います。

主なデータは次の場所にあります。

```text
src/games/typing/infrastructure/data/
public/data/
```

### ブロック崩し

`src/games/breakout` に実装しています。
ステージ状態、スコア計算、Canvas 描画、ポインター入力、メニュー・ポーズ・リザルト画面を扱います。

主なステージデータは次の場所にあります。

```text
src/games/breakout/infrastructure/data/stages.js
```

## デプロイ方法

デプロイは `deploy.mjs` で行います。
`npm run deploy` を実行すると、先に `vite build` で `dist/` を生成し、その後 FTP でリモートディレクトリへアップロードします。

### 1. デプロイ設定を用意する

リポジトリルートの `env/.env.deploy.example` をコピーして、`env/.env.deploy` を作成します。

PowerShell の場合:

```powershell
Copy-Item ..\env\.env.deploy.example ..\env\.env.deploy
```

Bash などの場合:

```bash
cp ../env/.env.deploy.example ../env/.env.deploy
```

`env/.env.deploy` に次の値を設定します。

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `DEPLOY_FTP_HOST` | 必須 | FTP ホスト名です。 |
| `DEPLOY_FTP_USER` | 必須 | FTP ユーザー名です。 |
| `DEPLOY_FTP_PASSWORD` | 必須 | FTP パスワードです。 |
| `DEPLOY_REMOTE_DIR` | 必須 | アップロード先のリモートディレクトリです。 |
| `DEPLOY_FTP_PORT` | 任意 | FTP ポートです。未指定時は `21` です。 |
| `DEPLOY_SITE_URL` | 任意 | デプロイ完了時に表示するサイト URL です。 |

### 2. ビルドを確認する

```bash
npm run build
npm run preview
```

`dist/` に本番用ファイルが出力されます。

### 3. デプロイする

```bash
npm run deploy
```

実行内容は次の通りです。

```text
vite build
node deploy.mjs
```

アップロード元は `web/dist/`、アップロード先は `DEPLOY_REMOTE_DIR` です。
接続情報が不足している場合、`deploy.mjs` は不足している環境変数を表示して終了します。

## 関連ドキュメント

詳細な要件・設計はリポジトリルートの `docs/` を参照してください。

| ドキュメント | パス |
| --- | --- |
| 要件定義 | `../docs/要件定義書.md` |
| サイト基本設計 | `../docs/サイト基本設計書.md` |
| サイト詳細設計 | `../docs/サイト詳細設計書.md` |
| タイピングゲーム基本設計 | `../docs/ゲーム基本設計書_タイピング.md` |
| タイピングゲーム詳細設計 | `../docs/ゲーム詳細設計書_タイピング.md` |
| ブロック崩し基本設計 | `../docs/ゲーム基本設計書_ブロック崩し.md` |
| ブロック崩し詳細設計 | `../docs/ゲーム詳細設計書_ブロック崩し.md` |
