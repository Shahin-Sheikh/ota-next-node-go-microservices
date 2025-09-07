import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Find your next adventure</h1>
            <p className={styles.heroSubtitle}>
              Discover unique places to stay around the world with StayBook
            </p>
            <button className={styles.heroCta}>Start exploring</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <h2 className={styles.sectionTitle}>Why choose StayBook?</h2>
          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} card`}>
              <div className={styles.featureIcon}>🏠</div>
              <h3>Unique homes</h3>
              <p>Stay in amazing places handpicked by our team</p>
            </div>
            <div className={`${styles.featureCard} card`}>
              <div className={styles.featureIcon}>⭐</div>
              <h3>Trusted reviews</h3>
              <p>Read authentic reviews from verified guests</p>
            </div>
            <div className={`${styles.featureCard} card`}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Secure booking</h3>
              <p>Your payment information is always protected</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
