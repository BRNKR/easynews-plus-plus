/**
 * Internationalization (i18n) module for the Easynews++ addon
 */

// Define the supported languages
type Language =
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'ja'
  | 'pt'
  | 'ru'
  | 'ko'
  | 'zh'
  | 'nl'
  | 'ro'
  | 'bg';

// Key-value structure for translations
type TranslationKeys = {
  // Configuration page
  configPage: {
    title: string;
    copyConfig: string;
    addToStremio: string;
    configCopied: string;
    version: string;
    description: string;
    supportDevelopment: string;
  };
  // Form fields
  form: {
    username: string;
    password: string;
    strictTitleMatching: string;
    strictTitleMatchingHint: string;
    preferredLanguage: string;
    preferredLanguageHint: string;
    sortingMethod: string;
    sortingMethodHint: string;
    uiLanguage: string;
    showQualities: string;
    maxResultsPerQuality: string;
    maxFileSize: string;
    noLimit: string;
  };
  // Languages
  languages: {
    noPreference: string;
    english: string;
    german: string;
    spanish: string;
    french: string;
    italian: string;
    japanese: string;
    portuguese: string;
    russian: string;
    korean: string;
    chinese: string;
    dutch: string;
    romanian: string;
    bulgarian: string;
    // Note: Additional languages are defined only in the manifest for preferred audio language selection
  };
  // Sorting options
  sortingOptions: {
    qualityFirst: string;
    languageFirst: string;
    sizeFirst: string;
    dateFirst: string;
  };
  qualityOptions: {
    allQualities: string;
  };
  errors: {
    authFailed: string;
  };
};

// Translation dictionary type
type Translations = Record<Language, TranslationKeys>;

// Default language
export const DEFAULT_LANGUAGE: Language = 'en';

// Map ISO codes to our language keys
export const ISO_TO_LANGUAGE: Record<string, Language> = {
  eng: 'en',
  ger: 'de',
  spa: 'es',
  fre: 'fr',
  ita: 'it',
  jpn: 'ja',
  por: 'pt',
  rus: 'ru',
  kor: 'ko',
  chi: 'zh',
  dut: 'nl',
  rum: 'ro',
  bul: 'bg',
  // Default to English if not found
  '': 'en',
};

// Additional ISO 639-2 to ISO 639-1 mappings for languages not in our UI
export const ADDITIONAL_LANGUAGE_CODES: Record<string, string> = {
  ara: 'ar', // Arabic
  cze: 'cs', // Czech
  dan: 'da', // Danish
  fin: 'fi', // Finnish
  gre: 'el', // Greek
  heb: 'he', // Hebrew
  hin: 'hi', // Hindi
  hun: 'hu', // Hungarian
  ice: 'is', // Icelandic
  ind: 'id', // Indonesian
  may: 'ms', // Malay
  nor: 'no', // Norwegian
  per: 'fa', // Persian
  pol: 'pl', // Polish
  swe: 'sv', // Swedish
  tha: 'th', // Thai
  tur: 'tr', // Turkish
  ukr: 'uk', // Ukrainian
  vie: 'vi', // Vietnamese
};

// Full display names for all supported languages (both UI and additional)
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  // Core languages with UI translations
  eng: 'English',
  ger: 'Deutsch (German)',
  spa: 'Español (Spanish)',
  fre: 'Français (French)',
  ita: 'Italiano (Italian)',
  jpn: '日本語 (Japanese)',
  por: 'Português (Portuguese)',
  rus: 'Русский (Russian)',
  kor: '한국어 (Korean)',
  chi: '中文 (Chinese)',
  dut: 'Nederlands (Dutch)',
  rum: 'Română (Romanian)',
  bul: 'Български (Bulgarian)',
  // Additional languages without UI translations
  ara: 'Arabic (العربية)',
  cze: 'Czech (Čeština)',
  dan: 'Danish (Dansk)',
  fin: 'Finnish (Suomi)',
  gre: 'Greek (Ελληνικά)',
  heb: 'Hebrew (עברית)',
  hin: 'Hindi (हिन्दी)',
  hun: 'Hungarian (Magyar)',
  ice: 'Icelandic (Íslenska)',
  ind: 'Indonesian (Bahasa Indonesia)',
  may: 'Malay (Bahasa Melayu)',
  nor: 'Norwegian (Norsk)',
  per: 'Persian (فارسی)',
  pol: 'Polish (Polski)',
  swe: 'Swedish (Svenska)',
  tha: 'Thai (ไทย)',
  tur: 'Turkish (Türkçe)',
  ukr: 'Ukrainian (Українська)',
  vie: 'Vietnamese (Tiếng Việt)',
  // Empty string for "no preference" option
  '': 'No preference',
};

// Language to ISO mapping (reverse of above)
const LANGUAGE_TO_ISO: Record<Language, string> = {
  en: 'eng',
  de: 'ger',
  es: 'spa',
  fr: 'fre',
  it: 'ita',
  ja: 'jpn',
  pt: 'por',
  ru: 'rus',
  ko: 'kor',
  zh: 'chi',
  nl: 'dut',
  ro: 'rum',
  bg: 'bul',
};

