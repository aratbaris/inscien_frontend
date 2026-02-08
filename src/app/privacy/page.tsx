import styles from "./page.module.css";

export const metadata = {
  title: "Privacy Policy | InScien",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>← InScien</a>
        </div>
        <div className={styles.headerMain}>
          <div className={styles.pageDomain}>Legal</div>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: February 8, 2026</p>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.intro}>
          This Privacy Policy explains how Finance Lab Teknoloji Anonim Şirketi collects, uses, stores, and protects your personal data when you use the InScien platform.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Company Details</h2>
          <div className={styles.companyBlock}>
            <p>FINANCE LAB TEKNOLOJİ ANONİM ŞİRKETİ</p>
            <p>Address: Reşitpaşa Mah., Katar Cad., İTÜ ARI Teknokent 3 Binası No: 4, İç Kapı No: B204, Sarıyer / Istanbul, 34467</p>
            <p>Trade Registry Number: 1035621</p>
            <p>Tax Office: Sarıyer</p>
            <p>Email: info@inscien.com</p>
          </div>
          <p>InScien complies with applicable data protection laws, including KVKK in Türkiye, GDPR in the European Union, and general international privacy standards.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <h3 className={styles.subsectionTitle}>Information You Provide</h3>
          <p>We collect information you actively provide, including name, email address, billing information, optional company information, and support inquiries.</p>
          <h3 className={styles.subsectionTitle}>Automatically Collected Information</h3>
          <p>We collect technical and usage data such as IP address, browser and device information, usage logs, request metadata, session identifiers, and authentication tokens.</p>
          <h3 className={styles.subsectionTitle}>Payment Information</h3>
          <p>InScien does not store credit card information. Payments are processed through Gumroad. We receive only payment confirmations, masked card details, and subscription status.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <p>We process personal data to provide access to the platform, authenticate accounts, process subscriptions and payments, improve performance, send necessary notifications, provide support, and fulfill legal obligations. We do not sell personal data to third parties.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Legal Basis for Processing</h2>
          <p>Depending on your jurisdiction, your data may be processed based on contractual necessity, legitimate interest such as security and fraud prevention, user consent for optional marketing communications, and legal obligations including tax and billing requirements.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Sharing</h2>
          <p>We may share data only with cloud infrastructure providers, analytics and monitoring services, and legal authorities when required by law. All partners comply with GDPR and KVKK.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Retention</h2>
          <p>We retain personal and billing data for as long as necessary for account operation, legal reporting, tax compliance, and security requirements. You may request deletion except where legal retention obligations apply.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cookies</h2>
          <p>InScien uses cookies and local storage for authentication, session management, analytics, and user preference storage. You may manage or disable cookies through your browser settings.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Rights</h2>
          <p>Depending on your location under KVKK or GDPR, you may have rights to access, correct, delete, or transfer your data, withdraw consent, or object to certain forms of processing. Requests may be submitted to <a href="mailto:info@inscien.com" className={styles.link}>info@inscien.com</a>.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Security</h2>
          <p>We implement security measures including TLS and SSL encryption, encrypted storage, access controls, firewalls, and automated abuse detection. While no system is completely risk-free, we follow industry-standard practices to safeguard personal data.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Children's Privacy</h2>
          <p>InScien is not intended for individuals under 18 years of age, and we do not knowingly collect personal data from children.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>International Data Transfers</h2>
          <p>Data may be processed in data centers located outside your country. All transfers comply with GDPR and KVKK requirements for international data protection.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
          <p>We may revise this Privacy Policy from time to time. Updates become effective when published on this page.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <p>For privacy-related inquiries, please contact:</p>
          <div className={styles.companyBlock}>
            <p>FINANCE LAB TEKNOLOJİ ANONİM ŞİRKETİ</p>
            <p>Email: <a href="mailto:info@inscien.com" className={styles.link}>info@inscien.com</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}