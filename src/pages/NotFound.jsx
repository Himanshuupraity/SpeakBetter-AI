import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="pt-10">
      <EmptyState title="Page not found" action={<Button to="/">Go to dashboard</Button>}>The page you’re looking for doesn’t exist.</EmptyState>
    </div>
  );
}