// All supported languages with their display names
const SUPPORTED_LANGUAGES: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch (German)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  it: 'Italiano (Italian)',
  ja: '日本語 (Japanese)',
  pt: 'Português (Portuguese)',
  ru: 'Русский (Russian)',
  ko: '한국어 (Korean)',
  zh: '中文 (Chinese)',
  nl: 'Nederlands (Dutch)',
  ro: 'Română (Romanian)',
  bg: 'Български (Bulgarian)',
};

/**
 * Get the translations for the given language code
 * @param langCode Language code (ISO or our internal code)
 * @returns Translations object or the default (English) translations
 */
export function getTranslations(langCode: string): TranslationKeys {
  // Convert ISO code to our language code if needed
  const language = ISO_TO_LANGUAGE[langCode] || (langCode as Language);

  // Return translations if language is supported, otherwise fall back to English
  return language in translations ? translations[language] : translations[DEFAULT_LANGUAGE];
}

/**
 * Gets the user interface language from the configuration
 * @param preferredLanguage Language from the config (ISO code)
 * @returns The appropriate language code to use
 */
export function getUILanguage(preferredLanguage?: string): Language {
  if (!preferredLanguage) return DEFAULT_LANGUAGE;
  return ISO_TO_LANGUAGE[preferredLanguage] || DEFAULT_LANGUAGE;
}

