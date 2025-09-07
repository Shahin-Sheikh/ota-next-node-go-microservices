import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <div className={styles.navbarLogo}>
          <Link href="/" className={styles.logoLink}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              className={styles.logoIcon}
              fill="currentColor"
            >
              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 2c7.732 0 14 6.268 14 14s-6.268 14-14 14S2 23.732 2 16 8.268 2 16 2z" />
              <path d="M12 8h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zm0 4h6v2h-6z" />
            </svg>
            <span className={styles.logoText}>StayBook</span>
          </Link>
        </div>

        {/* Search Bar (Airbnb style) */}
        <div className={styles.navbarSearch}>
          <div className={styles.searchContainer}>
            <div className={styles.searchItem}>
              <label className={styles.searchLabel}>Where</label>
              <input
                type="text"
                placeholder="Search destinations"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchDivider}></div>
            <div className={styles.searchItem}>
              <label className={styles.searchLabel}>Check in</label>
              <input
                type="text"
                placeholder="Add dates"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchDivider}></div>
            <div className={styles.searchItem}>
              <label className={styles.searchLabel}>Check out</label>
              <input
                type="text"
                placeholder="Add dates"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchDivider}></div>
            <div className={styles.searchItem}>
              <label className={styles.searchLabel}>Who</label>
              <input
                type="text"
                placeholder="Add guests"
                className={styles.searchInput}
              />
            </div>
            <button className={styles.searchButton}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Menu */}
        <div className={styles.navbarUser}>
          <div className={styles.userMenu}>
            <button className={styles.userMenuButton}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
              <div className={styles.userAvatar}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
