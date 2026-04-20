import React from "react";
import { Search, Calendar, Home, CheckCircle, ArrowRight, Star, Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const { t, language } = useLanguage();

  const content = {
    en: {
      title: "How It Works",
      subtitle: "Simple steps to find your perfect pension in Ethiopia",
      step: "Step",
      guest: {
        title: "For Guests",
        subtitle: "Find and book comfortable pensions with ease",
        steps: [
          {
            icon: <Search className="w-8 h-8" />,
            title: "Search for Pensions",
            description: "Browse through our wide selection of pensions across Ethiopia. Filter by location, price, amenities, and more."
          },
          {
            icon: <Calendar className="w-8 h-8" />,
            title: "Choose Your Dates",
            description: "Select your check-in and check-out dates. View real-time availability and pricing."
          },
          {
            icon: <Home className="w-8 h-8" />,
            title: "Book Your Stay",
            description: "Complete your booking securely online. Receive instant confirmation and booking details."
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "Enjoy Your Stay",
            description: "Arrive at your pension and enjoy your comfortable stay. Leave a review after your visit."
          }
        ]
      },
      owner: {
        title: "For Property Owners",
        subtitle: "List your property and start earning",
        steps: [
          {
            icon: <Building2 className="w-8 h-8" />,
            title: "Register Your Property",
            description: "Create an account and register your pension. Provide details about your property, amenities, and photos."
          },
          {
            icon: <Star className="w-8 h-8" />,
            title: "Get Approved",
            description: "Our team will review and approve your property listing. This ensures quality and trust for all users."
          },
          {
            icon: <Users className="w-8 h-8" />,
            title: "Receive Bookings",
            description: "Start receiving booking requests from travelers. Manage your availability and reservations easily."
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "Earn Income",
            description: "Generate income from your property. Get paid securely for each confirmed booking."
          }
        ]
      },
      benefits: {
        title: "Why Choose Qirb Alga?",
        items: [
          "Wide selection of verified pensions across Ethiopia",
          "Secure online booking and payment system",
          "24/7 customer support",
          "Transparent pricing with no hidden fees",
          "Real-time availability and instant confirmation",
          "User reviews and ratings for informed decisions"
        ]
      },
      cta: {
        title: "Ready to Get Started?",
        guest: "Browse Pensions",
        owner: "List Your Property"
      }
    },
    am: {
      title: "እንዴት ይሰራል",
      subtitle: "በኢትዮጵያ ምርጥ ትራንሲት ክፍዎችን ለማግኘት ቀላል ደረጃዎች",
      step: "ደረጃ",
      guest: {
        title: "ለጉሟኞች",
        subtitle: "ትራንሲት ክፍዎችን በቀላሉ ማግኘት እና ማስወጣት",
        steps: [
          {
            icon: <Search className="w-8 h-8" />,
            title: "የትራንሲት ክፍዎችን ይፈልጉ",
            description: "በኢትዮጵያ ያሉ የትራንሲት ክፍዎችን ያሰሱ። በአካባቢ፣ በዋጋ፣ በአገልግሎቶች እና ሌሎችም ይምረጡ።"
          },
          {
            icon: <Calendar className="w-8 h-8" />,
            title: "ቀናትዎን ይምረጡ",
            description: "የመግቢያ እና የመውጫ ቀናትዎን ይምረጡ። የአሁኑን መኖር እና ዋጋዎችን ይመልከቱ።"
          },
          {
            icon: <Home className="w-8 h-8" />,
            title: "ቦታዎን ይሰይሙ",
            description: "ቦታዎን በደህንነት በመስመር ይሰይሙ። ወዲያውኑ ማረጋገጫ እና የቦታ ማስወጣት ዝርዝሮችን ያግኙ።"
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "ቦታዎን ይደሰቱ",
            description: "ወደ ትራንሲት ክፍዎዎ ይጓዙ እና ተራፊ ቀጠሮዎን ይደሰቱ። ከጉሟት በኋላ ግምገማ ይስጡ።"
          }
        ]
      },
      owner: {
        title: "ለንብረት ባለቤቶች",
        subtitle: "ንብረትዎን ይዘርዝሩ እና እየሳት ይጀምሩ",
        steps: [
          {
            icon: <Building2 className="w-8 h-8" />,
            title: "ንብረትዎን ይመዝግቡ",
            description: "መለያ ይፍጠሩ እና የትራንሲት ክፍዎዎን ይመዝግቡ። ስለ ንብረትዎ፣ አገልግሎቶች እና ፎቶዎች ዝርዝሮችን ይስጡ።"
          },
          {
            icon: <Star className="w-8 h-8" />,
            title: "ማረጋገጫ ያግኙ",
            description: "ቡድናችን የንብረት ዝርዝሮዎን ያረጋግጋል። ይህ ለሁሉም ተጠቃሚዎች ጥራት እና ክብርት ያረጋግጋል።"
          },
          {
            icon: <Users className="w-8 h-8" />,
            title: "የቦታ ማስወጣት ጥያቄዎችን ያግኙ",
            description: "ከጉሟኞች የቦታ ማስወጣት ጥያቄዎችን ይቀበሉ። መኖርዎን እና ቀጠሮዎችን በቀላሉ ያቀናብሩ።"
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "ገቢ ያግኙ",
            description: "ከንብረትዎ ገቢ ያመጣሉ። ለያንዳንዱ የተረጋገጠ ቦታ ማስወጣት በደህንነት ይከፍሉ።"
          }
        ]
      },
      benefits: {
        title: "ለምን ቂርብ አልጋን ይምረጡ?",
        items: [
          "በኢትዮጵያ የተረጋገጡ ትራንሲት ክፍዎች ሰፊ ምርጫ",
          "ደህንነቱ የተጠበቀ በመስመር ቦታ ማስወጣት እና ክፍያ ስርዓት",
          "24/7 ደንበኞች ድጋፍ",
          "ያልታወሰነ ዋጋ ከማንኛውም ተጨማሪ ክፍያ የሌለው",
          "የአሁኑን መኖር እና ወዲያውኑ ማረጋገጫ",
          "ለደራሴት ውሳኔ የተጠቃሚ ግምገማዎች እና ደረጃዎች"
        ]
      },
      cta: {
        title: "ለመጀመር ዝግጁ ነዎት?",
        guest: "የትራንሲት ክፍዎችን ያሰሱ",
        owner: "ንብረትዎን ይዘርዝሩ"
      }
    },
    om: {
      title: "Akka Fayyadamu",
      subtitle: "Etiyoophiyaa keessatti paanshenii gaarii barbaaduu dandeettii qabduu sadarkaa wardii",
      step: "Sadarkaa",
      guest: {
        title: "Deeggartootaf",
        subtitle: "Paanshenii of dandeessa ta'een barbaachuu fi buufuu",
        steps: [
          {
            icon: <Search className="w-8 h-8" />,
            title: "Paanshenii Barbaadi",
            description: "Etiyoophiyaa keessatti argaman paansenota hedduu keessaa ilaali. Bakka jireenya, gatii, faca'iinsa fi kan kanaa ilaalitti filadhu."
          },
          {
            icon: <Calendar className="w-8 h-8" />,
            title: "Guyyaa Filadhu",
            description: "Guyyaa galmeessuu fi baasuu filadhu. Jireenysa ammaa fi gatii ilaali."
          },
          {
            icon: <Home className="w-8 h-8" />,
            title: "Buu'aa Eegadhu",
            description: "Buu'aa karaa interneetii ammaa eegadhu. Eegamaa walitti deebi'aa fi maqaa bu'uuf qabdu argadhu."
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "Eegadhu",
            description: "Paanshenii keessatti deemuu fi dandeessii gaarii deemu. Deegartoo ta'ee booda deebiin kennadhu."
          }
        ]
      },
      owner: {
        title: "Qabeenya Qabattootaf",
        subtitle: "Qabeenyi keessanii qubachiisi fi kaffaltii argachuu jalqabi",
        steps: [
          {
            icon: <Building2 className="w-8 h-8" />,
            title: "Qabeenyi Keessanii Qubachiisi",
            description: "Maqaa uumuu fi paansenii keessanii qubachiisi. Qabeenyaa keessaa, faca'iinsa fi suuraawwanii beeksisi."
          },
          {
            icon: <Star className="w-8 h-8" />,
            title: "Eegamaa Argadhu",
            description: "Waadaan keenya qabeenyaa keessanii eega. Kun dandeessiin fi yaada deeggartoota hedduuf taasisa."
          },
          {
            icon: <Users className="w-8 h-8" />,
            title: "Eegamaa Bu'aa Argadhu",
            description: "Siyaasaawwan deeggartoota irraa eegamaa bu'aa argadhu. Jireenya fi eegamaa bu'aa siffachuu dandeessa."
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: "Kaffaltii Argadhu",
            description: "Qabeenyaa keessaa kaffaltii argadhu. Eegamaa bu'aa tokkoon tokkoo irraa kaffaltii ammaa argadhu."
          }
        ]
      },
      benefits: {
        title: "Akka Qirb Alga Filattu?",
        items: [
          "Etiyoophiyaa keessatti eegamamii paansenota hedduu filannoo bal'aa",
          "Eegamaa bu'aa interneeii fi kaffaltii ammaa sirna dandeettii qabuu",
          "24/7 gargaarsa dargaggummaa",
          "Gatii cimaa kan hin qabne faca'iinsa dirqama",
          "Jireenysa ammaa fi eegamaa walitti deebi'aa",
          "Deeggartoota deebiin fi darajii waliin walitti deebi'uu"
        ]
      },
      cta: {
        title: "Jalqabaaf Gammadduu?",
        guest: "Paansenota Filadhu",
        owner: "Qabeenyi Keessanii Qubachiisi"
      }
    }
  };

  const data = content[language as keyof typeof content] || content.en;
  console.log('Language:', language, 'Data keys:', Object.keys(content), 'Selected data:', data);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{data.title}</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">{data.subtitle}</p>
          </div>
        </div>

        {/* For Guests Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{data.guest.title}</h2>
            <p className="text-slate-600">{data.guest.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.guest.steps.map((step, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">{data.step} {index + 1}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Owners Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">{data.owner.title}</h2>
              <p className="text-slate-600">{data.owner.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.owner.steps.map((step, index) => (
                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                      {step.icon}
                    </div>
                    <div className="text-sm font-semibold text-primary mb-2">{data.step} {index + 1}</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{data.benefits.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.benefits.items.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-slate-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">{data.cta.title}</h2>
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                <a href="/">
                  {data.cta.guest}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800" asChild>
                <a href="/register-property">
                  {data.cta.owner}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
