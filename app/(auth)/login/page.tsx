import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.content}>
        {/* Left Side - Info */}
        <div className={styles.infoSection}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Equi</span>
            <span className={styles.logoAccent}>para</span>
          </Link>
          
          <h1 className={styles.title}>
            Welcome Back to Equipara
          </h1>
          
          <p className={styles.description}>
            Sign in to manage your rentals, list equipment, or browse the marketplace.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔧</div>
              <div>
                <h3 className={styles.featureTitle}>Manage Your Fleet</h3>
                <p className={styles.featureDesc}>
                  Update listings, check availability, and respond to inquiries
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <div>
                <h3 className={styles.featureTitle}>Track Rentals</h3>
                <p className={styles.featureDesc}>
                  View active rentals, payment history, and booking status
                </p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🤝</div>
              <div>
                <h3 className={styles.featureTitle}>Connect Directly</h3>
                <p className={styles.featureDesc}>
                  Message suppliers and buyers directly through the platform
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Sign In</h2>
            <p className={styles.formSubtitle}>
              Access your Equipara account
            </p>
            
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}