module.exports = {
  "auth": {
    "output": {
      "mode": "tags",
      "client": "react-query",
      "mock": false,
      "target": "src/api/services/auth/index.ts",
      "schemas": "src/api/services/auth/models",
      "override": {
        "mutator": {
          "path": "src/api/instances/authInstance.ts",
          "name": "authInstance"
        }
      }
    },
    "input": {
      "target": "http://funtofun.site/api-docs.json"
    },
    "hooks": {
      "afterAllFilesWrite": "yarn run format"
    }
  }
}