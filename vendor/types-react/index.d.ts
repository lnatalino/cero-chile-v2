declare module 'react' {
  export type ReactText = string | number;
  export type ReactChild = ReactElement | ReactText;
  export type ReactNode = ReactChild | boolean | null | undefined | ReactNode[] | Promise<ReactChild | ReactNode[]>;
  export type Key = string | number;
  export interface Attributes {
    key?: Key | null;
  }
  export interface RefObject<T> {
    current: T | null;
  }
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactNode | Promise<ReactNode>;
  export interface JSXElementConstructor<P> {
    (props: P): ReactNode | Promise<ReactNode>;
  }
  export interface ExoticComponent<P = {}> {
    (props: P): ReactNode;
  }
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  export interface Context<T> {
    Provider: FC<{ value: T }>;
    Consumer: FC<{ value: T }>;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;
  export function createElement(type: any, props?: any, ...children: ReactNode[]): ReactElement;
  export const Fragment: unique symbol;
  export function useState<S>(initialState: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: unknown[]): T;

  export interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }): ReactNode | Promise<ReactNode>;
  }

  export interface PropsWithChildren<P> extends P {
    children?: ReactNode;
  }

  const React: {
    createElement: typeof createElement;
    Fragment: typeof Fragment;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    version: string;
  };

  export default React;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: any;
  }
  type Element = import('react').ReactElement | Promise<import('react').ReactElement>;
}
