import styles from "./page.module.css";

export const metadata = {
  title: "Terms of Use | InScien",
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <a href="/" className={styles.backLink}>← InScien</a>
        </div>
        <div className={styles.headerMain}>
          <div className={styles.pageDomain}>Legal</div>
          <h1 className={styles.pageTitle}>Terms of Use</h1>
          <p className={styles.lastUpdated}>Last updated: February 8, 2026</p>
        </div>
      </header>

      <main className={styles.content}>
        <p className={styles.intro}>
          These Terms govern your access to and use of InScien products and services. By using InScien, you agree to these Terms.
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
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Use of the Service</h2>
          <p>You agree to use the service in compliance with applicable laws and not to misuse, disrupt, or attempt unauthorized access to the service.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accounts and Access</h2>
          <p>If you create an account, you are responsible for maintaining the confidentiality of your credentials and for activities under your account.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Payments and Subscriptions</h2>
          <p>If you purchase a subscription, you agree to pay the applicable fees and taxes. Subscription access may be subject to fair use and abuse prevention controls. Payments are processed through Gumroad. You may cancel your subscription at any time through the Gumroad dashboard.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Disclaimers</h2>
          <p>InScien provides information tools, monitoring agents, and analysis capabilities for research and workflow support. InScien does not provide investment, financial, or legal advice. Analysis outputs and agent artifacts are for informational purposes only.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, InScien is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Changes</h2>
          <p>We may update these Terms from time to time. Updates become effective when published on this page.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:info@inscien.com" className={styles.link}>info@inscien.com</a>.</p>
        </section>
      </main>
    </div>
  );
}