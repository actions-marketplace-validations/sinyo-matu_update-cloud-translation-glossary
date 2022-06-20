import * as index from "../src/index";
import { assert, it, describe } from "vitest";
import { google } from "googleapis";
import dotenv from "dotenv";
import { debug } from "console";
dotenv.config();

const PROJECT_ID = "153846811568";
const GLOSSARY_NAME = "test-glossary";
const BUCKET_NAME = "test-action-translation-bucket";
const GLOSSARY_FILE_NAME = "sample.csv";
const authClient = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

describe("create delete head", () => {
  it("create glossary resource", async () => {
    const token = await authClient.getAccessToken();
    debug(token);
    const glossaryFullName = `projects/${PROJECT_ID}/locations/us-central1/glossaries/${GLOSSARY_NAME}`;
    const glossaryFilePath = `gs://${BUCKET_NAME}/${GLOSSARY_FILE_NAME}`;
    const input = JSON.stringify({
      name: glossaryFullName,
      languagePair: {
        sourceLanguageCode: "ja",
        targetLanguageCode: "en",
      },
      inputConfig: {
        gcsSource: {
          inputUri: glossaryFilePath,
        },
      },
    });
    assert.isDefined(token);
    assert.isOk(await index.createGlossary(input, PROJECT_ID, token!));
  });
});
