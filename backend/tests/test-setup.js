import { emailService } from '../src/services/emailService.js';

globalThis.__testEmails = [];
emailService.sendEmail = async (message) => {
  globalThis.__testEmails.push(message);
  return { success: true, messageId: `test-message-${globalThis.__testEmails.length}` };
};
