import { Cache, ContentType } from 'stremio-addon-sdk';
import addonBuilder from 'stremio-addon-sdk/src/builder';
import { manifest } from './manifest';
import {
  buildSearchQuery,
  calculateBitrate,
  createStreamPath,
  createStreamUrl,
  getDuration,
  getFileExtension,
  getPostTitle,
  getRecommendedInternetSpeed,
  getAudioQuality,
  getVideoQuality,
  getSize,
  isBadVideo,
  logError,
  matchesTitle,
  getAlternativeTitles,
  isAuthError,
} from './utils';
import {
  EasynewsAPI,
  SearchOptions,
  EasynewsSearchResponse,
  FileData,
} from 'easynews-plus-plus-api';
import { publicMetaProvider } from './meta';
import { Stream, VideoQuality } from './types';
import customTitlesJson from '../../../custom-titles.json';
import { getUILanguage, translations } from './i18n';
import { createLogger } from 'easynews-plus-plus-shared';
import { filenameParse } from '@ctrl/video-filename-parser';

// Extended configuration interface
interface AddonConfig {
  username: string;
  password: string;
  strictTitleMatching?: string;
  preferredLanguage?: string;
  sortingPreference?: string;
  showQualities?: string; // Comma-separated list of qualities to show
  maxResultsPerQuality?: string; // Max results per quality
  maxFileSize?: string; // Max file size in GB
  baseUrl?: string; // Scheme, host and (optional port)
  [key: string]: any;
}

type SearchResult = {
  query: string;
  result: EasynewsSearchResponse;
};

// Create a logger with Addon prefix and explicitly set the level from environment variable
export const logger = createLogger({
  prefix: 'Addon',
  level: process.env.EASYNEWS_LOG_LEVEL || undefined, // Use the environment variable if set
});

// Helper to create a localized auth error stream
function authErrorStream(langCode: string) {
  const lang = getUILanguage(langCode);
  return {
    streams: [
      {
        name: 'Easynews++ Auth Error',
        description: translations[lang].errors.authFailed,
        url: 'https://example.com/error', // Dummy URL that won't play
        behaviorHints: {
          notWebReady: true,
        },
      },
    ],
  };
}

// Default configuration values
const DEFAULT_CONFIG = {
  strictTitleMatching: 'true',
  preferredLanguage: '',
  sortingPreference: 'quality_first',
  showQualities: '2160p,1080p,720p,480p',
  maxResultsPerQuality: '0',
  maxFileSize: '0',
};

