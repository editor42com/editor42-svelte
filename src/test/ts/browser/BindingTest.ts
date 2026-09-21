import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';

import * as Loader from '../alien/Loader';
import { ENGINES } from '../alien/TestHelpers';
import { TinyAssertions } from '@ephox/mcagar';

describe('BindingTest', () => {
  ENGINES.forEach((version) =>
    Loader.withVersion(version, (render) => {
      const defaultProps: Loader.EditorProps = {};

      it('TINYINT-3435: value prop is bound to the editor\'s content', async () => {
        const initialValue = '<p>Hello, World!</p>';
        const newValue = '<p>New Content</p>';
        // the debranded engine renames mce* commands to editor42*
        const setContentCommand = version === 'editor42' ? 'editor42SetContent' : 'mceSetContent';
        using ctx = await render({ ...defaultProps, value: initialValue });
        TinyAssertions.assertContent(ctx.editor, initialValue);
        ctx.editor.execCommand(setContentCommand, false, newValue);
        Assertions.assertEq('value prop should be updated', newValue, ctx.getProps('value'));
      });
    })
  );
});
