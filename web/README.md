# ペンギンげーむず！ — web

ブラウザで遊べるミニゲームポータルサイトのフロントエンドです。  
本番サイト: **https://pengin24.com**

---

## 技術スタック

| 項目 | 採用技術 |
|---|---|
| ビルドツール | Vite 8 |
| テスト | Vitest 4 |
| デプロイ | basic-ftp（ConoHa Wing / FTP） |
| ルーティング | ハッシュベース SPA（自作） |
| グラフィクス | HTML5 Canvas 2D API |
| スタイル | Vanilla CSS（CSS Custom Properties） |

---

## ディレクトリ構成

```
web/
├── index.html                  # エントリポイント HTML（OGP・CSP・favicon 設定）
├── vite.config.js              # Vite 設定（envDir: ../env, outDir: dist）
├── deploy.mjs                  # FTP デプロイスクリプト
├── package.json
│
├── public/                     # 静的ファイル（ビルド時にそのまま dist/ へコピー）
│   ├── logo.png                # サイトロゴ
│   ├── favicon.png             # ファビコン
│   ├── og-image.png            # OGP 画像（SNS シェア用）
│   ├── .htaccess               # Apache 設定（HTTPS リダイレクト・キャッシュ・セキュリティヘッダー）
│   ├── data/                   # ゲーム出題データ（JSON）
│   │   ├── ja-romaji-easy.json
│   │   ├── ja-romaji-normal.json
│   │   ├── ja-romaji-hard.json
│   │   ├── en-word-easy.json
│   │   ├── en-word-normal.json
│   │   └── en-word-hard.json
│   └── assets/img/             # 画像素材
│       ├── hero-bg.png         # トップページ ヒーロー背景
│       ├── game-bg-menu.png    # ゲームメニュー背景
│       ├── game-bg-typing.png  # ゲームプレイ背景（Canvas）
│       └── games/
│           ├── typing-thumb.png    # タイピングゲーム サムネイル
│           └── coming-soon.png     # 未公開ゲーム プレースホルダー
│
└── src/                        # アプリケーションソース
    ├── main.js                 # アプリ起動・DOM 組み立て
    │
    ├── shared/                 # 全画面共通の基盤
    │   ├── router/
    │   │   └── router.js       # ハッシュルーター（SPA ナビゲーション）
    │   ├── events.js           # カスタムイベントバス（emitEvent / onEvent）
    │   ├── components/         # 共通 UI パーツ
    │   │   ├── header.js       # スティッキーヘッダー（ナビ・認証表示）
    │   │   ├── footer.js       # フッター
    │   │   ├── page-container.js # ページ描画コンテナ
    │   │   ├── loading.js      # ローディングスピナー
    │   │   └── game-card.js    # ゲームカード（サムネ・タイトル・タグ）
    │   └── styles/
    │       ├── variables.css   # デザイントークン（色・フォント・スペーシング）
    │       └── main.css        # グローバルスタイル・全コンポーネント CSS
    │
    ├── portal/                 # ポータル（サイト共通ページ群）
    │   ├── data/
    │   │   └── games.json      # ゲーム一覧データ（タイトル・サムネ・パス・ステータス）
    │   └── pages/
    │       ├── home.js         # トップページ（ヒーロー + ゲーム一覧）
    │       ├── about.js        # About ページ
    │       ├── contact.js      # お問い合わせ（Google Forms 埋め込み）
    │       └── not-found.js    # 404 ページ
    │
    ├── user/                   # ユーザー機能（モック実装）
    │   ├── pages/
    │   │   ├── login.js        # ログイン画面（sessionStorage ベース）
    │   │   └── ranking.js      # ランキング表示
    │   └── repository/
    │       ├── mock-auth-repository.js     # 認証モック
    │       └── mock-ranking-repository.js  # ランキングデータモック
    │
    └── games/
        └── typing/             # タイピングゲーム（クリーンアーキテクチャ）
            ├── index.js        # DI 構成ルート・画面遷移管理
            ├── pages/
            │   ├── description.js  # ゲーム紹介ページ（遊び方・プレイボタン）
            │   └── play.js         # ゲームマウントページ（index.js を呼ぶ）
            ├── domain/         # ドメイン層（純粋なビジネスロジック）
            ├── application/    # アプリケーション層（ユースケース）
            ├── infrastructure/ # インフラ層（データ取得）
            └── presentation/   # プレゼンテーション層（Canvas 描画・UI）
```

