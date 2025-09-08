import Link from "next/link";
import styles from "./navbar.module.css";

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Browse", href: "/browse", icon: "browse" },
  { label: "About", href: "/about", icon: "about" },
  { label: "Contact", href: "/contact", icon: "contact" },
];

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
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-gray-700 hover:text-gray-900 flex flex-col items-center text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor">
                <use xlinkHref={`#icon-${item.icon}`} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
