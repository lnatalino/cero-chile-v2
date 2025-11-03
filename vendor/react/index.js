function createElement(type, props, ...children) {
  const normalizedChildren = children.length === 1 ? children[0] : children;
  return { type, props: { ...(props || {}), children: normalizedChildren } };
}

const Fragment = Symbol.for('react.fragment');

function useState(initialValue) {
  let value = typeof initialValue === 'function' ? initialValue() : initialValue;
  const setValue = (next) => {
    value = typeof next === 'function' ? next(value) : next;
  };
  return [value, setValue];
}

function useEffect() {}
function useMemo(factory) {
  return factory();
}
function useCallback(fn) {
  return fn;
}

module.exports = {
  createElement,
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  version: '18.3.0',
};
