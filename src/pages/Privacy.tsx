import React from "react";
import { Shield, Eye, Lock, Cookie, User, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  const { t, language } = useLanguage();
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const privacyContent = {
    en: {
      title: "Privacy Policy",
      subtitle: "Your privacy is important to us",
      lastUpdated: `Last Updated: ${lastUpdated}`,
      sections: [
        {
          id: "data-collection",
          icon: <Eye className="w-5 h-5" />,
          title: "Data Collection",
          content: "We collect information you provide directly to us, including when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and any other information you choose to provide."
        },
        {
          id: "data-usage",
          icon: <Shield className="w-5 h-5" />,
          title: "How We Use Your Data",
          content: "We use the information we collect to process bookings, communicate with you about your reservations, provide customer support, improve our services, and send you promotional materials (if you consent). We do not sell your personal data to third parties."
        },
        {
          id: "data-sharing",
          icon: <Lock className="w-5 h-5" />,
          title: "Data Sharing",
          content: "We may share your information with pension owners to facilitate bookings, with service providers who assist our operations, and when required by law. We ensure all third parties handle your data securely and in accordance with this privacy policy."
        },
        {
          id: "cookies",
          icon: <Cookie className="w-5 h-5" />,
          title: "Cookies and Tracking",
          content: "We use cookies and similar technologies to improve your experience, analyze usage patterns, and personalize content. You can control cookie settings through your browser preferences."
        },
        {
          id: "user-rights",
          icon: <User className="w-5 h-5" />,
          title: "Your Rights",
          content: "You have the right to access, correct, or delete your personal data. You may also opt out of promotional communications and request a copy of your data. Contact us to exercise these rights."
        },
        {
          id: "contact",
          icon: <Mail className="w-5 h-5" />,
          title: "Contact Us",
          content: "If you have questions about this privacy policy or how we handle your data, please contact us at privacy@qirbalga.com"
        }
      ],
      additionalSections: {
        dataSecurity: {
          title: "Data Security",
          content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure."
        },
        changesToPolicy: {
          title: "Changes to This Policy",
          content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date."
        }
      }
    },
    am: {
      title: "የግል የመገናኘት ፖሊሲ",
      subtitle: "የእርስዎ የግል ምንኩልታ ለእኛ አስፈላጊ ነው",
      lastUpdated: `የመጨረሻ ዝማኔ: ${lastUpdated}`,
      sections: [
        {
          id: "data-collection",
          icon: <Eye className="w-5 h-5" />,
          title: "የውሂብ ሰብሳቢ",
          content: "እርስዎ በቀጥታ ለእኛ የሚሰጡትን መረጃ እንሰብሳለን፣ ይኸውም መለያ ሲፈጥሩ፣ ቦታ ሲያስወጣሉ ወይም ሲያግኙን፣ ይህም ስም፣ ኢሜይል አድራሻ፣ ስልክ ቁጥር፣ የክፍያ መረጃ እና ሌሎችንም መረጃዎች ያካትታል።"
        },
        {
          id: "data-usage",
          icon: <Shield className="w-5 h-5" />,
          title: "የውሂብ አጠቃቀም",
          content: "የሰብሳንን መረጃ ቦታ ለማስወጣት፣ ስለ ቦታዎች ለመግባባት፣ ደንበኞችን ለማገልገል፣ አገልግሎታችንን ለማሻሻል እና ማስታወቂያ ይዞታዎችን ለመላክ (ከፈቀዱ) እንጠቀማለን። የግል ውሂብዎን ለሦስተኛ ወገኖች አንሸጥውም።"
        },
        {
          id: "data-sharing",
          icon: <Lock className="w-5 h-5" />,
          title: "የውሂብ ካሰራረል",
          content: "የውሂብዎን ለቦታ ባለቤቶች ቦታ ለማስወጣት፣ አገልግሎታችንን የሚረዱ አገልግሎት ሰጪዎች እና በህግ ከተፈለገ እንወስናለን። ሁሉም ሦስተኛ ወገኖች የውሂብዎን በደህንነት እና በዚህ የግል ፖሊሲ መሰረት እንዲያስተናግዱ እናስተዋልል።"
        },
        {
          id: "cookies",
          icon: <Cookie className="w-5 h-5" />,
          title: "ኩኪዎች እና መከታታት",
          content: "ተሞክሮን ለማሻሻል፣ የአጠቃቀም ንዑስ ንዑስ ለመተንተን እና ይዘትን ለማበጣጠብ ኩኪዎችን እና ተመሳሳይ ቴክኖሎጂዎችን እንጠቀማለን። ኩኪ ቅንብሮችን በአሳሽዎ ምርጫዎች ማስተዳደር ይችላሉ።"
        },
        {
          id: "user-rights",
          icon: <User className="w-5 h-5" />,
          title: "የእርስዎ መብቶች",
          content: "የግል ውሂብዎን ለማየት፣ ለመተራመር ወይም ለመሰርዝ መብት አለዎት። ከማስታወቂያ ግንኙነቶችም ማስወጣ እና የውሂብዎ ቅጽ መጠየቅ ይችላሉ። እነዚህን መብቶች ለመጠቀም ያግኙን።"
        },
        {
          id: "contact",
          icon: <Mail className="w-5 h-5" />,
          title: "ያግኙን",
          content: "ስለዚህ የግል ፖሊሲ ወይም የውሂብዎን እንዴት እንደም ከሆነ ጥያቄ ካሎት፣ ወደ privacy@qirbalga.com ይጽሑፉ"
        }
      ],
      additionalSections: {
        dataSecurity: {
          title: "የውሂብ ደህንነት",
          content: "የግል ውሂብዎን ከልዩ ሰው መድረስ፣ ለውጥ፣ ማስተዋል ወይም አፈጻጸም ለመከል ተለዋጭ እና አካባቢ እርምጃዎችን እንተግባራለን። ግን በኢንተርኔት ላይ የመላክ ዘዴ 100% ደህንነት የለውም።"
        },
        changesToPolicy: {
          title: "ለዚህ ፖሊሲ ለውጦች",
          content: "የዚህን የግል ፖሊሲ ከጊዜ ወደ ጊዜ ልንነሳሳው ይችላለን። ማንኛውም ለውጥ በዚህ ገጽ ላይ አዲሱን ፖሊሲ በማስቀመጥ እና 'የመጨረሻ ዝማኔ' ቀንን በማሻሻል እናገልግልዎታለን።"
        }
      }
    },
    om: {
      title: "Iccitii Sirnaa",
      subtitle: "Sirriin keessummaa keessan nu barbachisa",
      lastUpdated: `Yeroon Haara'e: ${lastUpdated}`,
      sections: [
        {
          id: "data-collection",
          icon: <Eye className="w-5 h-5" />,
          title: "Riisoo Deetaa",
          content: "Deetaa qabannee nuuf kenneef kan waraabamu, yeroo maqaan maqaaf cabsuu, bukiinsa gochuu ykn nuu quunamnu, kunis maqaakee, teessoo iimeelii, lakkoofsa bilbilaa, odeeffannoo kaffaltii fi deetaa biroo kan filatteef jira."
        },
        {
          id: "data-usage",
          icon: <Shield className="w-5 h-5" />,
          title: "Deetaa Keessatti Akka Fayyadamnu",
          content: "Deetaa riiseen bukiinsaaf, waa'ee bukiinsii keessan siif waliin wal dhageessuu, tajaajila keessummaa kennuu, tajaajileen keenya guddisuu fi mallattoolee erguu (yoo naanneef jirta) deetaa fayyadna. Deetaa sirrii keessanitti dukaatti gurguruu."
        },
        {
          id: "data-sharing",
          icon: <Lock className="w-5 h-5" />,
          title: "Deetaa Waliin Qoodaachu",
          content: "Deetaa keessaniif abbootii pensiinii, tajaajila keessan gargaaru fi yeroo seeraan barbaachisamu waliin qoodanna. Sadarkaa sadarkaan deetaa keessaniif eeggumaa fi kan iccitii kanaa waliin qoodamu eeganna."
        },
        {
          id: "cookies",
          icon: <Cookie className="w-5 h-5" />,
          title: "Kukiis fi Gadi Fageenya",
          content: "Taphota keessan guddisu, madda fayyadumsaa ilaaluu fi yaadaa adda ta'isiif kukiis fi teeknooloojii waliin wal fakkaatu fayyadna. Kukiis dhuunfaa keessatti sirrii kooduu."
        },
        {
          id: "user-rights",
          icon: <User className="w-5 h-5" />,
          title: "Mirga Keessan",
          content: "Deetaa sirrii keessan ilaaluu, sirreessuu ykn haquu mirga qabda. Mallattoolee irraa ba'uu fi deetaa keessanii qabdu barbaachuu danda'a. Mirri kanaaf nuu quunamani."
        },
        {
          id: "contact",
          icon: <Mail className="w-5 h-5" />,
          title: "Nu Quunamani",
          content: "Yoo iccitii kanaa ykn deetaa keessan akka waliin walitti deebinu gaafii qabatte, privacy@qirbalga.com erguu."
        }
      ],
      additionalSections: {
        dataSecurity: {
          title: "Eegumsa Deetaa",
          content: "Deetaa sirrii keessanii malee deebi'uu, jijjiiruu, agarsiisuu ykn balleessuu irraa eeggachuuf teeknikaalii fi walitti dhufaa safuu ta'e fayyadna. Garuu, intarneetii irratti deebi'uu 100% eeggamaa miti."
        },
        changesToPolicy: {
          title: "Iccitii Kanaa Jijjiiruu",
          content: "Iccitii kanaa yeroo yeroo ijjeessuu danda'a. Iccitii haaraa fuulduraa jiru irratti buufnuu 'Yeroon Haara'e' ijjeessuun deetaa keessaniif beeksisaa."
        }
      }
    }
  };

  const content = privacyContent[language as keyof typeof privacyContent] || privacyContent.en;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl text-slate-300 mb-2">{content.subtitle}</p>
            <p className="text-sm text-slate-400">{content.lastUpdated}</p>
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
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{content.additionalSections.dataSecurity.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                {content.additionalSections.dataSecurity.content}
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{content.additionalSections.changesToPolicy.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {content.additionalSections.changesToPolicy.content}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
