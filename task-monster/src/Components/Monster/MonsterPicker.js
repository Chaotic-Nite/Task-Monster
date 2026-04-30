import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Swords, Star } from 'lucide-react';
import { Input } from '../ui/input';

const DND_API_BASE = 'https://www.dnd5eapi.co/api';

export default function MonsterPicker({ selectedMonster, onSelect, themeColor = '#6B21A8' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSearchResults([]);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchMonsters = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${DND_API_BASE}/monsters?name=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSearchResults((data.results || []).slice(0, 12));
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchMonsters(val), 400);
  };

  const handleSelectMonster = async (monsterRef) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${DND_API_BASE}/monsters/${monsterRef.index}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const detail = await res.json();
      const armorClass =
        Array.isArray(detail.armor_class)
          ? detail.armor_class[0]?.value
          : detail.armor_class;
      onSelect({
        dnd_index: detail.index,
        name: detail.name,
        hp: detail.hit_points,
        type: detail.type,
        size: detail.size,
        challenge_rating: detail.challenge_rating,
        armor_class: armorClass,
        image: detail.image ? `https://www.dnd5eapi.co${detail.image}` : null,
      });
    } catch (err) {
      console.error('Failed to fetch monster details:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const showDropdown = !selectedMonster && (searchResults.length > 0 || isSearching) && searchQuery;

  return (
    <div ref={containerRef} className="relative">
      {selectedMonster ? (
        <div
          className="flex items-center gap-3 p-3 border-2 rounded-lg"
          style={{ borderColor: themeColor + '50', backgroundColor: themeColor + '0A' }}
        >
          {selectedMonster.image ? (
            <img
              src={selectedMonster.image}
              alt={selectedMonster.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: themeColor + '20' }}
            >
              <Swords className="w-6 h-6" style={{ color: themeColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{selectedMonster.name}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-red-500">♥</span>
                {selectedMonster.hp} HP
              </span>
              <span className="capitalize">
                {selectedMonster.size} {selectedMonster.type}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                CR {selectedMonster.challenge_rating}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-400 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={isLoadingDetail ? 'Loading monster...' : 'Search D&D monsters...'}
            className="pl-9"
            disabled={isLoadingDetail}
          />
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-center text-sm text-slate-500">Searching...</div>
          ) : (
            searchResults.map((monster) => (
              <button
                key={monster.index}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectMonster(monster)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors text-sm border-b border-slate-100 last:border-0"
              >
                {monster.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
