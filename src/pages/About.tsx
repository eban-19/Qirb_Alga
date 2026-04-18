import React from "react";
import { Target, Users, Award, Heart, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const { t, language } = useLanguage();

  const aboutContent = {
    en: {
      title: "About Qirb Alga",
      subtitle: "Connecting people with exceptional pension experiences in Ethiopia",
      mission: {
        title: "Our Mission",
        content: "To make it easy for travelers to find and book comfortable, affordable, and authentic pension accommodations across Ethiopia, while supporting local property owners and contributing to the growth of Ethiopian tourism."
      },
      vision: {
        title: "Our Vision",
        content: "To become Ethiopia's leading platform for pension bookings, known for reliability, transparency, and exceptional customer service."
      },
      values: [
        {
          icon: <Heart className="w-6 h-6" />,
          title: "Customer First",
          content: "We prioritize the needs and satisfaction of our users above all else."
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: "Quality",
          content: "We ensure all listed pensions meet our quality standards for a great experience."
        },
        {
          icon: <Award className="w-6 h-6" />,
          title: "Trust",
          content: "We build trust through transparency, security, and reliable service."
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Community",
          content: "We foster a community of travelers and property owners connected by shared experiences."
        }
      ],
      stats: [
        { number: "500+", label: "Pensions Listed" },
        { number: "10,000+", label: "Happy Travelers" },
        { number: "50+", label: "Cities Covered" },
        { number: "24/7", label: "Support Available" }
      ],
      team: [
        {
          name: "Team Qirb Alga",
          role: "Dedicated Team",
          description: "A passionate team committed to revolutionizing the pension booking experience in Ethiopia."
        }
      ]
    },
    am: {
      title: "ስለ ቂርብ አልጋ",
      subtitle: "ሰዎችን በኢትዮጵያ የሚገኙ የትራንሲት ክፍዎች ጥሩ ልምዶች እንዲኖሩት እንገናኝባቸዋለን",
      mission: {
        title: "ተልዕኳችን",
        content: "በኢትዮጵያ ዙሪያ መተኛት የሚችሉ፣ ተራፊ፣ እና እውነተኛ የትራንሲት ክፍዎችን ለጉሟኞች ማግኘት እና ማስወጣት ለማስቻል፣ እንዲሁም የአካባቢ ንብረት ባለቤቶችን ለመደግፍ እና ለኢትዮጵያ ቱሪዝም እድገት ለመዋጣት"
      },
      vision: {
        title: "ተስፋችን",
        content: "በኢትዮጵያ ለትራንሲት ክፍዎች መጠየቅ የመሪ መድረክ ለመሆን፣ በክብርት፣ በግልጽነት እና በአስተማማኝ ደንበኞች አገልግሎት የታወቀ"
      },
      values: [
        {
          icon: <Heart className="w-6 h-6" />,
          title: "ደንበኛ ቀድሞ",
          content: "የተጠቃሚዎች ፍላጎት እና ደስተኛነት ሁልግግሎት ከፍተኛ እንደምተኛ እናስቀምጣለን።"
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: "ጥራት",
          content: "ሁሉም የተዘረዙ ክፍዎች ጥሩ ልምድ ለማስተላለፍ የጥራት መደብራችንን እንደግማለን።"
        },
        {
          icon: <Award className="w-6 h-6" />,
          title: "ክብርት",
          content: "በግልጽነት፣ በደህንነት እና በአስተማማኝ አገልግሎት ክብርት እንሰርባለን።"
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "ማህበር",
          content: "በጋራ ልምዶች የተገናኙ ጉሟኞች እና ንብረት ባለቤቶች ማህበር እንሰርባለን።"
        }
      ],
      stats: [
        { number: "500+", label: "የተዘረዙ ክፍዎች" },
        { number: "10,000+", label: "ደስተኞች ጉሟኞች" },
        { number: "50+", label: "የተሸፉ ከተማዎች" },
        { number: "24/7", label: "የአገልግሎት ድጋፍ" }
      ],
      team: [
        {
          name: "ቡድን ቂርብ አልጋ",
          role: "ተራፊ ቡድን",
          description: "በኢትዮጵያ የትራንሲት ክፍዎች መጠየቅ ልምድን ለማሻሻል ተራፊ የሆነ ቡድን"
        }
      ]
    },
    om: {
      title: "Waa'ee Qirb Alga",
      subtitle: "Namoota fi taphota pensiinoota gaarii Itoophiyaa keessatti waliin walitti dhiyaannu",
      mission: {
        title: "Misiyooni Keenya",
        content: "Siyaafaa dhaqqabummaa fi gatii madaalawaa qabanii Itoophiyaa keessatti argamu namoota siif barbaachisaa ta'u kan argachuu fi bukiinsa gochuuf saayisuu, akkasumas abbootii qabeenyaa dhihoo jiruu fi tapha toorizimii Itoophiyaa guddisuu"
      },
      vision: {
        title: "Facaan Keenya",
        content: "Itoophiyaa keessatti bukiinsa pensiinootaaf dhaabbataa ta'u kan beekamu nageenyummaa, gaddiseessuu fi tajaajila keessummaa gaariin"
      },
      values: [
        {
          icon: <Heart className="w-6 h-6" />,
          title: "Keessummaa Jalqabaa",
          content: "Miirri fi eegumsa fayyadamaa keessatti bal'inaan guddachisuu."
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: "Gozimaa",
          content: "Pensiinoota hundi kan gozimmaa keenya irratti hirkatamu taasisu."
        },
        {
          icon: <Award className="w-6 h-6" />,
          title: "Nageenyummaa",
          content: "Gaddiseessuu, eegumsaa fi tajaajila nageenyummaa qabeessaan nageenyummaa dhiyaannu."
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Jamaa",
          content: "Siyaafaa fi abbootii qabeenyaa walitti dhiyaannu jamaa cimaa uumuu."
        }
      ],
      stats: [
        { number: "500+", label: "Pensiinoota Galmeessame" },
        { number: "10,000+", label: "Siyaafaa Nagaa Qabani" },
        { number: "50+", label: "Magaalotaatin Harkaa'ame" },
        { number: "24/7", label: "Gargaarsa Jiru" }
      ],
      team: [
        {
          name: "Wiirtii Qirb Alga",
          role: "Wiirtii Wajjinii",
          description: "Itoophiyaa keessatti bukiinsa pensiinoota jijjiiruuf walitti dhiyaannu wiirtii cimaa."
        }
      ]
    }
  };

  const content = aboutContent[language as keyof typeof aboutContent] || aboutContent.en;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">{content.subtitle}</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">{content.mission.title}</h3>
                <p className="text-slate-600 leading-relaxed">{content.mission.content}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">{content.vision.title}</h3>
                <p className="text-slate-600 leading-relaxed">{content.vision.content}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.values.map((value, index) => (
                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-600">{value.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {content.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.team.map((member, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-slate-300 mb-8">Join thousands of travelers who trust Qirb Alga for their pension bookings across Ethiopia.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Pensions
                </Button>
              </Link>
              <Link to="/register-property">
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900">
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
