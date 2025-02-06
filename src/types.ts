// Add these new types
export interface ArtworkData {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  imageUrl: string;
  colors: Array<{
    percentage: number;
    hex: string;
  }>;
  dimensions?: {
    height: number;
    width: number;
    unit: string;
  };
}

export interface SearchParams {
  query?: string;
  artist?: string;
  type?: string;
  century?: number;
  color?: string;
  hasImage?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TimelineArtwork {
  year: string;
  title: string;
  objectNumber: string;
  description: string;
  image: string | null;
}

export interface ArtworkSearchResult {
  id: string;
  objectNumber: string;
  title: string;
  principalOrFirstMaker: string;
  longTitle: string;
  subTitle: string;
  scLabelLine: string;
  location: string;
  webImage?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface SearchArtworkArguments {
  q?: string;
  involvedMaker?: string;
  type?: string;
  material?: string;
  technique?: string;
  century?: number;
  color?: string;
  imgonly?: boolean;
  toppieces?: boolean;
  sortBy?: 'relevance' | 'objecttype' | 'chronologic' | 'achronologic' | 'artist' | 'artistdesc';
  p?: number;
  ps?: number;
  culture?: 'nl' | 'en';
}

export interface ArtworkDetails {
  elapsedMilliseconds: number;
  artObject: {
    links: {
      search: string;
    };
    id: string;
    priref: string;
    objectNumber: string;
    language: string;
    title: string;
    copyrightHolder: string | null;
    webImage?: {
      guid: string;
      offsetPercentageX: number;
      offsetPercentageY: number;
      width: number;
      height: number;
      url: string;
    };
    colors: Array<{
      percentage: number;
      hex: string;
    }>;
    colorsWithNormalization: Array<{
      originalHex: string;
      normalizedHex: string;
    }>;
    normalizedColors: Array<{
      percentage: number;
      hex: string;
    }>;
    normalized32Colors: Array<{
      percentage: number;
      hex: string;
    }>;
    materialsThesaurus: string[];
    techniquesThesaurus: string[];
    productionPlacesThesaurus: string[];
    titles: string[];
    description: string;
    labelText: string | null;
    objectTypes: string[];
    objectCollection: string[];
    makers: any[];
    principalMakers: Array<{
      name: string;
      unFixedName: string;
      placeOfBirth: string;
      dateOfBirth: string;
      dateOfBirthPrecision: string | null;
      dateOfDeath: string;
      dateOfDeathPrecision: string | null;
      placeOfDeath: string;
      occupation: string[];
      roles: string[];
      nationality: string;
      biography: string | null;
      productionPlaces: string[];
      qualification: string | null;
      labelDesc: string;
    }>;
    plaqueDescriptionDutch: string | null;
    plaqueDescriptionEnglish: string | null;
    principalMaker: string;
    artistRole: string | null;
    associations: string[];
    acquisition: {
      method: string;
      date: string;
      creditLine: string;
    };
    exhibitions: any[];
    materials: string[];
    techniques: string[];
    productionPlaces: string[];
    dating: {
      presentingDate: string;
      sortingDate: number;
      period: number;
      yearEarly: number;
      yearLate: number;
    };
    classification: {
      iconClassIdentifier: string[];
    };
    hasImage: boolean;
    historicalPersons: string[];
    inscriptions: string[];
    documentation: string[];
    catRefRPK: string[];
    principalOrFirstMaker: string;
    dimensions: Array<{
      unit: string;
      type: string;
      precision: string | null;
      part: string | null;
      value: string;
    }>;
    physicalProperties: string[];
    physicalMedium: string;
    longTitle: string;
    subTitle: string;
    scLabelLine: string;
    label: {
      title: string;
      makerLine: string;
      description: string;
      notes: string | null;
      date: string;
    };
    showImage: boolean;
    location: string;
  };
}

export interface ImageTiles {
  levels: Array<{
    name: string;      // Level identifier (e.g., 'z0' for highest resolution, 'z6' for lowest)
    width: number;     // Total width of the image at this zoom level
    height: number;    // Total height of the image at this zoom level
    tiles: Array<{
      x: number;       // Horizontal position of the tile (0-based)
      y: number;       // Vertical position of the tile (0-based)
      url: string;     // URL to the tile image
    }>;
  }>;
}

export interface UserSet {
  links: {
    self: string;
    web: string;
  };
  id: string;
  count: number;
  type: string;
  name: string;
  slug: string;
  description: string | null;
  user: {
    id: number;
    name: string;
    lang: string;
    avatarUrl: string | null;
    headerUrl: string | null;
    initials: string;
  };
  createdOn: string;
  updatedOn: string;
}

export interface UserSetsResponse {
  count: number;
  elapsedMilliseconds: number;
  userSets: UserSet[];
}

export interface GetUserSetsArguments {
  page?: number;
  pageSize?: number;
  culture?: 'nl' | 'en';
}

export interface OpenImageArguments {
  imageUrl: string;
}

export interface Prompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export interface UserSetDetails {
  elapsedMilliseconds: number;
  userSet: {
    links: {
      overview: string;
      web: string;
    };
    id: string;
    count: number;
    type: string;
    name: string;
    slug: string;
    description: string | null;
    user: {
      id: number;
      name: string;
      lang: string;
      avatarUrl: string | null;
      headerUrl: string | null;
      initials: string;
    };
    setItems: Array<{
      links: {
        artobject: string;
        web: string;
      };
      id: string;
      objectNumber: string;
      relation: string;
      relationDescription: string;
      cropped: boolean;
      cropX: number;
      cropY: number;
      cropWidth: number;
      cropHeight: number;
      origWidth: number;
      origHeight: number;
      image: {
        guid: string;
        parentObjectNumber: string;
        cdnUrl: string;
        cropX: number;
        cropY: number;
        width: number;
        height: number;
        offsetPercentageX: number;
        offsetPercentageY: number;
      };
    }>;
    createdOn: string;
    updatedOn: string;
  };
}

export interface GetUserSetDetailsArguments {
  setId: string;
  culture?: 'nl' | 'en';
  page?: number;
  pageSize?: number;
} 