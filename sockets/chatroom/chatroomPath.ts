import globals from '@Configs/globals';

const url = new URL(globals.api);
const chatroomPath = url.pathname.length > 1 ? `${url.pathname}/chatroom` : '/chatroom';
export default chatroomPath;
