import { SearchArtworkArguments, OpenImageArguments } from '../types.js';

export function isSearchArtworkArguments(args: unknown): args is SearchArtworkArguments {
  if (!args || typeof args !== 'object') return false;
  const params = args as any;

  // Check types of optional parameters if they exist
  if (params.q !== undefined && typeof params.q !== 'string') return false;
  if (params.involvedMaker !== undefined && typeof params.involvedMaker !== 'string') return false;
  if (params.type !== undefined && typeof params.type !== 'string') return false;
  if (params.material !== undefined && typeof params.material !== 'string') return false;
  if (params.technique !== undefined && typeof params.technique !== 'string') return false;
  if (params.century !== undefined && typeof params.century !== 'number') return false;
  if (params.color !== undefined && typeof params.color !== 'string') return false;
  if (params.imgonly !== undefined && typeof params.imgonly !== 'boolean') return false;
  if (params.toppieces !== undefined && typeof params.toppieces !== 'boolean') return false;
  if (params.p !== undefined && typeof params.p !== 'number') return false;
  if (params.ps !== undefined && typeof params.ps !== 'number') return false;
  if (params.culture !== undefined && !['nl', 'en'].includes(params.culture)) return false;
  if (params.sortBy !== undefined && !['relevance', 'objecttype', 'chronologic', 'achronologic', 'artist', 'artistdesc'].includes(params.sortBy)) return false;

  // At least one search parameter should be provided
  return !!(params.q || params.involvedMaker || params.type || params.material || 
           params.technique || params.century || params.color);
}

export function isOpenImageArguments(args: unknown): args is OpenImageArguments {
  if (!args || typeof args !== 'object') return false;
  const { imageUrl } = args as any;
  return typeof imageUrl === 'string' && imageUrl.startsWith('http');
} 