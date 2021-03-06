import { MessageType, WAMessage } from '@adiwajshing/baileys';
import * as fs from 'fs';
import * as imageminWebp from 'imagemin';
import * as imagemin from 'imagemin-webp';
import { addCommand } from '../core/events';
import { errorMessage, infoMessage } from '../core/helpers';
import { getString } from '../core/language';

const Lang = getString('sticker');

addCommand(
  { pattern: 'sticker', fromMe: false, desc: Lang['STICKER_DESC'] },
  async (message) => {
    if (!message.reply_message) {
      return await message.sendTextMessage(errorMessage(Lang['NEED_REPLY']));
    }

    if (message.reply_message.video) {
      return await message.sendTextMessage(errorMessage(Lang['ONLY_IMAGE']));
    }

    const downloading = await message.sendTextMessage(
      infoMessage(Lang['DOWNLOADING']),
    );
    var location = await message.client.downloadAndSaveMediaMessage(
      {
        key: {
          remoteJid: message.reply_message.jid,
          id: message.reply_message.id,
        },
        message: message.reply_message.data.quotedMessage,
      } as WAMessage,
      'output',
    );

    if (message.reply_message.image) {
      await imagemin(location, {
        destination: './output.webp',
        plugins: [imageminWebp({ quality: 80 })],
      });

      await message.sendMessage(
        message.jid,
        fs.readFileSync('./output.webp'),
        MessageType.sticker,
      );

      return await message.client.deleteMessage(message.jid, {
        id: downloading?.key.id,
        remoteJid: downloading?.key.remoteJid,
        fromMe: true,
      });
    }
  },
);
