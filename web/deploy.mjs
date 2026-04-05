/**
 * deploy.mjs - ペンギンげーむず！ ConoHa Wing デプロイスクリプト
 *
 * 使い方:
 *   npm run deploy
 *
 * 接続情報: env/.env.deploy に記載してください。
 * テンプレート: env/.env.deploy.example を参照
 */
import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- env/.env.deploy を読み込んで process.env にマージ ----
function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // ファイルが存在しない場合は無視
  }
}

loadEnvFile(path.join(__dirname, '../env/.env.deploy'));

// ---- 接続設定（すべて環境変数から取得）----
const FTP_HOST     = process.env.DEPLOY_FTP_HOST;
const FTP_USER     = process.env.DEPLOY_FTP_USER;
const FTP_PASSWORD = process.env.DEPLOY_FTP_PASSWORD;
const FTP_PORT     = parseInt(process.env.DEPLOY_FTP_PORT ?? '21', 10);
const REMOTE_DIR   = process.env.DEPLOY_REMOTE_DIR;
const SITE_URL     = process.env.DEPLOY_SITE_URL;
const LOCAL_DIST   = path.join(__dirname, 'dist');

function validateConfig() {
  const required = {
    DEPLOY_FTP_HOST:     FTP_HOST,
    DEPLOY_FTP_USER:     FTP_USER,
    DEPLOY_FTP_PASSWORD: FTP_PASSWORD,
    DEPLOY_REMOTE_DIR:   REMOTE_DIR,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error('✗ 以下の環境変数が未設定です:');
    for (const k of missing) console.error(`  ${k}`);
    console.error('→ env/.env.deploy に記載してください。テンプレート: env/.env.deploy.example');
    process.exit(1);
  }
}

async function deploy() {
  validateConfig();

  console.log('=== ペンギンげーむず！ デプロイ ===');
  console.log(`ローカル: ${LOCAL_DIST}`);
  console.log(`リモート: ${FTP_USER}@${FTP_HOST}:${REMOTE_DIR}`);
  console.log('');

  const client = new ftp.Client(10000);
  client.ftp.verbose = false;

  try {
    console.log('接続中...');
    // NOTE: ConoHa Wing 共有ホスティングはポート22(SFTP)が閉じられているため
    //       plain FTP(ポート21)を使用。本番デプロイはローカル環境からのみ実行すること。
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: FTP_PORT,
      secure: false,
    });
    console.log('✓ 接続成功');

    console.log('アップロード中（時間がかかる場合があります）...');
    await client.uploadFromDir(LOCAL_DIST, REMOTE_DIR);
    console.log('✓ アップロード完了');

    console.log('');
    console.log('=== デプロイ完了 ===');
    console.log(`サイト: ${SITE_URL ?? `https://${FTP_HOST}`}`);
  } catch (err) {
    console.error('✗ デプロイ失敗:', err.message);
    if (err.message.includes('530') || err.message.toLowerCase().includes('login')) {
      console.error('→ FTP ユーザー名またはパスワードが正しくない可能性があります。');
    }
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

deploy();
