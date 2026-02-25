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
const sequelize_1 = require("sequelize");
const lodash_1 = __importDefault(require("lodash"));
const _Models_1 = require("@Models");
const UtilService = __importStar(require("../UtilService"));
function generateCommitContributionData(commit, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let { parent } = commit;
        if (!parent && commit.parentId) {
            parent = yield _Models_1.Commit.findByPk(commit.parentId);
        }
        const timeConstraint = {
            createdAt: Object.assign({ [sequelize_1.Op.lte]: commit.time }, (parent ? { [sequelize_1.Op.gt]: parent.time } : null)),
        };
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const eventContributionRecords = yield _Models_1.Record.findAll({
                where: Object.assign(Object.assign({}, timeConstraint), { [sequelize_1.Op.or]: [
                        {
                            target: commit.eventId,
                            action: {
                                [sequelize_1.Op.or]: ['createEvent', 'addNewsToEvent', 'updateStackOrders'],
                            },
                        },
                        {
                            subtarget: commit.eventId,
                            action: 'forkEvent',
                        },
                    ] }),
                transaction,
            });
            const stacks = yield _Models_1.Stack.findAll({
                where: {
                    eventId: commit.eventId,
                    status: 'admitted',
                    order: { [sequelize_1.Op.gte]: 0 },
                },
                transaction,
            });
            const stackContributionRecords = yield _Models_1.Record.findAll({
                where: Object.assign(Object.assign({}, timeConstraint), { target: { [sequelize_1.Op.or]: stacks.length > 0 ? stacks.map(s => s.id) : [-1] }, action: {
                        [sequelize_1.Op.or]: ['createStack', 'addNewsToStack'],
                    } }),
                transaction,
            });
            const roleChangeRecords = yield _Models_1.Record.findAll({
                where: Object.assign(Object.assign({}, timeConstraint), { model: 'Client', action: {
                        [sequelize_1.Op.or]: [
                            'setClientEventOwner',
                            'allowClientToViewEvent',
                            'allowClientToEditEvent',
                            'allowClientToManageEvent',
                            'disallowClientToViewEvent',
                            'disallowClientToEditEvent',
                            'disallowClientToManageEvent',
                        ],
                    } }),
                transaction,
            });
            const roleChanges = lodash_1.default.uniqBy(roleChangeRecords, r => r.target);
            const records = [...eventContributionRecords, ...stackContributionRecords, ...roleChanges];
            records.sort((a, b) => {
                if (a.action === b.action) {
                    return a.createdAt > b.createdAt ? 1 : -1;
                }
                return a.action > b.action ? 1 : -1;
            });
            const clientIds = lodash_1.default.uniq(records.map(r => r.owner).filter(i => i));
            const clients = {};
            for (const clientId of clientIds) {
                const data = {
                    eventId: commit.eventId,
                    commitId: commit.id,
                    contributorId: clientId,
                    points: 0,
                    parentId: undefined,
                };
                if (commit.parentId) {
                    let { parentId } = commit;
                    while (parentId) {
                        const previousCount = yield _Models_1.EventContributor.findOne({
                            where: {
                                eventId: commit.eventId,
                                contributorId: clientId,
                                commitId: parentId,
                            },
                            transaction,
                        });
                        if (previousCount) {
                            data.parentId = previousCount.id;
                            data.points = previousCount.points;
                            break;
                        }
                        const parentCommit = yield _Models_1.Commit.findByPk(parentId, { transaction });
                        parentId = parentCommit.parentId;
                    }
                }
                clients[clientId] = data;
            }
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                if (!record.owner)
                    continue;
                const nextRecord = records[i + 1];
                if (nextRecord && record.action === 'updateStackOrders' && nextRecord.action === 'updateStackOrders' && record.owner === nextRecord.owner) {
                    continue;
                }
                switch (record.action) {
                    case 'createEvent':
                    case 'forkEvent':
                        clients[record.owner].points += 5;
                        break;
                    case 'addNewsToEvent':
                        clients[record.owner].points += 2;
                        clients[record.owner].points += 2;
                        break;
                    case 'addNewsToStack':
                    case 'updateStackOrders':
                    case 'inviteClientToNewsroom':
                        clients[record.owner].points += 1;
                        break;
                }
            }
            for (const roleChange of roleChanges) {
                clients[roleChange.owner].points += 1;
            }
            for (const clientId of clientIds) {
                const eventContributor = yield _Models_1.EventContributor.findOne({
                    where: {
                        eventId: commit.eventId,
                        commitId: commit.id,
                        contributorId: clientId,
                    },
                    transaction,
                });
                if (eventContributor) {
                    eventContributor.points = clients[clientId].points;
                    yield eventContributor.save({ transaction });
                }
                else {
                    yield _Models_1.EventContributor.create(clients[clientId], { transaction });
                }
            }
        }), transaction);
    });
}
exports.default = generateCommitContributionData;

//# sourceMappingURL=generateCommitContributionData.js.map
