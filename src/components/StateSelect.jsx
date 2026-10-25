import { useEffect, useRef, useState } from 'react';
import { NIGERIAN_STATES } from '../lib/nigeria';
import { ChevronDownIcon } from './icons';

// Styled searchable state dropdown — replaces chip grids for 37 Nigerian states.
// Props: value (string|null), onChange (string) => void, placeholder
export function StateSelect({ value, onChange, placeholder = 'Select state' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = search.trim()
    ? NIGERIAN_STATES.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
    : NIGERIAN_STATES;

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch('');
  }, [open]);

  useEffect(() => {
    const onClickOut = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  function select(state) {
    onChange(state);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={s.wrap}>
      <button type="button" style={s.trigger} onClick={() => setOpen((o) => !o)}>
        <span style={{ ...s.triggerLabel, ...(value ? null : s.placeholder) }}>
          {value ?? placeholder}
        </span>
        <ChevronDownIcon size={14} color="#94A3B8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={s.dropdown}>
          <div style={s.searchWrap}>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state…"
              style={s.searchInput}
            />
          </div>
          <ul style={s.list}>
            {filtered.length === 0 ? (
              <li style={s.noResult}>No match</li>
            ) : (
              filtered.map((state) => (
                <li key={state}>
                  <button
                    type="button"
                    style={{ ...s.option, ...(state === value ? s.optionActive : null) }}
                    onMouseDown={(e) => { e.preventDefault(); select(state); }}
                  >
                    {state}
                    {state === value && <span style={s.check}>✓</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative', width: '100%' },
  trigger: {
    width: '100%', height: 50, borderRadius: 16, border: '1px solid #BFDBFE',
    background: '#FFFFFF', padding: '0 14px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 8, cursor: 'pointer', fontFamily: 'inherit',
  },
  triggerLabel: { fontSize: 14.5, color: '#0F172A', fontWeight: 500 },
  placeholder: { color: '#94A3B8', fontWeight: 400 },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 1001,
    background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 16,
    boxShadow: '0 8px 32px rgba(37,99,235,0.12)', overflow: 'hidden',
  },
  searchWrap: { padding: '10px 10px 6px' },
  searchInput: {
    width: '100%', height: 38, borderRadius: 12, border: '1px solid #DBEAFE',
    background: '#EEF6FF', padding: '0 12px', fontSize: 13.5, fontFamily: 'inherit',
    outline: 'none', color: '#0F172A', boxSizing: 'border-box',
  },
  list: { listStyle: 'none', maxHeight: 220, overflowY: 'auto', padding: '4px 0' },
  option: {
    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
    fontSize: 14, color: '#0F172A', cursor: 'pointer', textAlign: 'left',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontFamily: 'inherit',
  },
  optionActive: { background: '#EEF6FF', color: '#0F172A', fontWeight: 700 },
  check: { fontSize: 13, color: '#0F172A' },
  noResult: { padding: '12px 14px', fontSize: 13, color: '#94A3B8' },
};
