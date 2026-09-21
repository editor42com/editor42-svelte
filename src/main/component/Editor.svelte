<!--
  @component

-->

<script lang="ts" module>
  declare let global: { editor42?: Editor42; tinymce?: Editor42 };
  declare let window: Window & { editor42?: Editor42; tinymce?: Editor42 };

  const uuid = (prefix: string): string => prefix + '_' + Math.floor(Math.random() * 1000000000) + String(Date.now());

  const isDisabledOptionSupported = (editor: Editor42Editor): boolean => typeof editor.options.set === 'function' && editor.options.isRegistered('disabled');

  const createScriptLoader = () => {
    let state: {
      listeners: Array<() => void>;
      scriptId: string;
      scriptLoaded: boolean;
      injected: boolean;
    } = {
      listeners: [],
      scriptId: uuid('editor42-script'),
      scriptLoaded: false,
      injected: false
    };

    const injectScript = (scriptId: string, doc: Document, url: string, cb: () => void) => {
      state.injected = true;
      const script = doc.createElement('script');
      script.referrerPolicy = 'origin';
      script.type = 'application/javascript';
      script.src = url;
      script.onload = () => {
        cb();
      };
      if (doc.head) {
        doc.head.appendChild(script);
      }
    };

    const load = (doc: Document, url: string, callback: () => void) => {
      if (state.scriptLoaded) {
        callback();
      } else {
        state.listeners.push(callback);
        // check we can access doc
        if (!state.injected) {
          injectScript(state.scriptId, doc, url, () => {
            state.listeners.forEach((fn) => fn());
            state.scriptLoaded = true;
          });
        }
      }
    };

    return {
      load
    };
  };
  let scriptLoader = createScriptLoader();

  // Only to be used by tests.
  export const reinitializeScriptLoader = (): void => {
    scriptLoader = createScriptLoader();
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Editor42, Editor as Editor42Editor } from 'editor42';

  import { bindHandlers, normalizeChannel, type EventHandlers } from './Utils';

  type EditorOptions = Parameters<Editor42['init']>[0];
  type LegacyChannel = `${'4' | '5' | '6' | '7' | '8'}${'' | '-dev' | '-testing' | `.${number}` | `.${number}.${number}`}`;
  type Channel = 'latest' | `latest-${number}` | `42.${number}` | `42.${number}.${number}` | LegacyChannel;

  export interface EditorProps extends Partial<EventHandlers> {
    id?: string; // default values
    inline?: boolean | undefined;
    disabled?: boolean;
    readonly?: boolean;
    apiKey?: string;
    licenseKey?: string | undefined;
    channel?: Channel;
    scriptSrc?: string | undefined;
    conf?: EditorOptions;
    modelEvents?: string;
    value?: string;
    text?: string;
    cssClass?: string;
  }

  let {
    id = uuid('editor42-svelte'),
    inline = undefined,
    disabled = false,
    readonly = false,
    // Removed: accepted so existing code compiles, never read or sent anywhere.
    apiKey = undefined,
    licenseKey = undefined,
    channel = 'latest',
    scriptSrc = undefined,
    conf = {},
    modelEvents = 'change input undo redo',
    value = $bindable(''),
    text = $bindable(''),
    cssClass = 'editor42-wrapper',
    ...eventHandlers
  }: EditorProps = $props();
  let container: HTMLElement | undefined;
  // svelte-ignore non_reactive_update
  let element: HTMLElement | undefined;
  let editorRef: Editor42Editor | undefined = $state();
  // The following three variables are not meant to be reactive, but we need to track them to avoid unnecessary editor updates.
  let lastVal = $state.snapshot(value);
  // svelte-ignore state_referenced_locally
  let disablindCache = $state.snapshot(disabled);
  // svelte-ignore state_referenced_locally
  let readonlyCache = $state.snapshot(readonly);

  const setReadonly = (editor: Editor42Editor, readonlyValue: boolean) => {
    if (typeof editor.mode?.set === 'function') {
      editor.mode.set(readonlyValue ? 'readonly' : 'design');
    }
  };

  const setDisabled = (editor: Editor42Editor, disabledValue: boolean) => {
    if (isDisabledOptionSupported(editor)) {
      editor.options.set('disabled', disabledValue);
    } else {
      editor.mode.set(disabledValue ? 'readonly' : 'design');
    }
  };

  $effect(() => {
    if (editorRef && lastVal !== value) {
      editorRef.setContent(value);
      text = editorRef.getContent({ format: 'text' });
    }
    if (editorRef && readonly !== readonlyCache) {
      readonlyCache = readonly;
      setReadonly(editorRef, readonly);
    }
    if (editorRef && disabled !== disablindCache) {
      disablindCache = disabled;
      setDisabled(editorRef, disabled);
    }
  });

  // Resolve the engine global. Editor42 wins when both engines are on the page; a real
  // TinyMCE is a supported fallback so this component can drive either engine.
  const getEditor42 = (): Editor42 | null => {
    const getSink = (): { editor42?: Editor42; tinymce?: Editor42 } => typeof window !== 'undefined' ? window : global;
    const sink = getSink();
    return sink?.editor42 ?? sink?.tinymce ?? null;
  };

  const init = () => {
    const finalInit: EditorOptions = {
      ...conf,
      target: element,
      // eslint-disable-next-line no-nested-ternary
      inline: inline !== undefined ? inline : conf.inline !== undefined ? conf.inline : false,
      setup: (editor: Editor42Editor) => {
        editor.on('PreInit', () => {
          setDisabled(editor, disabled);
          setReadonly(editor, readonly);
        });
        editorRef = editor;
        editor.on('init', () => {
          editor.setContent(value);
          // bind model events
          editor.on(modelEvents, () => {
            lastVal = editor.getContent();
            if (lastVal !== value) {
              value = lastVal;
              text = editor.getContent({ format: 'text' });
            }
          });
        });
        bindHandlers(editor, eventHandlers);
        if (typeof conf.setup === 'function') {
          conf.setup(editor);
        }
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    element!.style.visibility = '';
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    void getEditor42()?.init(finalInit);
  };

  onMount(() => {
    if (getEditor42() !== null) {
      init();
    } else {
      // with no scriptSrc the script comes from the editor42 cdn, no key of any kind
      const script = scriptSrc ? scriptSrc : `https://cdn.editor42.com/editor42/${normalizeChannel(channel)}/editor42.min.js`;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      scriptLoader.load(container!.ownerDocument, script, () => {
        init();
      });
    }
  });

  onDestroy(() => {
    if (editorRef) {
      getEditor42()?.remove(editorRef);
    }
  });
</script>

<div bind:this={container} class={cssClass}>
{#if inline}
  <div id={id} bind:this={element}></div>
{:else}
  <textarea id={id} bind:this={element} style="visibility:hidden"></textarea>
{/if}
</div>