import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import SkillSearch from '../components/home/SkillSearch';
import TrendingSkills from '../components/home/TrendingSkills';
import SkillMatches from '../components/home/SkillMatches';
import HowItWorks from '../components/home/HowItWorks';
import SmartMatching from '../components/home/SmartMatching';
import TopMentors from '../components/home/TopMentors';
import LearnTogether from '../components/home/LearnTogether';
import QuizPreview from '../components/home/QuizPreview';
import ProgressPreview from '../components/home/ProgressPreview';
import ChatPreview from '../components/home/ChatPreview';
import CommunityPreview from '../components/home/CommunityPreview';
import Testimonials from '../components/home/Testimonials';
import FinalCTA from '../components/home/FinalCTA';
import Footer from '../components/home/Footer';

const Homepage = () => {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-900">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Hero />
        <SkillSearch />
        <TrendingSkills />
        <SkillMatches />
        <HowItWorks />
        <SmartMatching />
        <TopMentors />
        <LearnTogether />
        <QuizPreview />
        <ProgressPreview />
        <ChatPreview />
        <CommunityPreview />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;