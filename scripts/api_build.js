const { https, http } = require("follow-redirects");
const path = require("path");
const pkg = require("../package.json");
const fs = require("fs");
const { generateApi } = require("swagger-typescript-api");

const API_GEN_PATH = "../src/ApiClient/generatedcode";

// swagger
const SWAGGER_FILE = fs.createWriteStream(path.resolve(__dirname, API_GEN_PATH, "swagger.json"));
let SWAGGER_FILE_IMPORT = {};

// out file
const GENERATED_FILE = path.resolve(__dirname, API_GEN_PATH);

// the entire "build chain" in one convinient file!
async function buildAPI() {
  console.log("⏲   Pausing until fs opens up.");
  await Promise.all([
    await new Promise(fsResolve => {
      SWAGGER_FILE.once("open", () => {
        fsResolve();
      });
      if (!SWAGGER_FILE.pending) {
        fsResolve();
      }
    })
  ]);
  console.log("✅   All fs open.");

  const schemaGenType = pkg.schema_gen.type;
  let schemaGenValue;
  if (schemaGenType === "version")
    schemaGenValue = pkg.tgs_api_version;
  else
    schemaGenValue = pkg.schema_gen.value

  await apiDownload(schemaGenType, schemaGenValue);
  codeZeroOrBreak();

  await new Promise(resolve => {
    console.log("⏲   Pausing until FS finishes writing.");
    SWAGGER_FILE.once("finish", () => {
      resolve();
    })
    if (SWAGGER_FILE.writableFinished) {
      resolve();
    }
  });

  // we (should) exist already, if not then goddamit
  try {
    SWAGGER_FILE_IMPORT = require(path.resolve(SWAGGER_FILE.path));
  } catch (error) {
    process.exitCode = 1;
    console.error(`❌   Resolved swagger.json is bad!\n❌   Error: ${error}`);
  }
  codeZeroOrBreak();

  generateApi({
    input: SWAGGER_FILE.path,
    output: GENERATED_FILE,
    fileName: "generated.ts",
    // url: `https://github.com/tgstation/tgstation-server/releases/download/api-v${schemaGenValue}/swagger.json`,
    templates: path.resolve(__dirname, "./templates"),
    generateResponses: true,
    defaultResponseAsSuccess: true,
    generateRouteTypes: false,
    extractRequestParams: true,
    extractRequestBody: true,
    httpClientType: "axios",
    prettier: {
      printWidth: 120,
      tabWidth: 2,
      trailingComma: "all",
      parser: "typescript"
    },
    defaultResponseType: "void",
    singleHttpClient: true,
    codeGenConstructs: () => ({
      Keyword: {
        Null: 'undefined'
      }
    }),
    hooks: {
      // stupid shit to make anything not nullable required
      onCreateComponent: (component) => {
        if (component.componentName !== "schemas") {
          return component;
        }

        if (component.rawTypeData?.properties) {
          Object.keys(component.rawTypeData.properties).forEach(r => {
            if (component.rawTypeData.properties[r]['nullable']) return;
            component.rawTypeData.properties[r]['required'] = true;
          })
        }
        return component
      }
    }
  }).catch(e => {
    console.error("❌  ", e);
    process.exitCode = 1;
  });
}

void buildAPI();

function codeZeroOrBreak() {
  if (process.exitCode === 1) {
    process.exit();
  }
}

async function apiDownload(type, value) {
  console.log(
    `🔵   ${type !== "file" ? "Downloading" : "Locating"} API. Type: ${type} | Value: ${value}`
  );
  switch (type) {
    case "version":
      await new Promise(resolve => {
        https.get(
          `https://github.com/tgstation/tgstation-server/releases/download/api-v${value}/swagger.json`,
          response => {
            if (response.statusCode >= 400) {
              console.error(`❌   API Schema v${value}`);
              console.error(
                `❌   Error Response: ${response.statusMessage}, ${response.statusCode}`
              );
              process.exitCode = 1;
            }

            if (response.statusCode >= 200 && response.statusCode <= 299) {
              console.log(`✅   API Schema v${value}`);
            }

            try {
              response.pipe(SWAGGER_FILE);
              console.log(`✅   API Schema written to ${SWAGGER_FILE.path}`);
              resolve();
            } catch (error) {
              process.exitCode = 1;
              console.error(`❌   API Schema Error: ${error}`);
              resolve();
            }
          }
        );
      });
      break;

    case "url": {
      const protocol = value.startsWith("https") ? https : http;
      protocol.get(value, function (response) {
        if (response.statusCode >= 400) {
          console.error(`❌   API Schema at ${value} `);
          console.error(
            `❌   Error Response: ${response.statusMessage}, ${response.statusCode}`
          );
          process.exitCode = 1;
        }
        if (response.statusCode >= 200 && response.statusCode <= 299) {
          console.log(`\x1b[32m✔\x1b[0m API Schema at ${value}`);
        }

        try {
          response.pipe(SWAGGER_FILE);
        } catch (error) {
          process.exitCode = 1;
          console.error(`❌   API Schema Error: ${error}`);
        }
      });
      break;
    }
    case "file": {
      let filepath;
      if (path.isAbsolute(value)) {
        filepath = value;
      } else {
        filepath = path.resolve(process.cwd(), value);
      }

      fs.createReadStream(filepath).pipe(SWAGGER_FILE);
      break;
    }
    default:
      process.exitCode = 1;
      console.error(`❌   Invalid TGS type given. ${type}`);
      break;
  }
}
