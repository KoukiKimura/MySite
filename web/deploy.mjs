/**
 * deploy.mjs - ペンギンげーむず！ ConoHa Wing デプロイスクリプト
 *
 * 使い方:
 *   npm run deploy
 *   または: DEPLOY_PASSWORD=xxx node deploy.mjs
 *
 * パスワード入力: 環境変数 DEPLOY_PASSWORD が未設定の場合は対話入力を求めます。
 */
import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- 接続設定 ----
const SFTP_HOST = 'REDACTED_HOST';
const SFTP_USER = 'root';
const SFTP_PORT = 22;
const REMOTE_DIR = 'REDACTED_DIR';
const LOCAL_DIST = path.join(__dirname, 'dist');

async function readPassword() {
  if (process.env.DEPLOY_PASSWORD) {
    return process.env.DEPLOY_PASSWORD;
  }
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // パスワードをエコーしないように出力を一時的に抑制
  const originalWrite = process.stdout.write.bind(process.stdout);
  return new Promise((resolve) => {
    rl.question(`SFTP password for ${SFTP_USER}@${SFTP_HOST}: `, (answer) => {
      process.stdout.write('\n');
      rl.close();
      resolve(answer);
    });
    // 入力をエコーしない
    rl.stdoutMuted = true;
    rl._writeToOutput = (str) => {
      if (!rl.stdoutMuted) originalWrite(str);
    };
  });
}

async function deploy() {
  console.log('=== ペンギンげーむず！ デプロイ ===');
  console.log(`ローカル: ${LOCAL_DIST}`);
  console.log(`リモート: ${SFTP_USER}@${SFTP_HOST}:${REMOTE_DIR}`);
  console.log('');

  const password = await readPassword();

  const sftp = new SftpClient();

  try {
    console.log('接続中...');
    await sftp.connect({
      host: SFTP_HOST,
      username: SFTP_USER,
      password,
      port: SFTP_PORT,
      readyTimeout: 10000,
    });
    console.log('✓ 接続成功');

    console.log('アップロード中（時間がかかる場合があります）...');
    await sftp.uploadDir(LOCAL_DIST, REMOTE_DIR);
    console.log('✓ アップロード完了');

    console.log('');
    console.log('=== デプロイ完了 ===');
    console.log(`サイト: https://pengin24.com`);
  } catch (err) {
    console.error('✗ デプロイ失敗:', err.message);
    process.exitCode = 1;
  } finally {
    await sftp.end();
  }
}

deploy();
