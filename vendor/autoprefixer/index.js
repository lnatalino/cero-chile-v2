module.exports = function autoprefixer() {
  return {
    postcssPlugin: 'autoprefixer',
    Once(root) {
      return root;
    }
  };
};

module.exports.postcss = true;
