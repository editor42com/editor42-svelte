import { after, before, context } from '@ephox/bedrock-client';
import { Remove, SugarElement } from '@ephox/sugar';
import { VersionLoader } from '@tinymce/miniature';
import { flushSync, mount, unmount } from 'svelte';
import type { Editor as Editor42Editor } from 'editor42';
import { type EventHandlers } from '../../../main/component/Utils';
import type { Version } from './TestHelpers';

// @ts-expect-error Remove when dispose polyfill is not needed
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error Remove when dispose polyfill is not needed
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

const editorModule = require('!!../../../../scripts/svelte-loader.js!../../../main/component/Editor.svelte');
const Editor: any = editorModule.default;
const reinitializeScriptLoader: () => void = editorModule.reinitializeScriptLoader;
// proxy() is the runtime equivalent of $state({}) for objects — mutations trigger reactive updates
// in the mounted component exactly as $state would inside a .svelte file.
const { proxy }: { proxy: <T extends object>(val: T) => T } = require('svelte/internal/client');

export interface EditorProps extends Partial<EventHandlers> {
  [key: string]: unknown;
  id?: string;
  inline?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  apiKey?: string;
  licenseKey?: string;
  channel?: string;
  scriptSrc?: string;
  conf?: Record<string, unknown>;
  modelEvents?: string;
  value?: string;
  cssClass?: string;
}

export interface SvelteEditorContext extends Disposable {
  editor: Editor42Editor;
  DOMNode: HTMLElement;
  componentInstance: Record<string, any>;
  /** Update any props on the live component instance and flush Svelte reactivity synchronously. */
  setProps(patch: Partial<EditorProps>): void;
  getProps(name: keyof EditorProps): unknown;
  remove(): void;
}

export type RenderFn = (props?: EditorProps) => Promise<SvelteEditorContext>;

export const render = async (props: EditorProps = {}): Promise<SvelteEditorContext> => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const userConf: Record<string, unknown> = (props.conf as Record<string, unknown>) ?? {};
  const userSetup = typeof userConf.setup === 'function' ? userConf.setup as (editor: Editor42Editor) => void : undefined;

  // Reactive proxy — mutations via setProps() propagate into the mounted component.
  const reactiveProps = proxy({
    ...props,
    licenseKey: props.licenseKey ?? 'gpl',
  }) as Record<string, unknown>;

  let componentInstance!: Record<string, any>;

  const { editor, DOMNode } = await new Promise<{ editor: Editor42Editor; DOMNode: HTMLElement }>((resolve, reject) => {
    reactiveProps.conf = {
      ...userConf,
      setup: (ed: Editor42Editor) => {
        if (userSetup) {
          userSetup(ed);
        }
        ed.on('SkinLoaded', () => {
          setTimeout(() => {
            const dNode = ed.targetElm as HTMLElement;
            if (dNode) {
              resolve({ editor: ed, DOMNode: dNode });
            } else {
              reject(new Error('Could not find DOMNode after SkinLoaded'));
            }
          }, 0);
        });
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    componentInstance = mount(Editor, { target: container, props: reactiveProps });
  });

  const setProps = (patch: Partial<EditorProps>) => {
    Object.assign(reactiveProps, patch);
    flushSync();
  };

  const getProps = (name: string): any => reactiveProps[name];

  const remove = () => {
    unmount(componentInstance).catch((reason) => {
      // eslint-disable-next-line no-console
      console.error(reason);
    });
    Remove.remove(SugarElement.fromDom(container));
  };

  return {
    editor,
    DOMNode,
    componentInstance,
    setProps,
    getProps,
    remove,
    [Symbol.dispose]: remove
  };
};

const unloadTinymce = () => {
  const win = window as Window & { tinymce?: unknown };
  if (win.tinymce && typeof (win.tinymce as any).remove === 'function') {
    (win.tinymce as any).remove();
  }
  document.querySelectorAll('script[src*="/node_modules/tinymce"]').forEach((el) => el.remove());
  document.querySelectorAll('link[href*="/node_modules/tinymce"]').forEach((el) => el.remove());
  delete win.tinymce;
};

export const EDITOR42_LOCAL = '/project/node_modules/editor42/editor42.min.js';

// Drop editor42 (and the shim aliases it may have installed) so a following context can
// load the engine it actually asked for.
export const unloadEditor42 = () => {
  const win = window as Window & { editor42?: unknown; tinymce?: unknown; tinyMCE?: unknown; EDITOR42_NO_SHIM?: unknown };
  if (win.editor42 && typeof (win.editor42 as any).remove === 'function') {
    (win.editor42 as any).remove();
  }
  if (win.tinymce !== undefined && win.tinymce === win.editor42) {
    delete win.tinymce;
  }
  if (win.tinyMCE !== undefined && win.tinyMCE === win.editor42) {
    delete win.tinyMCE;
  }
  delete win.editor42;
  delete win.EDITOR42_NO_SHIM;
  document.querySelectorAll('script[src*="editor42"]').forEach((el) => el.remove());
  document.querySelectorAll('link[href*="editor42"]').forEach((el) => el.remove());
};

// Full engine sweep so every test file is self-cleaning whatever order files run in.
export const unloadAllEngines = () => {
  reinitializeScriptLoader();
  unloadEditor42();
  unloadTinymce();
};

export const pLoadEditor42 = (options: { noShim?: boolean } = {}): Promise<void> => {
  unloadEditor42();
  if (options.noShim) {
    (window as any).EDITOR42_NO_SHIM = true;
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = EDITOR42_LOCAL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('failed to load ' + EDITOR42_LOCAL));
    document.head.appendChild(script);
  });
};

export const withVersion = (version: Version | 'editor42', fn: (render: RenderFn) => void): void => {
  const label = version === 'editor42' ? 'Editor42' : `TinyMCE (${version})`;
  context(label, () => {
    before(async () => {
      if (version === 'editor42') {
        await pLoadEditor42();
      } else {
        unloadEditor42();
        await VersionLoader.pLoadVersion(version);
      }
    });

    after(() => {
      unloadAllEngines();
    });

    fn(render);
  });
};
