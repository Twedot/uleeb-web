import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FiltersContext';
import { api } from '../lib/api';
import { ChevronLeftIcon, SearchIcon } from '../components/icons';
import { NIGERIAN_STATES } from '../lib/nigeria';

export default function Filters() {
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const { user, token } = useAuth();
  const { selectedStates, allNigeria, setSelectedStates, setAllNigeria, selectedCountry, setSelectedCountry } =
    useFilters();
  const isPro = user?.plan === 'pro';
  const isPlus = user?.plan === 'plus' || isPro;
  const [stateSearch, setStateSearch] = useState('');
  const [countries, setCountries] = useState([]);
  const [proNudge, setProNudge] = useState(false);

  useEffect(() => {
    if (!isPro || !token) return;
    api.get('/properties/countries', token).then(setCountries).catch(() => {});
  }, [isPro, token]);

  function toggleState(s) {
    if (allNigeria) setAllNigeria(false);
    const already = selectedStates.includes(s);
    if (already) {
      setSelectedStates(selectedStates.filter((x) => x !== s));
      return;
    }
    if (!isPlus && selectedStates.length >= 1) {
      // Free: swap to the new state rather than silently blocking —
      // comparing two at once is the Plus feature, not switching which one.
      setSelectedStates([s]);
      return;
    }
    setSelectedStates([...selectedStates, s]);
  }

  function toggleAllNigeria() {
    if (!isPro) { setProNudge(true); return; }
    const next = !allNigeria;
    setAllNigeria(next);
    if (next) setSelectedStates([]);
  }

  function clear() {
    setSelectedStates([]);
    setAllNigeria(false);
  }

  const filterActive = !allNigeria && selectedStates.length > 0;
  const subtitle = isPlus
    ? 'Pick as many states as you like, or the whole country.'
    : 'Pick one state. Upgrade to Plus or Pro to compare multiple states.';

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={() => goBack()}>
          <ChevronLeftIcon size={15} />
        </button>
        <h1 style={styles.title}>Filter by location</h1>
        <button type="button" style={styles.clearBtn} onClick={clear}>Clear</button>
      </div>

      <p style={styles.subtitle}>{subtitle}</p>

      {isPro && (
        <div style={styles.section}>
          <p style={styles.label}>Country</p>
          <div style={styles.chipsRow}>
            <button
              type="button"
              style={{ ...styles.chip, ...(!selectedCountry ? styles.chipActive : null) }}
              onClick={() => setSelectedCountry(undefined)}
            >
              My country
            </button>
            {countries.map((c) => (
              <button
                key={c}
                type="button"
                style={{ ...styles.chip, ...(selectedCountry === c ? styles.chipActive : null) }}
                onClick={() => setSelectedCountry(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.section}>
        <p style={styles.label}>State</p>
        <button
          type="button"
          style={{ ...styles.allChip, ...(allNigeria ? styles.allChipActive : null), ...(!isPro ? styles.locked : null) }}
          onClick={toggleAllNigeria}
        >
          <span style={{ ...styles.allChipText, ...(allNigeria ? styles.allChipTextActive : null) }}>
            All Nigeria{!isPro ? ' · Pro' : ''}
          </span>
        </button>

        {proNudge && (
          <div style={styles.proNudge}>
            <p style={styles.proNudgeText}>Filtering all of Nigeria needs a Pro plan.</p>
            <div style={styles.proNudgeBtns}>
              <button type="button" style={styles.upgradeBtn} onClick={() => navigate('/plans')}>Upgrade to Pro</button>
              <button type="button" style={styles.dismissBtn} onClick={() => setProNudge(false)}>Not now</button>
            </div>
          </div>
        )}

        <div style={styles.stateSearchWrap}>
          <SearchIcon size={13} color="#94A3B8" />
          <input
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            placeholder="Search state…"
            style={styles.stateSearchInput}
          />
        </div>
        <div style={styles.statesWrap}>
          {NIGERIAN_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase())).map((s) => {
            const active = selectedStates.includes(s);
            return (
              <button
                key={s}
                type="button"
                style={{ ...styles.chip, ...(active ? styles.chipActive : null), ...(allNigeria ? styles.chipDisabled : null) }}
                onClick={() => toggleState(s)}
                disabled={allNigeria}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.footer}>
        <button type="button" style={styles.applyBtn} onClick={() => goBack()}>
          {filterActive
            ? `Show homes in ${selectedStates.join(', ')}`
            : allNigeria
              ? 'Show all of Nigeria'
              : 'Apply'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 560, margin: '0 auto', minHeight: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column', padding: '0 0 24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0' },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A' },
  clearBtn: { background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#94A3B8', cursor: 'pointer' },
  subtitle: { fontSize: 13, color: '#475569', padding: '12px 24px 20px', lineHeight: '19px' },
  section: { padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#94A3B8' },
  chipsRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  allChip: {
    alignSelf: 'flex-start', padding: '10px 16px', borderRadius: 999, border: '1px solid #BFDBFE',
    background: '#FFFFFF', cursor: 'pointer',
  },
  allChipActive: { background: '#2563EB', borderColor: '#2563EB' },
  locked: { opacity: 0.6 },
  allChipText: { fontSize: 13, fontWeight: 600, color: '#0F172A' },
  allChipTextActive: { color: '#FFFFFF' },
  stateSearchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    height: 40, borderRadius: 12, border: '1px solid #DBEAFE', background: '#EEF6FF',
    padding: '0 12px',
  },
  stateSearchInput: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13.5, color: '#0F172A', fontFamily: 'inherit',
  },
  statesWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  chip: {
    padding: '10px 16px', borderRadius: 999, border: '1px solid #BFDBFE', background: '#FFFFFF',
    fontSize: 13.5, fontWeight: 600, color: '#0F172A', cursor: 'pointer',
  },
  chipActive: { background: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' },
  chipDisabled: { opacity: 0.4, cursor: 'default' },
  proNudge: {
    background: '#EEF6FF', border: '1px solid #BFDBFE', borderRadius: 14, padding: '12px 14px',
  },
  proNudgeText: { fontSize: 13, color: '#0F172A', marginBottom: 10, lineHeight: '18px' },
  proNudgeBtns: { display: 'flex', gap: 8 },
  upgradeBtn: {
    height: 36, padding: '0 16px', borderRadius: 999, border: 'none',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF',
    fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
  },
  dismissBtn: {
    height: 36, padding: '0 12px', borderRadius: 999, border: '1px solid #BFDBFE',
    background: '#FFFFFF', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  footer: { marginTop: 'auto', padding: '16px 24px 0' },
  applyBtn: {
    width: '100%', height: 50, borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: 'none',
    color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
  },
};
