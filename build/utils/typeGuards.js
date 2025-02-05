export function isSearchArtworkArguments(args) {
    if (!args || typeof args !== 'object')
        return false;
    const { query } = args;
    return typeof query === 'string';
}
export function isOpenImageArguments(args) {
    if (!args || typeof args !== 'object')
        return false;
    const { imageUrl } = args;
    return typeof imageUrl === 'string' && imageUrl.startsWith('http');
}
