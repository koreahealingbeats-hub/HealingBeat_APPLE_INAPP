const { withPodfile } = require("@expo/config-plugins");

const withFmtFix = (config) => {
  return withPodfile(config, (config) => {
    const patchCode = `
    # Fix fmt consteval compilation error with Xcode 16+
    fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      content = File.read(fmt_base)
      # More aggressive replacement for FMT_USE_CONSTEVAL 1
      patched = content.gsub(/#\\s+define FMT_USE_CONSTEVAL 1/, "#  define FMT_USE_CONSTEVAL 0")
      if patched != content
        File.chmod(0644, fmt_base)
        File.write(fmt_base, patched)
        puts "Successfully patched fmt/base.h for Xcode 16 compatibility"
      end
    end

    # Fix folly coroutine compilation error with Xcode 16+
    installer.pods_project.targets.each do |target|
      if target.name == 'RCT-Folly'
        target.build_configurations.each do |config|
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAS_COROUTINES=0'
        end
        puts "Successfully patched RCT-Folly to disable coroutines for Xcode 16 compatibility"
      end
    end`;

    if (config.modResults.contents.includes("fmt_base")) {
      return config;
    }

    if (config.modResults.contents.includes("post_install do |installer|")) {
      config.modResults.contents = config.modResults.contents.replace(
        /(post_install do \|installer\|[\s\S]*?)(\s+end)/,
        (match, p1, p2) => p1 + patchCode + p2
      );
    } else {
      config.modResults.contents += `
post_install do |installer|
${patchCode}
end
`;
    }

    return config;
  });
};

module.exports = withFmtFix;
