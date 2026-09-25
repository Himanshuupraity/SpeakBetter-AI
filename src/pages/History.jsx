import { useMemo, useState } from 'react';
import { FileClock } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import ChoiceGroup from '../components/common/ChoiceGroup.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import SessionListItem from '../components/dashboard/SessionListItem.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDate, relativeDay, dayKey } from '../utils/date.js';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'writing', label: 'Writing' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
  { id: 'pronunciation', label: 'Pronunciation' },
  { id: 'speed', label: 'Speed' },
];

export default function History() {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(30);

  const groups = useMemo(() => {
    const list = state.sessions.filter((s) => filter === 'all' || s.type === filter).slice(0, limit);
    const map = new Map();
    list.forEach((s) => {
      const k = dayKey(s.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    });
    return [...map.entries()];
  }, [state.sessions, filter, limit]);
  const total = state.sessions.filter((s) => filter === 'all' || s.type === filter).length;

  return (
    <div>
      <PageHeader title="Practice History" subtitle={`${state.sessions.length} sessions in total`} icon={FileClock} />
      <div className="scrollbar-none -mx-4 mb-4 overflow-x-auto px-4">
        <ChoiceGroup label="Filter by type" hideLabel options={FILTERS} value={filter} onChange={setFilter} className="[&>div]:flex-nowrap [&_label]:shrink-0" />
      </div>
      {groups.length ? (
        <div className="space-y-4">
          {groups.map(([day, sessions]) => (
            <section key={day} aria-label={formatDate(sessions[0].date)}>
              <h2 className="mb-1.5 px-1 text-sm font-semibold text-slate-500">{relativeDay(sessions[0].date)} <span className="font-normal">· {formatDate(sessions[0].date)}</span></h2>
              <Card padded={false} className="p-1.5">{sessions.map((s) => <SessionListItem key={s.id} session={s} showDate={false} />)}</Card>
            </section>
          ))}
          {total > limit && <Button variant="outline" block onClick={() => setLimit((l) => l + 30)}>Show more</Button>}
        </div>
      ) : (
        <EmptyState icon={FileClock} title="No sessions yet" action={<Button to="/speak">Start practising</Button>}>Every practice session you complete is saved here with its detailed report.</EmptyState>
      )}
    </div>
  );
}
