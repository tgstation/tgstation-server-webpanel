const { https } = require("follow-redirects");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const pkg = require("../package.json");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const API_GEN_PATH = "../src/ApiClient/generatedcode";

// swagger
const SWAGGER_FILE = createWriteStreamSafe(path.resolve(__dirname, API_GEN_PATH, 'swagger.json'));
let SWAGGER_FILE_IMPORT = {};

// enum
const ENUM_FILE = createWriteStreamSafe(path.resolve(__dirname, API_GEN_PATH, '_enums.ts'));

// exports
const EXPORTS_FILE = createWriteStreamSafe(path.resolve(__dirname, API_GEN_PATH, 'schemas.d.ts'));

// dts file
const GENERATED_FILE = path.resolve(__dirname, API_GEN_PATH, '_generated.d.ts');

function createWriteStreamSafe(path) {
  fs.openSync(path, "w+"); // blank it
  return fs.createWriteStream(path);
}

// the entire "build chain" in one convinient file!
async function build() {
  console.log("⏲ Pausing until fs opens up.");
  await Promise.all([
    await new Promise(fsResolve => {
      SWAGGER_FILE.once('open', () => {
        fsResolve();
      })
      if (!SWAGGER_FILE.pending) {
        fsResolve();
      }
    }),
    await new Promise(fsResolve => {
      ENUM_FILE.once('open', () => {
        fsResolve()
      })
      if (!ENUM_FILE.pending) {
        fsResolve();
      }
    }),
    await new Promise(fsResolve => {
      EXPORTS_FILE.once('open', () => {
        fsResolve()
      })
      if (!EXPORTS_FILE.pending) {
        fsResolve();
      }
    }),
  ]);
  console.log("\x1b[32m✔\x1b[0m All fs open.");

  await apiDownload(pkg.tgs_api.type, pkg.tgs_api.value);
  codeZeroOrBreak();

  // await new Promise(resolve => { //DO NOT REMOVE THIS
  //   setTimeout(() => {
  //     console.log("⏲ Pausing for 1 second (fs has to wake up and know that the schema json updated).")
  //     resolve();
  //   }, 1000);
  // });

  await typegen();
  codeZeroOrBreak();

  // we (should) exist already, if not then goddamit
  try {
    SWAGGER_FILE_IMPORT = require(path.resolve(SWAGGER_FILE.path));
  } catch (error) {
    process.exitCode = 1;
    console.error(`❌ Resolved swagger.json is bad!\n❌ Error: ${error}`);
  }
  codeZeroOrBreak();

  generateEnums();
  codeZeroOrBreak();

  generateExports();
  // no czob, its the end already
}
build();

async function codeZeroOrBreak() {
  if(process.exitCode == 1) {
    process.exit();
  }
}

async function apiDownload(type, value) {
  console.log(`🔵 ${type != "file" ? "Downloading" : "Locating"} API. Type: ${type} | Value: ${value}`);
  switch (type) {
    case "version":
      await new Promise(
        resolve => {
          https.get(
            `https://github.com/tgstation/tgstation-server/releases/download/api-v${value}/swagger.json`,
            response => {
              if(response.statusCode >= 400) {
                console.error(`❌ API Schema v${value}`);
                console.error(`❌ Error Response: ${response.statusMessage}, ${response.statusCode}`);
                process.exitCode = 1;
              }

              if (response.statusCode >= 200 && response.statusCode <= 299) {
                console.log(`\x1b[32m✔\x1b[0m API Schema v${value}`);
              }

              try {
                response.pipe(SWAGGER_FILE);
                console.log(`\x1b[32m✔\x1b[0m API Schema written to ${SWAGGER_FILE.path}`);
                resolve();
              } catch (error) {
                process.exitCode = 1;
                console.error(`❌ API Schema Error: ${error}`);
                resolve();
              }
            }
          )
        });
      break;

    case "url": {
      https.get(
        value,
        function (response) {
          if(response.statusCode >= 400) {
            console.error(`❌ API Schema at ${value} `);
            console.error(`❌ Error Response: ${response.statusMessage}, ${response.statusCode}`);
            process.exitCode = 1;
          }
          if (response.statusCode >= 200 && response.statusCode <= 299) {
            console.log(`\x1b[32m✔\x1b[0m API Schema at ${value}`);
          }

          try {
            response.pipe(SWAGGER_FILE);
          } catch (error) {
            process.exitCode = 1;
            console.error(`❌ API Schema Error: ${error}`);
          }
        });
      break;
    }
    case "file": {
      let filepath;
      if(path.isAbsolute(value)) {
        filepath = value;
      } else {
        filepath = path.resolve(process.cwd(), value)
      }

      fs.createReadStream(filepath).pipe(SWAGGER_FILE)
      break;
    }
    default:
      process.exitCode = 1;
      console.error(`❌ Invalid TGS type given. ${type}`);
      break;
  }
}

async function typegen() {
  fse.removeSync(GENERATED_FILE);
  console.log(`🔵 Generating API types. If this takes longer than a minuite or so, ask LetterN on discord **immediately**.`);
  const { stdout, stderr } = await exec(`yarn typegen ${SWAGGER_FILE.path} > ${GENERATED_FILE}`, { shell: true });
  if (stderr) {
    console.error(`❌ API Schema typegen Error: ${stderr}`);
  }
  console.log(`\x1b[32m✔\x1b[0m API Schema type generation written to ${GENERATED_FILE}`);
}

function generateEnums() {
  for (const [name, schema] of Object.entries(SWAGGER_FILE_IMPORT.components.schemas)) {
    if (!("enum" in schema)) {
        continue
    }; //skip if true

    let enum_data = `export enum ${name} {\n`;
    for (let i = 0; i < schema.enum.length; i++) {
        const name = schema["x-enum-varnames"][i]; //sets the name
        const value = schema["enum"][i]; //sets the value
        const quote = typeof (value) === 'string' ? '"' : "";
        enum_data += `    ${name} = ${quote}${value}${quote}${i < schema.enum.length - 1 ? "," : ""}\n`;
    }
    enum_data += '}\n\n';
    try {
      ENUM_FILE.write(enum_data, (e) => {
        if (!e) {
          return;
        }
        process.exitCode = 1;
        console.error(`❌ API Schema types Error: ${e}`);
        throw e;
      });
    } catch (error) {
      process.exitCode = 1;
      console.error(`❌ API Schema types Error: ${error}`);
    }
  }
  console.log(`\x1b[32m✔\x1b[0m API Schema types written to ${ENUM_FILE.path}`);
}

function generateExports() {
  let exports_data = "import { Components } from \"./_generated\";\n";
  for (const [name] of Object.entries(SWAGGER_FILE_IMPORT.components.schemas)) {
    exports_data += `declare type ${name} = Components.Schemas.${name};\n`
  }

  try {
    EXPORTS_FILE.write(exports_data, (e) => {
      if (!e) {
        return;
      }
      process.exitCode = 1;
      console.error(`❌ API Schema exports Error: ${e}`);
      throw e;
    });
  } catch (error) {
    process.exitCode = 1;
    console.error(`❌ API Schema exports Error: ${error}`);
  }
  console.log(`\x1b[32m✔\x1b[0m API Schema exports written to ${EXPORTS_FILE.path}`);
}
