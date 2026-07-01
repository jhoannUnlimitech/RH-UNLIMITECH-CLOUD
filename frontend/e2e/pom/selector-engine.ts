/**
 * POM Selector Engine — Proxy-based hierarchical selector builder.
 *
 * Builds CSS selectors from a schema of data-test-context / data-test-key / data-test-state
 * annotations following the UI Test Annotations steering.
 *
 * API:
 *   pom.login_form                        → navigate to context node
 *   pom.login_form(".cls", "[attr]")      → complement (appended directly, no spaces allowed)
 *   pom.login_form.ready                  → state: [data-test-state="ready"]
 *   pom.login_form._.login_inputs         → descend (space in CSS) to child
 *   pom.login_form.ready.$()              → terminal: returns the CSS selector string
 *   pom.login_form.$(' input.my-cls')     → terminal + raw CSS suffix (free-form, spaces allowed)
 *
 * The terminal ($) is always a function call:
 *   .$()        → returns the accumulated CSS selector as a string
 *   .$('css')   → returns the accumulated selector + raw CSS appended as-is
 *
 * Complements (node function call) are trimmed and must NOT contain spaces.
 * They are appended directly to the current element's selector (e.g. classes, attributes).
 *
 * Known states are defined in states.ts (single source of truth).
 *
 * Naming convention:
 *   Code uses lower_snake_case → converted to lower-kebab-case in selectors.
 *   e.g. login_form → "login-form", email_input → "email-input"
 */

// ─── Schema Definition Types ────────────────────────────────────────────────

import { type KnownState, KNOWN_STATES } from './states';

export interface ContextNode<C extends Record<string, ContextNode<any> | KeyNode<any>> = {}> {
  readonly type: 'context';
  readonly children: C;
}

export interface KeyNode<C extends Record<string, KeyNode<any>> = {}> {
  readonly type: 'key';
  readonly indexed?: boolean;
  readonly children?: C;
}

export function context<C extends Record<string, ContextNode<any> | KeyNode<any>>>(children: C): ContextNode<C>;
export function context(): ContextNode<{}>;
export function context(children: Record<string, ContextNode<any> | KeyNode<any>> = {}): ContextNode {
  return { type: 'context', children };
}

export function key<C extends Record<string, KeyNode<any>>>(opts: { indexed?: boolean; children: C }): KeyNode<C>;
export function key(opts?: { indexed?: boolean }): KeyNode<{}>;
export function key(opts?: { indexed?: boolean; children?: Record<string, KeyNode<any>> }): KeyNode {
  return { type: 'key', indexed: opts?.indexed, children: opts?.children };
}

// ─── Proxy Type System ──────────────────────────────────────────────────────

/** Terminal function: .$() or .$('raw css') */
type TerminalFn = (rawSuffix?: string) => string;

/** Base operations available on every proxy node */
interface NodeBase<Children extends Record<string, ContextNode<any> | KeyNode<any>>> {
  /** Terminal: .$() returns selector string, .$('raw') appends raw CSS */
  readonly $: TerminalFn;
  /** Descend to children */
  readonly _: ChildrenProxy<Children>;
}

/** State properties: each returns the same node shape for chaining */
type StateProps<N> = {
  readonly [S in KnownState]: N;
};

/**
 * Proxy node for a context with children C.
 * Callable for complements: pom.login_form(".cls") returns same type.
 */
interface ContextProxy<C extends Record<string, ContextNode<any> | KeyNode<any>>>
  extends NodeBase<C>, StateProps<ContextProxy<C>> {
  (...complements: string[]): ContextProxy<C>;
}

/**
 * Proxy node for a non-indexed key with optional children C.
 */
interface KeyProxy<C extends Record<string, KeyNode<any>>>
  extends NodeBase<C>, StateProps<KeyProxy<C>> {
  (...complements: string[]): KeyProxy<C>;
}

/**
 * Proxy node for an indexed key (callable with index).
 * - Called with index: product_row(1) → KeyProxy for that specific row
 * - Property access: product_row.$ → selector for all rows (without index)
 */
interface IndexedKeyProxy<C extends Record<string, KeyNode<any>>> {
  (index: number): KeyProxy<C>;
  readonly $: TerminalFn;
  readonly _: ChildrenProxy<C>;
}

/** Maps schema children to their proxy types */
type ChildrenProxy<C extends Record<string, ContextNode<any> | KeyNode<any>>> = {
  readonly [K in keyof C]:
    C[K] extends ContextNode<infer CC> ? ContextProxy<CC> :
    C[K] extends KeyNode<infer KC>
      ? (C[K] extends { indexed: true } ? IndexedKeyProxy<KC> : KeyProxy<KC>)
      : never;
};

/** Root POM type: maps top-level schema entries to proxies */
type PomProxy<T extends Record<string, ContextNode<any> | KeyNode<any>>> = ChildrenProxy<T>;

