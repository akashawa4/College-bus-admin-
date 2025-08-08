import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const setupDemoAccount = async () => {
  try {
    const demoEmail = 'demo@admin.com';
    const demoPassword = 'demo123456';
    
    console.log('Creating demo account...');
    await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
    console.log('✅ Demo account created successfully!');
    console.log('📧 Email: demo@admin.com');
    console.log('🔑 Password: demo123456');
    console.log('You can now use these credentials to login.');
    
    return { success: true, email: demoEmail, password: demoPassword };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Demo account already exists!');
      console.log('📧 Email: demo@admin.com');
      console.log('🔑 Password: demo123456');
      return { success: true, email: 'demo@admin.com', password: 'demo123456' };
    } else {
      console.error('❌ Failed to create demo account:', error.message);
      throw error;
    }
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).setupDemoAccount = setupDemoAccount;
}

