const createConfig = require("./webpack.common.js");

//set TGS_WEBPANEL_GITHUB_PATH to the github pages subdir
//set TGS_WEBPANEL_CLIENT_PATH to the path tgs will use to build
//set GITHUB_SHA to the version commit

process.env.TGS_WEBPANEL_GITHUB_PATH = "/tgstation-server-control-panel/";
process.env.TGS_WEBPANEL_CLIENT_PATH = "/app/";


module.exports = createConfig(true, true);