function parseConfig(config: AddonConfig): {
  useStrictMatching: boolean;
  preferredLang: string;
  qualityFilters: string[];
  maxResultsPerQuality: number;
  maxFileSizeGB: number;
  sortOptions: Partial<SearchOptions>;
} {
  // Apply default values for any missing configuration options
  const {
    username,
    password,
    strictTitleMatching = DEFAULT_CONFIG.strictTitleMatching,
    preferredLanguage = DEFAULT_CONFIG.preferredLanguage,
    sortingPreference = DEFAULT_CONFIG.sortingPreference,
    showQualities = DEFAULT_CONFIG.showQualities,
    maxResultsPerQuality = DEFAULT_CONFIG.maxResultsPerQuality,
    maxFileSize = DEFAULT_CONFIG.maxFileSize,
    baseUrl,
    ...options
  } = config;

  /**
   * Parse strictTitleMatching option (checkbox returns string 'on' or undefined)
   * and convert it to a boolean value.
   */
  const useStrictMatching =
    config.strictTitleMatching === 'on' || config.trictTitleMatching === 'true';
  if (!config.strictTitleMatching) {
    logger.info(`Using default strictTitleMatching: ${strictTitleMatching}`);
  } else {
    logger.info(`Strict title matching: ${useStrictMatching ? 'enabled' : 'disabled'}`);
  }

  /**
   * Parse preferredLanguage option from the config.
   * If the option is not set, use the default value.
   */
  const preferredLang = config.preferredLanguage || '';
  if (!config.preferredLanguage) {
    logger.info(`Using default preferredLanguage: ${config.preferredLanguage || 'No preference'}`);
  } else {
    /**
     * Get preferred language from configuration.
     * If the option is not set, do not log anything.
     */
    logger.info(
      `Preferred language: ${config.preferredLanguage ? config.preferredLanguage : 'No preference'}`
    );
  }

  /**
   * Parse quality filters from the configuration.
   * If the option is not set, use the default value.
   */
  const qualityFilters = config.showQualities
    ? config.showQualities
        .split(',')
        .map(q => q.trim().toLowerCase())
        .filter(Boolean)
    : ['2160p', '1080p', '720p', '480p'];

  if (!config.showQualities) {
    logger.info('Using default showQualities: ' + config.showQualities);
  } else {
    logger.info(`Quality filters: ${qualityFilters.join(', ')}`);
  }

  /**
   * Parse max results per quality from the configuration.
   * If the option is not set, use the default value (0 = no limit).
   * If the value is not a number, use the default value.
   */
  let maxResultsPerQualityValue = parseInt(config.maxResultsPerQuality ?? '0', 10);
  if (Number.isNaN(maxResultsPerQualityValue) || maxResultsPerQualityValue < 0) {
    maxResultsPerQualityValue = 0;
  }
  if (!config.maxResultsPerQuality) {
    logger.info('Using default maxResultsPerQuality: ' + config.maxResultsPerQuality);
  } else {
    logger.info(
      `Max results per quality: ${maxResultsPerQualityValue === 0 ? 'No limit' : maxResultsPerQualityValue}`
    );
  }

  /**
   * Parse max file size from the configuration.
   * If the option is not set or is invalid, use the default value (0 = no limit).
   */
  let maxFileSizeGB = parseFloat(config.maxFileSize ?? '0');
  if (Number.isNaN(maxFileSizeGB) || maxFileSizeGB < 0) {
    maxFileSizeGB = 0; // Default to no limit if invalid
  }

  // Log the max file size setting
  if (!config.maxFileSize) {
    logger.info('Using default maxFileSize: ' + config.maxFileSize);
  } else {
    logger.info(`Max file size: ${maxFileSizeGB === 0 ? 'No limit' : maxFileSizeGB + ' GB'}`);
  }

  if (!config.sortingPreference) {
    logger.info(`Using default sortingPreference: ${config.sortingPreference}`);
  } else {
    logger.info(`Sorting preference from config: ${config.sortingPreference}`);
  }

  // Configure API sorting options based on user sorting preference
  const sortOptions: Partial<SearchOptions> = {
    query: '', // Will be set for each search later
  };

  // Set consistent API sorting parameters regardless of user sorting preference
  // This ensures we always get the same raw results
  // We'll handle user sorting preferences after fetching all results

  // Use parameters that give us the most complete results
  sortOptions.sort1 = 'relevance'; // Use relevance as primary sort
  sortOptions.sort1Direction = '-'; // Descending
  sortOptions.sort2 = 'dsize'; // Then size
  sortOptions.sort2Direction = '-'; // Descending
  // Set a consistent third sort option
  sortOptions.sort3 = 'dtime'; // DateTime
  sortOptions.sort3Direction = '-'; // Descending

  // Log the API sorting parameters
  logger.debug(
    `API Sorting: ${sortOptions.sort1} (${sortOptions.sort1Direction}), ${sortOptions.sort2} (${sortOptions.sort2Direction}), ${sortOptions.sort3} (${sortOptions.sort3Direction})`
  );

  return {
    useStrictMatching,
    preferredLang,
    qualityFilters,
    maxResultsPerQuality: maxResultsPerQualityValue,
    maxFileSizeGB,
    sortOptions,
  };
}

const builder = new addonBuilder(manifest);

// In-memory request cache to reduce API calls and improve response times
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getFromCache<T>(key: string): T | null {
  const cached = requestCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }

  return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
  requestCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Helper function to count the total number of unique results
 * across all searches. This is used to detect when we've reached
 * the global limit of results.
 *
 * @param allSearchResults The array of search results
 * @returns The total number of unique results
 */
function countTotalUniqueResults(allSearchResults: SearchResult[]): number {
  const uniqueHashes = new Set<string>();

  for (const { result } of allSearchResults) {
    for (const file of result.data ?? []) {
      const fileHash = file['0'];
      uniqueHashes.add(fileHash);
    }
  }

  return uniqueHashes.size;
}

// Get quality scores with improved 4K detection
const getQualityScore = (quality: VideoQuality): number => {
  if (!quality) return 0;

  if (quality === VideoQuality.UHD_4K) return 4;
  if (quality === VideoQuality.FULLHD) return 3;
  if (quality === VideoQuality.HD) return 2;
  if (quality === VideoQuality.SD) return 1;
  return 0;
};

const getResolution = (file: FileData): VideoQuality => {
  const width = file.xres;
  const height = file.yres;
  const totalPixels = width * height;
  const maxDimension = Math.max(width, height);

  if (maxDimension >= 3800 || totalPixels >= 7000000) {
    return VideoQuality.UHD_4K;
  }
  if (maxDimension >= 1900 || (maxDimension >= 1800 && totalPixels >= 1400000)) {
    return VideoQuality.FULLHD;
  }
  if (maxDimension >= 1200 || (maxDimension >= 1100 && totalPixels >= 700000)) {
    return VideoQuality.HD;
  }
  return VideoQuality.SD;
};

