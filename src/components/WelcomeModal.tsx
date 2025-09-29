import { useState } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { useGuestAuth } from '../contexts/GuestAuthContext';

interface WelcomeModalProps {
  isOpen: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen }: WelcomeModalProps) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useGuestAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      login(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Üdvözöljük! 🍺
          </h2>
          <p className="text-gray-600">
            Add meg a neved, hogy elkezdhessük a pub crawl tervezést!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Neved
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="pl. Pisti"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              maxLength={20}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Bejelentkezés...
              </>
            ) : (
              <>
                Kezdjük! 🚀
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Guest felhasználóként használod az alkalmazást. 
            Az adataid a böngésződben tárolódnak.
          </p>
        </div>
      </div>
    </div>
  );
};
