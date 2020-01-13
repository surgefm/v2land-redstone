async function validateSettings (settings: any) {
  for (const attr of Object.keys(settings)) {
    switch (attr) {
    case 'defaultSubscriptionMethod':
      if (!['EveryNewStack', '30DaysSinceLatestStack'].includes(settings[attr])) {
        throw new Error(`'defaultSubscriptionMethod' 字段不得为 ${settings[attr]}`);
      }
      break;
    default:
      throw new Error(`不存在 '${attr}' 字段`);
    }
  }
}

export default validateSettings;
