import { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Phone, Mail, AlertCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'clients' | 'artisans' | 'paiements';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'Comment fonctionne BuilderHub?',
    answer: 'BuilderHub est une plateforme qui met en relation les clients recherchant des travaux avec les artisans qualifiés. Les clients publient une demande, les artisans répondent avec des devis, et une fois accepté, un contrat sécurisé lie les deux parties.',
  },
  {
    id: '2',
    category: 'clients',
    question: 'Comment créer une demande de travaux?',
    answer: 'Connectez-vous à votre compte client, cliquez sur "Nouvelle demande", remplissez les détails (type de travaux, localisation, budget), ajoutez des photos si nécessaire, puis publiez. Les artisans verront votre demande et pourront répondre avec des devis.',
  },
  {
    id: '3',
    category: 'clients',
    question: 'Suis-je obligé d\'accepter le premier devis?',
    answer: 'Non, vous recevrez généralement plusieurs devis. Vous pouvez les comparer, discuter avec les artisans et choisir celui qui correspond le mieux à vos besoins et budget.',
  },
  {
    id: '4',
    category: 'artisans',
    question: 'Comment m\'inscrire en tant qu\'artisan?',
    answer: 'Cliquez sur "Inscription" et sélectionnez "Artisan". Remplissez vos informations professionnelles, votre métier, vos années d\'expérience, et vérifiez votre identité. Votre profil sera examiné par notre équipe avant d\'être activé.',
  },
  {
    id: '5',
    category: 'artisans',
    question: 'Quels documents dois-je fournir pour la vérification?',
    answer: 'Vous devrez fournir une pièce d\'identité valide, un justificatif de domicile, et une preuve de votre assurance RC Pro (responsabilité civile professionnelle).',
  },
  {
    id: '6',
    category: 'artisans',
    question: 'Comment recevoir des demandes?',
    answer: 'Une fois votre profil vérifié, vous verrez les demandes publiées correspondant à votre métier et localisation. Vous pouvez répondre avec un devis détaillé. Plus votre profil est complet et vos avis positifs, plus vous serez visible.',
  },
  {
    id: '7',
    category: 'paiements',
    question: 'Comment fonctionne le système de paiement?',
    answer: 'Les paiements sont sécurisés via notre plateforme. Généralement, le client verse un acompte (50%) à la signature du contrat, et le solde (50%) à la fin du travail. BuilderHub retient une commission de service.',
  },
  {
    id: '8',
    category: 'paiements',
    question: 'Que se passe-t-il en cas de litige?',
    answer: 'En cas de désaccord, notre équipe de support intervient pour médier. Les contrats signés et l\'historique des échanges servent de base à la résolution. Les paiements sont protégés jusqu\'à la résolution.',
  },
];

interface HelpCenterProps {
  onClose: () => void;
}

export default function HelpCenter({ onClose }: HelpCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'clients' | 'artisans' | 'paiements'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const filteredFAQ = FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white rounded-t-2xl">
          <h1 className="text-3xl font-bold mb-2">Centre d'aide BuilderHub</h1>
          <p className="text-indigo-100">Trouvez les réponses à vos questions</p>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(['all', 'general', 'clients', 'artisans', 'paiements'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune réponse trouvée. Contactez notre support.</p>
              </div>
            ) : (
              filteredFAQ.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-left">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${
                        expandedId === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedId === item.id && (
                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Besoin d'aide supplémentaire?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowContactForm(true)}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Chat en direct</h3>
                <p className="text-sm text-gray-600">Parlez à notre équipe</p>
              </button>

              <a
                href="tel:+226XXXXXXXX"
                className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <Phone className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                <p className="text-sm text-gray-600">+226 XX XX XX XX</p>
              </a>

              <a
                href="mailto:support@builderhub.bf"
                className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <Mail className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-600">support@builderhub.bf</p>
              </a>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Contactez-nous</h2>
              </div>
              <form className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez votre problème..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