const compareSize = (aFile: FileData, bFile: FileData) => {
  if (aFile.rawSize > bFile.rawSize) {
    return -1;
  }
  if (aFile.rawSize < bFile.rawSize) {
    return 1;
  }
  return 0;
};

const sortByQualityAndSize = (a: Stream, b: Stream) => {
  const aFile = (a as any)._temp?.file as FileData;
  const bFile = (b as any)._temp?.file as FileData;

  const aResolution = getResolution(aFile);
  const bResolution = getResolution(bFile);

  // Extract quality scores
  const aScore = getQualityScore(aResolution);
  const bScore = getQualityScore(bResolution);

  // Compare quality scores
  if (aScore !== bScore) {
    return bScore - aScore;
  }

  // Compare sizes
  return compareSize(aFile, bFile);
};

async function searchWithTitleVariant(
  titleVariant: string,
  meta: any,
  year: number | undefined,
  type: ContentType,
  api: EasynewsAPI,
  sortOptions: Partial<SearchOptions>,
  allSearchResults: SearchResult[],
  totalFoundResults: number,
  TOTAL_MAX_RESULTS: number
): Promise<{ allSearchResults: SearchResult[]; totalFoundResults: number }> {
  // Skip empty titles
  if (!titleVariant.trim()) return { allSearchResults, totalFoundResults };

  // Stop searching if we already have enough results
  if (totalFoundResults >= TOTAL_MAX_RESULTS) {
    logger.debug(
      `Already found ${totalFoundResults} unique results, skipping additional title searches`
    );
    return { allSearchResults, totalFoundResults };
  }

  const titleMeta = { ...meta, name: titleVariant, year: year };
  const query = buildSearchQuery(type, titleMeta);
  logger.debug(`Searching for: "${query}"`);

  try {
    const res = await api.search({
      ...sortOptions,
      query,
    });

    const resultCount = res?.data?.length || 0;
    logger.debug(`Found ${resultCount} results for "${query}" with year`);

    if (resultCount > 0) {
      allSearchResults.push({ query, result: res });
      totalFoundResults = countTotalUniqueResults(allSearchResults);
      logger.debug(`Total unique results so far: ${totalFoundResults}`);

      // Log a few examples of the results
      const examples = res.data.slice(0, 2);
      for (const file of examples) {
        const title = getPostTitle(file);
        logger.debug(`Example result: "${title}" (${file['4'] || 'unknown size'})`);
      }
    }
  } catch (error) {
    logger.error(`Error searching for "${query}":`, error);

    // Check if it's an authentication error
    if (isAuthError(error)) {
      // Throw an exception
      throw error;
    }

    // Continue with other titles even if one fails
  }

  return { allSearchResults, totalFoundResults };
}

// Load custom titles
let titlesFromFile: Record<string, string[]> = {};
let loadedPath = '';

try {
  // Always use the imported JSON by default
  logger.debug('Loading custom titles from imported custom-titles.json');
  titlesFromFile = customTitlesJson;
  loadedPath = 'imported';

  // Log some details about the loaded custom titles
  const numCustomTitles = Object.keys(titlesFromFile).length;
  logger.info(`Successfully loaded ${numCustomTitles} custom titles`);

  if (numCustomTitles > 0) {
    // Log an example to verify they're loaded correctly
    const examples = Object.entries(titlesFromFile).slice(0, 1);
    for (const [original, customTitles] of examples) {
      logger.debug(`Example custom title: "${original}" -> "${customTitles.join('", "')}"`);
    }
  } else {
    logger.warn(
      'No custom titles were loaded from the file. The file might be empty or have invalid format.'
    );
  }
} catch (error) {
  logger.error('Error loading custom titles file:', error);
  logger.info('Using imported custom titles as fallback');
  titlesFromFile = customTitlesJson;
}

// Import custom template for landing page
import customTemplate from './custom-template';

// Export landing HTML for Cloudflare Worker
export const landingHTML = customTemplate(manifest);

