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
        mostPopular: string;
        includedServices: string;
        virtualTour: string;
        nearestProperties: string;
        availableRoomsFilter: string;
        bestDeals: string;
        soldOut: string;
        bestDealBadge: string;
        noPropertiesFound: string;
        noMatchesQuery: string;
        clearFilters: string;
        loadingBooking: string;
    };
    booking: {
        secureBooking: string;
        secureBookingDesc: string;
        stepStayInfo: string;
        checkInDate: string;
        checkOutDate: string;
        numberOfRooms: string;
        maxAvailable: string;
        stepGuestDetails: string;
        fullName: string;
        phone: string;
        email: string;
        emailOptional: string;
        specialRequests: string;
        specialRequestsOptional: string;
        stepPayment: string;
        payAtProperty: string;
        payAtPropertyDesc: string;
        payOnline: string;
        payOnlineDesc: string;
        bookingSummary: string;
        selectedRoom: string;
        nights: string;
        subtotal: string;
        tax: string;
        totalPayable: string;
        confirmBooking: string;
        processing: string;
        successTitle: string;
        successDesc: string;
        bookingId: string;
        totalPaid: string;
        backToHome: string;
        secureBookingMessage: string;
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
            mostPopular: "Most Popular",
            includedServices: "Included Services",
            virtualTour: "3D Tour",
            nearestProperties: "Nearest Properties",
            availableRoomsFilter: "Available Rooms",
            bestDeals: "Best Deals",
            soldOut: "Sold Out",
            bestDealBadge: "🔥 Best Deal",
            noPropertiesFound: "No Properties Found",
            noMatchesQuery: "No matches found for your search.",
            clearFilters: "Clear Filters",
            loadingBooking: "Loading booking details...",
        },
        booking: {
            secureBooking: "Secure Booking",
            secureBookingDesc: "Complete your details below to confirm your stay.",
            stepStayInfo: "Stay Information",
            checkInDate: "Check-in Date *",
            checkOutDate: "Check-out Date *",
            numberOfRooms: "Number of Rooms *",
            maxAvailable: "Maximum available in this package:",
            stepGuestDetails: "Guest Details",
            fullName: "Full Name *",
            phone: "Phone Number *",
            email: "Email Address (Optional)",
            emailOptional: "abebe@example.com",
            specialRequests: "Special Requests (Optional)",
            specialRequestsOptional: "Any special requirements or late arrival...",
            stepPayment: "Payment Method",
            payAtProperty: "Pay at Property",
            payAtPropertyDesc: "Pay when you arrive at the pension.",
            payOnline: "Pay Online",
            payOnlineDesc: "Telebirr, CBE Birr, M-PESA etc. (Coming Soon)",
            bookingSummary: "Booking Summary",
            selectedRoom: "Selected Room",
            nights: "nights",
            subtotal: "Subtotal",
            tax: "Taxes & Fees (15%)",
            totalPayable: "Total Payable",
            confirmBooking: "Confirm Booking",
            processing: "Processing...",
            successTitle: "Booking Confirmed!",
            successDesc: "Your reservation is confirmed.",
            bookingId: "Booking ID:",
            totalPaid: "Total Paid:",
            backToHome: "Back to Home",
            secureBookingMessage: "Your booking is secure. Payment is protected and your personal information is kept strictly confidential.",
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
            mostPopular: "Baay'ee Jaallatamaa",
            includedServices: "Tajaajiloota Dabalatee",
            virtualTour: "Daawwannaa 3D",
            nearestProperties: "Iddoowwan Dhihoo",
            availableRoomsFilter: "Kutaa Banaa",
            bestDeals: "Gatii Gaarii",
            soldOut: "Hunduu Qabameera",
            bestDealBadge: "🔥 Gatii Gaarii",
            noPropertiesFound: "Iddoowwan hin argamne",
            noMatchesQuery: "Barbaacha keetiif wanti wal simu hin argamne.",
            clearFilters: "Filannoowwan Haqi",
            loadingBooking: "Odeeffannoo buukingii fe'aa jira...",
        },
        booking: {
            secureBooking: "Buukingii Nageenyummaa",
            secureBookingDesc: "Turtii kee mirkaneessuuf odeeffannoo armaan gadii guuti.",
            stepStayInfo: "Odeeffannoo Turtii",
            checkInDate: "Guyyaa Seensaa *",
            checkOutDate: "Guyyaa Ba'iinsaa *",
            numberOfRooms: "Baay'ina Kutaa *",
            maxAvailable: "Paakeejii kana keessatti baay'inni argamu:",
            stepGuestDetails: "Odeeffannoo Keessummaa",
            fullName: "Maqaa Guutuu *",
            phone: "Lakkoofsa Bilbilaa *",
            email: "Teessoo Iimeelii (Filannoo)",
            emailOptional: "abebe@example.com",
            specialRequests: "Gaaffii Addaa (Filannoo)",
            specialRequestsOptional: "Ulaagaalee addaa ykn yeroo booda dhufuu...",
            stepPayment: "Mala Kaffaltii",
            payAtProperty: "Bakka Bultii Kaffaluu",
            payAtPropertyDesc: "Yeroo pensiinii geessu kaffali.",
            payOnline: "Toora Interneetiin Kaffaluu",
            payOnlineDesc: "Telebirr, CBE Birr, M-PESA fi kkf (Dhihootti Dhufa)",
            bookingSummary: "Cuunfaa Buukingii",
            selectedRoom: "Kutaa Filatame",
            nights: "halkaniif",
            subtotal: "Dimshaasha Xiqqaa",
            tax: "Gibira fi Kaffaltii (15%)",
            totalPayable: "Waliigala Kaffalamu",
            confirmBooking: "Buukingii Mirkaneessi",
            processing: "Adeemsisaa jira...",
            successTitle: "Bukiingiin Mirkanaa'eera!",
            successDesc: "Bukiingiin kee mirkanaa'eera.",
            bookingId: "Lakkoofsa Bukiingii:",
            totalPaid: "Waliigala Kaffalame:",
            backToHome: "Gara Manaatti Deebi'i",
            secureBookingMessage: "Bukiingiin keessi eegamaadha. Kaffaltiin kee fi odeeffannoon dhuunfaa dhoksaadhaan qabama.",
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
            mostPopular: "በጣም ተመራጭ",
            includedServices: "የተካተቱ አገልግሎቶች",
            virtualTour: "የ3D ጉብኝት",
            nearestProperties: "በአቅራቢያ ያሉ ንብረቶች",
            availableRoomsFilter: "የሚገኙ ክፍሎች",
            bestDeals: "ምርጥ ቅናሾች",
            soldOut: "ሙሉ በሙሉ ተይዟል",
            bestDealBadge: "🔥 ምርጥ ቅናሽ",
            noPropertiesFound: "ምንም ንብረቶች አልተገኙም",
            noMatchesQuery: "ለፍለጋዎ የሚዛመድ ምንም አልተገኘም።",
            clearFilters: "ማጣሪያዎችን አጽዳ",
            loadingBooking: "የቡኪንግ መረጃ በማምጣት ላይ...",
        },
        booking: {
            secureBooking: "ደህንነቱ የተጠበቀ ቡኪንግ",
            secureBookingDesc: "ቆይታዎን ለማረጋገጥ ከታች ዝርዝሮችዎን ይሙሉ፡፡",
            stepStayInfo: "የቆይታ መረጃ",
            checkInDate: "የመግቢያ ቀን *",
            checkOutDate: "የመውጫ ቀን *",
            numberOfRooms: "የክፍሎች ብዛት *",
            maxAvailable: "በዚህ ፓኬጅ ውስጥ ከፍተኛው የሚገኝ:",
            stepGuestDetails: "የእንግዳ ዝርዝሮች",
            fullName: "ሙሉ ስም *",
            phone: "ስልክ ቁጥር *",
            email: "የኢሜይል አድራሻ (አማራጭ)",
            emailOptional: "abebe@example.com",
            specialRequests: "ልዩ ጥያቄዎች (አማራጭ)",
            specialRequestsOptional: "ማንኛውም ልዩ መስፈርቶች ወይም ዘግይቶ መድረስ...",
            stepPayment: "የመክፈያ ዘዴ",
            payAtProperty: "በንብረቱ ላይ ይክፈሉ",
            payAtPropertyDesc: "ፔንሽን ሲደርሱ ይክፈሉ።",
            payOnline: "በኦንላይን ይክፈሉ",
            payOnlineDesc: "Telebirr, CBE Birr, M-PESA ወዘተ (በቅርቡ የሚመጣ)",
            bookingSummary: "የቦታ ማስያዣ ማጠቃለያ",
            selectedRoom: "የተመረጠ ክፍል",
            nights: "ሌሊቶች",
            subtotal: "ንዑስ ድምር",
            tax: "ግብር እና ክፍያዎች (15%)",
            totalPayable: "አጠቃላይ ክፍያ",
            confirmBooking: "ቡኪንግ ያረጋግጡ",
            processing: "በማስኬድ ላይ...",
            successTitle: "ቦታ ማስያዝ ተረጋግጧል!",
            successDesc: "ቦታ ማስያዝዎ ተረጋግጧል።",
            bookingId: "የቦታ ማስያዣ መታወቂያ:",
            totalPaid: "የተከፈለ መጠን:",
            backToHome: "ወደ መነሻ ይመለሱ",
            secureBookingMessage: "ቦታ ማስያዝዎ ደህንነቱ የተጠበቀ ነው። ክፍያዎ የተጠበቀ ሲሆን የግል መረጃዎም በሚስጥር ይጠበቃል።",
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

export const dynamicTranslations: Record<Language, Record<string, string>> = {
    en: {},
    om: {
        // Packages
        "Basic": "Bu'uura",
        "Standard": "Idilee",
        "Premium": "Olaanaa",
        // Services
        "Standard WiFi": "WiFi Idilee",
        "Shared Bathroom": "Mana Fincaan Waloo",
        "Daily Cleaning": "Qulqullina Guyyaa",
        "High-speed WiFi": "WiFi Saffisaa",
        "Private Bathroom": "Mana Fincaan Dhuunfaa",
        "Breakfast Included": "Ciree Dabalatee",
        "Free Parking": "Ijaarsa Konkolaataa Bilisa",
        "Premium WiFi": "WiFi Olaanaa",
        "Private Balcony": "Baalkoonii Dhuunfaa",
        "3 Meals Included": "Nyaata 3 Dabalatee",
        "Airport Pickup": "Dirree Xiyyaaraatii Fudhachuu",
        "Laundry Service": "Tajaajila Uffata Miiccuu",
        "Fresh Towels": "Fooxaa Haaraa",
        "En-suite Bathroom": "Mana Fincaan Keessaa",
        "All Meals Included": "Nyaanni Hundi Dabalatee",
        "Fresh Linens": "Uffata Siree Haaraa",
        "Dedicated Workspace": "Iddoo Hojii Dhuunfaa",
        "Airport Transfer": "Geejjiba Dirree Xiyyaaraa",
        "Weekly Cleaning": "Qulqullina Torbee",
        "Basic Cleaning": "Qulqullina Bu'uuraa",
        // Descriptions (Package)
        "Room only with shared essentials.": "Kutaa qofa wantoota bu'uuraa waloo waliin.",
        "Comfortable stay with private amenities.": "Turtii mijataa wantoota dhuunfaa waliin.",
        "Luxury experience with full board.": "Muuxannoo olaanaa nyaata guutuu waliin.",
        "Functional and affordable room.": "Kutaa tajaajila gaarii fi gatii madaalawaa qabu.",
        "Comfort room with private bathroom.": "Kutaa mijataa mana fincaan dhuunfaa waliin.",
        "Spacious room with city view.": "Kutaa bal'aa magaalaa agarsiisu.",
        "Compact room with essential utilities.": "Kutaa xiqqaa tajaajiloota bu'uuraa waliin.",
        "Basic business room with workspace.": "Kutaa hojii bu'uuraa iddoo hojii waliin.",
        "Executive room with all-inclusive services.": "Kutaa hooggansaa tajaajiloota hunda dabalatee.",
        "Standard room, very budget-friendly.": "Kutaa idilee, gatii baay'ee madaalawaa.",
        "Entry-level private room.": "Kutaa dhuunfaa sadarkaa jalqabaa.",
        "Larger room with better ventilation and services.": "Kutaa bal'aa qilleensa fi tajaajila gaarii waliin.",
        "Standard lodge room.": "Kutaa loojii idilee.",
        "Large room with balcony.": "Kutaa bal'aa baalkoonii waliin.",
        "Practical shared-facility room.": "Kutaa tajaajila waloo qabu.",
        "Standard private room.": "Kutaa dhuunfaa idilee.",
        "Large shared-apartment room with all perks.": "Kutaa bal'aa appaartamaantii waloo faayidaa hunda waliin.",
        // Descriptions (Room Overview)
        "Clean and affordable pension close to key transport and shopping areas.": "Pensiinii qulqulluu fi gatii madaalawaa iddoo geejjibaa fi gabaatti dhihoo.",
        "Cozy rooms for short and mid-term stays in central Addis.": "Kutoota mijataa turtii yeroo gabaabaa fi giddugaleessaaf giddugala Finfinneetti.",
        "Modern pension with upgraded interiors and on-site support staff.": "Pensiinii ammayaa meeshaalee keessaa fooyya'anii fi hojjettoota deeggarsaa waliin.",
        "Budget-friendly property with easy access to city bus routes.": "Qabeenya gatii madaalawaa daandii awtoobusii magaalaatti salphaatti argamu.",
        "Comfort-oriented lodge with improved facilities and reception desk.": "Loojii mijummaa irratti xiyyeeffate tajaajiloota fooyya'anii fi keessummeessaa waliin.",
        "Convenient city-center rooms for students, workers, and visitors.": "Kutoota giddugala magaalaa mijatoo barattoota, hojjettoota fi daawwattootaaf.",
        // Owner Info
        "Managed by Sunshine Hospitality PLC.": "Wiixata Keessummeessaa Sunshine PLC tiin bulchama.",
        "Family-run guest house with 10+ years of service.": "Mana keessummaa maatiin bulchamu kan tajaajila waggaa 10+ qabu.",
        "Operated by Habesha City Lodging.": "Habesha City Lodging tiin hojjatama.",
        "Privately owned neighborhood pension.": "Pensiinii naannoo dhuunfaan qabame.",
        "Managed by Royal Comfort Holdings.": "Royal Comfort Holdings tiin bulchama.",
        "Operated by City Center Housing Services.": "Tajaajila Mana Giddugala Magaalaatiin hojjatama.",
        // Room Details
        "Single and double rooms with private bathroom options.": "Kutoota siree tokkoo fi lamaa filannoo mana fincaan dhuunfaa waliin.",
        "Quiet floors, daily housekeeping, and optional meal plans.": "Darbii cal jedhe, qulqullina guyyaa fi filannoo nyaataa.",
        "Business-friendly rooms with desk space and fast internet.": "Kutoota hojiif mijatan iddoo minxaaxii fi intarneetii saffisaa waliin.",
        "Simple rooms for students and workers.": "Kutoota salphaa barattoota fi hojjettootaaf.",
        "Includes rooms with private balcony and improved ventilation.": "Kutoota baalkoonii dhuunfaa fi qilleensa gaarii waliin.",
        "Flexible stay duration and practical shared facilities.": "Turtii jijjiirramaa fi tajaajiloota waloo qabatamaa.",
    },
    am: {
        // Packages
        "Basic": "መሰረታዊ",
        "Standard": "መደበኛ",
        "Premium": "ፕሪሚየም",
        // Services
        "Standard WiFi": "መደበኛ ዋይፋይ",
        "Shared Bathroom": "የጋራ መታጠቢያ ቤት",
        "Daily Cleaning": "ዕለታዊ ጽዳት",
        "High-speed WiFi": "ፈጣን ዋይፋይ",
        "Private Bathroom": "የግል መታጠቢያ ቤት",
        "Breakfast Included": "ቁርስ ተካትቷል",
        "Free Parking": "ነጻ ማቆሚያ",
        "Premium WiFi": "ፕሪሚየም ዋይፋይ",
        "Private Balcony": "የግል በረንዳ",
        "3 Meals Included": "3 ምግቦች ተካትተዋል",
        "Airport Pickup": "ከአየር ማረፊያ መቀበል",
        "Laundry Service": "የልብስ ማጠብ አገልግልት",
        "Fresh Towels": "አዲስ ፎጣዎች",
        "En-suite Bathroom": "የውስጥ መታጠቢያ ቤት",
        "All Meals Included": "ሁሉም ምግቦች ተካትተዋል",
        "Fresh Linens": "አዲስ አንሶላዎች",
        "Dedicated Workspace": "የተመደበ የስራ ቦታ",
        "Airport Transfer": "የአየር ማረፊያ ትራንስፖርት",
        "Weekly Cleaning": "ሳምንታዊ ጽዳት",
        "Basic Cleaning": "መሰረታዊ ጽዳት",
        // Descriptions (Package)
        "Room only with shared essentials.": "ክፍል ብቻ ከጋራ አቅርቦቶች ጋር።",
        "Comfortable stay with private amenities.": "ምቹ ቆይታ ከግል አገልግሎቶች ጋር።",
        "Luxury experience with full board.": "የቅንጦት ተሞክሮ ከሙሉ ምግብ ጋር።",
        "Functional and affordable room.": "ውጤታማ እና ተመጣጣኝ ክፍል ።",
        "Comfort room with private bathroom.": "ምቹ ክፍል ከግል መታጠቢያ ቤት ጋር።",
        "Spacious room with city view.": "ሰፊ ክፍል የከተማ እይታ ያለው።",
        "Compact room with essential utilities.": "መሰረታዊ አገልግሎቶች ያሉት አነስተኛ ክፍል ።",
        "Basic business room with workspace.": "መሰረታዊ የንግድ ክፍል ከስራ ቦታ ጋር።",
        "Executive room with all-inclusive services.": "የአስተዳደር ክፍል ሁሉን አቀፍ አገልግሎት ጋር።",
        "Standard room, very budget-friendly.": "መደበኛ ክፍል፣ በጣም ተመጣጣኝ የሆነ።",
        "Entry-level private room.": "የመግቢያ ደረጃ የግል ክፍል ።",
        "Larger room with better ventilation and services.": "ሰፊ ክፍል ከተሻለ አየር እና አገልግሎቶች ጋር።",
        "Standard lodge room.": "መደበኛ የሎጅ ክፍል ።",
        "Large room with balcony.": "ሰፊ ክፍል ከበረንዳ ጋር።",
        "Practical shared-facility room.": "የጋራ አገልግሎት መገልገያ ክፍል ።",
        "Standard private room.": "መደበኛ የግል ክፍል ።",
        "Large shared-apartment room with all perks.": "ከሁሉም ጥቅሞች ጋር ትልቅ የጋራ አፓርትመንት ክፍል ።",
        // Descriptions (Room Overview)
        "Clean and affordable pension close to key transport and shopping areas.": "ለንግድ እና ለትራንስፖርት ቦታዎች ቅርብ የሆነ ንጹህ እና ተመጣጣኝ ፔንሽን ።",
        "Cozy rooms for short and mid-term stays in central Addis.": "ለአጭር እና ለመካከለኛ ጊዜ ቆይታ ምቹ ክፍሎች በማዕከላዊ አዲስ አበባ።",
        "Modern pension with upgraded interiors and on-site support staff.": "ባዘመኑ የውስጥ ክፍሎች እና ድጋፍ ሰጪ ሰራተኞች ያሉት ዘመናዊ ፔንሽን ።",
        "Budget-friendly property with easy access to city bus routes.": "ለከተማ አውቶቡስ መስመሮች በቀላሉ የሚገኝ ተመጣጣኝ ንብረት።",
        "Comfort-oriented lodge with improved facilities and reception desk.": "በምቾት ላይ ያተኮረ ሎጅ በተሻሻሉ አገልግሎቶች የተሟላ።",
        "Convenient city-center rooms for students, workers, and visitors.": "ለተማሪዎች፣ ሰራተኞች እና ጎብኝዎች ምቹ የከተማ-ማዕከል ክፍሎች ።",
        // Owner Info
        "Managed by Sunshine Hospitality PLC.": "በሰንሻይን መስተንግዶ PLC የሚተዳደር።",
        "Family-run guest house with 10+ years of service.": "የ10+ ዓመታት አገልግሎት ያለው በቤተሰብ የሚተዳደር የነፃ እንግዳ ቤት።",
        "Operated by Habesha City Lodging.": "በሀበሻ ከተማ ሎጅንግ የሚተዳደር።",
        "Privately owned neighborhood pension.": "የግል ንብረት የሆነ የሰፈር ፔንሽን ።",
        "Managed by Royal Comfort Holdings.": "በRoyal Comfort Holdings የሚተዳደር።",
        "Operated by City Center Housing Services.": "በከተማ ማዕከል የቤት አገልግሎቶች የሚተዳደር።",
        // Room Details
        "Single and double rooms with private bathroom options.": "የግል መታጠቢያ ቤት አማራጭ ያላቸው ነጠላ እና ድርብ ክፍሎች።",
        "Quiet floors, daily housekeeping, and optional meal plans.": "ጸጥ ያሉ ወለሎች፣ የእለት ተእለት ጽዳት፣ እና የምግብ ዕቅድ አማራጮች።",
        "Business-friendly rooms with desk space and fast internet.": "ለስራ ምቹ ክፍሎች ከስራ ጠረጴዛ እና ፈጣን ኢንተርኔት ጋር።",
        "Simple rooms for students and workers.": "ለተማሪዎች እና ሰራተኞች ቀላል ክፍሎች።",
        "Includes rooms with private balcony and improved ventilation.": "የግል በረንዳ እና የተሻለ አየር ያላቸውን ክፍሎች ያካትታል ።",
        "Flexible stay duration and practical shared facilities.": "ተለዋዋጭ የቆይታ ጊዜ እና የጋራ አገልግሎቶች።",
    }
};

export const trDict = (text: string, lang: Language): string => {
    if (lang === "en") return text;
    return dynamicTranslations[lang]?.[text] || text;
};
