export type Version = '6' | '7' | '7.5' | '8';
export const VERSIONS: Version[] = [ '6', '7', '8' ];
// Editor42 first: it is the engine this component targets; the TinyMCE versions stay
// as the compatibility matrix.
export const ENGINES: Array<Version | 'editor42'> = [ 'editor42', ...VERSIONS ];
