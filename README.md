# Official Editor42 Svelte component

## About

This package is a thin wrapper around [Editor42](https://github.com/editor42com/editor42),
the auditable MIT fork of TinyMCE 6, to make it easier to use in a Svelte 5 application.

Documentation lives at [editor42.com](https://editor42.com/docs).

## Installation

```sh
npm install @editor42/editor42-svelte
```

## Usage

```svelte
<script>
  import Editor from '@editor42/editor42-svelte';
</script>

<Editor conf={{ height: 400 }} value="<p>Hello from Editor42</p>" />
```

With no extra props the editor script is loaded from `https://cdn.editor42.com` on the
`latest` channel. There is no account, no sign-up and no key of any kind. The `latest`
pointer only ever moves for security and bug-fix releases, because the Editor42 major
version is fixed forever.

## Self-hosting

Point the component at your own copy of the script (the full file URL; editor42 and
TinyMCE builds both work):

```svelte
<Editor scriptSrc="/js/editor42/editor42.min.js" />
```

## Pinning a version

```svelte
<Editor channel="42.0.0" />
```

`channel` accepts `latest`, a `latest-N` alias, or an exact version.

## Editor options

Everything else is an Editor42 option, passed through `conf`:

```svelte
<Editor conf={{ height: 400, menubar: false, plugins: 'lists link' }} />
```

See the [Editor42 documentation](https://editor42.com/docs) for the full list.

## Migrating from the TinyMCE Svelte component

```sh
npm uninstall @tinymce/tinymce-svelte
npm install @editor42/editor42-svelte
```

Change the import to `@editor42/editor42-svelte` and you are done. `scriptSrc`, `channel` and
`conf` keep their names, and TinyMCE-style numeric channels resolve to `latest`.

All API-key and licence-key handling has been removed. The corresponding props are still
accepted so existing code compiles, but they do nothing: no key is read, stored or sent
anywhere, and no request ever reaches a vendor cloud.

The wrapper div class defaults to `editor42-wrapper` (it was `tinymce-wrapper`); set the
`cssClass` prop if your styles target the old name.

The component also drives a stock TinyMCE if that is what is already loaded on the page,
which keeps the switch reversible. Configuring TinyMCE itself is outside the scope of
this package.

## Issues

Found an issue or have a feature request? Open an
[issue](https://github.com/editor42com/editor42-svelte/issues) or submit a pull request.
For issues with the editor itself, use the
[Editor42 repository](https://github.com/editor42com/editor42/issues).

## License

MIT. See [LICENSE.txt](LICENSE.txt).