---

## タイピングゲーム — クリーンアーキテクチャ詳細

タイピングゲームは **4層のクリーンアーキテクチャ** で実装されています。  
依存方向は常に外→内（Presentation → Application → Domain）で、  
Infrastructure は Application から DI で注入されます。

```
Infrastructure  ──────→  Application  ──────→  Domain
（JSON 取得）            （ユースケース）        （状態・ルール）
                              ↑
                        Presentation
                        （Canvas 描画・入力）
```

### domain/ — ドメイン層

ゲームの核心ルール。外部依存ゼロ。

| ファイル | 役割 |
|---|---|
| `entities/game-session.js` | ゲームセッション状態機械（READY → PLAYING → PAUSED → FINISHED）。正解数・ミス数・コンボ・タイマーを管理 |
| `entities/question.js` | 問題エンティティ（display + reading のイミュータブルオブジェクト） |
| `services/romaji-converter.js` | ひらがな → ローマ字変換。複数入力パターン（sha/sya, tsu/tu など）を生成 |
| `services/score-calculator.js` | WPM・正確率・ランク（S/A/B/C/D）・最終スコアの計算 |
| `values/difficulty.js` | 難易度定義（初級・中級・上級）と時間ボーナス倍率 |
| `values/game-config.js` | ゲーム設定（モード×難易度の時間/問題数テーブル） |
| `values/game-mode.js` | ゲームモード定数（time-limit / fixed-count） |
| `values/question-mode.js` | 出題モード定数（ja-romaji / en-word） |
| `values/romaji-input.js` | 1かなチャンクの入力状態値オブジェクト。`advanceRomajiInput()` で1文字ずつ照合 |
| `values/score.js` | スコア値オブジェクト |

### application/ — アプリケーション層

ユースケース（操作シナリオ）とリポジトリインターフェース。

| ファイル | 役割 |
|---|---|
| `repositories/question-repository.js` | リポジトリインターフェース定義（JSDoc のみ） |
| `services/question-provider.js` | 出題リスト生成。Fisher-Yates シャッフル → 難易度分の問題を選択 |
| `use-cases/start-game.js` | UC-1: ゲーム開始。設定検証 → 出題取得 → セッション生成 |
| `use-cases/process-input.js` | UC-2: キー入力処理。照合 → 正解/ミス記録 → 問題進行 → ゲーム終了判定 |
| `use-cases/finish-game.js` | UC-3: ゲーム終了。FINISHED 状態遷移 → 最終結果計算 |
| `use-cases/retry-game.js` | UC-4: 同設定でリトライ |
| `use-cases/return-to-menu.js` | UC-5: メニューへ戻る |

### infrastructure/ — インフラ層

データ取得の具体実装。Application のインターフェースを実装。

| ファイル | 役割 |
|---|---|
| `repositories/json-question-repository.js` | `/data/{mode}-{difficulty}.json` を fetch で取得。Map によるキャッシュ付き |
| `data/*.json` | 開発時の参照用データ（本番は `public/data/` を使用） |

> **注**: 本番ビルドで参照するデータは `public/data/*.json`（絶対パス `/data/` でアクセス）。

### presentation/ — プレゼンテーション層

Canvas 2D による描画と DOM オーバーレイ。

| ファイル | 役割 |
|---|---|
| `canvas/typing-canvas.js` | Canvas 初期化・論理解像度 800×600 → DPR スケーリング・リサイズ対応 |
| `canvas/text-renderer.js` | テキスト・背景・プログレスバー・スコア・タイマー等の Canvas 描画関数集 |
| `canvas/effect-renderer.js` | 正解フラッシュ・ミスフラッシュ+画面シェイク・コンボパルス・ランクイン演出 |
| `keyboard-handler.js` | キーボード入力ハンドラ（a〜z / `-` のみ受理、IME対策済み） |
| `screens/menu-screen.js` | G-1 メニュー画面（DOM）: モード・難易度選択 |
| `screens/countdown-screen.js` | G-2 カウントダウン（Canvas）: 3→2→1→Start! アニメーション |
| `screens/play-screen.js` | G-3 プレイ画面（Canvas）: メインゲームループ・入力処理連携 |
| `screens/pause-screen.js` | G-4 一時停止（Canvas オーバーレイ）: 続ける/リトライ/メニューボタン |
| `screens/result-screen.js` | G-5 リザルト画面（DOM）: スコア・ランク・統計表示 |
| `typing-game.css` | ゲーム UI スタイル（メニュー・リザルト・コンテナ） |

