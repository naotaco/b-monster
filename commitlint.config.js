module.exports = {
  extends: ["@commitlint/config-conventional"],
  // See https://conventional-changelog.github.io/commitlint/#/reference-rules
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore"]
    ],
    "body-leading-blank": [2, "always"],
    "body-empty": [2, "never"]
  }
};