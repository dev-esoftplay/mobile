const { withGradleProperties } = require("@expo/config-plugins");

const withIncreasedHeapSize = (config) => {
  return withGradleProperties(config, (config) => {
    // Filter out any existing `org.gradle.jvmargs` property
    config.modResults = config.modResults.filter(
      (item) => item.key !== "org.gradle.jvmargs"
    );

    config.modResults.push({
      type: "property",
      key: "org.gradle.jvmargs",
      value: "-Xmx4g", // Adjust heap size (e.g., 4g)
    });

    return config;
  });
};

module.exports = withIncreasedHeapSize;