### index.js — DI 構成ルートと画面遷移

```
createTypingGame(container)
  ├── JsonQuestionRepository      ← infrastructure
  ├── QuestionProvider            ← application
  ├── TypingCanvas / TextRenderer / EffectRenderer / KeyboardHandler ← presentation
  └── showScreen(name) で画面を切り替える
       menu → countdown → play ↔ pause → result
                                   ↓
                               (retry) → countdown
```

---

## ルーティング

`src/shared/router/router.js` がハッシュ URL を解析し、対応するページモジュールを動的インポートします。

| URL ハッシュ | ページモジュール |
|---|---|
| `#/` | `portal/pages/home.js` |
| `#/games/typing` | `games/typing/pages/description.js` |
| `#/games/typing/play` | `games/typing/pages/play.js` |
| `#/ranking` | `user/pages/ranking.js` |
| `#/login` | `user/pages/login.js` |
| `#/about` | `portal/pages/about.js` |
| `#/contact` | `portal/pages/contact.js` |
| (その他) | `portal/pages/not-found.js` |

ゲームプレイページ（`/play`）は自動的にフルスクリーン表示モードへ切り替わります。  
ページを離れる際は `destroy()` が呼ばれ、Canvas ループ・イベントリスナーが解放されます。

---

## 環境変数

環境変数ファイルは `../env/` に配置します（リポジトリルートの `env/` フォルダ）。

| ファイル | 用途 | git 管理 |
|---|---|---|
| `env/.env` | 開発環境共通 | ✅ 管理する |
| `env/.env.production` | 本番ビルド用（`VITE_SITE_URL` 等） | ✅ 管理する |
| `env/.env.deploy` | **FTP 認証情報**（絶対にコミットしない） | ❌ `.gitignore` 除外済み |
| `env/.env.deploy.example` | `.env.deploy` のテンプレート | ✅ 管理する |

### `.env.deploy` の設定項目

```
DEPLOY_FTP_HOST=<FTP ホスト>
DEPLOY_FTP_USER=<FTP ユーザー>
DEPLOY_FTP_PASSWORD=<FTP パスワード>
DEPLOY_FTP_PORT=21
DEPLOY_REMOTE_DIR=<リモートディレクトリ>
DEPLOY_SITE_URL=https://pengin24.com
```

---

## セットアップ

### 前提条件

- Node.js 18 以上
- npm 9 以上

### インストール

```bash
cd web
npm install
```

---

## 開発

```bash
# 開発サーバー起動（http://localhost:3000 で自動オープン）
npm run dev
```

ホットリロード対応。ルーター・Canvas 描画・スタイル変更が即時反映されます。

---

## テスト

```bash
# テスト実行（97 テスト、watch モードなし）
npm test

# カバレッジレポート生成（coverage/ に出力）
npm run coverage
```

### テスト対象

| 層 | テストファイル数 | 概要 |
|---|---|---|
| domain | 10 | エンティティ・サービス・値オブジェクトの単体テスト |
| application | 4 | ユースケースの統合テスト（リポジトリはモック） |
| infrastructure | 1 | JSON 取得・キャッシュ動作の単体テスト |

プレゼンテーション層（Canvas/DOM）はテスト対象外です。

---

## ビルド

```bash
# 本番ビルド（dist/ に出力）
npm run build

# ビルド結果のプレビュー
npm run preview
```

### ビルド出力（dist/）

```
dist/
├── index.html          # エントリ HTML
├── .htaccess           # Apache 設定（public/ からコピー）
├── assets/             # Vite がバンドルした JS・CSS（コンテンツハッシュ付き）
│   ├── index-[hash].js
│   └── index-[hash].css
├── data/               # 出題 JSON ファイル（public/data/ からコピー）
└── assets/img/         # 画像素材（public/assets/ からコピー）
```

