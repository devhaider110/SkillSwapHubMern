const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300">
          <p><strong>Last updated:</strong> August 2026</p>
          <p><strong>1. Information We Collect:</strong> Name, email, username, profile picture, bio, skills, swap history.</p>
          <p><strong>2. How We Use Data:</strong> To match users, facilitate swaps, recommend skills, and improve the platform.</p>
          <p><strong>3. Profile Visibility:</strong> You can control who sees your profile in Settings → Privacy.</p>
          <p><strong>4. Files & Images:</strong> Uploaded images are stored securely on Cloudinary. You can delete them anytime.</p>
          <p><strong>5. Cookies & Local Storage:</strong> Used for authentication, theme preference, and session management.</p>
          <p><strong>6. Account Deletion:</strong> You can delete your account anytime from Settings → Account. All data will be permanently removed.</p>
          <p><strong>7. Data Sharing:</strong> We do not sell or share your personal data with third parties.</p>
          <p><strong>8. Contact:</strong> For privacy concerns, email us at privacy@skillswap.com.</p>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;