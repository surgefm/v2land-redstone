import axios from 'axios';
import { globals } from '@Configs';
const { SLACK_URL } = process.env;

export async function sendText(text: string) {
  if (globals.environment !== 'production') {
    console.log('send slack', { text });
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
}
