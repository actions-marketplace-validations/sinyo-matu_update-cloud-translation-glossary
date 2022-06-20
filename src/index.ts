import * as core from "@actions/core";
import fetch from "node-fetch";
const requiredInputOption = {
  required: true,
  trimWhiteSpace: true,
};
const notRequiredInputOption = {
  required: false,
  trimWhiteSpace: true,
};

interface RequiredInputs {
  accessToken: string;
  bucketName: string;
  glossaryName: string;
  glossaryFileName: string;
  projectId: string;
}

export interface ErrorResponse {
  error: ErrorMessage;
}

export interface ErrorMessage {
  code: number;
  message: string;
  status: string;
}

function getRequiredInputs(): RequiredInputs {
  const accessToken = core.getInput("access-token");
  const bucketName = core.getInput("bucket-name", requiredInputOption);
  const glossaryName = core.getInput("glossary-name", requiredInputOption);
  const glossaryFileName = core.getInput(
    "glossary-file-name",
    requiredInputOption
  );
  const projectId = core.getInput("project-id", requiredInputOption);
  return {
    bucketName,
    glossaryFileName,
    glossaryName,
    projectId,
    accessToken,
  };
}

async function onePairInput(sourceLanguage: string, targetLanguage: string) {
  const { bucketName, glossaryFileName, projectId, glossaryName, accessToken } =
    getRequiredInputs();
  core.info(`try delete existed resource: ${projectId}/${glossaryName}`);
  await deleteGlossary(projectId, glossaryName, accessToken);
  const glossaryFullName = `projects/${projectId}/locations/us-central1/glossaries/${glossaryName}`;
  const glossaryFilePath = `gs://${bucketName}/${glossaryFileName}`;
  const input = JSON.stringify({
    name: glossaryFullName,
    languagePair: {
      sourceLanguageCode: sourceLanguage,
      targetLanguageCode: targetLanguage,
    },
    inputConfig: {
      gcsSource: {
        inputUri: glossaryFilePath,
      },
    },
  });
  core.info(`try create resource: ${projectId}/${glossaryName}`);
  await createGlossary(input, projectId, accessToken);
  core.info("done!");
}

async function codesSetInput(codesSet: string) {
  const { bucketName, glossaryFileName, projectId, glossaryName, accessToken } =
    getRequiredInputs();
  core.info(`try delete existed resource: ${projectId}/${glossaryName}`);
  await deleteGlossary(projectId, glossaryName, accessToken);
  const glossaryFullName = `projects/${projectId}/locations/us-central1/glossaries/${glossaryName}`;
  const glossaryFilePath = `gs://${bucketName}/${glossaryFileName}`;
  const codes = codesSet.split(",");
  const input = JSON.stringify({
    name: glossaryFullName,
    languageCodesSet: {
      languageCodes: codes,
    },
    inputConfig: {
      gcsSource: {
        inputUri: glossaryFilePath,
      },
    },
  });
  core.info(`try create resource: ${projectId}/${glossaryName}`);
  await createGlossary(input, projectId, accessToken);
  core.info("done!");
}

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
  core.debug(`response message :${await resp.text()}`);
  return;
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
      `delete glossary request failed with status:${resp.status} message:${message}`
    );
    throw Error("delete request failed");
  }
  core.debug(`response message :${await resp.text()}`);
  return;
}

async function main() {
  const targetLanguage = core.getInput(
    "target-language",
    notRequiredInputOption
  );
  const sourceLanguage = core.getInput(
    "source-language",
    notRequiredInputOption
  );
  const languageCodesSet = core.getInput(
    "language-codes-set",
    notRequiredInputOption
  );
  if (targetLanguage.length !== 0 && sourceLanguage.length !== 0) {
    core.info(
      `detected sourceLanguage: ${sourceLanguage}, targetLanguage ${targetLanguage}`
    );
    core.info(`create one pair glossary resource`);
    await onePairInput(targetLanguage, sourceLanguage);
    return;
  }
  if (languageCodesSet.length !== 0) {
    core.info(`detected language codes set: ${languageCodesSet}`);
    core.info(`create multi-language glossary resource`);
    await codesSetInput(languageCodesSet);
    return;
  }
  throw Error("Not appropriate language code input setting");
}

try {
  main();
} catch (error: any) {
  core.setFailed(error.message);
}
