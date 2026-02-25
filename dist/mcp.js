"use strict";
// Standalone MCP server entry point (stdio transport).
// Use this for Claude Desktop or other subprocess-based MCP clients.
// The MCP server also launches by default with the Express service at /mcp.
//
// Requires MCP_ACCESS_TOKEN environment variable for authentication.
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
require("source-map-support/register");
require("module-alias/register");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '..', '.env') });
// Redirect console.log/info to stderr so they don't corrupt MCP stdio on stdout.
const _stderr = console.error.bind(console);
console.log = (...args) => _stderr('[MCP]', ...args);
console.info = (...args) => _stderr('[MCP]', ...args);
const loadSequelize_1 = __importDefault(require("./loadSequelize"));
const initialize_1 = __importDefault(require("@Services/AccessControlService/initialize"));
const AgentService_1 = require("@Services/AgentService");
const mcp_1 = require("./api/mcp");
const sdk_1 = require("./api/mcp/sdk");
const _Models_1 = require("@Models");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, loadSequelize_1.default)();
        yield (0, initialize_1.default)();
        const botClient = yield (0, AgentService_1.getOrCreateBotClient)();
        // Authenticate via MCP_ACCESS_TOKEN env var
        const tokenStr = process.env.MCP_ACCESS_TOKEN;
        if (!tokenStr) {
            console.error('MCP_ACCESS_TOKEN environment variable is required');
            process.exit(1);
        }
        const accessToken = yield _Models_1.AuthorizationAccessToken.findOne({
            where: { token: tokenStr, status: 'active' },
        });
        if (!accessToken) {
            console.error('Invalid or revoked MCP_ACCESS_TOKEN');
            process.exit(1);
        }
        if (new Date(accessToken.expire) < new Date()) {
            console.error('MCP_ACCESS_TOKEN has expired');
            process.exit(1);
        }
        const clientId = accessToken.owner;
        console.log(`Authenticated as client ${clientId}`);
        const server = (0, mcp_1.createMcpServer)(botClient.id, clientId);
        const transport = new sdk_1.StdioServerTransport();
        yield server.connect(transport);
    });
}
main().catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
});

//# sourceMappingURL=mcp.js.map
