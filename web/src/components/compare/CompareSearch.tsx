import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from '@/data/DataProvider';
import { SearchBar } from '../filters/SearchBar';

/** Grosse Suche wie im Explorer, ohne Filter: Ein Vorschlag öffnet direkt die Detailseite. */
export function CompareSearch() {
  const companies = useCompanies();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2 lg:px-7">
      <SearchBar
        companies={companies}
        value={query}
        onChange={setQuery}
        onPick={(ticker) => navigate(`/firma/${encodeURIComponent(ticker)}`)}
      />
    </div>
  );
}
