// Handles the /start command on Telegram Serverless.

import { api } from 'sdk';
import { t } from '../lib/translations.js';
import { MINI_APP_URL } from '../lib/config.js';

const START_COMMAND = /^\/start(?:@\w+)?(?:\s|$)/;

export default async function (message) {
  if (!START_COMMAND.test(message.text ?? '')) return;

  const languageCode = message.from?.language_code;

  await api.sendMessage({
    chat_id: message.chat.id,
    text: t(languageCode, 'welcome'),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: t(languageCode, 'openMiniApp'), web_app: { url: MINI_APP_URL } }]],
    },
  });
}
