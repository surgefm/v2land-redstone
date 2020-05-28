import globals from '@Configs/globals';

const url = new URL(globals.api);
const newsroomPath = `${url.pathname}/newsroom`;
export default newsroomPath;
