declare module 'next/navigation' {
  export function redirect(destination: string): never;
  export function notFound(): never;
}

declare module 'next/headers' {
  interface CookieValue {
    name: string;
    value: string;
  }
  interface CookieStore {
    get(name: string): CookieValue | undefined;
    set(cookie: { name: string; value: string }): void;
    delete(cookie: { name: string }): void;
  }
  export function cookies(): Promise<CookieStore>;
}

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(data: unknown, init?: ResponseInit): NextResponse;
    static redirect(url: string, status?: number): NextResponse;
  }
  export const NextRequest: typeof Request;
}

declare module 'next/link' {
  import type { ReactElement, ReactNode } from 'react';
  export interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    target?: string;
    rel?: string;
    [key: string]: unknown;
  }
  const Link: (props: LinkProps) => ReactElement;
  export default Link;
}
