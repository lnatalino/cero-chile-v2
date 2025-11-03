const React = require('react');

function render(element, container) {
  if (container && container.innerHTML !== undefined) {
    container.innerHTML = JSON.stringify(element);
  }
  return element;
}

module.exports = { render };
