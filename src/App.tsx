import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SearchModalProvider } from './context/SearchModalContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SubjectsPage } from './pages/SubjectsPage';
import { SubjectHubPage } from './pages/SubjectHubPage';
import { TopicHubPage } from './pages/TopicHubPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { SeriesPage } from './pages/SeriesPage';
import { AboutPage } from './pages/AboutPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <SearchModalProvider>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/:slug" element={<SubjectHubPage />} />
                <Route path="/topics" element={<TopicHubPage />} />
                <Route path="/topics/:slug" element={<TopicHubPage />} />
                <Route path="/notes/:slug" element={<NoteDetailPage />} />
                <Route path="/series" element={<SeriesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Layout>
          </SearchModalProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
