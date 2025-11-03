const React = require('./index.js');

function jsx(type, props, key) {
  if (key !== undefined) {
    props = { ...(props || {}), key };
  }
  return React.createElement(type, props, ...(props && props.children !== undefined ? [props.children] : []));
}

function jsxs(type, props, key) {
  return jsx(type, props, key);
}

exports.jsx = jsx;
exports.jsxs = jsxs;
exports.Fragment = React.Fragment;
