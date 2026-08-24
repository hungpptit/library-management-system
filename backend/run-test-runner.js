const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===============================================================');
console.log(' LIBRARY MANAGEMENT SYSTEM - SENIOR BACKEND AUTOMATED TEST SUITE');
console.log('===============================================================');
console.log(`Execution Time: ${new Date().toISOString()}`);
console.log('Running Jest test runner with code coverage...\n');

const logFilePath = path.join(__dirname, 'test-results.log');
let rawOutput = '';
let exitCode = 0;

try {
  rawOutput = execSync('npx jest --coverage --verbose', {
    cwd: __dirname,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'test', CI: 'true' },
  });
} catch (error) {
  rawOutput = (error.stdout || '') + '\n' + (error.stderr || '') + '\n' + (error.message || '');
  exitCode = error.status || 1;
}

// Format structured report
const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const header = `================================================================================
BÁO CÁO LOG KẾT QUẢ KIỂM THỬ BACKEND (AUTOMATED TEST EXECUTION LOG)
Dự án: Hệ thống Quản lý Thư viện (Library Management System)
Thời gian thực thi: ${timestamp}
Môi trường: NodeJS ${process.version} | NestJS v10 | Jest v29 | TypeScript
================================================================================\n\n`;

const fullLog = header + rawOutput;
fs.writeFileSync(logFilePath, fullLog, 'utf8');

// Copy log to root as well for convenient access
const rootLogFilePath = path.join(__dirname, '..', 'test-results.log');
fs.writeFileSync(rootLogFilePath, fullLog, 'utf8');

console.log(rawOutput);
console.log('\n===============================================================');
console.log(`Test Execution Finished with Status Code: ${exitCode}`);
console.log(`Detailed test logs exported to:`);
console.log(`  - backend/test-results.log`);
console.log(`  - test-results.log`);
console.log('===============================================================');

process.exit(exitCode);
