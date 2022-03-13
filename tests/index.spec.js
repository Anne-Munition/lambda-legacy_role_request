const index = require('../src/index');
const nock = require('nock');

let event = {
  body: {},
};

process.env.WEBHOOK_URL =
  'https://discord.com/api/webhooks/000000000000000000/001';
process.env.DEV_WEBHOOK_URL =
  'https://discord.com/api/webhooks/000000000000000000/002';

describe('legacy role request', () => {
  beforeEach(() => {
    process.env.WEBHOOK_URL =
      'https://discord.com/api/webhooks/000000000000000000/001';
    process.env.DEV_WEBHOOK_URL =
      'https://discord.com/api/webhooks/000000000000000000/002';

    event.body = {
      discordId: 'discordId',
      discordName: 'discordName',
      twitchId: 'twitchId',
      twitchName: 'twitchName',
    };
  });

  test('400 no discordId', async () => {
    delete event.body.discordId;
    const actual = await index.handler(event);
    expect(actual.statusCode).toBe(400);
  });

  test('400 no discordName', async () => {
    delete event.body.discordName;
    const actual = await index.handler(event);
    expect(actual.statusCode).toBe(400);
  });

  test('400 no twitchId', async () => {
    delete event.body.twitchId;
    const actual = await index.handler(event);
    expect(actual.statusCode).toBe(400);
  });

  test('400 no twitchName', async () => {
    delete event.body.twitchName;
    const actual = await index.handler(event);
    expect(actual.statusCode).toBe(400);
  });

  test('error thrown if missing url', async () => {
    delete process.env.WEBHOOK_URL;
    delete process.env.DEV_WEBHOOK_URL;
    await expect(index.handler(event)).rejects.toThrowError('No Webhook URL');
  });

  test('uses dev url if dev passed in body', async () => {
    nock('https://discord.com')
      .post('/api/webhooks/000000000000000000/002', {
        content:
          'discordName - <@discordId>\ntwitchName - twitchId\n<https://www.twitch.tv/popout/annemunition/viewercard/twitchName>',
      })
      .reply(200);
    event.body.dev = true;
    await index.handler(event);
    expect(nock.isDone()).toBe(true);
  });

  test('uses prod url if dev is not passed in body', async () => {
    nock('https://discord.com')
      .post('/api/webhooks/000000000000000000/001', {
        content:
          'discordName - <@discordId>\ntwitchName - twitchId\n<https://www.twitch.tv/popout/annemunition/viewercard/twitchName>',
      })
      .reply(200);
    await index.handler(event);
    expect(nock.isDone()).toBe(true);
  });

  test('parses a stringified body', async () => {
    nock('https://discord.com')
      .post('/api/webhooks/000000000000000000/001', {
        content:
          'discordName - <@discordId>\ntwitchName - twitchId\n<https://www.twitch.tv/popout/annemunition/viewercard/twitchName>',
      })
      .reply(200);
    await index.handler({ body: JSON.stringify(event.body) });
    expect(nock.isDone()).toBe(true);
  });
});
