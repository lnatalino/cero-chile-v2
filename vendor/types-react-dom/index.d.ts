declare module 'react-dom' {
  import type { ReactNode } from 'react';

  export function render(element: ReactNode, container: unknown): void;
  const ReactDOM: {
    render: typeof render;
  };
  export default ReactDOM;
}

declare module 'react-dom/server' {
  import type { ReactNode } from 'react';
  export function renderToString(element: ReactNode): string;
}
