// Account status-specific login messages
export interface AccountStatusError {
  status: 'pending' | 'rejected' | 'suspended' | 'not_found' | 'invalid_credentials' | 'general';
  message: string;
  title: string;
  variant: 'destructive' | 'default';
  icon?: string;
  severity?: 'high' | 'medium' | 'low';
}

// Manual override for suspended accounts (admin can add emails here)
const SUSPENDED_ACCOUNTS = new Set<string>([
  // Add suspended account emails here if needed
  'adisu@gail.com', // This is the suspended account based on terminal output
  // 'suspended@example.com'
  // Add your suspended account email here for testing
]);

export const getAccountStatusMessage = (error: any, email?: string): AccountStatusError => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorStatus = (error?.status?.toString() || '').toLowerCase(); // Convert status to string first
  const userStatus = error?.user?.status?.toLowerCase() || ''; // Check if backend returns user status
  const originalResponse = error?.originalResponse || {}; // Get original backend response
  const requiresApproval = originalResponse?.requiresApproval === true; // Check for suspended account flag
  
  // TEMPORARY DEBUG: Log all data to understand what we receive
  console.log('=== LOGIN ERROR DEBUG ===');
  console.log('Email:', email);
  console.log('Error Message:', errorMessage);
  console.log('Original Response:', originalResponse);
  console.log('User Data:', originalResponse.user);
  console.log('Requires Approval:', requiresApproval);
  console.log('========================');
  
  // Check for suspended account first (priority check)
  // Use specific suspended keywords and patterns
  if (errorMessage.includes('suspended') || errorStatus === 'suspended' || 
      errorMessage.includes('temporarily') || errorMessage.includes('disabled') ||
      errorMessage.includes('deactivated') || errorMessage.includes('blocked') ||
      userStatus === 'suspended') {
    return {
      status: 'suspended',
      title: 'Account Suspended',
      message: 'Your account has been temporarily suspended. Please contact the administrator for more information or wait for the suspension period to end.',
      variant: 'default', // Use default for less severe issues
      icon: 'alert-triangle',
      severity: 'medium'
    };
  }
  
  // Check for pending approval (new registrations)
  // This should be triggered for new users who haven't been approved yet
  if (errorMessage.includes('pending') || errorStatus === 'pending' || 
      errorMessage.includes('under review') || errorMessage.includes('verification') ||
      userStatus === 'pending') {
    return {
      status: 'pending',
      title: 'Account Pending Approval',
      message: 'Your account is pending approval. Our team is reviewing your application and will notify you once the process is complete.',
      variant: 'default', // Use default for informational messages
      icon: 'clock',
      severity: 'low'
    };
  }
  
  // Special handling for requiresApproval cases
  // Use multiple detection methods to distinguish suspended vs pending
  if (requiresApproval) {
    // Method 1: Manual override list
    if (email && SUSPENDED_ACCOUNTS.has(email.toLowerCase())) {
      return {
        status: 'suspended',
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended. Please contact the administrator for more information or wait for the suspension period to end.',
        variant: 'default',
        icon: 'alert-triangle',
        severity: 'medium'
      };
    }
    
    // Method 2: Check for user status in original response
    if (originalResponse.user?.status?.toLowerCase() === 'suspended') {
      return {
        status: 'suspended',
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended. Please contact the administrator for more information or wait for the suspension period to end.',
        variant: 'default',
        icon: 'alert-triangle',
        severity: 'medium'
      };
    }
    
    // Method 3: Pattern analysis - look for indicators of suspension vs new registration
    // Suspended accounts often have different message patterns
    const messageIndicatesSuspended = 
      errorMessage.includes('temporarily') ||
      errorMessage.includes('disabled') ||
      errorMessage.includes('deactivated') ||
      errorMessage.includes('blocked') ||
      errorMessage.includes('suspended');
    
    const messageIndicatesPending = 
      errorMessage.includes('pending') ||
      errorMessage.includes('under review') ||
      errorMessage.includes('verification') ||
      errorMessage.includes('wait for admin approval') ||
      errorMessage.includes('admin approval');
    
    if (messageIndicatesSuspended) {
      return {
        status: 'suspended',
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended. Please contact the administrator for more information or wait for the suspension period to end.',
        variant: 'default',
        icon: 'alert-triangle',
        severity: 'medium'
      };
    }
    
    if (messageIndicatesPending) {
      return {
        status: 'pending',
        title: 'Account Pending Approval',
        message: 'Your account is pending approval. Our team is reviewing your application and will notify you once the process is complete.',
        variant: 'default',
        icon: 'clock',
        severity: 'low'
      };
    }
    
    // Method 4: Default to pending for new registrations (safer default)
    return {
      status: 'pending',
      title: 'Account Pending Approval',
      message: 'Your account is pending approval. Our team is reviewing your application and will notify you once the process is complete.',
      variant: 'default',
      icon: 'clock',
      severity: 'low'
    };
  }
  
  // Check for rejected account
  if (errorMessage.includes('rejected') || errorStatus === 'rejected' ||
      errorMessage.includes('denied') || errorMessage.includes('declined') ||
      userStatus === 'rejected') {
    return {
      status: 'rejected',
      title: 'Account Rejected',
      message: 'Your account application has been rejected. Please review your submitted information and contact support if you believe this is an error.',
      variant: 'destructive',
      icon: 'x-circle',
      severity: 'high'
    };
  }
  
  // Check for invalid credentials
  if (errorMessage.includes('invalid') || errorMessage.includes('incorrect') || 
      errorMessage.includes('wrong') || errorMessage.includes('credentials') ||
      errorMessage.includes('password') || errorMessage.includes('email')) {
    return {
      status: 'invalid_credentials',
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please try again.',
      variant: 'destructive',
      icon: 'lock',
      severity: 'high'
    };
  }
  
  // Check for account not found
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist') ||
      errorMessage.includes('no account') || errorMessage.includes('user not found')) {
    return {
      status: 'not_found',
      title: 'Account Not Found',
      message: 'No account found with this email address. Please check your email or create a new account.',
      variant: 'destructive',
      icon: 'user-x',
      severity: 'high'
    };
  }
  
  // Default error - if it contains "not approved" but we couldn't determine if it's suspended or pending,
  // use pattern analysis or default to pending (safer)
  if (errorMessage.includes('not approved')) {
    // Check for manual override first
    if (email && SUSPENDED_ACCOUNTS.has(email.toLowerCase())) {
      return {
        status: 'suspended',
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended. Please contact the administrator for more information or wait for the suspension period to end.',
        variant: 'default',
        icon: 'alert-triangle',
        severity: 'medium'
      };
    }
    
    // Default to pending for new registrations
    return {
      status: 'pending',
      title: 'Account Pending Approval',
      message: 'Your account is pending approval. Our team is reviewing your application and will notify you once the process is complete.',
      variant: 'default',
      icon: 'clock',
      severity: 'low'
    };
  }
  
  // Default error
  return {
    status: 'general',
    title: 'Login Failed',
    message: errorMessage || 'An error occurred during login. Please try again.',
    variant: 'destructive',
    icon: 'alert-circle',
    severity: 'medium'
  };
};
