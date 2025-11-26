import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* LOGO + DESCRIPCIÓN */}
        <div className="footer-section brand">
          <div className="footer-logo">C</div>
          <h2>Clothing.</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="social-icons">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-youtube"></i>
          </div>
        </div>

        {/* Company */}
        <div className="footer-section">
          <h3>Company</h3>
          <a href="#">About Us</a>
          <a href="#">Blog</a>
          <a href="#">Contact Us</a>
          <a href="#">Career</a>
        </div>

        {/* Customer Services */}
        <div className="footer-section">
          <h3>Customer Services</h3>
          <a href="#">My Account</a>
          <a href="#">Track Your Order</a>
          <a href="#">Return</a>
          <a href="#">FAQ</a>
        </div>

        {/* Information */}
        <div className="footer-section">
          <h3>Our Information</h3>
          <a href="#">Privacy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Return Policy</a>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>+0123-456-789</p>
          <p>example@gmail.com</p>
          <p>
            8502 Preston Rd.<br />
            Inglewood, Maine 98380
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 Clothing Website Design. All Rights Reserved.</p>

        <div className="footer-lang">
          <span>English ▾</span>
          <span>USD ▾</span>
        </div>
      </div>
    </footer>
  );
}
