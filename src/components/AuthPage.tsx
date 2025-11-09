import { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Phone, MapPin, AlertCircle, Eye, Wrench, Hammer, Droplet, Leaf, Zap, Paintbrush } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ClientDashboard from './ClientDashboard';

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'client' | 'artisan'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    ville: '',
  });

  if (demoMode) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          <button
            onClick={() => setDemoMode(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-colors"
          >
            Quitter la démo
          </button>
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg font-medium">
            Mode Démo
          </div>
        </div>
        <ClientDashboard userId="demo" onLogout={() => setDemoMode(false)} />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Impossible de créer le compte');

      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            user_type: userType,
            telephone: formData.telephone,
            adresse: formData.adresse,
            ville: formData.ville,
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Erreur création profil: ${insertError.message}`);
        }
      } else {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            user_type: userType,
            telephone: formData.telephone,
            adresse: formData.adresse,
            ville: formData.ville,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw new Error(`Erreur mise à jour profil: ${updateError.message}`);
        }
      }

      if (userType === 'artisan') {
        const { error: artisanError } = await supabase
          .from('artisans')
          .insert({
            user_id: authData.user.id,
            nom: '',
            prenom: '',
            telephone: formData.telephone,
            email: formData.email,
            ville: formData.ville,
            adresse: formData.adresse,
            metier: '',
            disponible: true,
          });

        if (artisanError) {
          console.error('Artisan error:', artisanError);
          throw new Error(`Erreur profil artisan: ${artisanError.message}`);
        }
      }

      onSuccess();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative burkina-gradient text-white" style={{ height: '160px' }}>
            <div className="absolute inset-0 grid grid-cols-5 gap-2 p-3 opacity-50">
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-yellow-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Hammer className="w-5 h-5 text-orange-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Droplet className="w-5 h-5 text-blue-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Leaf className="w-5 h-5 text-green-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Wrench className="w-5 h-5 text-gray-200" strokeWidth={2.5} /></div>

              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Paintbrush className="w-5 h-5 text-pink-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-yellow-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Hammer className="w-5 h-5 text-orange-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Droplet className="w-5 h-5 text-blue-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Leaf className="w-5 h-5 text-green-300" strokeWidth={2.5} /></div>

              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Wrench className="w-5 h-5 text-gray-200" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Paintbrush className="w-5 h-5 text-pink-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-yellow-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Hammer className="w-5 h-5 text-orange-300" strokeWidth={2.5} /></div>
              <div className="bg-white/20 rounded-lg flex items-center justify-center"><Droplet className="w-5 h-5 text-blue-300" strokeWidth={2.5} /></div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 burkina-star z-30"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
              <h1 className="text-3xl font-bold mb-2 text-center text-white drop-shadow-lg">BuilderHub</h1>
              <p className="text-white text-center drop-shadow">Plateforme de mise en relation</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Connexion
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Inscription
              </button>
            </div>

            {mode === 'register' && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Je suis:</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="client"
                      checked={userType === 'client'}
                      onChange={(e) => setUserType(e.target.value as 'client' | 'artisan')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Client</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="artisan"
                      checked={userType === 'artisan'}
                      onChange={(e) => setUserType(e.target.value as 'client' | 'artisan')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Artisan</span>
                  </label>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="+226 XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Votre adresse"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Ouagadougou, Bobo-Dioulasso..."
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all mt-6"
              >
                {loading ? 'Veuillez patienter...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm mb-4">
            Plateforme sécurisée pour artisans et particuliers
          </p>
          <button
            onClick={() => setDemoMode(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-md transition-all inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir la démo
          </button>
        </div>
      </div>
    </div>
  );
}
