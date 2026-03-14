export type Language = "en" | "om" | "am";

export const languageLabels: Record<Language, string> = {
  en: "English",
  om: "Afaan Oromoo",
  am: "አማርኛ",
};

export interface TranslationSchema {
  navbar: {
    howItWorks: string;
    listProperty: string;
    languageLabel: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    searchPlaceholder: string;
    finding: string;
    findNearMe: string;
    locationNote: string;
  };
  propertyGrid: {
    title: string;
    subtitle: string;
    items: Array<{ name: string; address: string }>;
  };
  propertyCard: {
    room: string;
    rooms: string;
    left: string;
    away: string;
    perNight: string;
    locationLabel: string;
    startingPriceLabel: string;
    viewProfile: string;
    openInMaps: string;
  };
  rooms: {
    listTitle: string;
    listSubtitle: string;
    noRooms: string;
    loadingList: string;
    loadingProfile: string;
    locationPrefix: string;
    availableRooms: string;
    profileTitlePrefix: string;
    aboutTitle: string;
    ownerInfoTitle: string;
    roomDetailsTitle: string;
    servicesTitle: string;
    packagesTitle: string;
    locationTitle: string;
    mapPlaceholder: string;
    packageName: string;
    packagePrice: string;
    packageDescription: string;
    backToRooms: string;
    notFound: string;
    openInMaps: string;
    bookNow: string;
    contactHost: string;
    watchVideo: string;
    viewPhotos: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; desc: string }>;
  };
  ownerBanner: {
    badge: string;
    title: string;
    subtitle: string;
    benefits: Array<{ title: string; desc: string }>;
    cta: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    support: string;
    about: string;
    forOwners: string;
    contact: string;
    privacy: string;
    terms: string;
    rights: string;
  };
  notFound: {
    message: string;
    backHome: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    navbar: {
      howItWorks: "How it works",
      listProperty: "List Your Property",
      languageLabel: "Language",
    },
    hero: {
      badge: "Find nearby pensions instantly",
      titleLine1: "Find Available Rooms",
      titleLine2: "Near You",
      subtitle:
        "Qirb Alga helps you discover affordable pensions with available rooms - sorted by distance from your current location.",
      searchPlaceholder: "Search by pension name or area...",
      finding: "Finding...",
      findNearMe: "Find Near Me",
      locationNote: "We use your location only to show nearby available rooms - nothing else.",
    },
    propertyGrid: {
      title: "Available Pensions Near You",
      subtitle: "Sorted by distance - the closest rooms with availability appear first.",
      items: [
        { name: "Sunshine Pension", address: "Bole, Addis Ababa" },
        { name: "Abyssinia Guest House", address: "Piassa, Addis Ababa" },
        { name: "Habesha Inn", address: "Kazanchis, Addis Ababa" },
        { name: "Green Valley Pension", address: "Mexico, Addis Ababa" },
        { name: "Royal Comfort Lodge", address: "Sarbet, Addis Ababa" },
        { name: "City Center Rooms", address: "Arat Kilo, Addis Ababa" },
      ],
    },
    propertyCard: {
      room: "Room",
      rooms: "Rooms",
      left: "Left",
      away: "away",
      perNight: "/night",
      locationLabel: "Location",
      startingPriceLabel: "Starting Price",
      viewProfile: "View Room Profile",
      openInMaps: "Open in Google Maps",
    },
    rooms: {
      listTitle: "Discover Available Pensions",
      listSubtitle: "Real-time room availability, location, and package pricing in one place.",
      noRooms: "No rooms are available right now.",
      loadingList: "Loading rooms...",
      loadingProfile: "Loading room profile...",
      locationPrefix: "Location",
      availableRooms: "Available Rooms",
      profileTitlePrefix: "Room Profile",
      aboutTitle: "About",
      ownerInfoTitle: "Owner / Property Info",
      roomDetailsTitle: "Room Details",
      servicesTitle: "Services",
      packagesTitle: "Packages",
      locationTitle: "Location",
      mapPlaceholder: "Map integration ready (Google Maps / OpenStreetMap / Mapbox)",
      packageName: "Package",
      packagePrice: "Price",
      packageDescription: "Description",
      backToRooms: "Back to Rooms",
      notFound: "Room profile not found.",
      openInMaps: "Open in Google Maps",
      bookNow: "Book Now",
      contactHost: "Contact Host",
      watchVideo: "Video",
      viewPhotos: "Photos",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Finding a room near you takes just 3 simple steps.",
      steps: [
        {
          title: "Share Your Location",
          desc: "Allow location access so we can find pensions near you.",
        },
        {
          title: "Browse Available Rooms",
          desc: "See real-time availability, prices, and distances at a glance.",
        },
        {
          title: "Book & Stay",
          desc: "Choose your room and confirm your stay - fast and easy.",
        },
      ],
    },
    ownerBanner: {
      badge: "For Pension Owners",
      title: "Fill Your Empty Rooms Today",
      subtitle:
        "Join Qirb Alga and let nearby guests find your available rooms instantly. It's free to list.",
      benefits: [
        {
          title: "Reach More Guests",
          desc: "Get discovered by travelers searching near your location.",
        },
        {
          title: "Fill Empty Rooms",
          desc: "Show real-time availability and attract last-minute bookings.",
        },
        {
          title: "Easy Setup",
          desc: "List your property in under 5 minutes - no tech skills needed.",
        },
      ],
      cta: "Register Your Property - It's Free",
    },
    footer: {
      tagline: "Discover and book the best pensions near you with ease.",
      quickLinks: "Quick Links",
      support: "Support",
      about: "About",
      forOwners: "For Owners",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms of Service",
      rights: "All rights reserved.",
    },
    notFound: {
      message: "Oops! Page not found",
      backHome: "Return to Home",
    },
  },
  om: {
    navbar: {
      howItWorks: "Akka inni hojjetu",
      listProperty: "Qabeenya Kee Galmeessi",
      languageLabel: "Afaan",
    },
    hero: {
      badge: "Pensiinoota si dhihoo jiran dafii argadhu",
      titleLine1: "Kutaa Iddoo Jiran Argadhu",
      titleLine2: "Si Dhihoo",
      subtitle:
        "Qirb Alga pensiinoota gatii madaalawaa fi kutaa banaa qaban akka argattu si gargaara - fageenya bakka ati jirtu irraa tartiibaan.",
      searchPlaceholder: "Maqaa pensiinii ykn naannoo barbaadi...",
      finding: "Barbaadaa jira...",
      findNearMe: "Na Dhihoo Barbaadi",
      locationNote: "Bakki ati jirtu kutaa si dhihoo jiran agarsiisuuf qofa fayyadama - waan biraa miti.",
    },
    propertyGrid: {
      title: "Pensiinoota Si Dhihoo Jiran",
      subtitle: "Fageenyaan tartiibame - kutaan dhihoo fi banaan duratti mul'ata.",
      items: [
        { name: "Pensiinii Sunshine", address: "Bolee, Finfinnee" },
        { name: "Mana Keessummaa Abyssinia", address: "Piassaa, Finfinnee" },
        { name: "Habesha Inn", address: "Kazanchis, Finfinnee" },
        { name: "Pensiinii Green Valley", address: "Mexico, Finfinnee" },
        { name: "Royal Comfort Lodge", address: "Sarbet, Finfinnee" },
        { name: "City Center Rooms", address: "Arat Kilo, Finfinnee" },
      ],
    },
    propertyCard: {
      room: "Kutaa",
      rooms: "Kutaa",
      left: "Hafe",
      away: "fagaata",
      perNight: "/halkan",
      locationLabel: "Bakka",
      startingPriceLabel: "Gatii jalqabaa",
      viewProfile: "Profaayilii Kutaa Ilaali",
      openInMaps: "Google Maps keessatti bani",
    },
    rooms: {
      listTitle: "Pensiinoota Banaa Argadhu",
      listSubtitle: "Banaa kutaa yeroo ammaa, bakka fi gatii paakeejii iddoo tokko irraa ilaali.",
      noRooms: "Yeroo ammaa kutaan hin argamne.",
      loadingList: "Kutoota fe'aa jira...",
      loadingProfile: "Profaayilii kutaa fe'aa jira...",
      locationPrefix: "Bakka",
      availableRooms: "Kutaa Banaa",
      profileTitlePrefix: "Profaayilii Kutaa",
      aboutTitle: "Waa'ee",
      ownerInfoTitle: "Odeeffannoo Abbaa Qabeenyaa",
      roomDetailsTitle: "Bal'ina Kutaa",
      servicesTitle: "Tajaajiloota",
      packagesTitle: "Paakeejota",
      locationTitle: "Bakka",
      mapPlaceholder: "Walitti hidhamiinsa kaartaa qophaa'eera (Google Maps / OpenStreetMap / Mapbox)",
      packageName: "Paakeejii",
      packagePrice: "Gatii",
      packageDescription: "Ibsa",
      backToRooms: "Gara Kutootaatti Deebi'i",
      notFound: "Profaayiliin kutaa hin argamne.",
      openInMaps: "Google Maps keessatti bani",
      bookNow: "Amma Buki Godhi",
      contactHost: "Abbaa Qabeenyaa Quunnami",
      watchVideo: "Viidiyoo",
      viewPhotos: "Suuraa",
    },
    howItWorks: {
      title: "Akka Inni Hojjetu",
      subtitle: "Kutaa si dhihoo jiru argachuun tarkaanfii salphaa 3 qofaan raawwatama.",
      steps: [
        {
          title: "Bakka Jirtu Qoodi",
          desc: "Bakka jirtu eeyyami; pensiinoota si dhihoo jiran akka arginuuf.",
        },
        {
          title: "Kutaa Banaa Ilaali",
          desc: "Banaadha, gatii fi fageenya yeroo ammaa ija tokkoon ilaali.",
        },
        {
          title: "Buki godhi fi Turi",
          desc: "Kutaa kee filadhu; turtii kee saffisaan mirkaneessi.",
        },
      ],
    },
    ownerBanner: {
      badge: "Abbootii Pensiiniif",
      title: "Kutaa Duwwaa Kee Har'a Guuti",
      subtitle:
        "Qirb Alga waliin hirmaadhu; keessummoonni si dhihoo jiran kutaa kee banaa dafanii haa argan. Galmeessuun bilisaadha.",
      benefits: [
        {
          title: "Keessummoota Hedduu Geessi",
          desc: "Imaltoonni naannoo kee barbaadan si akka argan taasiisi.",
        },
        {
          title: "Kutaa Duwwaa Guuti",
          desc: "Banaa yeroo ammaa agarsiisi; buki daqiiqaa dhumaa jajjabeessi.",
        },
        {
          title: "Qophii Salphaa",
          desc: "Daqiiqaa 5 keessatti qabeenya kee galmeessi - ogummaa teeknikaa hin barbaachisu.",
        },
      ],
      cta: "Qabeenya Kee Galmeessi - Bilisa",
    },
    footer: {
      tagline: "Pensiinoota filatamoo si dhihoo jiran salphaatti argadhu.",
      quickLinks: "Geessituuwwan",
      support: "Deeggarsa",
      about: "Waa'ee",
      forOwners: "Abbootii Qabeenyaaf",
      contact: "Nu Qunnami",
      privacy: "Iccitii",
      terms: "Waliigaltee",
      rights: "Mirgi hundi eegameera.",
    },
    notFound: {
      message: "Baga gaddite! Fuulli kun hin argamne",
      backHome: "Gara Manaatti Deebi'i",
    },
  },
  am: {
    navbar: {
      howItWorks: "እንዴት እንደሚሰራ",
      listProperty: "ንብረትዎን ያስመዝግቡ",
      languageLabel: "ቋንቋ",
    },
    hero: {
      badge: "በአቅራቢያዎ ያሉ ፔንሽኖችን በፍጥነት ያግኙ",
      titleLine1: "የሚገኙ ክፍሎችን ያግኙ",
      titleLine2: "በአቅራቢያዎ",
      subtitle:
        "Qirb Alga በአካባቢዎ ያሉ ክፍል ያላቸውን ተመጣጣኝ ፔንሽኖች እንዲያገኙ ይረዳዎታል - ከቦታዎ ርቀት መሰረት ተደርጎ።",
      searchPlaceholder: "በፔንሽን ስም ወይም አካባቢ ይፈልጉ...",
      finding: "በመፈለግ ላይ...",
      findNearMe: "በአቅራቢያዬ ፈልግ",
      locationNote: "አካባቢዎን የምንጠቀመው በአቅራቢያዎ ያሉ ክፍሎችን ለማሳየት ብቻ ነው - ሌላ አይደለም።",
    },
    propertyGrid: {
      title: "በአቅራቢያዎ ያሉ ፔንሽኖች",
      subtitle: "በርቀት የተደረደሩ - ቅርብ እና ባዶ ክፍሎች መጀመሪያ ይታያሉ።",
      items: [
        { name: "Sunshine ፔንሽን", address: "ቦሌ፣ አዲስ አበባ" },
        { name: "Abyssinia እንግዳ ቤት", address: "ፒያሳ፣ አዲስ አበባ" },
        { name: "Habesha Inn", address: "ካዛንቺስ፣ አዲስ አበባ" },
        { name: "Green Valley ፔንሽን", address: "ሜክሲኮ፣ አዲስ አበባ" },
        { name: "Royal Comfort Lodge", address: "ሳርቤት፣ አዲስ አበባ" },
        { name: "City Center Rooms", address: "አራት ኪሎ፣ አዲስ አበባ" },
      ],
    },
    propertyCard: {
      room: "ክፍል",
      rooms: "ክፍሎች",
      left: "ቀርቷል",
      away: "ርቀት",
      perNight: "/ሌሊት",
      locationLabel: "ቦታ",
      startingPriceLabel: "የመነሻ ዋጋ",
      viewProfile: "የክፍል ፕሮፋይል ይመልከቱ",
      openInMaps: "በGoogle Maps ክፈት",
    },
    rooms: {
      listTitle: "የሚገኙ ፔንሽኖችን ያግኙ",
      listSubtitle: "የክፍል ክፍተት፣ ቦታ እና የፓኬጅ ዋጋ በአንድ ቦታ ይመልከቱ።",
      noRooms: "አሁን የሚገኝ ክፍል የለም።",
      loadingList: "ክፍሎች በመጫን ላይ...",
      loadingProfile: "የክፍል ፕሮፋይል በመጫን ላይ...",
      locationPrefix: "ቦታ",
      availableRooms: "የሚገኙ ክፍሎች",
      profileTitlePrefix: "የክፍል ፕሮፋይል",
      aboutTitle: "ስለ ንብረቱ",
      ownerInfoTitle: "የባለቤት / ንብረት መረጃ",
      roomDetailsTitle: "የክፍል ዝርዝር",
      servicesTitle: "አገልግሎቶች",
      packagesTitle: "ፓኬጆች",
      locationTitle: "ቦታ",
      mapPlaceholder: "የካርታ ግንኙነት ዝግጁ ነው (Google Maps / OpenStreetMap / Mapbox)",
      packageName: "ፓኬጅ",
      packagePrice: "ዋጋ",
      packageDescription: "መግለጫ",
      backToRooms: "ወደ ክፍሎች ተመለስ",
      notFound: "የክፍል ፕሮፋይል አልተገኘም።",
      openInMaps: "በGoogle Maps ክፈት",
      bookNow: "አሁን ያስይዙ",
      contactHost: "አስተናጋጁን ያግኙ",
      watchVideo: "ቪዲዮ",
      viewPhotos: "ፎቶዎች",
    },
    howItWorks: {
      title: "እንዴት እንደሚሰራ",
      subtitle: "በአቅራቢያዎ ክፍል ማግኘት 3 ቀላል ደረጃዎች ብቻ ይፈልጋል።",
      steps: [
        {
          title: "አካባቢዎን ያጋሩ",
          desc: "በአቅራቢያዎ ያሉ ፔንሽኖችን እንድናገኝ የአካባቢ ፍቃድ ይስጡ።",
        },
        {
          title: "ያሉ ክፍሎችን ይመልከቱ",
          desc: "የአሁኑን ክፍተት፣ ዋጋ እና ርቀት በአንድ እይታ ይመልከቱ።",
        },
        {
          title: "ይያዙ እና ይቆዩ",
          desc: "ክፍልዎን ይምረጡ እና ቆይታዎን በፍጥነት ያረጋግጡ።",
        },
      ],
    },
    ownerBanner: {
      badge: "ለፔንሽን ባለቤቶች",
      title: "ባዶ ክፍሎችዎን ዛሬ ይሙሉ",
      subtitle:
        "Qirb Alga ን ይቀላቀሉ፤ በአቅራቢያዎ ያሉ እንግዶች ያሉ ክፍሎችዎን ወዲያውኑ እንዲያገኙ። መመዝገብ ነጻ ነው።",
      benefits: [
        {
          title: "ብዙ እንግዶችን ይድረሱ",
          desc: "በአካባቢዎ የሚፈልጉ ተጓዦች እንዲያገኙዎ ያድርጉ።",
        },
        {
          title: "ባዶ ክፍሎችን ይሙሉ",
          desc: "የአሁኑን ክፍተት ያሳዩ እና የመጨረሻ ደቂቃ ቦታ ማስያዣ ያግኙ።",
        },
        {
          title: "ቀላል ማስጀመሪያ",
          desc: "ንብረትዎን በ5 ደቂቃ ውስጥ ያስመዝግቡ - ቴክኒክ ክህሎት አያስፈልግም።",
        },
      ],
      cta: "ንብረትዎን ያስመዝግቡ - ነጻ",
    },
    footer: {
      tagline: "በአቅራቢያዎ ያሉ ምርጥ ፔንሽኖችን በቀላሉ ያግኙ እና ያስይዙ።",
      quickLinks: "ፈጣን አገናኞች",
      support: "ድጋፍ",
      about: "ስለ እኛ",
      forOwners: "ለባለቤቶች",
      contact: "ያግኙን",
      privacy: "ግላዊነት",
      terms: "የአገልግሎት ውሎች",
      rights: "ሁሉም መብቶች የተጠበቁ ናቸው።",
    },
    notFound: {
      message: "ይቅርታ! ገጹ አልተገኘም",
      backHome: "ወደ መነሻ ይመለሱ",
    },
  },
};
