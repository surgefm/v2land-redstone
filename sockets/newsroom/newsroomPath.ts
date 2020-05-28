import globals from '@Configs/globals';

const url = new URL(globals.api);
const newsroomPath = url.pathname.length > 1 ? `${url.pathname}/newsroom` : '/newsroom';
export default newsroomPath;
