"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Controllers_1 = __importDefault(require("@Controllers"));
const _Configs_1 = require("@Configs");
const _Policies_1 = __importStar(require("@Policies"));
function loadRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const key in _Configs_1.routes) {
            if (typeof _Configs_1.routes[key] === 'string') {
                const fn = _Configs_1.routes[key];
                const method = getMethod(app, key);
                const route = key.split(' ')[key.split(' ').length - 1];
                const controller = fn.split('.')[0];
                const action = fn.split('.')[1];
                const middlewares = getPolicies(controller, action);
                method(route, ...middlewares, getControllerAction(controller, action));
            }
        }
    });
}
function wrapAsync(fn) {
    return function (req, res, next) {
        const result = fn(req, res, next);
        if (result && typeof result.catch === 'function') {
            result.catch(next);
        }
    };
}
function getControllerAction(controller, action) {
    return function (req, res, next) {
        _Controllers_1.default[controller][action](req, res).catch(next);
    };
}
function getMethod(app, location) {
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
function getPolicies(controller, action) {
    if (!(controller in _Controllers_1.default))
        wrongConfig(controller, action);
    if (!(controller in _Configs_1.policies))
        wrongConfig(controller, action);
    if (!(action in _Configs_1.policies[controller]) && !('*' in _Configs_1.policies[controller]))
        wrongConfig(controller, action);
    const policyRule = _Configs_1.policies[controller][action in _Configs_1.policies[controller] ? action : '*'];
    if (typeof policyRule === 'boolean') {
        return policyRule ? [] : [_Policies_1.forbiddenRoute];
    }
    const list = (typeof policyRule === 'string' || typeof policyRule === 'function')
        ? [policyRule]
        : policyRule;
    const middlewares = [];
    for (const policy of list) {
        let middleware;
        if (typeof policy === 'function') {
            middleware = policy;
        }
        else {
            if (!(policy in _Policies_1.default)) {
                wrongConfig(controller, action);
                return [_Policies_1.forbiddenRoute];
            }
            middleware = _Policies_1.default[policy];
        }
        middlewares.push(wrapAsync(middleware));
    }
    return middlewares;
}
function wrongConfig(controller, action) {
    throw new Error(`Wrong route config: ${controller} or ${action} not found`);
}
exports.default = loadRoutes;

//# sourceMappingURL=loadRoutes.js.map
