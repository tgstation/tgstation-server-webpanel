const { https } = require("follow-redirects");
const fs = require("fs");
const path = require("path");
const pkg = require("../package.json");

const file = fs.createWriteStream(
    path.resolve(__dirname, "..", "src", "ApiClient", "generatedcode", "swagger.json")
);

switch (pkg.tgs_api.type) {
    case "version": {
        https.get(
            "https://github.com/tgstation/tgstation-server/releases/download/api-v" +
            pkg.tgs_api.value +
            "/swagger.json",
            function (response) {
                response.pipe(file);
            }
        );
        break;
    }
    case "url": {
        https.get(
            pkg.tgs_api.value,
            function (response) {
                response.pipe(file);
            }
        );
        break;
    }
    case "file": {
        let filepath;
        if(path.isAbsolute(pkg.tgs_api.value)) {
            filepath = pkg.tgs_api.value;
        } else {
            filepath = path.resolve(process.cwd(), pkg.tgs_api.value)
        }

        fs.createReadStream(filepath).pipe(file)
        break;
    }
}
