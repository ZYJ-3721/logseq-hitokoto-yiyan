module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits"
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false
      },
    ],
    "@semantic-release/git",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "zip -qq -r logseq-hitokoto-yiyan-v${nextRelease.version}.zip dist README.md logo.svg LICENSE package.json"
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: ["logseq-hitokoto-yiyan-v*.zip"]
      }
    ]
  ]
}
