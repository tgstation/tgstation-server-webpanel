const swagger = require("../src/ApiClient/generatedcode/swagger.json");

console.log("import { Components } from \"./_generated\";");
console.log("");
for (const [name] of Object.entries(swagger.components.schemas)) {
    console.log(`declare type ${name} = Components.Schemas.${name};`);
}
