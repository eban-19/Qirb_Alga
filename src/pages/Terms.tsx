import React from "react";
import { FileText, User, CreditCard, Calendar, AlertTriangle, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  const { t, language } = useLanguage();
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const termsContent = {
    en: {
      title: "Terms of Service",
      subtitle: "Terms and conditions for using Qirb Alga",
      effectiveDate: `Effective Date: ${effectiveDate}`,
      sections: [
        {
          id: "agreement",
          icon: <FileText className="w-5 h-5" />,
          title: "Agreement to Terms",
          content: "By accessing or using Qirb Alga, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service."
        },
        {
          id: "user-accounts",
          icon: <User className="w-5 h-5" />,
          title: "User Accounts",
          content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account."
        },
        {
          id: "bookings",
          icon: <Calendar className="w-5 h-5" />,
          title: "Bookings and Reservations",
          content: "All bookings are subject to availability and confirmation by the pension owner. Prices and availability may change without prior notice. Cancellation policies vary by property and are specified in the booking confirmation."
        },
        {
          id: "payments",
          icon: <CreditCard className="w-5 h-5" />,
          title: "Payments and Refunds",
          content: "Payment is required at the time of booking unless otherwise specified. Refunds are processed according to the property's cancellation policy. We reserve the right to modify pricing at any time."
        },
        {
          id: "liability",
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Limitation of Liability",
          content: "Qirb Alga shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use of our services. Our total liability shall not exceed the amount paid for the booking."
        },
        {
          id: "disputes",
          icon: <Scale className="w-5 h-5" />,
          title: "Dispute Resolution",
          content: "Any disputes arising from these terms shall be resolved through good faith negotiations. If negotiation fails, disputes shall be resolved through arbitration in accordance with applicable laws."
        }
      ],
      additionalSections: {
        userConduct: {
          title: "User Conduct",
          content: "Users agree not to use the service for any illegal purpose, harass others, or violate any applicable laws. We reserve the right to suspend or terminate accounts that violate these terms."
        },
        intellectualProperty: {
          title: "Intellectual Property",
          content: "All content on Qirb Alga, including text, graphics, logos, and software, is owned by Qirb Alga or its licensors and is protected by copyright laws."
        },
        modifications: {
          title: "Modifications to Terms",
          content: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms."
        }
      }
    },
    am: {
      title: "የአገልግሎት ውል",
      subtitle: "ቂርብ አልጋን ለመጠቀም ውሎች እና ሁኔታዎች",
      effectiveDate: `የሚጀምሩት ቀን: ${effectiveDate}`,
      sections: [
        {
          id: "agreement",
          icon: <FileText className="w-5 h-5" />,
          title: "ወደ ውሎች ማስማማት",
          content: "ቂርብ አልጋንን በመጠቀም ወይም በመድረስ እነዚህን የአገልግሎት ውሎች እና ሁሉንም ተመጣጣኝ ህጎች እና ደንቦች እንደምተኛ ተስማምዎት ። እነዚህን ውሎች ካልተስማሙ፣ አገልግሎቱን መጠቀም የለዎትም።"
        },
        {
          id: "user-accounts",
          icon: <User className="w-5 h-5" />,
          title: "የተጠቃሚ መለያዎች",
          content: "የመለያዎን እና የይለፍ ቃልዎን ሚስጥር ሙሉ ኃላፊነት ያለዎት ነዎት። በመለያዎ ወይም በይለፍ ቃልዎ ስር የሚፈጸሙትን ሁሉም እርምጃዎች ሃላፊነት ለመቀበል ይስማማሉ። መለያዎ በልዩ ሰው ከተጠቀመ ወዲያውኑ ማሳወቅ ያስፈልጋል።"
        },
        {
          id: "bookings",
          icon: <Calendar className="w-5 h-5" />,
          title: "ቦታ ማስወጣት እና ቀጠሮ",
          content: "ሁሉም ቦታ ማስወጣት የቦታ ባለቤት ማረጋገጥ እና መኖር ይጠይቃሉ። ዋጋዎች እና መኖር ያለመኖር ምንም ቅድመ ማስጊያ ሳይሆን ሊቀይሩ ይችላሉ። የሰርዝ ፖሊሲዎች በንብረት ይለያያሉ እና በቦታ ማስወጣት ማረጋገጫ ውስጥ ይገልጻሉ።"
        },
        {
          id: "payments",
          icon: <CreditCard className="w-5 h-5" />,
          title: "ክፍያዎች እና ተመላሽ",
          content: "ክፍያ በቦታ ማስወጣት ጊዜ ያስፈልጋል እንዲሁም ሌላ ካልተገለጸ። ተመላሽ ክፍያዎች በንብረት የሰርዝ ፖሊሲ መሰረት ይሰራሉ። ዋጋዎችን በማንኛውም ጊዜ ለመቀየር መብት እናሰጣለን።"
        },
        {
          id: "liability",
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "የሃላፊነት ገደብ",
          content: "ቂርብ አልጋ ከአገልግሎታችን መጠቀም የሚመጡ ማንኛውም በይፊስ የሆኑ፣ በተደጋጋሚ ወይም በተለይ የሆኑ ጉዳቶች ሃላፊነት አይወስድም። ጠቅላላ ሃላፊነታችን የቦታ ማስወጣት ላይ የተከፈለውን መጠን አይሻልም።"
        },
        {
          id: "disputes",
          icon: <Scale className="w-5 h-5" />,
          title: "ክርክር መፍትሔ",
          content: "ከዚህ ውል የሚመጡ የማንኛውም አይነት ክርክር በትክክለኛ ውይይት ይፈታል። ውይይት ካልሰራ ክርክሮች በተመጣጣኝ ህጎች መሰረት በአርቢትሬሽን ይፈታሉ።"
        }
      ],
      additionalSections: {
        userConduct: {
          title: "የተጠቃሚ ስራ",
          content: "ተጠቃሚዎች አገልግሎቱን ለማንኛውም ህግ አለመከተል፣ ሌሎችን ለመተንከል ወይም ተመጣጣኝ ህጎችን አለመጣባት ይስማማሉ። እነዚህን ውሎች የሚጥሱ መለያዎችን ለማስቆር ወይም ለመጨረስ መብት አለን።"
        },
        intellectualProperty: {
          title: "የአእምሮ ንብረት",
          content: "በቂርብ አልጋ ላይ ያሉ ሁሉም ይዘት፣ ጽሑፍ፣ ንድፎች፣ አርማዎች እና ሶፍትዌር ባሉት ሁሉ፣ በቂርብ አልጋ ወይም ተፈቃዪዎቹ የተራዙ ነው፣ እንዲሁም በየካፒን ህግ የተጠበቀ ነው።"
        },
        modifications: {
          title: "ወደ ውሎች ማሻሻል",
          content: "እነዚህን ውሎች በማንኛውም ጊዜ ለማሻሻል መብት አለን። ለውሎቹ ለውጡ በኋላ የአገልግሎቱ ቀጠሮ መቀጠር የአዲሱን ውል መቀበል ነው።"
        }
      }
    },
    om: {
      title: "Waliigaltee Tajaajilaa",
      subtitle: "Waliigaltee fi qabxii Qirb Alga fayyadamuuf",
      effectiveDate: `Yeroon Hojjetu: ${effectiveDate}`,
      sections: [
        {
          id: "agreement",
          icon: <FileText className="w-5 h-5" />,
          title: "Waliigaltee Irra Deebi'uu",
          content: "Qirb Alga fayyaduu ykn duubee seenessuun, Waliigaltee Tajaajilaa kanaa fi seera fi qabxii hundaan waliin walitti dhiyaannu. Waliigalteen kana yoo hin beekne, tajaajilicha fayyadamuu mannaa."
        },
        {
          id: "user-accounts",
          icon: <User className="w-5 h-5" />,
          title: "Maqaan Fayyadamaa",
          content: "Sirriin maqaakee fi jecha icciitiin eeggachuuf keessattuu. Maqaakee ykn jecha icciitiin raawwatamu hundaaf qabannee fayyadama. Yoo namni bira maqaakee fayyadame yoo jireesse, yeroo amma nuu beeksisuu."
        },
        {
          id: "bookings",
          icon: <Calendar className="w-5 h-5" />,
          title: "Bukiinsa fi Qabxii",
          content: "Bukiinsa hundi kan eeggamaa fi abbootii pensiiniin eeggamu. Gatii fi eeggamaa malee murtaa'uu danda'a. Seera sirreessuu qabeenyaa biraatiifi bukiinsa eeggamu irratti ibsama."
        },
        {
          id: "payments",
          icon: <CreditCard className="w-5 h-5" />,
          title: "Kaffaltii fi Deebi'ii",
          content: "Kaffaltii yeroon bukiinsa gochaa barbaachisa, yeroo biraa ibsameef deebi'ii. Deebi'ii seera sirreessuu qabeenyaa irratti raawwatama. Gatii yeroon murtaa'ee jijjiiruu mirkaneessina."
        },
        {
          id: "liability",
          icon: <AlertTriangle className="w-5 h-5" />,
          title: "Xumuraa Haraa",
          content: "Qirb Alga tajaajila keenya fayyadumuun dhufu dhiibbaa, qabxii addaa ykn dhiibbaa gareessaaf haraa hinqabdu. Harri keenya gatii bukiinsaa irratti caalaa hin dhaabu."
        },
        {
          id: "disputes",
          icon: <Scale className="w-5 h-5" />,
          title: "Xumuraa Kaayyoo",
          content: "Waliigalteen kanaa irraa ka'an kaayyoonni haala nagaa ta'een ilaalchisee xumurama. Yoo ilaalchisuun hin hojjetin, kaayyoonni seeraan waliin xumurama."
        }
      ],
      additionalSections: {
        userConduct: {
          title: "Hojjii Fayyadamaa",
          content: "Fayyadamaan tajaajilicha seera qabuuf, namoota cimsuu ykn seera hawaa'e kan fayyadamuufi miti. Waliigalteen kanaa cimsu maqaawwan ofirraa cufuu ykn haquu mirkaneessina."
        },
        intellectualProperty: {
          title: "Qabeenya Afaanii",
          content: "Qirb Alga irratti jiru yaadannoo hundaa, qubee, afuuraa fi softiweerii, Qirb Alga ykn qabamtoota isaa kan ta'e fi seera copyrightin eegama."
        },
        modifications: {
          title: "Waliigaltee Jijjiiruu",
          content: "Waliigalteen kana yeroon murtaa'ee jijjiiruu mirkaneessina. Tajaajilicha jijjiiramaa booda fayyadamuu waliigaltee haaraa irratti deebi'uu."
        }
      }
    }
  };

  const content = termsContent[language as keyof typeof termsContent] || termsContent.en;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl text-slate-300 mb-2">{content.subtitle}</p>
            <p className="text-sm text-slate-400">{content.effectiveDate}</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-6">
            {content.sections.map((section) => (
              <Card key={section.id} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{section.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="mt-8 bg-slate-100 border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{content.additionalSections.userConduct.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {content.additionalSections.userConduct.content}
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{content.additionalSections.intellectualProperty.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {content.additionalSections.intellectualProperty.content}
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{content.additionalSections.modifications.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {content.additionalSections.modifications.content}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
