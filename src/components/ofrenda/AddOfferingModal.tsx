import React, { useState } from 'react';
import { X, Sparkles, Flame, Plus, Heart, Image as ImageIcon } from 'lucide-react';
import { createOfrenda, generateCalavera } from '../../lib/api';
import { soundManager } from '../../audio/soundManager';

interface AddOfferingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_OFFERINGS = [
  { id: 'cempasuchil', label: '🌼 Cempasúchil (Marigold)' },
  { id: 'pan_de_muerto', label: '🍞 Pan de Muerto' },
  { id: 'candle', label: '🕯️ Veladora (Candle)' },
  { id: 'copal', label: '💨 Copal Incense' },
  { id: 'sugar_skull', label: '💀 Sugar Skull' },
];

export const AddOfferingModal: React.FC<AddOfferingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [passedYear, setPassedYear] = useState('');
  const [story, setStory] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [favoriteThings, setFavoriteThings] = useState('');
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>(['candle', 'cempasuchil']);
  const [calaveraPoem, setCalaveraPoem] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleOffering = (id: string) => {
    setSelectedOfferings(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleGeneratePoem = async () => {
    if (!personName) {
      setErrorMsg('Please enter a name first so Gemma 2 knows who to honor!');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);

    try {
      const res = await generateCalavera({
        name: personName,
        relationship: relationship || 'Cherished Soul',
        story: story || 'A life remembered with love and devotion',
        favoriteThings: favoriteThings.split(',').map(s => s.trim()).filter(Boolean),
        offerings: selectedOfferings,
      });

      setCalaveraPoem(res.poem);
    } catch (err) {
      setErrorMsg('Could not reach Gemma 2. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName) {
      setErrorMsg('Name of the honored soul is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createOfrenda({
        personName,
        relationship: relationship || 'Cherished Soul',
        birthYear,
        passedYear,
        story,
        photoUrl: photoUrl || undefined,
        favoriteThings: favoriteThings.split(',').map(s => s.trim()).filter(Boolean),
        offerings: selectedOfferings,
        calaveraPoem: calaveraPoem || undefined,
        calaveraAuthor: calaveraPoem ? 'Gemma 2 Open-Weight Poet' : undefined,
      });

      soundManager.playCandleChime();
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg('Failed to save offering to altar. Check MongoDB status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-ofrenda-altar to-black border-2 border-amber-500/70 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-amber-400 hover:text-white rounded-full bg-black/50 border border-amber-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Colocar una Ofrenda</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-100">
            Honor an Ancestor or Loved One
          </h3>
          <p className="text-xs md:text-sm text-amber-200/70 mt-1">
            Place their memory on the eternal living altar. Stored in MongoDB Atlas and blessed with open-weight Gemma 2 poetry.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Name of the Honored Soul *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Abuela Elena or Carl Sagan"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Relationship / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Beloved Grandmother, Astronomer"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Birth Year
              </label>
              <input
                type="text"
                placeholder="e.g. 1934"
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Year Passed
              </label>
              <input
                type="text"
                placeholder="e.g. 2018"
                value={passedYear}
                onChange={e => setPassedYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
              Memory, Story, or Passion
            </label>
            <textarea
              rows={3}
              placeholder="What made them special? What values or memories do you cherish most?"
              value={story}
              onChange={e => setStory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-amber-300 uppercase mb-1">
                Favorite Things (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Pan dulce, mariachi music, gardening"
                value={favoriteThings}
                onChange={e => setFavoriteThings(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Select Traditional Offerings */}
          <div>
            <label className="block text-xs font-mono text-amber-300 uppercase mb-2">
              Select Offerings to Place on Altar:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_OFFERINGS.map(off => {
                const isSelected = selectedOfferings.includes(off.id);
                return (
                  <button
                    type="button"
                    key={off.id}
                    onClick={() => toggleOffering(off.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-black/60 border border-amber-900/60 text-amber-300/70 hover:border-amber-500'
                    }`}
                  >
                    {off.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemma 2 Calavera Generator Section */}
          <div className="bg-black/40 rounded-2xl p-4 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemma 2 Calavera Literaria Poet
              </span>
              <button
                type="button"
                onClick={handleGeneratePoem}
                disabled={isGenerating || !personName}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold transition-all disabled:opacity-40"
              >
                <span>{isGenerating ? 'Composing...' : 'Auto-Compose with Gemma 2'}</span>
              </button>
            </div>

            {calaveraPoem ? (
              <textarea
                rows={4}
                value={calaveraPoem}
                onChange={e => setCalaveraPoem(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-800/60 text-amber-100 text-xs font-serif leading-relaxed"
              />
            ) : (
              <p className="text-[11px] text-amber-200/50 italic">
                Click "Auto-Compose with Gemma 2" to have Google's open-weight model generate an authentic rhyming Mexican stanza celebrating their life!
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !personName}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs uppercase font-mono shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
            >
              <Flame className="w-4 h-4" />
              <span>{isSubmitting ? 'Placing Offering...' : 'Place on Altar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
