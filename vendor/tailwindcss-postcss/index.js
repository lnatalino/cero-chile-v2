module.exports = function tailwindcssPostcss() {
  return {
    postcssPlugin: '@tailwindcss/postcss',
    Once(root) {
      return root;
    }
  };
};

module.exports.postcss = true;
