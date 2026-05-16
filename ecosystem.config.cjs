const { execSync } = require("child_process");
const path = require("path");

const globalRoot = execSync("npm root -g").toString().trim();

module.exports = {
  apps: [
    {
      name: "fe_lacosta",
      script: path.join(globalRoot, "serve", "build", "main.js"),
      args: "-s dist -l 4173",
      cwd: __dirname,
    },
  ],
};
