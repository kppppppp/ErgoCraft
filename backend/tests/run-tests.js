import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['--import', './tests/test-setup.js', '--test', 'tests/**/*.test.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    MONGO_URI: '',
    MONGODB_URI: '',
    JWT_SECRET: 'test-only-secret-that-is-not-used-in-production',
    BREVO_API_KEY: 'test-only-no-network-key',
    BREVO_SENDER_EMAIL: 'test-sender@example.test',
    BREVO_SENDER_NAME: 'Ergocraft Test Mailer',
    ORDER_NOTIFICATION_EMAIL: 'test-owner@example.test',
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
    RAZORPAY_WEBHOOK_SECRET: '',
    CLOUDINARY_CLOUD_NAME: '',
    CLOUDINARY_API_KEY: '',
    CLOUDINARY_API_SECRET: '',
  },
  shell: false,
});

process.exit(result.status ?? 1);
