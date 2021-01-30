const createConfig = require("./webpack.common.js");
const { version } = require("./package.json");

//set TGS_WEBPANEL_GITHUB_PATH to the github pages subdir
//set TGS_WEBPANEL_CLIENT_PATH to the path tgs will use to build
//set GITHUB_SHA to the version commit

process.env.TGS_WEBPANEL_GITHUB_PATH = "http://localhost:3000/tgstation-server-webpanel/" + version + "/";
process.env.TGS_WEBPANEL_CLIENT_PATH = "/app/";


module.exports = createConfig(true, true);
