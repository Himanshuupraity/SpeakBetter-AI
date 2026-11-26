import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, RouterProvider, useLocation, useRouteError } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import Spinner from './components/common/Spinner.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { useApp } from './context/AppContext.jsx';

const Welcome = lazy(() => import('./pages/Welcome.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const LevelTest = lazy(() => import('./pages/LevelTest.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Speaking = lazy(() => import('./pages/Speaking.jsx'));
const Conversation = lazy(() => import('./pages/Conversation.jsx'));
const Pronunciation = lazy(() => import('./pages/Pronunciation.jsx'));
const SpeakingSpeed = lazy(() => import('./pages/SpeakingSpeed.jsx'));
const Grammar = lazy(() => import('./pages/Grammar.jsx'));
const GrammarTopic = lazy(() => import('./pages/GrammarTopic.jsx'));
const Vocabulary = lazy(() => import('./pages/Vocabulary.jsx'));
const Writing = lazy(() => import('./pages/Writing.jsx'));
const Reading = lazy(() => import('./pages/Reading.jsx'));
const Listening = lazy(() => import('./pages/Listening.jsx'));
const DailyPractice = lazy(() => import('./pages/DailyPractice.jsx'));
const Mistakes = lazy(() => import('./pages/Mistakes.jsx'));
const Progress = lazy(() => import('./pages/Progress.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const SessionDetail = lazy(() => import('./pages/SessionDetail.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Learn = lazy(() => import('./pages/Learn.jsx'));
const HindiHome = lazy(() => import('./pages/hindi/HindiHome.jsx'));
const HindiAlphabet = lazy(() => import('./pages/hindi/HindiAlphabet.jsx'));
const HindiWords = lazy(() => import('./pages/hindi/HindiWords.jsx'));
const HindiPhrases = lazy(() => import('./pages/hindi/HindiPhrases.jsx'));
const HindiGrammar = lazy(() => import('./pages/hindi/HindiGrammar.jsx'));
const HindiQuiz = lazy(() => import('./pages/hindi/HindiQuiz.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** First-time users see the welcome screen and onboarding before the app. */
function RequireOnboarding({ children }) {
  const { state } = useApp();
  if (!state.profile.onboarded) return <Navigate to="/welcome" replace />;
  return children;
}

/** Shell shared by every route: scroll reset, render-error boundary and lazy-page fallback. */
function Root() {
  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

/** Router-level errors are re-thrown so the app-wide ErrorBoundary shows its friendly screen. */
function RouteError() {
  throw useRouteError();
}

// A data router (rather than <BrowserRouter>) so pages can use useBlocker,
// e.g. to warn before leaving an unfinished conversation.
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />} errorElement={<RouteError />}>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/level-test" element={<LevelTest />} />
      <Route
        element={
          <RequireOnboarding>
            <AppLayout />
          </RequireOnboarding>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="speak" element={<Speaking />} />
        <Route path="conversation" element={<Conversation />} />
        <Route path="pronunciation" element={<Pronunciation />} />
        <Route path="speed" element={<SpeakingSpeed />} />
        <Route path="grammar" element={<Grammar />} />
        <Route path="grammar/:topicId" element={<GrammarTopic />} />
        <Route path="vocabulary" element={<Vocabulary />} />
        <Route path="writing" element={<Writing />} />
        <Route path="reading" element={<Reading />} />
        <Route path="reading/:articleId" element={<Reading />} />
        <Route path="listening" element={<Listening />} />
        <Route path="listening/:itemId" element={<Listening />} />
        <Route path="daily" element={<DailyPractice />} />
        <Route path="mistakes" element={<Mistakes />} />
        <Route path="progress" element={<Progress />} />
        <Route path="history" element={<History />} />
        <Route path="history/:sessionId" element={<SessionDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="learn" element={<Learn />} />
        <Route path="hindi" element={<HindiHome />} />
        <Route path="hindi/alphabet" element={<HindiAlphabet />} />
        <Route path="hindi/words" element={<HindiWords />} />
        <Route path="hindi/phrases" element={<HindiPhrases />} />
        <Route path="hindi/grammar" element={<HindiGrammar />} />
        <Route path="hindi/grammar/:lessonId" element={<HindiGrammar />} />
        <Route path="hindi/quiz" element={<HindiQuiz />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
