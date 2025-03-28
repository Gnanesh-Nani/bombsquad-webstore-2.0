import React from "react";
import "../styles/partials/footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <p className="footer-text">Mr-Rip Official &copy; {new Date().getFullYear()} All rights reserved.</p>
        </footer>
    );
};

export default Footer;