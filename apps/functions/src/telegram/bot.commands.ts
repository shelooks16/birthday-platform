import { BirthdayDocumentWithDate, splitBirthdays } from '@shared/birthday';
import { getTimestamp } from '@shared/firestore-utils';
import { ChannelType, TeleBotStartPayload } from '@shared/types';
import { birthdayRepo } from '../birthday/birthday.repository';
import { notificationChannelRepo } from '../notificationChannel/notificationChannel.repository';
import { profileRepo } from '../profile/profile.repository';

// https://github.com/telegraf/telegraf/issues/504#issuecomment-1270571923
const parseStartPayload = (payload: any) => {
  if (!payload) return null;

  try {
    const payloadStr = Buffer.from(payload, 'base64').toString();

    const parsed = JSON.parse(payloadStr) as Partial<TeleBotStartPayload>;

    if (!parsed.pairingCode) {
      return null;
    }

    const result: TeleBotStartPayload = {
      pairingCode: parsed.pairingCode
    };

    return result;
  } catch (err) {
    return null;
  }
};

export const connectUserProfile = async (
  chatId: number,
  channelDisplayName: string,
  startPayload?: string
) => {
  const payload = parseStartPayload(startPayload);

  if (!payload) return;

  let message = '';

  try {
    const profile = await profileRepo().findByBotPairingCode(
      payload.pairingCode
    );

    if (!profile) return;

    const existingChannel =
      await notificationChannelRepo().findChannelByProfileId(
        profile.id,
        ChannelType.telegram,
        chatId
      );

    if (existingChannel) {
      await notificationChannelRepo().updateOne({
        id: existingChannel.id,
        displayName: channelDisplayName
      });

      message = `${profile.displayName}, твой аккаунт уже подключен к этому боту. Данные были обновлены.`;
    } else {
      await notificationChannelRepo().setOne({
        profileId: profile.id,
        type: ChannelType.telegram,
        value: chatId,
        displayName: channelDisplayName,
        createdAt: getTimestamp()
      });

      message =
        `Привет, ${profile.displayName}!\n` +
        'Твой аккаунт теперь подключен к этому боту.\n' +
        'Бот будет отправлять тебе нотификации о днюхах. Помимо нотификаций, бот так же выполняет другие функции.';
    }
  } catch (err) {
    // todo handle
    message = err.message;
  }

  return message;
};

const buildMessageForSplit = (
  title: string,
  list: BirthdayDocumentWithDate[]
) => {
  let message = `-- ${title} --` + '\n';

  list.forEach((b) => {
    message += `${b.buddyName}` + '\n';
  });

  return message + '\n';
};

export const getBirthdayList = async (chatId: number) => {
  const channels = await notificationChannelRepo().findMany({
    where: [
      ['type', '==', ChannelType.telegram],
      ['value', '==', chatId]
    ]
  });

  const messages: string[] = [];

  for (const channel of channels) {
    const birthdays = await birthdayRepo().findMany({
      where: [['profileId', '==', channel.profileId]]
    });

    const { todayList, pastList, upcomingList } = splitBirthdays(birthdays);

    let message = '';

    if (todayList.length) {
      message += buildMessageForSplit('Today', todayList);
    }

    if (upcomingList.length) {
      message += buildMessageForSplit('Upcoming', upcomingList);
    }

    if (pastList.length) {
      message += buildMessageForSplit('Past', pastList);
    }

    messages.push(message);
  }

  return messages;
};
