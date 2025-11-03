function postcss(plugins = []) {
  return {
    process: async (css) => ({ css, plugins })
  };
}

module.exports = postcss;
module.exports.default = postcss;
