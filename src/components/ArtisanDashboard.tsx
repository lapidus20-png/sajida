import { useState, useEffect } from 'react';
import { Plus, FileText, TrendingUp, AlertCircle, Star, CheckCircle, Clock, Navigation, Image, Award, User, Lock, Mail, Phone, MapPin, Upload, Trash2, Download, FileCheck } from 'lucide-react';
import { supabase, JobRequest, Quote, Artisan, Review, calculateDistance, User as UserType } from '../lib/supabase';
import QuoteForm from './QuoteForm';
import { storageService, STORAGE_LIMITS } from '../lib/storageService';

interface ArtisanDashboardProps {
  artisanId: string;
  userId: string;
  onLogout: () => void;
}

export default function ArtisanDashboard({ artisanId, userId, onLogout }: ArtisanDashboardProps) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [userAccount, setUserAccount] = useState<UserType | null>(null);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'opportunites' | 'mes-devis' | 'profil' | 'compte'>('opportunites');
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; url: string; path: string }>>([]);

  useEffect(() => {
    loadData();
  }, [artisanId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const artisanResult = await supabase
        .from('artisans')
        .select('id, user_id, nom, prenom, metier, note_moyenne, statut_verification, annees_experience, telephone, ville, latitude, longitude, description, portefeuille, certifications, tarif_horaire, assurance_rcpro')
        .eq('id', artisanId)
        .maybeSingle();

      if (artisanResult.error) throw artisanResult.error;
      setArtisan(artisanResult.data);

      const userResult = await supabase
        .from('users')
        .select('id, user_type, email, telephone, adresse, ville, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (userResult.error) throw userResult.error;
      setUserAccount(userResult.data);
      setLoading(false);

      const [jobsResult, quotesResult, reviewsResult] = await Promise.all([
        supabase
          .from('job_requests')
          .select('id, titre, description, ville, localisation, statut, budget_min, budget_max, created_at, latitude, longitude')
          .eq('statut', 'publiee')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('quotes')
          .select('id, job_request_id, artisan_id, montant, description, delai, statut, created_at')
          .eq('artisan_id', artisanId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('reviews')
          .select('id, reviewer_id, note, commentaire, verified, created_at')
          .eq('reviewed_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (jobsResult.error) throw jobsResult.error;
      setJobRequests(jobsResult.data || []);

      if (quotesResult.error) throw quotesResult.error;
      setMyQuotes(quotesResult.data || []);

      if (reviewsResult.error) throw reviewsResult.error;
      setReviews(reviewsResult.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setActiveTab('profil');
  };

  const handleUpdateProfile = async (updates: Partial<Artisan>) => {
    try {
      const { error } = await supabase
        .from('artisans')
        .update(updates)
        .eq('id', artisanId);

      if (error) throw error;
      setArtisan({ ...artisan!, ...updates });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUpdateAccount = async (updates: Partial<UserType>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      setUserAccount({ ...userAccount!, ...updates });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordSuccess('Mot de passe modifié avec succès');
      setPasswordData({ newPassword: '', confirmPassword: '' });

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      setPasswordError(error.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storageService.validateFileSize(file, STORAGE_LIMITS.portfolios.maxSize)) {
      setUploadStatus({ type: 'error', message: `La taille du fichier ne doit pas dépasser ${STORAGE_LIMITS.portfolios.maxSize}MB` });
      return;
    }

    if (!storageService.validateFileType(file, STORAGE_LIMITS.portfolios.allowedTypes)) {
      setUploadStatus({ type: 'error', message: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const result = await storageService.uploadPortfolioImage(userId, file);

      if (result.success && result.url) {
        const updatedPortfolio = [...(artisan?.portefeuille || []), result.url];
        await handleUpdateProfile({ portefeuille: updatedPortfolio });
        setUploadStatus({ type: 'success', message: 'Photo ajoutée au portfolio' });
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Erreur lors de l\'upload' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Erreur lors de l\'upload' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handlePortfolioDelete = async (url: string, index: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette photo?')) return;

    try {
      const updatedPortfolio = artisan?.portefeuille?.filter((_, idx) => idx !== index) || [];
      await handleUpdateProfile({ portefeuille: updatedPortfolio });
      setUploadStatus({ type: 'success', message: 'Photo supprimée' });
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storageService.validateFileSize(file, STORAGE_LIMITS.documents.maxSize)) {
      setUploadStatus({ type: 'error', message: `La taille du fichier ne doit pas dépasser ${STORAGE_LIMITS.documents.maxSize}MB` });
      return;
    }

    if (!storageService.validateFileType(file, STORAGE_LIMITS.documents.allowedTypes)) {
      setUploadStatus({ type: 'error', message: 'Type de fichier non autorisé. Utilisez PDF, JPG ou PNG' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const result = await storageService.uploadDocument(userId, file);

      if (result.success && result.url && result.path) {
        const newDoc = { name: file.name, url: result.url, path: result.path };
        setUploadedDocuments([...uploadedDocuments, newDoc]);
        setUploadStatus({ type: 'success', message: 'Document téléchargé avec succès' });
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Erreur lors de l\'upload' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Erreur lors de l\'upload' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDocumentDelete = async (doc: { name: string; url: string; path: string }, index: number) => {
    if (!confirm(`Voulez-vous vraiment supprimer ${doc.name}?`)) return;

    try {
      await storageService.deleteFile('documents', doc.path);
      const updatedDocs = uploadedDocuments.filter((_, idx) => idx !== index);
      setUploadedDocuments(updatedDocs);
      setUploadStatus({ type: 'success', message: 'Document supprimé' });
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const stats = {
    profil: artisan ? {
      note: artisan.note_moyenne,
      verification: artisan.statut_verification,
      experience: artisan.annees_experience,
    } : null,
    quotes: {
      total: myQuotes.length,
      acceptes: myQuotes.filter(q => q.statut === 'accepte').length,
      en_attente: myQuotes.filter(q => q.statut === 'en_attente').length,
      refuses: myQuotes.filter(q => q.statut === 'refuse').length,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espace Artisan</h1>
            <p className="text-sm text-gray-600">{artisan?.nom} {artisan?.prenom}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEditProfile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Mon profil
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats.profil && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Note moyenne</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.profil.note.toFixed(1)}/5</p>
                </div>
                <Star className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Mes devis</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.quotes.total}</p>
                </div>
                <FileText className="w-12 h-12 text-emerald-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Acceptés</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.quotes.acceptes}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vérification</p>
                  <p className={`text-sm font-bold mt-1 ${
                    stats.profil.verification === 'verifie' ? 'text-green-600' :
                    stats.profil.verification === 'rejete' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {stats.profil.verification === 'verifie' ? '✓ Vérifié' :
                     stats.profil.verification === 'rejete' ? '✗ Rejeté' :
                     '⏳ En attente'}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-0">
              <button
                onClick={() => setActiveTab('opportunites')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'opportunites'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Opportunités
              </button>
              <button
                onClick={() => setActiveTab('mes-devis')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'mes-devis'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Mes devis ({stats.quotes.total})
              </button>
              <button
                onClick={() => setActiveTab('profil')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'profil'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Mon profil
              </button>
              <button
                onClick={() => setActiveTab('compte')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'compte'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Mon compte
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : activeTab === 'opportunites' ? (
              jobRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune opportunité disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobRequests.map(job => {
                    const distance =
                      artisan?.latitude && artisan?.longitude && job.latitude && job.longitude
                        ? calculateDistance(artisan.latitude, artisan.longitude, job.latitude, job.longitude)
                        : null;

                    return (
                      <div
                        key={job.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-emerald-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{job.titre}</h3>
                              {distance !== null && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                  <Navigation className="w-3 h-3" />
                                  {distance} km
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                              <span>📍 {job.localisation}</span>
                              <span>💰 {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()} FCFA</span>
                              <span>📅 {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowCreateQuote(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg whitespace-nowrap"
                          >
                            Répondre
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : activeTab === 'mes-devis' ? (
              myQuotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">Vous n'avez pas encore créé de devis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myQuotes.map(quote => {
                    const job = jobRequests.find(j => j.id === quote.job_request_id);
                    return (
                      <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Devis #{quote.id.slice(0, 8)}</h3>
                            <p className="text-gray-600 text-sm mb-3">{quote.description_travaux.substring(0, 100)}...</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quote.statut === 'accepte' ? 'bg-green-100 text-green-800' :
                                quote.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                                quote.statut === 'expire' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {quote.statut}
                              </span>
                              <span className="text-gray-600">⏱️ {quote.delai_execution} jours</span>
                              <span className="text-gray-600">📅 Valide jusqu'au {new Date(quote.validite_jusqu_au).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">
                              {quote.montant_total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">FCFA</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : artisan ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Métier</label>
                        <p className="text-gray-900 font-medium">{artisan.metier}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
                        <input
                          type="number"
                          value={artisan.annees_experience}
                          onChange={(e) => handleUpdateProfile({ annees_experience: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarif horaire (FCFA)</label>
                        <input
                          type="number"
                          value={artisan.tarif_horaire}
                          onChange={(e) => handleUpdateProfile({ tarif_horaire: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications et sécurité</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={artisan.assurance_rcpro}
                          onChange={(e) => handleUpdateProfile({ assurance_rcpro: e.target.checked })}
                          className="w-5 h-5 rounded"
                        />
                        <label className="text-gray-700">Assurance RC Pro active</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                        <div className="flex flex-wrap gap-2">
                          {artisan.certifications && artisan.certifications.length > 0 ? (
                            artisan.certifications.map((cert, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {cert}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">Aucune certification</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description de l'entreprise</h3>
                  <textarea
                    value={artisan.description}
                    onChange={(e) => handleUpdateProfile({ description: e.target.value })}
                    rows={5}
                    placeholder="Décrivez votre entreprise, vos services, et ce qui vous distingue..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Portfolio ({artisan.portefeuille?.length || 0} photos)
                    </h3>
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Ajouter une photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePortfolioUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {uploadStatus && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                      uploadStatus.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <p className={`text-sm ${
                        uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {uploadStatus.message}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {artisan.portefeuille && artisan.portefeuille.length > 0 ? (
                      artisan.portefeuille.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group">
                          <img
                            src={url}
                            alt={`Portfolio ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handlePortfolioDelete(url, idx)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 md:col-span-4 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Aucune image dans le portfolio</p>
                        <p className="text-gray-400 text-xs mt-1">Ajoutez des photos de vos réalisations</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileCheck className="w-5 h-5" />
                      Documents & Certifications ({uploadedDocuments.length})
                    </h3>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Ajouter un document
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <div className="space-y-3">
                    {uploadedDocuments.length > 0 ? (
                      uploadedDocuments.map((doc, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">Document uploadé</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDocumentDelete(doc, idx)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Aucun document uploadé</p>
                        <p className="text-gray-400 text-xs mt-1">Ajoutez vos certifications, assurances, etc.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Avis clients ({reviews.length})
                  </h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.note
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">{review.note}/5</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Vérifié
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.commentaire}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Aucun avis pour le moment</p>
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Status de vérification:</strong> {artisan.statut_verification === 'verifie' ? '✓ Votre profil est vérifié' :
                    artisan.statut_verification === 'rejete' ? '✗ Votre profil a été rejeté' :
                    '⏳ Votre profil est en attente de vérification'}
                  </p>
                </div>
              </div>
            ) : activeTab === 'compte' && userAccount ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Compte créé le:</strong> {new Date(userAccount.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={artisan?.nom || ''}
                        onChange={(e) => handleUpdateProfile({ nom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={artisan?.prenom || ''}
                        onChange={(e) => handleUpdateProfile({ prenom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={userAccount.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={userAccount.telephone || ''}
                        onChange={(e) => handleUpdateAccount({ telephone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={userAccount.adresse || ''}
                        onChange={(e) => handleUpdateAccount({ adresse: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        value={userAccount.ville || ''}
                        onChange={(e) => handleUpdateAccount({ ville: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Changer le mot de passe
                  </h3>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Retapez le nouveau mot de passe"
                      />
                    </div>
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{passwordSuccess}</p>
                      </div>
                    )}
                    <button
                      onClick={handlePasswordChange}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                    >
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de compte</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Type:</strong> <span className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium ml-2">{userAccount.user_type}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {showCreateQuote && selectedJob && (
        <QuoteForm
          jobRequest={selectedJob}
          artisanId={artisanId}
          onSuccess={() => {
            setShowCreateQuote(false);
            setSelectedJob(null);
            loadData();
          }}
          onCancel={() => {
            setShowCreateQuote(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
