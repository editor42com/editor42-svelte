# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.0.0 - 2026-09-21

### Changed
- Forked @tinymce/tinymce-svelte 4.0.1 as @editor42/editor42-svelte, targeting Editor42, and cherry-picked the upstream bedrock test harness that landed after the release.
- Renamed the identifiers this component looks for: it resolves the editor42 global and falls back to a stock TinyMCE when that is what the page has loaded.
- scriptSrc, channel and conf keep their upstream names; the no-src fallback loads from https://cdn.editor42.com on the latest channel and TinyMCE-style numeric channels resolve to latest.
- The wrapper div class defaults to editor42-wrapper.

### Removed
- All API-key and licence-key handling. The props are still accepted so existing code compiles, but no key is read, stored or sent, and no request reaches a vendor cloud.
- Vendor CI, release tooling and the vendor cloud test matrix.

## 4.0.1 - 2026-04-24

### Fixed
- TypeScript errors caused by all event handler props being incorrectly marked as required. #INT-3424

## 4.0.0 - 2026-04-13

### Added
- `svelte` to peer dependency. #INT-3311

#### Changed
- Upgraded to support Svelte 5. #INT-3311

## 3.2.0 - 2025-07-31

### Changed
- Set the default `channel` to `8`. #INT-3353
- Moved `rollup-plugin-execute` to devDependency. #INT-3353
- Updated peer dependency to support tinymce `8`. #INT-3353

## 3.1.0 - 2025-05-29

### Fixed
- tinymce "^v7.0.0 || ^v6.0.0 || ^v5.0.0" is now an optional peer dependency. #INT-3324

### Changed
- `disabled` property is now mapped to the TinyMCE `disabled` option. #TINY-11909

### Added
- Added `readonly` property that maps to the TinyMCE `readonly` option. #TINY-11909

## 3.0.0 - 2024-06-05

### Added
- Update README.md to contain license key info.
- Added storybook dependence's for various `storybook/...` packages.
- Added `react` and `react-dom` to dev-dependencies due to certain packages required it.
- Added events `Input`, `CompositionEnd`, `CompositionStart` & `CompositionUpdate`.
- Added `licenseKey` to config option.

### Changed
- Bumped `tinymce` version to `7.1.1` latest.
- Bumped default `cloud` channel to use `7`.

## 2.0.0 - 2023-12-04

### Changed
- Upgrade to Svelte 4

## 1.0.1 - 2023-03-17

### Fixed
- Editor now properly updates when external source updates value
- Storybook for inline mode corrected
- Updated dependencies
- Updated CI library to latest

## 1.0.0 - 2022-04-08

### Changed
- License: Code is provided under MIT License
- Default cloud channel value to '6'

## 0.1.2 - 2021-12-13

### Added
- `cssClass` property for wrapping div

## 0.1.1 - 2021-10-13

### Added
- onDestroy cleanup
- Linting
- Beehive flow

### Fixed
- Ignoring inline property from `conf` attribute

## 0.1.0 - 2021-08-18

### Added
- Build this thing
