const axios = require('axios');

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': 'https://pages.annemunition.tv',
  'Access-Control-Allow-Methods': 'POST',
};

exports.handler = async (event) => {
  if (typeof event.body === 'string') event.body = JSON.parse(event.body);
  const { discordId, discordName, twitchId, twitchName, dev } = event.body;
  if (!discordId || !discordName || !twitchId || !twitchName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ...event.body, message: 'Bad Request' }),
    };
  }

  const url = dev ? process.env.DEV_WEBHOOK_URL : process.env.WEBHOOK_URL;
  if (!url) throw new Error('No Webhook URL');

  await axios.post(url, {
    content: `${discordName} - <@${discordId}>\n${twitchName} - ${twitchId}\n<https://www.twitch.tv/popout/annemunition/viewercard/${twitchName}>`,
  });

  return {
    statusCode: 204,
    headers,
  };
};
