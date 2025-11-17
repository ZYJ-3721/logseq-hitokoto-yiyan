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
        prepareCmd: "zip -qq -r logseq-hitokoto-yiyan-v${nextRelease.version}.zip dist README.md demo.gif settings.png logo.svg package.json LICENSE"
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