// Define all the translations
export const translations: Translations = {
  // English (Default)
  en: {
    configPage: {
      title: 'Configuration',
      copyConfig: 'Copy Configuration',
      addToStremio: 'Add to Stremio',
      configCopied: 'Copied!',
      version: 'Version',
      description:
        'Easynews++ is an open-source addon that enhances the Easynews experience with superior performance, advanced search capabilities, and intelligent stream selection. It features custom title support, multi-platform compatibility, and self-hosting options. Join our community on <a href="https://discord.gg/Ma4SnagqwE">Discord</a> or contribute on <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Sponsor',
    },
    form: {
      username: 'Username',
      password: 'Password',
      strictTitleMatching: 'Strict Title Matching',
      strictTitleMatchingHint:
        "Recommended: Filters out results that don't exactly match the movie or series title",
      preferredLanguage: 'Preferred Audio Language',
      preferredLanguageHint:
        'Used to find and prioritize content with localized titles in the preferred language',
      sortingMethod: 'Sorting Method',
      sortingMethodHint:
        'All options use the same relevance-first API search, then sort results locally',
      uiLanguage: 'UI Language',
      showQualities: 'Qualities to show in streams list',
      maxResultsPerQuality: 'Max results per quality',
      maxFileSize: 'Max file size in GB',
      noLimit: 'No limit',
    },
    languages: {
      noPreference: 'No preference',
      english: 'English',
      german: 'German (Deutsch)',
      spanish: 'Spanish (Español)',
      french: 'French (Français)',
      italian: 'Italian (Italiano)',
      japanese: 'Japanese (日本語)',
      portuguese: 'Portuguese (Português)',
      russian: 'Russian (Русский)',
      korean: 'Korean (한국어)',
      chinese: 'Chinese (中文)',
      dutch: 'Dutch (Nederlands)',
      romanian: 'Romanian (Română)',
      bulgarian: 'Bulgarian (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Quality (4K → 1080p → 720p)',
      languageFirst: 'Preferred Language, then Quality',
      sizeFirst: 'File Size (largest first)',
      dateFirst: 'Date Added (newest first)',
    },
    qualityOptions: {
      allQualities: 'All Qualities',
    },
    errors: {
      authFailed:
        'Authentication Failed: Invalid username or password\nCheck your credentials & reconfigure addon',
    },
  },
  // German
  de: {
    configPage: {
      title: 'Konfiguration',
      copyConfig: 'Konfiguration kopieren',
      addToStremio: 'Zu Stremio hinzufügen',
      configCopied: 'Kopiert!',
      version: 'Version',
      description:
        'Easynews++ ist ein Open-Source-Addon, das die Easynews-Erfahrung mit überlegener Leistung, erweiterten Suchfunktionen und intelligenter Stream-Auswahl verbessert. Es bietet benutzerdefinierte Titelunterstützung, Multi-Plattform-Kompatibilität und Self-Hosting-Optionen. Trete unserer Community auf <a href="https://discord.gg/Ma4SnagqwE">Discord</a> bei oder trage auf <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a> bei.',
      supportDevelopment: 'Spenden',
    },
    form: {
      username: 'Benutzername',
      password: 'Passwort',
      strictTitleMatching: 'Strikte Titelübereinstimmung',
      strictTitleMatchingHint:
        'Empfohlen: Filtert Ergebnisse heraus, die nicht exakt mit dem Film- oder Serientitel übereinstimmen',
      preferredLanguage: 'Bevorzugte Audiosprache',
      preferredLanguageHint:
        'Wird verwendet, um Inhalte mit lokalisierten Titeln in der bevorzugten Sprache zu finden und zu priorisieren',
      sortingMethod: 'Sortiermethode',
      sortingMethodHint:
        'Alle Optionen verwenden die gleiche relevanz-basierte API-Suche und sortieren die Ergebnisse dann lokal',
      uiLanguage: 'UI-Sprache',
      showQualities: 'Anzuzeigende Qualitäten in der Streamliste',
      maxResultsPerQuality: 'Maximale Ergebnisse pro Qualität',
      maxFileSize: 'Maximale Dateigröße in GB',
      noLimit: 'Kein Limit',
    },
    languages: {
      noPreference: 'Keine Präferenz',
      english: 'Englisch (English)',
      german: 'Deutsch (German)',
      spanish: 'Spanisch (Español)',
      french: 'Französisch (Français)',
      italian: 'Italienisch (Italiano)',
      japanese: 'Japanisch (日本語)',
      portuguese: 'Portugiesisch (Português)',
      russian: 'Russisch (Русский)',
      korean: 'Koreanisch (한국어)',
      chinese: 'Chinesisch (中文)',
      dutch: 'Niederländisch (Nederlands)',
      romanian: 'Rumänisch (Română)',
      bulgarian: 'Bulgarisch (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Qualität (4K → 1080p → 720p)',
      languageFirst: 'Bevorzugte Sprache, dann Qualität',
      sizeFirst: 'Dateigröße (größte zuerst)',
      dateFirst: 'Hinzugefügt am (neueste zuerst)',
    },
    qualityOptions: {
      allQualities: 'Alle Qualitäten',
    },
    errors: {
      authFailed:
        'Authentifizierung fehlgeschlagen: Ungültiger Benutzername oder Passwort\nÜberprüfen Sie Ihre Anmeldeinformationen und konfigurieren Sie das Addon erneut',
    },
  },
  // Spanish
  es: {
    configPage: {
      title: 'Configuración',
      copyConfig: 'Copiar configuración',
      addToStremio: 'Añadir a Stremio',
      configCopied: '¡Copiado!',
      version: 'Versión',
      description:
        'Easynews++ es un complemento de código abierto que mejora la experiencia de Easynews con un rendimiento superior, capacidades de búsqueda avanzadas y selección inteligente de transmisiones. Cuenta con soporte de títulos personalizados, compatibilidad multiplataforma y opciones de alojamiento propio. Únase a nuestra comunidad en <a href="https://discord.gg/Ma4SnagqwE">Discord</a> o contribuya en <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Soporte',
    },
    form: {
      username: 'Nombre de usuario',
      password: 'Contraseña',
      strictTitleMatching: 'Coincidencia estricta de títulos',
      strictTitleMatchingHint:
        'Recomendado: Filtra resultados que no coincidan exactamente con el título de la película o serie',
      preferredLanguage: 'Idioma de audio preferido',
      preferredLanguageHint:
        'Se utiliza para encontrar y priorizar contenido con títulos localizados en el idioma preferido',
      sortingMethod: 'Método de clasificación',
      sortingMethodHint:
        'Todas las opciones utilizan la misma búsqueda API basada en relevancia y luego ordenan los resultados localmente',
      uiLanguage: 'Idioma de la interfaz de usuario',
      showQualities: 'Calidades a mostrar en la lista de streams',
      maxResultsPerQuality: 'Máx. resultados por calidad',
      maxFileSize: 'Tamaño máx. del archivo en GB',
      noLimit: 'Sin límite',
    },
    languages: {
      noPreference: 'Sin preferencia',
      english: 'Inglés (English)',
      german: 'Alemán (Deutsch)',
      spanish: 'Español (Spanish)',
      french: 'Francés (Français)',
      italian: 'Italiano (Italiano)',
      japanese: 'Japonés (日本語)',
      portuguese: 'Portugués (Português)',
      russian: 'Ruso (Русский)',
      korean: 'Coreano (한국어)',
      chinese: 'Chino (中文)',
      dutch: 'Holandés (Nederlands)',
      romanian: 'Rumano (Română)',
      bulgarian: 'Búlgara (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Calidad (4K → 1080p → 720p)',
      languageFirst: 'Idioma preferido, luego calidad',
      sizeFirst: 'Tamaño de archivo (más grande primero)',
      dateFirst: 'Fecha de adición (más recientes primero)',
    },
    qualityOptions: {
      allQualities: 'Todas las calidades',
    },
    errors: {
      authFailed:
        'Autenticación fallida: Nombre de usuario o contraseña inválidos\nVerifique sus credenciales y reconfigure el addon',
    },
  },
  // French
  fr: {
    configPage: {
      title: 'Configuration',
      copyConfig: 'Copier la configuration',
      addToStremio: 'Ajouter à Stremio',
      configCopied: 'Copié !',
      version: 'Version',
      description:
        "Easynews++ est un addon open-source qui améliore l'expérience Easynews avec des performances supérieures, des capacités de recherche avancées et une sélection intelligente des flux. Il propose le support de titres personnalisés, la compatibilité multi-plateformes et des options d'auto-hébergement. Rejoignez notre communauté sur <a href='https://discord.gg/Ma4SnagqwE'>Discord</a> ou contribuez sur <a href='https://github.com/panteLx/easynews-plus-plus'>GitHub</a>.",
      supportDevelopment: 'Soutenir',
    },
    form: {
      username: "Nom d'utilisateur",
      password: 'Mot de passe',
      strictTitleMatching: 'Correspondance stricte des titres',
      strictTitleMatchingHint:
        'Recommandé: Filtre les résultats qui ne correspondent pas exactement au titre du film ou de la série',
      preferredLanguage: 'Langue audio préférée',
      preferredLanguageHint:
        'Utilisé pour trouver et prioriser le contenu avec des titres localisés dans la langue préférée',
      sortingMethod: 'Méthode de tri',
      sortingMethodHint:
        'Toutes les options utilisent la même recherche API basée sur la pertinence puis trient les résultats localement',
      uiLanguage: "Langue de l'interface",
      showQualities: 'Qualités à afficher dans la liste des streams',
      maxResultsPerQuality: 'Résultats max. par qualité',
      maxFileSize: 'Taille max. du fichier en Go',
      noLimit: 'Sans limite',
    },
    languages: {
      noPreference: 'Sans préférence',
      english: 'Anglais (English)',
      german: 'Allemand (Deutsch)',
      spanish: 'Espagnol (Español)',
      french: 'Français (French)',
      italian: 'Italien (Italiano)',
      japanese: 'Japonais (日本語)',
      portuguese: 'Portugais (Português)',
      russian: 'Russe (Русский)',
      korean: 'Coréen (한국어)',
      chinese: 'Chinois (中文)',
      dutch: 'Néerlandais (Nederlands)',
      romanian: 'Roumain (Română)',
      bulgarian: 'Bulgare (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Qualité (4K → 1080p → 720p)',
      languageFirst: 'Langue préférée, puis qualité',
      sizeFirst: "Taille du fichier (plus grand d'abord)",
      dateFirst: "Date d'ajout (plus récent d'abord)",
    },
    qualityOptions: {
      allQualities: 'Toutes les qualités',
    },
    errors: {
      authFailed:
        "Authentification échouée : Nom d'utilisateur ou mot de passe invalide\nVérifiez vos identifiants et reconfigurez l'addon",
    },
  },
  // Italian
  it: {
    configPage: {
      title: 'Configurazione',
      copyConfig: 'Copia configurazione',
      addToStremio: 'Aggiungi a Stremio',
      configCopied: 'Copiato!',
      version: 'Versione',
      description:
        "Easynews++ è un addon open-source che migliora l'esperienza di Easynews con prestazioni superiori, funzionalità di ricerca avanzate e selezione intelligente dei flussi. Include supporto per titoli personalizzati, compatibilità multi-piattaforma e opzioni di self-hosting. Unisciti alla nostra comunità su <a href='https://discord.gg/Ma4SnagqwE'>Discord</a> o contribuisci su <a href='https://github.com/panteLx/easynews-plus-plus'>GitHub</a>.",
      supportDevelopment: 'Soporte',
    },
    form: {
      username: 'Nome utente',
      password: 'Password',
      strictTitleMatching: 'Corrispondenza esatta dei titoli',
      strictTitleMatchingHint:
        'Consigliato: Filtra i risultati che non corrispondono esattamente al titolo del film o della serie',
      preferredLanguage: 'Lingua audio preferita',
      preferredLanguageHint:
        'Utilizzato per trovare e dare priorità ai contenuti con titoli localizzati nella lingua preferita',
      sortingMethod: 'Metodo di ordinamento',
      sortingMethodHint:
        'Tutte le opzioni utilizzano la stessa ricerca API basata sulla rilevanza e poi ordinano i risultati localmente',
      uiLanguage: "Lingua dell'interfaccia utente",
      showQualities: 'Calità da mostrare nella lista degli stream',
      maxResultsPerQuality: 'Risultati max. per calità',
      maxFileSize: 'Dimensione massima del file in GB',
      noLimit: 'Senza limite',
    },
    languages: {
      noPreference: 'Nessuna preferenza',
      english: 'Inglese (English)',
      german: 'Tedesco (Deutsch)',
      spanish: 'Spagnolo (Español)',
      french: 'Francese (Français)',
      italian: 'Italiano (Italiano)',
      japanese: 'Giapponese (日本語)',
      portuguese: 'Portoghese (Português)',
      russian: 'Russo (Русский)',
      korean: 'Coreano (한국어)',
      chinese: 'Cinese (中文)',
      dutch: 'Olandese (Nederlands)',
      romanian: 'Rumeno (Română)',
      bulgarian: 'Bulgara (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Qualità (4K → 1080p → 720p)',
      languageFirst: 'Lingua preferita, poi qualità',
      sizeFirst: 'Dimensione file (i più grandi prima)',
      dateFirst: 'Data di aggiunta (i più recenti prima)',
    },
    qualityOptions: {
      allQualities: 'Tutte le qualità',
    },
    errors: {
      authFailed:
        'Autenticazione fallita: Nome utente o password non validi\nVerifica le tue credenziali e riconfigura l addon',
    },
  },
  // Japanese
  ja: {
    configPage: {
      title: '設定',
      copyConfig: '設定をコピー',
      addToStremio: 'Stremioに追加',
      configCopied: 'コピーしました！',
      version: 'バージョン',
      description:
        'Easynews++は、優れたパフォーマンス、高度な検索機能、インテリジェントなストリーム選択でEasynewsの体験を向上させるオープンソースアドオンです。カスタムタイトルのサポート、マルチプラットフォームの互換性、セルフホスティングオプションを備えています。<a href="https://discord.gg/Ma4SnagqwE">Discord</a>のコミュニティに参加するか、<a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>で貢献してください。',
      supportDevelopment: 'サポート',
    },
    form: {
      username: 'ユーザー名',
      password: 'パスワード',
      strictTitleMatching: '厳密なタイトル一致',
      strictTitleMatchingHint:
        '推奨：映画やシリーズのタイトルに正確に一致しない結果をフィルタリングします',
      preferredLanguage: '優先する音声言語',
      preferredLanguageHint:
        '優先言語でローカライズされたタイトルのコンテンツを検索して優先するために使用されます',
      sortingMethod: '並べ替え方法',
      sortingMethodHint:
        'すべてのオプションは同じ関連性ベースのAPI検索を使用し、結果をローカルで並べ替えます',
      uiLanguage: 'UI言語',
      showQualities: 'ストリームリストに表示する画質',
      maxResultsPerQuality: '画質ごとの最大結果数',
      maxFileSize: 'ファイルサイズの最大値 (GB)',
      noLimit: '制限なし',
    },
    languages: {
      noPreference: '優先なし',
      english: '英語 (English)',
      german: 'ドイツ語 (Deutsch)',
      spanish: 'スペイン語 (Español)',
      french: 'フランス語 (Français)',
      italian: 'イタリア語 (Italiano)',
      japanese: '日本語 (Japanese)',
      portuguese: 'ポルトガル語 (Português)',
      russian: 'ロシア語 (Русский)',
      korean: '韓国語 (한국어)',
      chinese: '中国語 (中文)',
      dutch: 'オランダ語 (Nederlands)',
      romanian: 'ルーマニア語 (Română)',
      bulgarian: 'ブルガリア語 (Български)',
    },
    sortingOptions: {
      qualityFirst: '画質優先 (4K → 1080p → 720p)',
      languageFirst: '優先言語、次に画質',
      sizeFirst: 'ファイルサイズ（最大優先）',
      dateFirst: '追加日（最新優先）',
    },
    qualityOptions: {
      allQualities: 'すべての画質',
    },
    errors: {
      authFailed:
        '認証失敗：ユーザー名またはパスワードが無効です\n資格情報を確認し、アドオンを再構成してください',
    },
  },
  // Portuguese
  pt: {
    configPage: {
      title: 'Configuração',
      copyConfig: 'Copiar configuração',
      addToStremio: 'Adicionar ao Stremio',
      configCopied: 'Copiado!',
      version: 'Versão',
      description:
        'Easynews++ é um addon de código aberto que melhora a experiência do Easynews com desempenho superior, recursos de pesquisa avançados e seleção inteligente de streams. Ele oferece suporte a títulos personalizados, compatibilidade multiplataforma e opções de hospedagem própria. Junte-se à nossa comunidade no <a href="https://discord.gg/Ma4SnagqwE">Discord</a> ou contribua no <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Suporte',
    },
    form: {
      username: 'Nome de usuário',
      password: 'Senha',
      strictTitleMatching: 'Correspondência estrita de títulos',
      strictTitleMatchingHint:
        'Recomendado: Filtra resultados que não correspondam exatamente ao título do filme ou série',
      preferredLanguage: 'Idioma de áudio preferido',
      preferredLanguageHint:
        'Usado para encontrar e priorizar conteúdo com títulos localizados no idioma preferido',
      sortingMethod: 'Método de classificação',
      sortingMethodHint:
        'Todas as opções usam a mesma pesquisa API baseada em relevância e depois classificam os resultados localmente',
      uiLanguage: 'Idioma da interface de usuário',
      showQualities: 'Qualidades a serem exibidas na lista de streams',
      maxResultsPerQuality: 'Máx. resultados por qualidade',
      maxFileSize: 'Tamanho máx. do arquivo em GB',
      noLimit: 'Sem limite',
    },
    languages: {
      noPreference: 'Sem preferência',
      english: 'Inglês (English)',
      german: 'Alemão (Deutsch)',
      spanish: 'Espanhol (Español)',
      french: 'Francês (Français)',
      italian: 'Italiano (Italiano)',
      japanese: 'Japonês (日本語)',
      portuguese: 'Português (Português)',
      russian: 'Russo (Русский)',
      korean: 'Coreano (한국어)',
      chinese: 'Chinês (中文)',
      dutch: 'Holandês (Nederlands)',
      romanian: 'Romeno (Română)',
      bulgarian: 'Búlgara (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Qualidade (4K → 1080p → 720p)',
      languageFirst: 'Idioma preferido, depois qualidade',
      sizeFirst: 'Tamanho do arquivo (maiores primeiro)',
      dateFirst: 'Data de adição (mais recentes primeiro)',
    },
    qualityOptions: {
      allQualities: 'Todas as qualidades',
    },
    errors: {
      authFailed:
        'Falha na autenticação: Nome de usuário ou senha inválidos\nVerifique suas credenciais e reconfigure o addon',
    },
  },
  // Russian
  ru: {
    configPage: {
      title: 'Конфигурация',
      copyConfig: 'Копировать конфигурацию',
      addToStremio: 'Добавить в Stremio',
      configCopied: 'Скопировано!',
      version: 'Версия',
      description:
        'Easynews++ — это дополнение с открытым исходным кодом, которое улучшает работу с Easynews благодаря превосходной производительности, расширенным возможностям поиска и интеллектуальному выбору потоков. Оно имеет поддержку пользовательских заголовков, совместимость с несколькими платформами и возможности самостоятельного размещения. Присоединяйтесь к нашему сообществу в <a href="https://discord.gg/Ma4SnagqwE">Discord</a> или вносите вклад на <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Поддержка',
    },
    form: {
      username: 'Имя пользователя',
      password: 'Пароль',
      strictTitleMatching: 'Строгое соответствие названия',
      strictTitleMatchingHint:
        'Рекомендуется: Фильтрует результаты, которые не точно соответствуют названию фильма или сериала',
      preferredLanguage: 'Предпочтительный язык аудио',
      preferredLanguageHint:
        'Используется для поиска и приоритизации контента с локализованными названиями на предпочтительном языке',
      sortingMethod: 'Метод сортировки',
      sortingMethodHint:
        'Все варианты используют один и тот же поиск по API на основе релевантности, а затем сортируют результаты локально',
      uiLanguage: 'Язык интерфейса',
      showQualities: 'Качество для отображения в списке потоков',
      maxResultsPerQuality: 'Максимальное количество результатов на качество',
      maxFileSize: 'Максимальный размер файла (ГБ)',
      noLimit: 'Без ограничения',
    },
    languages: {
      noPreference: 'Без предпочтений',
      english: 'Английский (English)',
      german: 'Немецкий (Deutsch)',
      spanish: 'Испанский (Español)',
      french: 'Французский (Français)',
      italian: 'Итальянский (Italiano)',
      japanese: 'Японский (日本語)',
      portuguese: 'Португальский (Português)',
      russian: 'Русский (Russian)',
      korean: 'Корейский (한국어)',
      chinese: 'Китайский (中文)',
      dutch: 'Нидерландский (Nederlands)',
      romanian: 'Румынский (Română)',
      bulgarian: 'Болгарский (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Качество (4K → 1080p → 720p)',
      languageFirst: 'Предпочтительный язык, затем качество',
      sizeFirst: 'Размер файла (сначала наибольшие)',
      dateFirst: 'Дата добавления (сначала новейшие)',
    },
    qualityOptions: {
      allQualities: 'Все качества',
    },
    errors: {
      authFailed:
        'Ошибка аутентификации: Неверное имя пользователя или пароль\nПроверьте свои учетные данные и перенастройте addon',
    },
  },
  // Korean
  ko: {
    configPage: {
      title: '설정',
      copyConfig: '설정 복사',
      addToStremio: 'Stremio에 추가',
      configCopied: '복사됨!',
      version: '버전',
      description:
        'Easynews++는 뛰어난 성능, 고급 검색 기능 및 지능형 스트림 선택으로 Easynews 경험을 향상시키는 오픈 소스 애드온입니다. 사용자 정의 제목 지원, 다중 플랫폼 호환성 및 자체 호스팅 옵션을 제공합니다. <a href="https://discord.gg/Ma4SnagqwE">Discord</a>에서 커뮤니티에 참여하거나 <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>에서 기여하세요.',
      supportDevelopment: '지원',
    },
    form: {
      username: '사용자 이름',
      password: '비밀번호',
      strictTitleMatching: '엄격한 제목 일치',
      strictTitleMatchingHint:
        '권장: 영화나 시리즈 제목과 정확히 일치하지 않는 결과를 필터링합니다',
      preferredLanguage: '선호하는 오디오 언어',
      preferredLanguageHint:
        '선호하는 언어로 현지화된 제목이 있는 콘텐츠를 찾고 우선시하는 데 사용됩니다',
      sortingMethod: '정렬 방법',
      sortingMethodHint:
        '모든 옵션은 동일한 관련성 기반 API 검색을 사용한 다음 결과를 로컬에서 정렬합니다',
      uiLanguage: 'UI 언어',
      showQualities: '스트림 목록에 표시할 화질',
      maxResultsPerQuality: '화질당 최대 결과 수',
      maxFileSize: '파일 크기의 최대값 (GB)',
      noLimit: '제한 없음',
    },
    languages: {
      noPreference: '선호도 없음',
      english: '영어 (English)',
      german: '독일어 (Deutsch)',
      spanish: '스페인어 (Español)',
      french: '프랑스어 (Français)',
      italian: '이탈리아어 (Italiano)',
      japanese: '일본어 (Japanese)',
      portuguese: '포르투갈어 (Português)',
      russian: '러시아어 (Русский)',
      korean: '한국어 (Korean)',
      chinese: '중국어 (中文)',
      dutch: '네덜란드어 (Nederlands)',
      romanian: '루마니아어 (Română)',
      bulgarian: '불가리아어 (Български)',
    },
    sortingOptions: {
      qualityFirst: '화질 (4K → 1080p → 720p)',
      languageFirst: '선호 언어, 그다음 화질',
      sizeFirst: '파일 크기 (큰 것 우선)',
      dateFirst: '추가된 날짜 (최신 우선)',
    },
    qualityOptions: {
      allQualities: '모든 화질',
    },
    errors: {
      authFailed:
        '인증 실패: 잘못된 사용자 이름 또는 비밀번호\n사용자 이름과 비밀번호를 확인하고 addon을 다시 구성하세요',
    },
  },
  // Chinese
  zh: {
    configPage: {
      title: '配置',
      copyConfig: '复制配置',
      addToStremio: '添加到 Stremio',
      configCopied: '已复制!',
      version: '版本',
      description:
        'Easynews++是一个开源插件，通过卓越的性能、高级搜索功能和智能流选择增强Easynews体验。它具有自定义标题支持、多平台兼容性和自托管选项。加入我们的<a href="https://discord.gg/Ma4SnagqwE">Discord</a>社区或在<a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>上贡献。',
      supportDevelopment: '支持',
    },
    form: {
      username: '用户名',
      password: '密码',
      strictTitleMatching: '严格标题匹配',
      strictTitleMatchingHint: '推荐：过滤掉与电影或剧集标题不完全匹配的结果',
      preferredLanguage: '首选音频语言',
      preferredLanguageHint: '用于查找和优先显示具有首选语言本地化标题的内容',
      sortingMethod: '排序方法',
      sortingMethodHint: '所有选项都使用相同的基于相关性的API搜索，然后在本地对结果进行排序',
      uiLanguage: 'UI 语言',
      showQualities: '在流列表中显示的画质',
      maxResultsPerQuality: '每个画质的最多结果数',
      maxFileSize: '文件大小最大值 (GB)',
      noLimit: '无限制',
    },
    languages: {
      noPreference: '无偏好',
      english: '英语 (English)',
      german: '德语 (Deutsch)',
      spanish: '西班牙语 (Español)',
      french: '法语 (Français)',
      italian: '意大利语 (Italiano)',
      japanese: '日语 (日本語)',
      portuguese: '葡萄牙语 (Português)',
      russian: '俄语 (Русский)',
      korean: '韩语 (한국어)',
      chinese: '中文 (Chinese)',
      dutch: '荷兰语 (Nederlands)',
      romanian: '罗马尼亚语 (Română)',
      bulgarian: '保加利亚语 (Български)',
    },
    sortingOptions: {
      qualityFirst: '质量 (4K → 1080p → 720p)',
      languageFirst: '首选语言，然后是质量',
      sizeFirst: '文件大小（最大优先）',
      dateFirst: '添加日期（最新优先）',
    },
    qualityOptions: {
      allQualities: '所有画质',
    },
    errors: {
      authFailed: '身份验证失败：用户名或密码无效\n检查您的凭据并重新配置addon',
    },
  },
  // Dutch
  nl: {
    configPage: {
      title: 'Configuratie',
      copyConfig: 'Configuratie kopiëren',
      addToStremio: 'Toevoegen aan Stremio',
      configCopied: 'Gekopieerd!',
      version: 'Versie',
      description:
        'Easynews++ is een open-source addon dat de ervaring van Easynews verbetert met een betere prestaties, geavanceerde zoekmogelijkheden en intelligente streamselectie. Het biedt ondersteuning voor aangepaste titels, multi-platformcompatibiliteit en zelfhostingopties. Doe mee met onze gemeenschap op <a href="https://discord.gg/Ma4SnagqwE">Discord</a> of help ons op <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Ondersteuning',
    },
    form: {
      username: 'Gebruikersnaam',
      password: 'Wachtwoord',
      strictTitleMatching: 'Stricte titelovereenkomst',
      strictTitleMatchingHint:
        'Aanbevolen: Filtert resultaten die niet exact overeenkomen met de film- of serie-titel',
      preferredLanguage: 'Voorgestelde audiolanguage',
      preferredLanguageHint:
        'Wordt gebruikt om inhoud met gelokaliseerde titels in de voorkeurstaal te vinden en voorrang te geven',
      sortingMethod: 'Sorteermethode',
      sortingMethodHint:
        'Alle opties gebruiken dezelfde relevantie-gebaseerde API-zoekopdracht en sorteren vervolgens de resultaten lokaal',
      uiLanguage: 'Gebruikersinterface-taal',
      showQualities: 'Kwaliteiten om weer te geven in de streamlijst',
      maxResultsPerQuality: 'Maximale resultaten per kwaliteit',
      maxFileSize: 'Maximale bestandsgrootte in GB',
      noLimit: 'Geen limiet',
    },
    languages: {
      noPreference: 'Geen voorkeur',
      english: 'Engels (English)',
      german: 'Duits (Deutsch)',
      spanish: 'Spaans (Español)',
      french: 'Frans (Français)',
      italian: 'Italiaans (Italiano)',
      japanese: 'Japans (日本語)',
      portuguese: 'Portugees (Português)',
      russian: 'Russisch (Русский)',
      korean: 'Koreaans (한국어)',
      chinese: 'Chinees (中文)',
      dutch: 'Nederlands (Dutch)',
      romanian: 'Roemeens (Română)',
      bulgarian: 'Bulgaars (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Kwaliteit (4K → 1080p → 720p)',
      languageFirst: 'Voorgestelde taal, dan kwaliteit',
      sizeFirst: 'Bestandsgrootte (grootste eerst)',
      dateFirst: 'Datum toegevoegd (nieuwste eerst)',
    },
    qualityOptions: {
      allQualities: 'Alle kwaliteiten',
    },
    errors: {
      authFailed:
        'Authenticatie mislukt: Ongeldige gebruikersnaam of wachtwoord\nControleer uw referenties en configureer het addon opnieuw',
    },
  },
  // Romanian
  ro: {
    configPage: {
      title: 'Configurare',
      copyConfig: 'Copiați configurarea',
      addToStremio: 'Adăugați în Stremio',
      configCopied: 'Copiat!',
      version: 'Versiune',
      description:
        'Easynews++ este un addon open-source care îmbunătățește experiența Easynews cu performanțe superioare, funcții avansate de căutare și selecție inteligentă de fluxuri. Acesta oferă suport pentru titluri personalizate, compatibilitate multiplatform și opțiuni de auto-hosting. Faceți parte din comunitatea noastră pe <a href="https://discord.gg/Ma4SnagqwE">Discord</a> sau contribuiți la <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Suport',
    },
    form: {
      username: 'Nume utilizator',
      password: 'Parolă',
      strictTitleMatching: 'Potrivire strictă a titlului',
      strictTitleMatchingHint:
        'Recomandat: Filtrează rezultatele care nu se potrivesc exact cu titlul filmului sau serialului',
      preferredLanguage: 'Limbă audio preferată',
      preferredLanguageHint:
        'Utilizat pentru a găsi și prioritiza conținutul cu titluri localizate în limba preferată',
      sortingMethod: 'Metodă de sortare',
      sortingMethodHint:
        'Toate opțiunile folosesc aceeași căutare API bazată pe relevanță și apoi sortează rezultatele local',
      uiLanguage: 'Limbă interfacă',
      showQualities: 'Calități pentru afișare în lista de streamuri',
      maxResultsPerQuality: 'Rezultate maxime pe calitate',
      maxFileSize: 'Mărimea maximă a fișierului în GB',
      noLimit: 'Nici un limit',
    },
    languages: {
      noPreference: 'Fără preferință',
      english: 'Engleză (English)',
      german: 'Germană (Deutsch)',
      spanish: 'Spaniolă (Español)',
      french: 'Franceză (Français)',
      italian: 'Italiană (Italiano)',
      japanese: 'Japoneză (日本語)',
      portuguese: 'Portugheză (Português)',
      russian: 'Rusă (Русский)',
      korean: 'Coreeană (한국어)',
      chinese: 'Chineză (中文)',
      dutch: 'Olandeză (Nederlands)',
      romanian: 'Română (Romanian)',
      bulgarian: 'Bulgară (Български)',
    },
    sortingOptions: {
      qualityFirst: 'Calitate (4K → 1080p → 720p)',
      languageFirst: 'Limbă preferată, apoi calitate',
      sizeFirst: 'Mărimea fișierului (cele mai mari înainte)',
      dateFirst: 'Data adăugării (cele mai recente înainte)',
    },
    qualityOptions: {
      allQualities: 'Toate calitățile',
    },
    errors: {
      authFailed:
        'Autentificare eșuată: Nume de utilizator sau parolă nevalidă\nVerificați datele dumneavoastră și reconfigurați addon',
    },
  },
  // Bulgarian
  bg: {
    configPage: {
      title: 'Конфигурация',
      copyConfig: 'Копирай конфигурацията',
      addToStremio: 'Добави в Stremio',
      configCopied: 'Конфигурацията е копирана!',
      version: 'Версия',
      description:
        'Easynews++ е добавка с отворен код, която подобрява работата с Easynews с по-добра производителност, разширени възможности за търсене и интелигентен избор на поток. Той включва поддръжка на персонализирани заглавия, мултиплатформена съвместимост и опции за самостоятелно хостване. Присъединете се към нашата общност в <a href="https://discord.gg/Ma4SnagqwE">Discord</a> или допринасяйте в <a href="https://github.com/panteLx/easynews-plus-plus">GitHub</a>.',
      supportDevelopment: 'Поддръжка',
    },
    form: {
      username: 'Потребителско име',
      password: 'Парола',
      strictTitleMatching: 'Строго съответствие на заглавието',
      strictTitleMatchingHint:
        'Препоръчително: Филтрира резултати, които не съвпадат точно със заглавието на филма или сериала',
      preferredLanguage: 'Предпочитан аудио език',
      preferredLanguageHint:
        'Използва се за намиране и приоритизиране на съдържание с локализирани заглавия на предпочитания език',
      sortingMethod: 'Метод на сортиране',
      sortingMethodHint:
        'Всички опции използват едно и също търсене на API базирано на релевантност и след това сортират резултатите локално',
      uiLanguage: 'Език на потребителския интерфейс',
      showQualities: 'Качество за показване в списъка с потоци',
      maxResultsPerQuality: 'Максимален брой резултати на качество',
      maxFileSize: 'Максимален размер на файла (GB)',
      noLimit: 'Без ограничение',
    },
    languages: {
      noPreference: 'Без предпочитания',
      english: 'Английски език (English)',
      german: 'Немски (Deutsch)',
      spanish: 'Испански (Español)',
      french: 'Френски (Français)',
      italian: 'Италиански (Italiano)',
      japanese: 'Японски (日本語)',
      portuguese: 'Португалски (Português)',
      russian: 'Руски (Русский)',
      korean: 'Корейски (한국어)',
      chinese: 'Китайски (中文)',
      dutch: 'Нидерландски (Nederlands)',
      romanian: 'Румънски (Română)',
      bulgarian: 'Български',
    },
    sortingOptions: {
      qualityFirst: 'Качество (4K → 1080p → 720p)',
      languageFirst: 'Предпочитан език, след това качество',
      sizeFirst: 'Размер на файла (първо най-големият)',
      dateFirst: 'Дата на добавяне (най-новата първа)',
    },
    qualityOptions: {
      allQualities: 'Всички качества',
    },
    errors: {
      authFailed:
        'Неуспешна аутентикация: Невалидно потребителско име или парола\nПроверете вашите данни и реконфигурирайте addon',
    },
  },
};
