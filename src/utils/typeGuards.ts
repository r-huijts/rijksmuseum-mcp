import { SearchArtworkArguments, OpenImageArguments } from '../types.js';

export function isSearchArtworkArguments(args: unknown): args is SearchArtworkArguments {
  if (!args || typeof args !== 'object') return false;
  const { query } = args as any;
  return typeof query === 'string';
}

export function isOpenImageArguments(args: unknown): args is OpenImageArguments {
  if (!args || typeof args !== 'object') return false;
  const { imageUrl } = args as any;
  return typeof imageUrl === 'string' && imageUrl.startsWith('http');
} 