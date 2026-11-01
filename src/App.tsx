import { Blog } from './components/Blog';
import { ChatWidget } from './components/ChatWidget';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Lawyers } from './components/Lawyers';
import { Marquee } from './components/Marquee';
import { Navbar } from './components/Navbar';
import { Process } from './components/Process';
import { Specialties } from './components/Specialties';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Specialties />
        <Process />
        <Lawyers />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