// ─── Internal State ─────────────────────────────────────────────────────────

interface SelectorState {
  segments: string[];
  currentBase: string;
  complements: string[];
  stateAttr: string;
  schemaNode: ContextNode | KeyNode | null;
  schemaChildren: Record<string, ContextNode | KeyNode>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function toKebab(snakeCase: string): string {
  return snakeCase.replace(/_/g, '-');
}

function buildCurrentSelector(state: SelectorState): string {
  return state.currentBase + state.complements.join('') + state.stateAttr;
}

function materialize(state: SelectorState): string {
  const parts = [...state.segments];
  const current = buildCurrentSelector(state);
  if (current) parts.push(current);
  return parts.join(' ');
}

function validateComplement(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes(' ')) {
    throw new Error(
      `POM: Complement "${value}" contains spaces. ` +
      `Complements are appended directly to the element (no descendant). ` +
      `Use .$('raw css') for free-form selectors with depth.`
    );
  }
  return trimmed;
}

// ─── Terminal symbol ────────────────────────────────────────────────────────

const TERMINAL = '$';

// ─── Proxy Factory ──────────────────────────────────────────────────────────

function createProxy(state: SelectorState): any {
  const handler: ProxyHandler<Function> = {
    apply(_target, _thisArg, args: string[]) {
      const validated = args.map(validateComplement);
      const newComplements = [...state.complements, ...validated];
      return createProxy({ ...state, complements: newComplements });
    },

    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol' || prop === 'then' || prop === 'toJSON') {
        return undefined;
      }

      const propStr = prop as string;

      if (propStr === TERMINAL) {
        const base = materialize(state);
        return (rawSuffix?: string) => rawSuffix ? base + rawSuffix : base;
      }

      if (propStr === '_') {
        const current = buildCurrentSelector(state);
        const newSegments = current
          ? [...state.segments, current]
          : [...state.segments];

        return createProxy({
          segments: newSegments,
          currentBase: '',
          complements: [],
          stateAttr: '',
          schemaNode: state.schemaNode,
          schemaChildren: state.schemaNode
            ? ('children' in state.schemaNode ? state.schemaNode.children ?? {} : {})
            : state.schemaChildren,
        });
      }

      if (KNOWN_STATES.has(propStr) || KNOWN_STATES.has(toKebab(propStr))) {
        const kebab = toKebab(propStr);
        return createProxy({
          ...state,
          stateAttr: `[data-test-state="${kebab}"]`,
        });
      }

      const kebab = toKebab(propStr);
      const childNode = state.schemaChildren[propStr];

      if (!childNode) {
        throw new Error(
          `POM: "${propStr}" is not a known child or state at this level. ` +
          `Available children: [${Object.keys(state.schemaChildren).join(', ')}]. ` +
          `Available states: [${[...KNOWN_STATES].join(', ')}].`
        );
      }

      const attr = childNode.type === 'context'
        ? `[data-test-context="${kebab}"]`
        : `[data-test-key="${kebab}"]`;

      if (childNode.type === 'key' && childNode.indexed) {
        const indexedProxy = (index: number) => {
          const indexedAttr = `[data-test-key="${kebab}-${index}"]`;
          return createProxy({
            ...state,
            currentBase: indexedAttr,
            complements: [],
            stateAttr: '',
            schemaNode: childNode,
            schemaChildren: childNode.children ?? {},
          });
        };

        return new Proxy(indexedProxy, {
          get(_fn, fnProp: string | symbol) {
            if (typeof fnProp === 'symbol') return undefined;
            if (fnProp === TERMINAL) {
              const base = materialize({ ...state, currentBase: attr, complements: [], stateAttr: '' });
              return (rawSuffix?: string) => rawSuffix ? base + rawSuffix : base;
            }
            if (fnProp === '_') {
              const current = buildCurrentSelector({ ...state, currentBase: attr, complements: [], stateAttr: '' });
              return createProxy({
                segments: [...state.segments, current],
                currentBase: '',
                complements: [],
                stateAttr: '',
                schemaNode: childNode,
                schemaChildren: childNode.children ?? {},
              });
            }
            return undefined;
          },
        });
      }

      return createProxy({
        ...state,
        currentBase: attr,
        complements: [],
        stateAttr: '',
        schemaNode: childNode,
        schemaChildren: childNode.type === 'context' ? childNode.children : (childNode.children ?? {}),
      });
    },
  };

  const target = function () {} as any;
  return new Proxy(target, handler);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function createPom<T extends Record<string, ContextNode<any> | KeyNode<any>>>(
  schema: T,
): PomProxy<T> {
  return createProxy({
    segments: [],
    currentBase: '',
    complements: [],
    stateAttr: '',
    schemaNode: null,
    schemaChildren: schema,
  }) as PomProxy<T>;
}
