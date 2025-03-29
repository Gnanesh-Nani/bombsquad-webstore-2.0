import React from "react";
import styles from "../styles/partials/footer.module.css"; // Updated import

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p className={styles.footerText}>Mr-Rip Official &copy; {new Date().getFullYear()} All rights reserved.</p>
        </footer>
    );
};

export default Footer;