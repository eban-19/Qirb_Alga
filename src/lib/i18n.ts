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
    appDownload: {
        badge: string;
        title: string;
        subtitle: string;
        googlePlay: string;
        appStore: string;
        feature1: string;
        feature2: string;
        feature3: string;
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
    ownerRegistration: {
        title: string;
        subtitle: string;
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        fullName: string;
        phone: string;
        email: string;
        password: string;
        role: string;
        roleOwner: string;
        roleManager: string;
        propertyName: string;
        city: string;
        totalRooms: string;
        startingPrice: string;
        licenseNumber: string;
        uploadLicense: string;
        uploadHelp: string;
        back: string;
        next: string;
        submit: string;
        reviewTitle: string;
        successTitle: string;
        successMessage: string;
        backToHome: string;
    };
    dashboard: {
        title: string;
        overview: string;
        rooms: string;
        bookings: string;
        guests: string;
        revenue: string;
        settings: string;
        stats: {
            totalRooms: string;
            activeBookings: string;
            occupancyRate: string;
            totalRevenue: string;
        };
        recentBookings: string;
        roomStatus: string;
        actions: {
            addRoom: string;
            updateAvailability: string;
            viewAll: string;
        };
        backToSite: string;
        logout: string;
    };
    sidebar: {
        overview: string;
        bookings: string;
        rooms: string;
        guests: string;
        pensionProfile: string;
        staffHr: string;
        staff: string;
        transactions: string;
        reports: string;
        settings: string;
        businessProfile: string;
        security: string;
        availability: string;
        compliance: string;
        bankSettings: string;
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
            listProperty: "Get Booked Today",
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
        appDownload: {
            badge: "Get the App",
            title: "Download Qirb Alga App",
            subtitle: "Book pensions faster, get exclusive app-only deals, and navigate directly to your room.",
            googlePlay: "Get it on Google Play",
            appStore: "Download on the App Store",
            feature1: "Easy Booking",
            feature2: "Exclusive Deals",
            feature3: "Real-time mapping"
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
        ownerRegistration: {
            title: "Register Your Property",
            subtitle: "Join Qirb Alga and start receiving bookings today. It takes just a few minutes.",
            step1: "Owner Profile",
            step2: "Property Details",
            step3: "Verification",
            step4: "Review & Submit",
            fullName: "Full Name",
            phone: "Phone Number",
            email: "Email",
            password: "Password",
            role: "Account Type",
            roleOwner: "Property Owner",
            roleManager: "Manager",
            propertyName: "Pension / Property Name",
            city: "City & Sub-city",
            totalRooms: "Total Number of Rooms",
            startingPrice: "Starting Price per Night (ETB)",
            licenseNumber: "Business License Number / TIN",
            uploadLicense: "Upload License or ID",
            uploadHelp: "Drag & drop or click to upload photo of Trade License/ID",
            back: "Back",
            next: "Next step",
            submit: "Submit for Verification",
            reviewTitle: "Review Your Details",
            successTitle: "Application Received!",
            successMessage: "Your property is currently in the Pending stage. Our system admins will verify your business details within 24 hours. Once approved, you will receive an SMS with a secure link to access your Owner Dashboard.",
            backToHome: "Back to Home",
        },
        notFound: {
            message: "Oops! Page not found",
            backHome: "Return to Home",
        },
        dashboard: {
            title: "Owner Dashboard",
            overview: "Overview",
            rooms: "Rooms",
            bookings: "Bookings",
            guests: "Guests",
            revenue: "Revenue",
            settings: "Settings",
            stats: {
                totalRooms: "Total Rooms",
                activeBookings: "Active Bookings",
                occupancyRate: "Occupancy Rate",
                totalRevenue: "Total Revenue",
            },
            recentBookings: "Recent Bookings",
            roomStatus: "Room Status",
            actions: {
                addRoom: "Add New Room",
                updateAvailability: "Update Availability",
                viewAll: "View All",
            },
            backToSite: "Back to Site",
            logout: "Log Out",
        },
        sidebar: {
            overview: "Overview",
            bookings: "Bookings",
            rooms: "Rooms",
            guests: "Guests",
            pensionProfile: "Pension Profile",
            packages: "Package Tiers",
            staffHr: "Staff & HR",
            staff: "Staff & HR",
            transactions: "Transactions",
            reports: "Reports",
            settings: "Settings",
            businessProfile: "Business Profile",
            security: "Security",
            availability: "Availability",
            compliance: "Compliance",
            bankSettings: "Bank Settings",
        },
    },
    om: {
        navbar: {
            howItWorks: "Akka inni hojjetu",
            listProperty: "Har'a Maamiltoota Argadhaa",
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
        appDownload: {
            badge: "Appilikeeshinii Buufadhu",
            title: "Appilikeeshinii Qirb Alga Buufadhu",
            subtitle: "Pensiinoota saffisaan buuki godhi, gatiiwwan gaarii addaa appilikeeshinii qofaaf ta'an argadhu, akkasumas kallattiin gara kutaa keetiitti qajeeli.",
            googlePlay: "Google Play irraa argadhu",
            appStore: "App Store irraa buufadhu",
            feature1: "Buukingii Salphaa",
            feature2: "Gatiiwwan Addaa",
            feature3: "Kaartaa Yeroo Ammaa"
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
        ownerRegistration: {
            title: "Qabeenya Kee Galmeessi",
            subtitle: "Qirb Alga waliin hirmaadhu, har'uma buukingii fudhadhu.",
            step1: "Profaayilii Abbaa Qabeenyaa",
            step2: "Bal'ina Qabeenyaa",
            step3: "Mirkaneessuu",
            step4: "Irra-deebii fi Ergi",
            fullName: "Maqaa Guutuu",
            phone: "Lakkoofsa Bilbilaa",
            email: "Iimeelii",
            password: "Jecha Darbeessaa",
            role: "Gahee Kee",
            roleOwner: "Abbaa Qabeenyaa",
            roleManager: "Hojii Raawwachiisaa",
            propertyName: "Maqaa Pensiinii",
            city: "Magaalaa & Kutaa Magaalaa",
            totalRooms: "Baay'ina Kutaa Waliigalaa",
            startingPrice: "Gatii Jalqabaa Halkanitti (ETB)",
            licenseNumber: "Lakkoofsa Eeyyama Daldalaa / TIN",
            uploadLicense: "Eeyyama ykn waraqaa eenyummaa fe'i",
            uploadHelp: "Suuraa Eeyyama/ID asitti dhiibi ykn cuqaasuun filadhu",
            back: "Duuba",
            next: "Itti Aanu",
            submit: "Mirkaneessaaf Ergi",
            reviewTitle: "Odeeffannoo Kee Irra-deebi'i",
            successTitle: "Iyyanni Kee Fudhaddhameera!",
            successMessage: "Qabeenyi kee sadarkaa eeguu irra jira. Bulchitootni sirnichaa sa'aatii 24 keessatti sirrummaa mirkaneessu. Yeroo eeyyamamu, linki nageenyummaan eegame karaa SMS ni argatta.",
            backToHome: "Gara Manaatti Deebi'i",
        },
        notFound: {
            message: "Baga gaddite! Fuulli kun hin argamne",
            backHome: "Gara Manaatti Deebi'i",
        },
        dashboard: {
            title: "Daashboordii Abbaa Qabeenyaa",
            overview: "Hubannoo Waliigalaa",
            rooms: "Kutoota",
            bookings: "Bukiingii",
            guests: "Keessummoota",
            revenue: "Galii",
            settings: "Sajataa",
            stats: {
                totalRooms: "Kutoota Waliigalaa",
                activeBookings: "Bukiingii Ammaa",
                occupancyRate: "Reejjii Qabiinsaa",
                totalRevenue: "Galii Waliigalaa",
            },
            recentBookings: "Bukiingii Dhihoo",
            roomStatus: "Haala Kutaa",
            actions: {
                addRoom: "Kutaa Haaraa Dabali",
                updateAvailability: "Haala Banaa Siri",
                viewAll: "Hunda Ilaali",
            },
            backToSite: "Gara Weebsaayitiitti Deebi'i",
            logout: "Ba'i",
        },
        sidebar: {
            overview: "Hubannoo Waliigalaa",
            bookings: "Bukiingii",
            rooms: "Kutoota",
            guests: "Keessummoota",
            pensionProfile: "Profaayilii Pensiinii",
            packages: "Paakeejota",
            staffHr: "Tajaajila & HR",
            staff: "Hojjettoota & HR",
            transactions: "Tajaajiloota",
            reports: "Gabaasa",
            settings: "Sajataa",
            businessProfile: "Profaayilii Daldalaa",
            security: "Nageenyaa",
            availability: "Kutaa Banaa",
            compliance: "Mirkaneessuu",
            bankSettings: "Sajataa Baankii",
        },
    },
    am: {
        navbar: {
            howItWorks: "እንዴት እንደሚሰራ",
            listProperty: "ዛሬውኑ ደንበኛ ያግኙ",
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
        },        appDownload: {
            badge: "መተግበሪያውን ያግኙ",
            title: "የ Qirb Alga መተግበሪያን ያውርዱ",
            subtitle: "ፔንሽኖችን በፍጥነት ያስይዙ፣ ለመተግበሪያ ብቻ የሆኑ ልዩ ቅናሾችን ያግኙ፣ እና በቀጥታ ወደ ክፍልዎ ይሂዱ።",
            googlePlay: "ከ Google Play ያግኙ",
            appStore: "ከ App Store ያውርዱ",
            feature1: "ቀላል ቡኪንግ",
            feature2: "ልዩ ቅናሾች",
            feature3: "የቀጥታ ካርታ"
        },        footer: {
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
        ownerRegistration: {
            title: "ንብረትዎን ያስመዝግቡ",
            subtitle: "Qirb Alga ን ይቀላቀሉ እና አሁኑኑ ቡኪንግ መቀበል ይጀምሩ።",
            step1: "የባለቤት ፕሮፋይል",
            step2: "የንብረት ዝርዝሮች",
            step3: "ማረጋገጫ",
            step4: "ይገምግሙ እና ይላኩ",
            fullName: "ሙሉ ስም",
            phone: "ስልጽ",
            email: "ኢሜልሎ",
            password: "የሚልጽ",
            role: "የአበቁ ዓይፍ",
            roleOwner: "የንብረት ባለቤት",
            roleManager: "ስራ አስኪያጅ",
            propertyName: "የፔንሽን ስም",
            city: "ከተማ እና ክፍለ ከተማ",
            totalRooms: "አጠቃላይ የክፍሎች ብዛት",
            startingPrice: "የሚጀምር ዋጋ በሌሊት (ብር)",
            licenseNumber: "የንግድ ፈቃድ / ቲን ቁጥር",
            uploadLicense: "ፈቃድ ወይም መታወቂያ ይስቀሉ",
            uploadHelp: "የንግድ ፈቃድ/መታወቂያ ፎንቶ ጎትተው ያምጡ ወይም ጠቅ በማድረግ ይምረጡ",
            back: "ወደ ኋላ",
            next: "ቀጣይ",
            submit: "ለማረጋገጫ ላክ",
            reviewTitle: "ዝርዝርዎን ይገምግሙ",
            successTitle: "ማመልከቻዎ ደርሷል!",
            successMessage: "የእርስዎ ንብረት በአሁኑ ጊዜ በመጠባበቅ ላይ ነው። የስርዓት አስተዳዳሪዎች በ24 ሰዓታት ውስጥ ያረጋግጣሉ። ሲፈቀድም ደህንነቱ የተጠበቀ ሊንክ በSMS ይደርስዎታል።",
            backToHome: "ወደ መነሻ ይመለሱ",
        },
        notFound: {
            message: "ይቅርታ! ገጹ አልተገኘም",
            backHome: "ወደ መነሻ ይመለሱ",
        },
        dashboard: {
            title: "የባለቤት ዳሽቦርድ",
            overview: "አጠቃላይ እይታ",
            rooms: "ክፍሎች",
            bookings: "ቦታ ማስያዣ",
            guests: "እንግዶች",
            revenue: "ገቢ",
            settings: "ቅንብሮች",
            stats: {
                totalRooms: "ጠቅላላ ክፍሎች",
                activeBookings: "ንቁም ቦታ ማስያዣ",
                occupancyRate: "የመያዝ መጠን",
                totalRevenue: "ጠቅላላ ገቢ",
            },
            recentBookings: "የቅርብ ጊዜ ቦታ ማስያዣ",
            roomStatus: "የክፍል ሁኔታ",
            actions: {
                addRoom: "አዲስ ክፍል ይጨምሩ",
                updateAvailability: "መገለጫ ያሻሽሉ",
                viewAll: "ሁሉም ይመልከቱ",
            },
            backToSite: "ወደ ድረ-ገጽ ተመለስ",
            logout: "ውጣ",
        },
        sidebar: {
            overview: "አጠቃላይ እይታ",
            bookings: "ቦታ ማስያዣ",
            rooms: "ክፍሎች",
            guests: "እንግዶች",
            pensionProfile: "የፔንሽን ፕሮፋይል",
            packages: "የፓኬጅ አይነቶች",
            staffHr: "ሰራተኞች እና HR",
            staff: "ሰራተኞች እና HR",
            transactions: "ግብይቶች",
            reports: "ሪፖርቶች",
            settings: "ቅንብሮች",
            businessProfile: "የንግድ ፕሮፋይል",
            security: "ደህንነት",
            availability: "ክፍል ክፍተት",
            compliance: "ማረጋገጫ",
            bankSettings: "የባንክ መረጃ",
        },
    },
};

// Backend translation function - calls API for real translation
export async function translateText(text: string, language: Language): Promise<string> {
  if (language === 'en') return text;
  
  try {
    const response = await fetch('http://localhost:3006/api/translations/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), targetLanguage: language })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Fallback to original
  }
}

// Backend batch translation function
export async function translateTextBatch(texts: string[], language: Language): Promise<string[]> {
  if (language === 'en') return texts;
  
  try {
    const response = await fetch('http://localhost:3006/api/translations/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texts, 
        targetLanguage: language, 
        sourceLanguage: 'en' 
      })
    });
    
    if (!response.ok) {
      console.error('Batch translation API error:', response.status);
      return texts; // Fallback to originals
    }
    
    const data = await response.json();
    return data.translatedTexts || texts;
  } catch (error) {
    console.error('Batch translation failed:', error);
    return texts; // Fallback to originals
  }
}

// Legacy function for backward compatibility - now calls backend
export const trDict = (text: string, lang: Language): string => {
  // For immediate synchronous use, return original text
  // For async use, use translateText() instead
  if (lang === "en") return text;
  return text; // Will be translated asynchronously by components
};
