import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle2, Building, User, FileText, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RegisterProperty = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "owner",
    propertyName: "",
    city: "",
    totalRooms: "",
    startingPrice: "",
    licenseNumber: "",
    fileName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all required fields: Full Name, Email, and Password');
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // Register the user with auto-login for pension owners
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role === 'owner' ? 'Owner' : 'Admin', // Map to backend roles
        password: formData.password || 'defaultPassword123' // Use form password or default
      };

      const response = await register(userData);

      if (response.success) {
        // Now create the pension record using the token from the registration response
        const pensionData = {
          name: formData.propertyName,
          address: formData.city,
          phone: formData.phone,
          email: formData.email,
          description: `Professional hospitality service in ${formData.city}`,
          capacity: parseInt(formData.totalRooms) || 1,
          owner_id: response.data.user.id // Use the returned user ID
        };

        try {
          // Use the token directly from the registration response
          const token = response.data.token;
          const pensionResponse = await fetch('http://localhost:3005/api/pensions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pensionData)
          });
          const pensionResult = await pensionResponse.json();
          if (pensionResponse.ok) {
            // Pension created successfully
          } else {
            // Pension creation failed
          }
        } catch (pensionError) {
          // Error creating pension
          // Still continue with success flow even if pension creation fails
        }

        // Registration successful, user is auto-logged in
        setStep(5); // Success step
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: t.ownerRegistration.step1, icon: User },
    { title: t.ownerRegistration.step2, icon: Building },
    { title: t.ownerRegistration.step3, icon: FileText },
    { title: t.ownerRegistration.step4, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          
          {step < 5 && (
            <div className="mb-10">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground gap-2" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" /> {t.ownerRegistration.backToHome || "Back to Home"}
              </Button>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                {t.ownerRegistration.title}
              </h1>
              <p className="text-muted-foreground">{t.ownerRegistration.subtitle}</p>

              {/* Progress Stepper */}
              <div className="flex items-center justify-between mt-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((s, index) => {
                  const StepIcon = s.icon;
                  const isActive = step >= index + 1;
                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
                      }`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              
              {/* STEP 1: Owner Profile */}
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.step1}</h2>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">{t.ownerRegistration.fullName} *</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="h-12" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">{t.ownerRegistration.phone} *</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="h-12" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">{t.ownerRegistration.email}</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="h-12" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password">{t.ownerRegistration.password} *</Label>
                      <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="h-12" placeholder="Create a password for your account" />
                    </div>

                    <div className="grid gap-3 pt-2">
                      <Label>{t.ownerRegistration.role} *</Label>
                      <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="owner" id="r-owner" />
                          <Label htmlFor="r-owner" className="font-normal cursor-pointer">{t.ownerRegistration.roleOwner}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manager" id="r-manager" />
                          <Label htmlFor="r-manager" className="font-normal cursor-pointer">{t.ownerRegistration.roleManager}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button onClick={nextStep} disabled={!formData.fullName || !formData.phone} size="lg" className="w-full sm:w-auto px-8 gap-2">
                      {t.ownerRegistration.next} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Property Overview */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.step2}</h2>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="propertyName">{t.ownerRegistration.propertyName} *</Label>
                      <Input id="propertyName" name="propertyName" value={formData.propertyName} onChange={handleInputChange} required className="h-12" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="city">{t.ownerRegistration.city} *</Label>
                      <Input id="city" name="city" placeholder="e.g. Bole, Addis Ababa" value={formData.city} onChange={handleInputChange} required className="h-12" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="totalRooms">{t.ownerRegistration.totalRooms} *</Label>
                        <Input id="totalRooms" name="totalRooms" type="number" min="1" value={formData.totalRooms} onChange={handleInputChange} required className="h-12" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="startingPrice">{t.ownerRegistration.startingPrice} *</Label>
                        <Input id="startingPrice" name="startingPrice" type="number" min="0" value={formData.startingPrice} onChange={handleInputChange} required className="h-12" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Button variant="outline" onClick={prevStep} size="lg" className="px-6">
                      {t.ownerRegistration.back}
                    </Button>
                    <Button onClick={nextStep} disabled={!formData.propertyName || !formData.city || !formData.totalRooms || !formData.startingPrice} size="lg" className="px-8 gap-2">
                      {t.ownerRegistration.next} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Business Verification */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.step3}</h2>
                  
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label htmlFor="licenseNumber">{t.ownerRegistration.licenseNumber} *</Label>
                      <Input id="licenseNumber" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required className="h-12" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>{t.ownerRegistration.uploadLicense} *</Label>
                      <Label 
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{formData.fileName || t.ownerRegistration.uploadHelp}</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB</p>
                        <Input 
                          type="file" 
                          className="hidden" 
                          id="file-upload"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFormData(prev => ({...prev, fileName: e.target.files?.[0]?.name || ""}))}
                        />
                      </Label>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Button variant="outline" onClick={prevStep} size="lg" className="px-6">
                      {t.ownerRegistration.back}
                    </Button>
                    <Button onClick={nextStep} disabled={!formData.licenseNumber} size="lg" className="px-8 gap-2">
                      {t.ownerRegistration.next} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.reviewTitle}</h2>
                  
                  <div className="bg-muted/30 rounded-xl p-6 space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{t.ownerRegistration.step1}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">{t.ownerRegistration.fullName}:</span>
                        <span className="font-medium text-foreground truncate">{formData.fullName}</span>
                        <span className="text-muted-foreground">{t.ownerRegistration.phone}:</span>
                        <span className="font-medium text-foreground">{formData.phone}</span>
                        <span className="text-muted-foreground">{t.ownerRegistration.role}:</span>
                        <span className="font-medium text-foreground capitalize">{formData.role}</span>
                      </div>
                    </div>
                    
                    <div className="h-px w-full bg-border" />

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{t.ownerRegistration.step2}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">{t.ownerRegistration.propertyName}:</span>
                        <span className="font-medium text-foreground truncate">{formData.propertyName}</span>
                        <span className="text-muted-foreground">{t.ownerRegistration.city}:</span>
                        <span className="font-medium text-foreground truncate">{formData.city}</span>
                        <span className="text-muted-foreground">{t.ownerRegistration.startingPrice}:</span>
                        <span className="font-medium text-foreground">{formData.startingPrice} ETB</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border" />

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{t.ownerRegistration.step3}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">{t.ownerRegistration.licenseNumber}:</span>
                        <span className="font-medium text-foreground">{formData.licenseNumber}</span>
                        <span className="text-muted-foreground">Document:</span>
                        <span className="font-medium text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Button variant="outline" onClick={prevStep} size="lg" className="px-6">
                      {t.ownerRegistration.back}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="px-8 gap-2 bg-primary">
                      {isSubmitting ? "Submitting..." : t.ownerRegistration.submit}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success / Pending */}
              {step === 5 && (
                <div className="text-center py-12 space-y-6 animate-in zoom-in-95 fade-in">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin opacity-20"></div>
                    <Building2 className="w-10 h-10" />
                    <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-foreground">
                    {t.ownerRegistration.successTitle}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {t.ownerRegistration.successMessage}
                  </p>

                  <div className="pt-8">
                    <Button onClick={() => navigate("/")} size="lg" className="px-8">
                      {t.ownerRegistration.backToHome}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterProperty;