/**
 * deploy.mjs - ペンギンげーむず！ ConoHa Wing デプロイスクリプト
 *
 * 使い方:
 *   npm run deploy
 *   または: DEPLOY_PASSWORD=xxx node deploy.mjs
 *
 * パスワード入力: 環境変数 DEPLOY_PASSWORD が未設定の場合は対話入力を求めます。
 */
import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- 接続設定 ----
const FTP_HOST = 'REDACTED_HOST';
const FTP_USER = 'REDACTED_USER';
const FTP_PORT = 21;
const REMOTE_DIR = 'REDACTED_DIR';
const LOCAL_DIST = path.join(__dirname, 'dist');

async function readPassword() {
  if (process.env.DEPLOY_PASSWORD) {
    return process.env.DEPLOY_PASSWORD;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`FTP password for ${FTP_USER}@${FTP_HOST}: `, (answer) => {
      process.stdout.write('\n');
      rl.close();
      resolve(answer);
    });
    rl.stdoutMuted = true;
    rl._writeToOutput = (str) => { if (!rl.stdoutMuted) process.stdout.write(str); };
  });
}

async function deploy() {
  console.log('=== ペンギンげーむず！ デプロイ ===');
  console.log(`ローカル: ${LOCAL_DIST}`);
  console.log(`リモート: ${FTP_USER}@${FTP_HOST}:${REMOTE_DIR}`);
  console.log('');

  const password = await readPassword();
  const client = new ftp.Client(10000);
  client.ftp.verbose = false;

  try {
    console.log('接続中...');
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password,
      port: FTP_PORT,
      secure: false,
    });
    console.log('✓ 接続成功');

    console.log('アップロード中（時間がかかる場合があります）...');
    await client.uploadFromDir(LOCAL_DIST, REMOTE_DIR);
    console.log('✓ アップロード完了');

    console.log('');
    console.log('=== デプロイ完了 ===');
    console.log('サイト: https://pengin24.com');
  } catch (err) {
    console.error('✗ デプロイ失敗:', err.message);
    // 接続情報のヒントを表示
    if (err.message.includes('530') || err.message.includes('Login')) {
      console.error('→ FTP ユーザー名またはパスワードが正しくない可能性があります。');
      console.error('  ConoHa Wing コントロールパネル → ファイルマネージャー → FTP で確認してください。');
    }
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

deploy();

