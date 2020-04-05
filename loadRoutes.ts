import controllers from '@Controllers';
import { routes, policies } from '@Configs';
import policyMiddlewares, { PolicyMiddleware, forbiddenRoute } from '@Policies';
import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { Express } from 'express';

async function loadRoutes(app: Express) {
  for (const key in routes) {
    if (typeof routes[key] === 'string') {
      const fn = routes[key] as string;
      const method = getMethod(app, key);
      const route = key.split(' ')[key.split(' ').length - 1];
      const controller = fn.split('.')[0];
      const action = fn.split('.')[1];
      const middlewares = getPolicies(controller, action);
      method(route, ...middlewares, getControllerAction(controller, action));
    }
  }
}

function getControllerAction(controller: string, action: string) {
  return function(req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
    controllers[controller][action](req, res).then(() => next());
  };
}

function getMethod(app: Express, location: string) {
  switch (location.split(' ')[0].toUpperCase()) {
  case 'GET':
    return app.get.bind(app);
  case 'POST':
    return app.post.bind(app);
  case 'HEAD':
    return app.head.bind(app);
  case 'PUT':
    return app.put.bind(app);
  case 'DELETE':
    return app.delete.bind(app);
  default:
    return app.all.bind(app);
  }
}

function getPolicies(controller: string, action: string) {
  if (!(controller in controllers)) wrongConfig(controller, action);
  if (!(controller in policies)) wrongConfig(controller, action);
  if (!(action in policies[controller]) && !('*' in policies[controller])) wrongConfig(controller, action);
  const policyRule = policies[controller][action in policies[controller] ? action : '*'];
  if (typeof policyRule === 'boolean') {
    return policyRule ? [] : [forbiddenRoute];
  }

  const list = typeof policyRule === 'string'
    ? [policyRule as unknown as string]
    : policyRule as unknown as string[];

  const middlewares: PolicyMiddleware[] = [];
  for (const policy of list) {
    if (!(policy in policyMiddlewares)) {
      wrongConfig(controller, action);
      return [forbiddenRoute];
    }
    middlewares.push(policyMiddlewares[policy]);
  }
  return middlewares;
}

function wrongConfig(controller: string, action: string) {
  throw new Error(`Wrong route config: ${controller} or ${action} not found`);
}

export default loadRoutes;
