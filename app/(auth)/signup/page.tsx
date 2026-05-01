import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import styles from './page.module.css';

export default function SignupPage() {
  return (
    <div className={styles.container}>
      {/* Background Pattern */}
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.content}>
        {/* Left Side - Info */}
        <div className={styles.infoSection}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Equi</span>
            <span className={styles.logoAccent}>para</span>
          </Link>
          
          <h1 className={styles.title}>
            Join Oman's Premier Equipment Marketplace
          </h1>
          
          <p className={styles.description}>
            Create your account to start renting heavy equipment or list your fleet. 
            Connect with verified suppliers across Oman and GCC.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3 className={styles.featureTitle}>Verified Suppliers</h3>
                <p className={styles.featureDesc}>
                  All sellers are vetted with commercial registration
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3 className={styles.featureTitle}>Wide Selection</h3>
                <p className={styles.featureDesc}>
                  Access cranes, forklifts, transport vehicles and more
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <div>
                <h3 className={styles.featureTitle}>Secure Platform</h3>
                <p className={styles.featureDesc}>
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSubtitle}>
              Join Equipara today - it's free
            </p>
            
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}