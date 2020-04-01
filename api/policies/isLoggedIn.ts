/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session client has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
import { Client } from '@Models';
import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';

export default async function(req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
  if (typeof req.session === 'undefined') {
    return res.status(401).json({
      message: '请在登录后进行该操作',
    });
  }
  req.currentClient = await getClient(req, req.session.clientId);
  if (req.currentClient) {
    req.currentClient.isManager = ['manager', 'admin'].includes(req.currentClient.role);
    req.currentClient.isAdmin = req.currentClient.role === 'admin';
    return next();
  } else {
    return res.status(401).json({
      message: '请在登录后进行该操作',
    });
  }
};

/**
 * getClient
 *
 * @module      :: Policy
 * @description :: Check if the clientId is undefined or invalid; if valid, return a client instance
 * @returns     :: a client instance(if client's found) or false (if not found)
 */
async function getClient(req: RedstoneRequest, clientId: number) {
  if (!clientId) {
    return null;
  }
  const client = await Client.findByPk(clientId);
  if (!client) {
    delete req.session.clientId;
    return null;
  }
  return client;
}
