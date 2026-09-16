import "./footer.scss";

const socials = [
  ["Instagram", "https://www.instagram.com/silvercastledigital/"],
  ["Facebook", "https://www.facebook.com/silvercastledigital/"],
  ["X", "https://twitter.com/SilverCastleDigital"],
  ["LinkedIn", "https://www.linkedin.com/company/silver-castle-digital/"],
  ["GitHub", "https://github.com/dwbrown115"],
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <a className="brand footer-brand" href="#hero">
          <img src="/silverCastleDigitalLogoVector.svg" alt="" width="414" height="512" />
          <span>Silver Castle Digital</span>
        </a>
        <p>Independent thinking.<br />Useful things.</p>
        <a href="#hero">Back to top <span aria-hidden="true">↑</span></a>
      </div>
      <div className="container footer-links">
        <div className="social-links">{socials.map(([name, url]) => <a href={url} target="_blank" rel="noreferrer" key={name}>{name}</a>)}</div>
        <span>© {new Date().getFullYear()} Silver Castle Digital</span>
      </div>
    </footer>
  );
}

export default Footer;
