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
      "target": "https://api-dev.growinvoice.com/api-docs.json"
    },
    "hooks": {
      "afterAllFilesWrite": "yarn run format"
    }
  }
}