const axios = require('axios');
const { SLACK_URL } = process.env;
import { globals } from '@Configs';

export async function sendText(text: string) {
  if (globals.environment !== 'production') {
    console.log('send slack', {
      text,
    });
    return;
  }
  return axios.post(
    SLACK_URL,
    JSON.stringify({
      text,
    }), {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
