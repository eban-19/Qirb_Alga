import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle2, Building, User, FileText, ArrowLeft, Building2, Plus, Edit, Eye, EyeOff } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  filterNameInput,
  filterPhoneInput,
  filterAlphaNumericInput,
  validateName,
  validatePhone,
  validateEmail,
  validatePassword
} from "@/utils/validation";

const RegisterProperty = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-scroll to error message when it is set
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: "owner",
    // Business profile fields
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    licenseNumber: "",
    idDocument: null,
    // Property fields (for after approval)
    pensionName: "",
    pensionAddress: "",
    pensionPhone: "",
    pensionEmail: "",
    pensionCapacity: "",
    pensionDescription: "",
    pensionRoomDetails: ""
  });

  const passwordRules = [
    { label: "At least 8 characters long", met: formData.password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(formData.password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(formData.password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(formData.password) },
    { label: "At least one special symbol (@$!%*?&#)", met: /[@$!%*?&#]/.test(formData.password) },
  ];
  const allPasswordRulesMet = passwordRules.every(rule => rule.met);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'idDocument' && files && files[0]) {
      // Handle file upload
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      console.log('📄 File selected:', file.name, file.type, file.size);
    } else {
      let filteredValue = value;
      if (name === 'fullName') {
        filteredValue = filterNameInput(value);
      } else if (name === 'phone' || name === 'businessPhone') {
        filteredValue = filterPhoneInput(value);
      } else if (name === 'licenseNumber') {
        filteredValue = filterAlphaNumericInput(value, 30);
      }
      setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const addProperty = async () => {
    try {
      const propertyData = {
        name: formData.pensionName,
        address: formData.pensionAddress,
        phone: formData.pensionPhone,
        email: formData.pensionEmail,
        capacity: parseInt(formData.pensionCapacity) || 1,
        description: formData.pensionDescription,
        room_details: formData.pensionRoomDetails
      };

      console.log('🏢 Adding property:', propertyData);
      alert('Property added successfully!');
    } catch (error) {
      console.error('❌ Error adding property:', error);
    }
  };

  const validateEthiopianPhone = (phone: string, isBusiness: boolean = false): string | null => {
    return validatePhone(phone, true, false, isBusiness ? 'Business phone number' : 'Phone number');
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev + 1);
  };

  const handleStep1Next = async () => {
    setError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate Ethiopian phone number with detailed descriptive validation
    const phoneError = validateEthiopianPhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Validate Strong Password (Required)
    if (!formData.password) {
      setError("Password is required");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&#)");
      return;
    }

    // Check if email already exists in DB
    try {
      const emailResponse = await fetch(`http://localhost:3006/api/auth/check-user?identifier=${encodeURIComponent(formData.email.trim())}`);
      const emailData = await emailResponse.json();
      if (emailData.success && emailData.exists) {
        setError("An account with this email address already exists.");
        return;
      }
    } catch (e) {
      console.error("Error verifying email uniqueness:", e);
    }

    // Check if phone already exists in DB
    try {
      // Normalize phone value to verify uniqueness properly in backend
      const rawPhone = formData.phone.trim();
      const phoneResponse = await fetch(`http://localhost:3006/api/auth/check-user?identifier=${encodeURIComponent(rawPhone)}`);
      const phoneData = await phoneResponse.json();
      if (phoneData.success && phoneData.exists) {
        setError("An account with this phone number already exists.");
        return;
      }
    } catch (e) {
      console.error("Error verifying phone uniqueness:", e);
    }

    nextStep();
  };

  const handleStep2Next = () => {
    setError("");

    if (!formData.businessName || formData.businessName.trim().length < 2) {
      setError("Business Name must be at least 2 characters long");
      return;
    }

    if (formData.businessEmail) {
      const emailErr = validateEmail(formData.businessEmail, false, "Business email");
      if (emailErr) {
        setError(emailErr);
        return;
      }
    }

    if (formData.businessPhone) {
      const phoneErr = validatePhone(formData.businessPhone, false, false, "Business phone");
      if (phoneErr) {
        setError(phoneErr);
        return;
      }
    }

    nextStep();
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill in all required fields: Full Name, Email, Phone Number, and Password');
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

      // Validate phone format
      const phoneError = validateEthiopianPhone(formData.phone);
      if (phoneError) {
        setError(phoneError);
        setIsSubmitting(false);
        return;
      }

      // Validate password strength
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!strongPasswordRegex.test(formData.password)) {
        setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&#)");
        setIsSubmitting(false);
        return;
      }

      // Validate business phone if provided
      if (formData.businessPhone) {
        const businessPhoneError = validateEthiopianPhone(formData.businessPhone, true);
        if (businessPhoneError) {
          setError(businessPhoneError);
          setIsSubmitting(false);
          return;
        }
      }

      // Validate business email if provided
      if (formData.businessEmail && !emailRegex.test(formData.businessEmail)) {
        setError('Please enter a valid business email address');
        setIsSubmitting(false);
        return;
      }

      // Upload document first, then register with document URL (original working approach)
      let documentUrl = null;
      
      if (formData.idDocument && formData.idDocument instanceof File) {
        console.log('📄 Uploading document before registration:', formData.idDocument.name);
        
        try {
          // Upload document first using test endpoint (no auth needed)
          const formDataUpload = new FormData();
          formDataUpload.append('image', formData.idDocument);
          
          const uploadResponse = await fetch('http://localhost:3006/api/uploads/test', {
            method: 'POST',
            body: formDataUpload,
          });
          
          const uploadResult = await uploadResponse.json();
          console.log('🔍 Upload result:', uploadResult);
          
          if (uploadResult.success) {
            documentUrl = uploadResult.data.url;
            console.log('✅ Document uploaded successfully:', documentUrl);
          } else {
            console.error('❌ Document upload failed:', uploadResult.message);
          }
        } catch (uploadError) {
          console.error('❌ Document upload error:', uploadError);
        }
      }

      // Register user with document URL (original working approach)
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: 'owner', // Send lowercase 'owner' to match backend expectation
        password: formData.password,
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        licenseNumber: formData.licenseNumber,
        documentUrl: documentUrl // Pass uploaded document URL directly
      };

      const response = await register(userData);

      if (response.success) {
        // Store the token in localStorage for subsequent API calls
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Business submitted for approval, go to success page
        console.log('✅ Business registration submitted for approval');
        setStep(5); // Go to success step
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertySubmit = async () => {
    // This will be called when adding properties after approval
    console.log('Adding property after approval');
    // Property addition logic here
  };

  const steps = [
    { title: t.ownerRegistration.step1, icon: User },
    { title: t.ownerRegistration.step2, icon: Building },
    { title: t.ownerRegistration.reviewTitle || "Review & Submit", icon: FileText },
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
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">{t.ownerRegistration.phone} *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="h-12" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t.ownerRegistration.email}</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="h-12" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          name="password" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          required
                          className="h-12 pr-10" 
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Dynamic Password Strength Checklist */}
                      <div className="mt-2 p-4 bg-slate-50/80 border border-slate-100/90 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Password Requirements
                        </p>
                        <div className="grid gap-1.5">
                          {passwordRules.map((rule, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {rule.met ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                              )}
                              <span className={rule.met ? "text-emerald-700 font-semibold transition-colors duration-200" : "text-slate-500 transition-colors duration-200"}>
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button onClick={handleStep1Next} disabled={!formData.fullName || !formData.phone || !formData.email || !allPasswordRulesMet} size="lg" className="w-full sm:w-auto px-8 gap-2">
                      {t.ownerRegistration.next} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Details */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.step2}</h2>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} required className="h-12" placeholder="Enter your business name" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="businessEmail">Business Email</Label>
                        <Input id="businessEmail" name="businessEmail" type="email" value={formData.businessEmail} onChange={handleInputChange} className="h-12" placeholder="business@example.com" />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input id="businessPhone" name="businessPhone" type="tel" value={formData.businessPhone} onChange={handleInputChange} className="h-12" placeholder="+251 ..." />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input id="licenseNumber" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="h-12" placeholder="Business license number" />
                    </div>
                    
                    <div className="pt-4">
                      <Label htmlFor="idDocument">Business License Document</Label>
                      <Input id="idDocument" name="idDocument" type="file" onChange={handleInputChange} accept="image/*,.pdf" className="h-12" />
                      <p className="text-sm text-slate-500 mt-1">Upload your business license or ID document (PDF or image)</p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Button variant="outline" onClick={prevStep} size="lg" className="px-6">
                      {t.ownerRegistration.back}
                    </Button>
                    <Button onClick={handleStep2Next} disabled={!formData.businessName} size="lg" className="w-full sm:w-auto px-8 gap-2">
                      {t.ownerRegistration.next} <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Submit */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.reviewTitle || "Review & Submit"}</h2>
                  
                  <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Business Profile</h3>
                        <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Profile
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Business Name</Label>
                          <p className="text-slate-900 font-medium">{formData.businessName}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Contact Person</Label>
                          <p className="text-slate-900 font-medium">{formData.fullName}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Email</Label>
                          <p className="text-slate-900 font-medium">{formData.email}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Phone</Label>
                          <p className="text-slate-900 font-medium">{formData.phone}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Business Email</Label>
                          <p className="text-slate-900 font-medium">{formData.businessEmail}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">Business Phone</Label>
                          <p className="text-slate-900 font-medium">{formData.businessPhone}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-bold text-slate-700">License Number</Label>
                          <p className="text-slate-900 font-medium">{formData.licenseNumber}</p>
                        </div>
                        
                        {formData.idDocument && (
                          <div>
                            <Label className="text-sm font-bold text-slate-700">License Document</Label>
                            <p className="text-slate-900 font-medium">Document uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-6 flex justify-between">
                      <Button variant="outline" onClick={prevStep} size="lg" className="px-6">
                        {t.ownerRegistration.back}
                      </Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full sm:w-auto px-8 gap-2">
                        {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Property Management (After Approval) */}
              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                  <h2 className="text-2xl font-bold text-foreground">{t.ownerRegistration.step4}</h2>
                  <p className="text-slate-600 mb-4">Your business has been approved! Now you can add your pension properties.</p>
                  
                  <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Add New Property</h3>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Property
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="pensionName">Property Name *</Label>
                          <Input id="pensionName" name="pensionName" value={formData.pensionName} onChange={handleInputChange} required className="h-12" placeholder="Enter property name" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionAddress">Property Address *</Label>
                          <Input id="pensionAddress" name="pensionAddress" value={formData.pensionAddress} onChange={handleInputChange} required className="h-12" placeholder="Full property address" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionPhone">Property Phone</Label>
                          <Input id="pensionPhone" name="pensionPhone" type="tel" value={formData.pensionPhone} onChange={handleInputChange} className="h-12" placeholder="Property contact phone" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionEmail">Property Email</Label>
                          <Input id="pensionEmail" name="pensionEmail" type="email" value={formData.pensionEmail} onChange={handleInputChange} className="h-12" placeholder="property@example.com" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionCapacity">Property Capacity</Label>
                          <Input id="pensionCapacity" name="pensionCapacity" type="number" value={formData.pensionCapacity} onChange={handleInputChange} required className="h-12" placeholder="Number of rooms" min="1" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionDescription">Property Description</Label>
                          <Textarea id="pensionDescription" name="pensionDescription" value={formData.pensionDescription} onChange={handleInputChange} className="h-12" placeholder="Describe your property" rows={3} />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="pensionRoomDetails">Room Details *</Label>
                          <Textarea id="pensionRoomDetails" name="pensionRoomDetails" value={formData.pensionRoomDetails} onChange={handleInputChange} className="h-12" placeholder="e.g. Single and double rooms with private bathroom options" rows={2} required />
                        </div>
                      </div>
                      
                      <div className="pt-6 flex justify-end">
                        <Button onClick={addProperty} disabled={!formData.pensionName || !formData.pensionAddress} size="lg" className="w-full sm:w-auto px-8 gap-2">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Property
                        </Button>
                      </div>
                    </div>
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