builder.defineStreamHandler(
  async ({ id, type, config }: { id: string; type: ContentType; config: AddonConfig }) => {
    const {
      useStrictMatching,
      preferredLang,
      qualityFilters,
      maxResultsPerQuality: maxResultsPerQualityValue,
      maxFileSizeGB,
      sortOptions,
    } = parseConfig(config);

    // If the id doesn't start with tt, return empty streams
    // This is a workaround to prevent the addon from trying to
    // fetch streams for non-IMDb IDs, which the API doesn't support
    if (!id.startsWith('tt')) {
      return {
        streams: [],
      };
    }

    /**
     * Cache key is a string that includes all the user settings that might affect
     * the results of the API call. This ensures that users with different settings
     * get different cache results.
     *
     * The cache key format is:
     * <id>:v3:user=<username>:strict=<true|false>:lang=<language>:sort=<sorting preference>:qualities=<comma separated list of qualities>:maxPerQuality=<max results per quality>:maxSize=<max file size>
     */
    const cacheKey = `${id}:v3:user=${config.username}:strict=${config.strictTitleMatching === 'on' || config.strictTitleMatching === 'true'}:lang=${config.preferredLanguage || ''}:sort=${config.sortingPreference}:qualities=${config.showQualities || ''}:maxPerQuality=${config.maxResultsPerQuality || ''}:maxSize=${config.maxFileSize || ''}`;

    logger.debug(`Cache key: ${cacheKey}`);
    const cached = getFromCache<{ streams: Stream[] }>(cacheKey);

    /**
     * If a cached result exists, return it. Otherwise, make the API call.
     * This ensures that the API is only called when the user settings have changed.
     */
    if (cached) {
      return cached;
    }

    try {
      if (!config.username || !config.password) {
        // Instead of throwing error, return a single stream with error message
        return authErrorStream(config.preferredLanguage || '');
      }

      const meta = await publicMetaProvider(id, type, config.preferredLanguage);
      logger.info(`Searching for: ${meta.name}`);

      // Initialize the API with user credentials
      let api;
      try {
        api = new EasynewsAPI({ username: config.username, password: config.password });
      } catch (error) {
        logger.error(`API initialization error: ${error}`);
        return authErrorStream(config.preferredLanguage || '');
      }

      logger.debug(`Getting alternative titles for: ${meta.name}`);

      // Initialize with the original title
      let allTitles = [meta.name];

      // Add any alternative names from meta (if available)
      if (meta.alternativeNames && meta.alternativeNames.length > 0) {
        logger.debug(
          `Adding ${meta.alternativeNames.length} alternative names from metadata (${meta.alternativeNames.join(', ')})`
        );
        // Filter out duplicates
        const newAlternatives = meta.alternativeNames.filter(alt => !allTitles.includes(alt));
        allTitles = [...allTitles, ...newAlternatives];
      }

      logger.debug(`Will search for ${allTitles.length} titles: ${allTitles.join(', ')}`);

      // Store all search results here
      let allSearchResults: SearchResult[] = [];

      // Early exit condition - limit API calls
      const TOTAL_MAX_RESULTS = parseInt(process.env.TOTAL_MAX_RESULTS || '500');
      let totalFoundResults = 0;

      console.time('Easynews API call');

      // If meta.year is defined, also search with year included (regardless of whether we found results without year)
      if (meta.year !== undefined) {
        for (const titleVariant of allTitles) {
          try {
            const { allSearchResults: newResults, totalFoundResults: newTotal } =
              await searchWithTitleVariant(
                titleVariant,
                meta,
                meta.year,
                type,
                api,
                sortOptions,
                allSearchResults,
                totalFoundResults,
                TOTAL_MAX_RESULTS
              );
            allSearchResults = newResults;
            totalFoundResults = newTotal;
          } catch (error) {
            if (isAuthError(error)) {
              // Return an authentication error stream
              return authErrorStream(config.preferredLanguage || '');
            }
            // Handle other types of errors
          }
        }
      }

      if (allSearchResults.length > 0 && totalFoundResults < TOTAL_MAX_RESULTS) {
        logger.debug(
          `Found ${totalFoundResults} unique results with year, also trying without year: ${meta.year}`
        );
      } else {
        logger.debug(`No results found with year, trying without year.`);
      }

      // Now try without year for each title variant
      for (const titleVariant of allTitles) {
        try {
          const { allSearchResults: newResults, totalFoundResults: newTotal } =
            await searchWithTitleVariant(
              titleVariant,
              meta,
              undefined, // No year
              type,
              api,
              sortOptions,
              allSearchResults,
              totalFoundResults,
              TOTAL_MAX_RESULTS
            );
          allSearchResults = newResults;
          totalFoundResults = newTotal;
        } catch (error) {
          if (isAuthError(error)) {
            // Return an authentication error stream
            return authErrorStream(config.preferredLanguage || '');
          }
          // Handle other types of errors
        }
      }

      console.timeEnd('Easynews API call');
      if (allSearchResults.length === 0) {
        return { streams: [] };
      }

      const processedHashes = new Set<string>();

      // Store all streams here
      let streams: Stream[] = [];

      // Apply global limit across all search results
      logger.debug(`Global stream limit: ${TOTAL_MAX_RESULTS} results across all searches`);

      console.time('Processing search results');
      // Process each search result
      for (const { query, result: res } of allSearchResults) {
        // Skip adding more results if we've already reached the limit
        if (streams.length >= TOTAL_MAX_RESULTS) {
          logger.debug(`Reached global limit of ${TOTAL_MAX_RESULTS} streams, stopping processing`);
          break;
        }

        for (const file of res.data ?? []) {
          // Check if we've reached the global limit
          if (streams.length >= TOTAL_MAX_RESULTS) {
            logger.debug(
              `Reached global limit of ${TOTAL_MAX_RESULTS} streams, stopping processing`
            );
            break;
          }

          const postTitle = getPostTitle(file);
          const fileHash = file['0']; // Use file hash to detect duplicates

          if (isBadVideo(file) || processedHashes.has(fileHash)) {
            continue;
          }

          processedHashes.add(fileHash);

          // For series there are multiple possible queries that could match the title.
          // We check if at least one of them matches.
          if (type === 'series') {
            // Create queries for all title variants
            const queries: string[] = [];

            for (const titleVariant of allTitles) {
              // Add full query with season and episode
              const fullMeta = {
                ...meta,
                name: titleVariant,
                year: meta.year,
              };
              queries.push(buildSearchQuery(type, fullMeta));

              // Add query with episode only
              const episodeMeta = {
                name: titleVariant,
                episode: meta.episode,
              };
              queries.push(buildSearchQuery(type, episodeMeta));
            }

            // Use strictTitleMatching setting if enabled for series
            if (!queries.some(q => matchesTitle(postTitle, q, useStrictMatching))) {
              logger.debug(`Rejected series by title matching: "${postTitle}"`);
              continue;
            }
          }

          // For movies, check if title matches any of the query variants
          // Other content types are loosely matched
          const matchesAnyVariant = allTitles.some(titleVariant => {
            const variantQuery = buildSearchQuery(type, {
              ...meta,
              name: titleVariant,
            });
            // For movies, only use strictTitleMatching if enabled by user, just like for series
            return matchesTitle(postTitle, variantQuery, useStrictMatching);
          });

          if (!matchesAnyVariant) {
            logger.debug(`Rejected ${type} by title matching: "${postTitle}"`);
            continue;
          }

          streams.push(
            mapStream({
              username: config.username,
              password: config.password,
              fullResolution: file.fullres,
              fileExtension: getFileExtension(file),
              duration: getDuration(file),
              size: getSize(file),
              postTitle,
              type,
              url: createStreamUrl(
                { downURL: res.downURL, dlFarm: res.dlFarm, dlPort: res.dlPort },
                config.username,
                config.password,
                createStreamPath(file),
                config.baseUrl
              ),
              videoSize: file.rawSize,
              file,
              preferredLang,
            })
          );
        }
      }

      // Sort streams based on user preference
      if (config.sortingPreference === 'language_first' && preferredLang) {
        logger.debug(`Applying language-first sorting for language: ${preferredLang}`);

        // Special handling for language-first sorting
        // First, separate streams by language
        const preferredLangStreams: Stream[] = [];
        const otherStreams: Stream[] = [];

        // Split streams into two groups
        for (const stream of streams) {
          const file = (stream as any)._temp?.file;
          const hasPreferredLang =
            file?.alangs && Array.isArray(file.alangs) && file.alangs.includes(preferredLang);

          if (hasPreferredLang) {
            preferredLangStreams.push(stream);
          } else {
            otherStreams.push(stream);
          }
        }

        logger.debug(
          `Found ${preferredLangStreams.length} streams with preferred language and ${otherStreams.length} other streams`
        );

        // Sort each group independently
        preferredLangStreams.sort(sortByQualityAndSize);
        otherStreams.sort(sortByQualityAndSize);

        // Replace streams array with the concatenated sorted groups
        streams.length = 0;
        streams.push(...preferredLangStreams, ...otherStreams);
      } else {
        // Original sorting for other preferences
        streams.sort((a, b) => {
          // Extract stream data
          const aFile = (a as any)._temp?.file;
          const bFile = (b as any)._temp?.file;
          const aHasPreferredLang = preferredLang && aFile?.alangs?.includes(preferredLang);
          const bHasPreferredLang = preferredLang && bFile?.alangs?.includes(preferredLang);

          // Extract resolution info
          const aResolution = getResolution(aFile);
          const bResolution = getResolution(bFile);

          // Extract quality scores
          const aScore = getQualityScore(aResolution);
          const bScore = getQualityScore(bResolution);

          // Apply sorting based on user preference
          switch (config.sortingPreference) {
            case 'size_first':
              // Size first, then quality, then language
              const sizeCompare = compareSize(aFile, bFile);
              if (sizeCompare !== 0) {
                return sizeCompare;
              }
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              return 0;

            case 'date_first':
              // Sort by date first using the file's date info
              const aDate = aFile?.['5'] ? new Date(aFile['5']).getTime() : 0;
              const bDate = bFile?.['5'] ? new Date(bFile['5']).getTime() : 0;
              if (aDate !== bDate) {
                // Higher date value (more recent) comes first - descending order
                return bDate - aDate;
              }
              // Then quality
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              // Then language
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              // Then size
              return compareSize(aFile, bFile);

            case 'lang_first':
            case 'language_first':
              // Language first, then quality, then size
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              return compareSize(aFile, bFile);

            case 'quality_first':
            default:
              // Quality first (default), then language, then size
              // Make sure the quality score comparison is working
              if (aScore !== bScore) {
                // Higher quality score first - ensure descending order
                return bScore - aScore;
              }
              // Then language
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              // Then size
              return compareSize(aFile, bFile);
          }
        });
      }

      // After all streams have been collected, first filter and limit them based on user settings
      const originalCount = streams.length;
      if (streams.length > 0) {
        logger.debug(`Starting filters with ${originalCount} streams`);

        // Filter streams by quality
        const defaultQualitySet = ['4k', '1080p', '720p', '480p'];
        const isCustomQualityFilter = !(
          qualityFilters.length === defaultQualitySet.length &&
          qualityFilters.every(q => defaultQualitySet.includes(q))
        );

        if (isCustomQualityFilter) {
          const qualityMap: Record<string, string[]> = {
            '4k': ['4K', 'UHD', '2160p'],
            '1080p': ['1080p'],
            '720p': ['720p'],
            '480p': ['480p', 'SD'],
          };

          // Create a list of allowed quality strings
          const allowedQualityTerms: string[] = [];
          qualityFilters.forEach(q => {
            if (qualityMap[q]) {
              allowedQualityTerms.push(...qualityMap[q]);
            }
          });

          logger.debug(`Filtering for qualities: ${qualityFilters.join(', ')}`);
          logger.debug(`Accepted quality terms: ${allowedQualityTerms.join(', ')}`);

          if (allowedQualityTerms.length > 0) {
            const filteredStreams = streams.filter(stream => {
              const quality = stream.name?.split('\n')[1] || '';
              const matchesQuality = allowedQualityTerms.some(term => quality.includes(term));
              return matchesQuality;
            });

            // Only update if we found at least one match
            if (filteredStreams.length > 0) {
              streams = filteredStreams;
              logger.debug(`After quality filtering: ${streams.length} streams remain`);
            } else {
              logger.warn(`Quality filtering would remove all streams - keeping original results`);
            }
          }
        }

        // Filter streams by file size (only if maxFileSizeGB > 0)
        if (maxFileSizeGB > 0) {
          const filteredStreams = streams.filter(stream => {
            const description = stream.description || '';
            const sizeLine = description.split('\n').find(line => line.includes('📦'));

            if (!sizeLine) return true; // Keep if we can't determine size

            // Extract only the size part (before any date information)
            const sizePart = sizeLine.split('📅')[0].trim();

            if (sizePart.includes('GB')) {
              const sizeGB = parseFloat(sizePart.match(/[\d.]+/)?.[0] || '0');
              return sizeGB <= maxFileSizeGB;
            }

            if (sizePart.includes('MB')) {
              const sizeMB = parseFloat(sizePart.match(/[\d.]+/)?.[0] || '0');
              return sizeMB / 1024 <= maxFileSizeGB;
            }

            return true; // Keep if we can't parse the size
          });

          // Only update if we found at least one match
          if (filteredStreams.length > 0) {
            streams = filteredStreams;
            logger.debug(`After max file size filtering: ${streams.length} streams remain`);
          } else {
            logger.warn(`File size filtering would remove all streams - keeping original results`);
          }
        }

        // Group streams by quality for limiting per quality (only if maxResultsPerQualityValue > 0)
        if (maxResultsPerQualityValue > 0) {
          const streamsByQuality: Record<string, Stream[]> = {};

          // Determine quality category for each stream
          streams.forEach(stream => {
            const quality = stream.name?.split('\n')[1] || '';
            let qualityCategory = 'other';

            if (quality.includes('4K') || quality.includes('UHD') || quality.includes('2160p')) {
              qualityCategory = '4k';
            } else if (quality.includes('1080p')) {
              qualityCategory = '1080p';
            } else if (quality.includes('720p')) {
              qualityCategory = '720p';
            } else if (quality.includes('480p') || quality.includes('SD')) {
              qualityCategory = '480p';
            }

            if (!streamsByQuality[qualityCategory]) {
              streamsByQuality[qualityCategory] = [];
            }
            streamsByQuality[qualityCategory].push(stream);
          });

          // Log the distribution of streams by quality
          Object.entries(streamsByQuality).forEach(([quality, streams]) => {
            logger.debug(`Quality ${quality}: ${streams.length} streams`);
          });

          // Apply limits per quality category and rebuild streams array
          const limitedStreams: Stream[] = [];
          Object.keys(streamsByQuality).forEach(quality => {
            const qualityStreams = streamsByQuality[quality];
            const limitedQualityStreams = qualityStreams.slice(0, maxResultsPerQualityValue);
            limitedStreams.push(...limitedQualityStreams);

            if (limitedQualityStreams.length < qualityStreams.length) {
              logger.debug(
                `Quality ${quality}: Limited from ${qualityStreams.length} to ${limitedQualityStreams.length} streams`
              );
            }
          });

          if (limitedStreams.length > 0) {
            streams = limitedStreams;
            logger.debug(
              `After applying max results per quality: ${streams.length} streams remain`
            );
          } else {
            logger.warn(`Per-quality limiting would remove all streams - keeping original results`);
          }
        }

        logger.info(`Filtering complete: ${originalCount} streams → ${streams.length} streams`);
      }

      // Now sort the filtered streams based on user preference
      if (config.sortingPreference === 'language_first' && preferredLang) {
        logger.debug(`Applying language-first sorting for language: ${preferredLang}`);

        // Special handling for language-first sorting
        // First, separate streams by language
        const preferredLangStreams: Stream[] = [];
        const otherStreams: Stream[] = [];

        // Split streams into two groups
        for (const stream of streams) {
          const file = (stream as any)._temp?.file;
          const hasPreferredLang =
            file?.alangs && Array.isArray(file.alangs) && file.alangs.includes(preferredLang);

          if (hasPreferredLang) {
            preferredLangStreams.push(stream);
          } else {
            otherStreams.push(stream);
          }
        }

        logger.debug(
          `Sorting: ${preferredLangStreams.length} streams with preferred language and ${otherStreams.length} other streams`
        );

        // Sort each group independently
        preferredLangStreams.sort(sortByQualityAndSize);
        otherStreams.sort(sortByQualityAndSize);

        // Replace streams array with the concatenated sorted groups
        streams.length = 0;
        streams.push(...preferredLangStreams, ...otherStreams);
      } else {
        // Original sorting for other preferences
        streams.sort((a, b) => {
          // Extract stream data
          const aFile = (a as any)._temp?.file;
          const bFile = (b as any)._temp?.file;
          const aHasPreferredLang = preferredLang && aFile?.alangs?.includes(preferredLang);
          const bHasPreferredLang = preferredLang && bFile?.alangs?.includes(preferredLang);

          // Extract resolution info
          const aResolution = getResolution(aFile);
          const bResolution = getResolution(bFile);

          // Extract quality scores
          const aScore = getQualityScore(aResolution);
          const bScore = getQualityScore(bResolution);

          // Apply sorting based on user preference
          switch (config.sortingPreference) {
            case 'size_first':
              // Size first, then quality, then language
              const sizeCompare = compareSize(aFile, bFile);
              if (sizeCompare !== 0) {
                return sizeCompare;
              }
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              return 0;

            case 'date_first':
              // Sort by date first using the file's date info
              const aDate = aFile?.['5'] ? new Date(aFile['5']).getTime() : 0;
              const bDate = bFile?.['5'] ? new Date(bFile['5']).getTime() : 0;
              if (aDate !== bDate) {
                // Higher date value (more recent) comes first - descending order
                return bDate - aDate;
              }
              // Then quality
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              // Then language
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              // Then size
              return compareSize(aFile, bFile);

            case 'lang_first':
            case 'language_first':
              // Language first, then quality, then size
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              return compareSize(aFile, bFile);

            case 'quality_first':
            default:
              // Quality first (default), then language, then size
              // Make sure the quality score comparison is working
              if (aScore !== bScore) {
                // Higher quality score first - ensure descending order
                return bScore - aScore;
              }
              // Then language
              if (aHasPreferredLang !== bHasPreferredLang) {
                return aHasPreferredLang ? -1 : 1;
              }
              // Then size
              return compareSize(aFile, bFile);
          }
        });
      }

      if (streams.length > 0) {
        const qualitySummary: Record<string, number> = {};
        streams.forEach(stream => {
          const quality = stream.name?.split('\n')[1] || 'Unknown';
          qualitySummary[quality] = (qualitySummary[quality] || 0) + 1;
        });

        const qualitySummaryStr = Object.entries(qualitySummary)
          .map(([quality, count]) => `${quality}: ${count}`)
          .join(', ');

        logger.info(`Found ${streams.length} streams total for ${id} (${qualitySummaryStr})`);
      } else {
        logger.info(`Found 0 streams total for ${id}`);
      }
      console.timeEnd('Processing search results');
      // Cache the result
      setCache(cacheKey, { streams, ...getCacheOptions(streams.length) });

      return { streams };
    } catch (error) {
      logError({
        message: `failed to handle stream: ${error}`,
        error,
        context: { resource: 'stream', id, type },
      });

      // Check if the error is related to authentication
      if (isAuthError(error)) return authErrorStream(config.preferredLanguage || '');

      return { streams: [] };
    }
  }
);

function mapStream({
  username,
  password,
  duration,
  size,
  fullResolution,
  postTitle,
  type,
  fileExtension,
  videoSize,
  url,
  file,
  preferredLang,
}: {
  postTitle: string;
  type: string;
  url: string;
  username: string;
  password: string;
  fileExtension: string;
  videoSize: number | undefined;
  duration: string | undefined;
  size: string | undefined;
  fullResolution: string | undefined;
  file: FileData;
  preferredLang: string;
}): Stream {
  logger.debug(`Mapping stream: "${postTitle}" (${fileExtension}, ${size}, ${duration})`);

  const parsedFilename = filenameParse(postTitle, type === 'series' ? true : false);
  const audioCodec = parsedFilename.audioCodec;
  const videoCodec = parsedFilename.videoCodec;
  const resolution = parsedFilename.resolution;

  const quality = getVideoQuality(postTitle, fullResolution);
  const audioQuality = getAudioQuality(file);

  // Log language information for debugging
  if (file.alangs && file.alangs.length > 0) {
    logger.debug(`Stream "${postTitle}" has languages: ${JSON.stringify(file.alangs)}`);
  } else {
    logger.debug(`Stream "${postTitle}" has no language information`);
  }

  // Calculate days since upload
  const publishDate = getPublishDate(file.ts);

  // calculate bitrate
  const bitrate = calculateBitrate(file);
  const internetSpeedStr = bitrate ? getRecommendedInternetSpeed(bitrate) : '';

  // Show language information in the description if available
  const languageInfo = file.alangs?.length
    ? `🌐 ${file.alangs.map((lang: string) => (lang === preferredLang ? `⭐ ${lang}` : `${lang}`)).join(' | ')}`
    : '🌐 Unknown';

  const stream: Stream & { _temp?: { file: FileData } } = {
    name: `Easynews++`,
    description: [
      // `🎬 ${parsedFilename.title} ${parsedFilename.year}`,
      `📺 ${quality} • 🎧 ${parsedFilename.audioCodec ? parsedFilename.audioCodec : audioQuality} • 🎞️ ${fileExtension}`,
      `📦 ${size ?? 'unknown size'} • ${internetSpeedStr} • ${publishDate}`,
      `🕛 ${duration ?? 'unknown duration'}`,
      languageInfo,
      `👥 ${parsedFilename.group ? ` ${parsedFilename.group}` : 'unknown'}`,
    ].join('\n'),
    url: url,
    behaviorHints: {
      notWebReady: true,
      filename: `${postTitle}${fileExtension}`,
    },
    // Add temporary property with file data for sorting
    _temp: { file },
  };

  return stream;
}

/**
 * Calculate a human-readable publish date from timestamp
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string or empty string if timestamp is invalid
 */
function getPublishDate(timestamp: number): string {
  if (!timestamp) return '';

  const uploadDate = new Date(timestamp * 1000);
  const now = new Date();

  // Calculate days difference
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `📅 ${diffDays}d`;
}

function getCacheOptions(itemsLength: number): Partial<Cache> {
  return {
    cacheMaxAge: (Math.min(itemsLength, 10) / 10) * 3600 * 24 * 7, // up to 1 week of cache for items
  };
}

export const addonInterface = builder.getInterface();