> **ポイント**: 出題 JSON (`public/data/*.json`) は Vite のバンドル対象外です。  
> `json-question-repository.js` が `/data/{mode}-{difficulty}.json` の絶対パスで fetch するため、  
> `public/` 配下に置くことで `dist/data/` へ自動コピーされます。

---

## デプロイ

### 前提

- `env/.env.deploy` にFTP認証情報が設定済みであること（テンプレート: `env/.env.deploy.example`）
- ConoHa Wing の FTP ポート 21 が開放されていること（SSH/SFTP ポート 22 は利用不可）

### デプロイ手順

```bash
# 1. ビルド + FTP アップロードを一括実行
npm run deploy
```

内部では以下が実行されます：

```
vite build  →  node deploy.mjs
```

`deploy.mjs` の動作：

1. `env/.env.deploy` を読み込み（環境変数として展開）
2. 必須変数の存在チェック（未設定の場合はエラー終了）
3. FTP 接続（`basic-ftp`、plain FTP / ポート 21）
4. `dist/` ディレクトリをリモートの `DEPLOY_REMOTE_DIR` に再帰アップロード
5. 接続クローズ

> **セキュリティ注意**: ConoHa Wing 共有ホスティングは SSH/SFTP ポート 22 が閉じられているため、  
> plain FTP（ポート 21）を使用しています。パスワードが平文送信されるため、  
> **デプロイは必ずローカル環境（信頼できるネットワーク）から実行してください**。

### 手動デプロイ時の注意

```bash
# ビルドのみ実行したい場合
npm run build

# デプロイのみ実行したい場合（ビルド済みの dist/ がある前提）
node deploy.mjs
```

---

## ファイル間のつながり（起動フロー）

```
index.html
  └─ src/main.js               # DOMContentLoaded で起動
       ├─ Header.create()       # ヘッダー生成
       ├─ PageContainer.create() # コンテンツ領域生成
       ├─ Footer.create()       # フッター生成
       └─ Router.init()         # ルーター起動
            └─ hashchange イベントを監視
                 └─ 対応ページモジュールを動的 import
                      例: games/typing/pages/play.js
                           └─ createTypingGame(container)  ← index.js
                                ├─ JsonQuestionRepository  ← infrastructure
                                ├─ QuestionProvider        ← application
                                ├─ TypingCanvas            ← presentation/canvas
                                ├─ TextRenderer(ctx, bgImage)
                                ├─ EffectRenderer(ctx)
                                ├─ KeyboardHandler
                                └─ showScreen('menu')      # 初期画面表示
```

---

## ゲーム画面遷移フロー

```
[G-1 メニュー]
  モード・難易度を選択して「ゲーム開始」
      ↓ startGame() → セッション生成
[G-2 カウントダウン]
  3 → 2 → 1 → Start!（各 1 秒）
      ↓ startSession() → PLAYING 状態へ
[G-3 プレイ]
  キーボード入力 → processInput() → 正解/ミス判定
  ├─ ESC キー → 一時停止
  │    ↓ pauseSession()
  │  [G-4 ポーズ]
  │    ├─ 続ける → resumeSession() → G-3 へ戻る
  │    ├─ リトライ → G-2 へ
  │    └─ メニュー → G-1 へ
  └─ ゲーム終了（時間切れ or 全問正解）
       ↓ finishGame() → 最終結果計算
[G-5 リザルト]
  スコア・WPM・正確率・ランク（S/A/B/C/D）を表示
  ├─ リトライ → G-2 へ
  └─ メニューへ → G-1 へ
```

---

## CSS 設計

- `shared/styles/variables.css` — デザイントークン（CSS Custom Properties）
  - カラー・タイポグラフィ・スペーシング・シャドウ・トランジション等
- `shared/styles/main.css` — グローバルリセット + 全画面共通スタイル
- `games/typing/presentation/typing-game.css` — ゲーム専用スタイル

スタイルシートは `main.js` でまとめて import され、Vite が 1 つの CSS バンドルとして出力します。

---

## ライセンス

Private — 無断転載・無断使用を禁じます。
