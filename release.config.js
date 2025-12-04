module.exports = {
  branches: ["main"],
  repositoryUrl: "https://github.com/fatjon-gash1/ecommerce-backend-ts.git",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": [
        "package.json",
        "package-lock.json",
        "CHANGELOG.md"
      ],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }]
  ]
};

