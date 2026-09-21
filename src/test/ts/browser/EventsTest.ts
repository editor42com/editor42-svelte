import { TestStore } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';

import * as Loader from '../alien/Loader';
import { ENGINES } from '../alien/TestHelpers';

describe('EventTest', () => {
  ENGINES.forEach((version) =>
    Loader.withVersion(version, (render) => {
      const store = TestStore<string>();
      const eventHandlers = {
        init: () => {
          store.add('init');
        },
        loadcontent: () => {
          store.add('loadcontent');
        }
      };
      const defaultProps: Loader.EditorProps = { ...eventHandlers };

      it('TINYINT-3435: event handlers are handled correctly', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        using ctx = await render({ ...defaultProps });
        store.assertEq('Events should be fired', [
          'loadcontent',
          'init',
        ]);
      });
    })
  );
});
