import core from "@actions/core";
import fetch from "node-fetch";
import { GoogleResponse } from ".";

export async function createGlossary(
  input: string,
  projectId: string,
  accessToken: string
) {
  const endPoint = `https://translation.googleapis.com/v3/projects/${projectId}/locations/us-central1/glossaries`;
  let resp = await fetch(endPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: input,
  });
  if (resp.status >= 300) {
    let message = await resp.text();
    core.debug(`error message:${message}`);
    core.error(
      `delete glossary request failed with status:${resp.status} message:${message}`
    );
    throw Error("delete request failed");
  }
  const message = (await resp.json()) as GoogleResponse;
  return message.name;
}

export async function deleteGlossary(
  projectId: string,
  glossaryName: string,
  accessToken: string
) {
  const endPoint = `https://translation.googleapis.com/v3/projects/${projectId}/locations/us-central1/glossaries/${glossaryName}`;
  let resp = await fetch(endPoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (resp.status === 404) {
    core.debug(`response message: ${await resp.text()}`);
    core.warning(`glossary ${glossaryName} is not found,continue to create`);
    return;
  }
  if (resp.status >= 300) {
    let message = await resp.text();
    core.debug(`error message:${message}`);
    core.error(
      `delete glossary request failed with status:${
        resp.status
      } message:${JSON.stringify(message)}`
    );
    throw Error("delete request failed");
  }
  core.debug(`response message :${await resp.text()}`);
  return;
}

export async function headOperation(name: string, accessToken: string) {
  const endPoint = `https://translation.googleapis.com/v3/${name}`;
  let resp = await fetch(endPoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (resp.status >= 300) {
    let message = (await resp.json()) as GoogleResponse;
    core.debug(`error message:${message}`);
    core.error(
      `delete glossary request failed with status:${
        resp.status
      } message:${JSON.stringify(message)}`
    );
    throw Error("delete request failed");
  }
  const message = (await resp.json()) as GoogleResponse;
  return message;
}
