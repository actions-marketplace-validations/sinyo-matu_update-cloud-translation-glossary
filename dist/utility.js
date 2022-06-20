"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.headOperation = exports.deleteGlossary = exports.createGlossary = void 0;
const core_1 = __importDefault(require("@actions/core"));
const node_fetch_1 = __importDefault(require("node-fetch"));
async function createGlossary(input, projectId, accessToken) {
    const endPoint = `https://translation.googleapis.com/v3/projects/${projectId}/locations/us-central1/glossaries`;
    let resp = await (0, node_fetch_1.default)(endPoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=utf-8",
        },
        body: input,
    });
    if (resp.status >= 300) {
        let message = await resp.text();
        core_1.default.debug(`error message:${message}`);
        core_1.default.error(`delete glossary request failed with status:${resp.status} message:${message}`);
        throw Error("delete request failed");
    }
    const message = (await resp.json());
    return message.name;
}
exports.createGlossary = createGlossary;
async function deleteGlossary(projectId, glossaryName, accessToken) {
    const endPoint = `https://translation.googleapis.com/v3/projects/${projectId}/locations/us-central1/glossaries/${glossaryName}`;
    let resp = await (0, node_fetch_1.default)(endPoint, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (resp.status === 404) {
        core_1.default.debug(`response message: ${await resp.text()}`);
        core_1.default.warning(`glossary ${glossaryName} is not found,continue to create`);
        return;
    }
    if (resp.status >= 300) {
        let message = await resp.text();
        core_1.default.debug(`error message:${message}`);
        core_1.default.error(`delete glossary request failed with status:${resp.status} message:${JSON.stringify(message)}`);
        throw Error("delete request failed");
    }
    core_1.default.debug(`response message :${await resp.text()}`);
    return;
}
exports.deleteGlossary = deleteGlossary;
async function headOperation(name, accessToken) {
    const endPoint = `https://translation.googleapis.com/v3/${name}`;
    let resp = await (0, node_fetch_1.default)(endPoint, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (resp.status >= 300) {
        let message = (await resp.json());
        core_1.default.debug(`error message:${message}`);
        core_1.default.error(`delete glossary request failed with status:${resp.status} message:${JSON.stringify(message)}`);
        throw Error("delete request failed");
    }
    const message = (await resp.json());
    return message;
}
exports.headOperation = headOperation;
