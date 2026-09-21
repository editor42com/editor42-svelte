import { Assertions, Waiter } from '@ephox/agar';
import { after, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';

import { EDITOR42_LOCAL, pLoadEditor42, render, unloadAllEngines } from '../alien/Loader';

describe('LoadEditorTest', () => {
  const w = window as any;

  const currentScriptSrcs = (): string[] =>
    Array.from(document.querySelectorAll<HTMLScriptElement>('script'))
      .map((s) => s.getAttribute('src') ?? '')
      .filter((s) => s.length > 0);

  // Mount without waiting for the editor: the fallback URL points at the real CDN,
  // which this environment never reaches. Returns the script srcs the component added.
  const pMountAndCollectScriptSrcs = async (props: Record<string, unknown>): Promise<string[]> => {
    const before = currentScriptSrcs();
    const bodyChildrenBefore = new Set(Array.from(document.body.children));
    const renderPromise = render(props);
    renderPromise.catch(() => undefined); // the editor never initialises in these tests
    let added: string[] = [];
    await Waiter.pTryUntil('a script tag was injected', () => {
      added = Arr.filter(currentScriptSrcs(), (s) => !Arr.contains(before, s));
      if (added.length === 0) {
        throw new Error('no new script tag yet');
      }
    });
    // the abandoned mount never resolves, so its container has to be swept by hand
    Arr.each(Array.from(document.body.children), (el) => {
      if (!bodyChildrenBefore.has(el)) {
        el.remove();
      }
    });
    return added;
  };

  beforeEach(() => {
    unloadAllEngines();
  });

  after(() => {
    unloadAllEngines();
  });

  it('loads a local editor42 build via the scriptSrc prop', async () => {
    using ctx = await render({ scriptSrc: EDITOR42_LOCAL });
    Assertions.assertEq('majorVersion is the TinyMCE 6 api level', '6', w.editor42.majorVersion);
    Assertions.assertEq('minorVersion is 42-family', true, w.editor42.minorVersion.startsWith('42.'));
    Assertions.assertEq('editor belongs to editor42', true, ctx.editor.editorManager === w.editor42);
  });

  it('falls back to the latest channel with no props at all', async () => {
    const srcs = await pMountAndCollectScriptSrcs({});
    Assertions.assertEq('exactly the latest channel url',
      [ 'https://cdn.editor42.com/editor42/latest/editor42.min.js' ], srcs);
  });

  it('the channel prop selects the cdn path', async () => {
    const srcs = await pMountAndCollectScriptSrcs({ channel: '42.0.0' });
    Assertions.assertEq('exact version',
      [ 'https://cdn.editor42.com/editor42/42.0.0/editor42.min.js' ], srcs);
  });

  it('legacy channel values map to latest', async () => {
    const srcs = await pMountAndCollectScriptSrcs({ channel: '7' });
    Assertions.assertEq('tinymce channel mapped',
      [ 'https://cdn.editor42.com/editor42/latest/editor42.min.js' ], srcs);
  });

  it('never contacts tiny.cloud and never sends a key, whatever key props are set', async () => {
    const srcs = await pMountAndCollectScriptSrcs({ apiKey: 'a-fake-api-key', licenseKey: 'gpl', channel: '7' });
    Assertions.assertEq('exactly the editor42 cdn url',
      [ 'https://cdn.editor42.com/editor42/latest/editor42.min.js' ], srcs);
    Arr.each(srcs, (src) => {
      Assertions.assertEq('no tiny.cloud contact', false, Strings.contains(src, 'tiny.cloud'));
      Assertions.assertEq('no key in the url', false,
        Strings.contains(src, 'a-fake-api-key') || Strings.contains(src, 'no-api-key'));
    });
  });
});
