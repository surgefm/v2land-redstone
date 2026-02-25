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
exports.UploadController = exports.TagController = exports.SubscriptionController = exports.StackController = exports.SearchController = exports.RoleController = exports.OAuth2Controller = exports.NotificationController = exports.NewsController = exports.HeaderImageController = exports.ExtractionController = exports.EventController = exports.ClientController = exports.ChatController = exports.AuthController = exports.AgentController = void 0;
const AgentController = __importStar(require("./AgentController"));
exports.AgentController = AgentController;
const AuthController = __importStar(require("./AuthController"));
exports.AuthController = AuthController;
const ChatController = __importStar(require("./ChatController"));
exports.ChatController = ChatController;
const ClientController = __importStar(require("./ClientController"));
exports.ClientController = ClientController;
const EventController = __importStar(require("./EventController"));
exports.EventController = EventController;
const ExtractionController = __importStar(require("./ExtractionController"));
exports.ExtractionController = ExtractionController;
const HeaderImageController = __importStar(require("./HeaderImageController"));
exports.HeaderImageController = HeaderImageController;
const NewsController = __importStar(require("./NewsController"));
exports.NewsController = NewsController;
const NotificationController = __importStar(require("./NotificationController"));
exports.NotificationController = NotificationController;
const OAuth2Controller = __importStar(require("./OAuth2Controller"));
exports.OAuth2Controller = OAuth2Controller;
const RoleController = __importStar(require("./RoleController"));
exports.RoleController = RoleController;
const SearchController = __importStar(require("./SearchController"));
exports.SearchController = SearchController;
const StackController = __importStar(require("./StackController"));
exports.StackController = StackController;
const SubscriptionController = __importStar(require("./SubscriptionController"));
exports.SubscriptionController = SubscriptionController;
const TagController = __importStar(require("./TagController"));
exports.TagController = TagController;
const UploadController = __importStar(require("./UploadController"));
exports.UploadController = UploadController;
exports.default = {
    AgentController,
    AuthController,
    ChatController,
    ClientController,
    EventController,
    ExtractionController,
    HeaderImageController,
    NewsController,
    NotificationController,
    OAuth2Controller,
    RoleController,
    SearchController,
    StackController,
    SubscriptionController,
    TagController,
    UploadController,
};

//# sourceMappingURL=index.js.map
