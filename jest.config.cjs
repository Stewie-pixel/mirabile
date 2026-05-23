module.exports = {
    forceExit: true,
    reporters: [
        "default",
        ["jest-junit", {
            outputDirectory: "test-results",
            outputName: "junit.xml"
        }]
    ]
}