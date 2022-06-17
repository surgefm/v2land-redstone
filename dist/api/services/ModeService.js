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
Object.defineProperty(exports, "__esModule", { value: true });
exports.modeCollection = exports.getMode = exports.getRecordActionName = exports.names = void 0;
const modeCollection = __importStar(require("@Modes"));
exports.modeCollection = modeCollection;
const names = {};
exports.names = names;
for (const key of Object.keys(modeCollection)) {
    const mode = modeCollection[key];
    names[mode.name] = mode;
}
function getRecordActionName(report) {
    const method = report.method.slice(0, 1).toUpperCase() + report.method.slice(1);
    const type = report.type.slice(0, 1).toUpperCase() + report.type.slice(1);
    return `send${method}${type}Report`;
}
exports.getRecordActionName = getRecordActionName;
function getMode(mode) {
    if (modeCollection[mode])
        return modeCollection[mode];
    return names[mode] || null;
}
exports.getMode = getMode;

//# sourceMappingURL=ModeService.js.map
