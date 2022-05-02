import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ChatService, AccessControlService } from '@Services';

async function loadChatMessages(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.session.clientId;
  const type = req.body.type as 'client' | 'newsroom';
  const ids = req.body.ids as number | number[];

  const hasAccess = type === 'client'
    ? await AccessControlService.isAllowedToViewClientChat(clientId, ids as number[])
    : await AccessControlService.isAllowedToViewNewsroomChat(clientId, ids as number);

  if (!hasAccess) {
    return res.status(401).json({
      message: '你没有权限浏览该聊天',
    });
  }

  const messages = await ChatService.loadMessages(type, ids, { before: req.body.before });

  res.status(200).json({ messages });
}

export default loadChatMessages;
