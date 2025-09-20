'use client';

import { useState } from 'react';

interface WorkflowHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowHelpModal({ isOpen, onClose }: WorkflowHelpModalProps) {
  const [activeTab, setActiveTab] = useState('introduction');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">📚 Guide Complet - Workflow Universel</h2>
              <p className="text-indigo-100">
                Créez des workflows complexes 100% compatibles avec le bot WhatsApp
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex overflow-x-auto">
            {[
              { id: 'introduction', label: '🎯 Introduction', emoji: '🎯' },
              { id: 'concepts', label: '💡 Concepts Clés', emoji: '💡' },
              { id: 'steps', label: '📋 Configuration Étapes', emoji: '📋' },
              { id: 'options', label: '🔧 Gestion Options', emoji: '🔧' },
              { id: 'bot', label: '🤖 Comportement Bot', emoji: '🤖' },
              { id: 'examples', label: '📝 Exemples', emoji: '📝' },
              { id: 'faq', label: '❓ FAQ', emoji: '❓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 whitespace-nowrap font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'introduction' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">🚀 Vue d\'ensemble</h3>
                <p className="mb-4">
                  Le <strong>Workflow Universel V2</strong> est un système générique qui vous permet de créer
                  n\'importe quel type de workflow pour vos menus, sans avoir besoin de coder ou d\'utiliser l\'IA.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-green-600 mb-2">✅ Simple</h4>
                    <p className="text-sm">Interface visuelle avec boutons pour ajouter/modifier des étapes</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-blue-600 mb-2">🔧 Flexible</h4>
                    <p className="text-sm">Adaptable à tous types de menus et configurations</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-purple-600 mb-2">🤖 Compatible</h4>
                    <p className="text-sm">100% compatible avec le bot WhatsApp</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">🎯 Objectif Principal</h3>
                <p className="text-gray-700">
                  Créer un template <strong>vraiment générique</strong> que vous pouvez modifier manuellement
                  pour n\'importe quel restaurant, sans dupliquer le code existant. Un seul système pour tous
                  vos besoins de workflows.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚡ Workflow en 5 étapes</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Configurez les informations du produit (nom, prix, catégorie)</li>
                  <li>Ajoutez des étapes avec le bouton "+ Ajouter étape"</li>
                  <li>Définissez si chaque étape est obligatoire ou optionnelle</li>
                  <li>Créez les groupes d\'options avec leurs prix</li>
                  <li>Générez le SQL et copiez-le pour l\'exécuter en base</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'concepts' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">💡 Concepts Fondamentaux</h3>

              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">📋 Étape (Step)</h4>
                  <p className="text-gray-700 mb-2">
                    Une question posée au client dans le bot. Chaque étape correspond à un choix à faire.
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    Exemple: "Choisissez votre plat principal"
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">🔧 Groupe d\'Options</h4>
                  <p className="text-gray-700 mb-2">
                    L\'ensemble des choix disponibles pour une étape. Chaque groupe contient plusieurs options.
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    Groupe "Plats principaux" → Pizza, Burger, Salade
                  </div>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">✅ Required (Obligatoire)</h4>
                  <p className="text-gray-700 mb-2">
                    Détermine si le client DOIT faire un choix ou s\'il peut passer l\'étape.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="bg-green-50 p-3 rounded">
                      <strong className="text-green-700">required: true</strong>
                      <p className="text-sm mt-1">Le client doit choisir</p>
                      <p className="text-xs text-gray-600 mt-1">Pas d\'option "0" dans le bot</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong className="text-yellow-700">required: false</strong>
                      <p className="text-sm mt-1">Le client peut passer</p>
                      <p className="text-xs text-gray-600 mt-1">Bot affiche "0️⃣ Passer"</p>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-lg mb-2">🔢 Max Selections</h4>
                  <p className="text-gray-700 mb-2">
                    Nombre maximum de choix que le client peut faire.
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <strong className="text-blue-700">max_selections: 1</strong>
                      <p className="text-sm mt-1">Choix unique</p>
                      <p className="text-xs text-gray-600 mt-1">Format: "2"</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <strong className="text-purple-700">max_selections: 5</strong>
                      <p className="text-sm mt-1">Choix multiples</p>
                      <p className="text-xs text-gray-600 mt-1">Format: "1,3,5"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">📋 Configuration des Étapes</h3>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">➕ Ajouter une étape</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cliquez sur le bouton <strong>"+ Ajouter étape"</strong></li>
                  <li>Remplissez la question à poser au client</li>
                  <li>Définissez le groupe d\'options associé</li>
                  <li>Cochez "Obligatoire" si le client doit répondre</li>
                  <li>Définissez le nombre max de sélections</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">⚙️ Paramètres d\'une étape</h4>

                <div className="border rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-sm">Question à poser</label>
                      <p className="text-gray-600 text-sm">Le message qui sera affiché dans le bot</p>
                      <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-sm">
                        "Choisissez votre boisson"
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-sm">Groupe d\'options</label>
                      <p className="text-gray-600 text-sm">Le nom du groupe contenant les choix</p>
                      <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-sm">
                        "Boissons"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Obligatoire</label>
                        <p className="text-gray-600 text-xs">Le client doit-il choisir ?</p>
                        <div className="mt-1">
                          <span className="bg-green-100 px-2 py-1 rounded text-sm">✓ Oui</span>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Max sélections</label>
                        <p className="text-gray-600 text-xs">Nombre max de choix</p>
                        <div className="mt-1">
                          <span className="bg-blue-100 px-2 py-1 rounded text-sm">1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💡 Conseils</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Ordonnez les étapes logiquement (entrée → plat → dessert → boisson)</li>
                  <li>Utilisez des questions courtes et claires</li>
                  <li>Limitez à 5-6 étapes maximum pour ne pas fatiguer le client</li>
                  <li>Mettez les options facultatives en fin de workflow</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">🔧 Gestion des Options</h3>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📝 Créer des options</h4>
                <p className="text-sm mb-3">
                  Chaque groupe d\'options contient les choix disponibles pour une étape.
                </p>
                <div className="bg-white p-3 rounded">
                  <p className="font-medium text-sm mb-2">Structure d\'une option :</p>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Nom :</strong> Le texte affiché (ex: "Pizza Margherita")</li>
                    <li><strong>Prix :</strong> Modification du prix (0 = inclus, 2 = +2€)</li>
                    <li><strong>Emoji :</strong> Icône pour l\'affichage (optionnel)</li>
                    <li><strong>Ordre :</strong> Position dans la liste</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">💰 Gestion des prix</h4>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="border rounded-lg p-3">
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">price: 0</div>
                    <p className="text-xs mt-2">Option incluse dans le prix de base</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">price: 2</div>
                    <p className="text-xs mt-2">Ajoute 2€ au prix total</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">price: -1</div>
                    <p className="text-xs mt-2">Réduit le prix de 1€</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🎯 Exemple concret</h4>
                <div className="bg-white p-3 rounded font-mono text-sm">
                  <div className="mb-2">Groupe: "Suppléments"</div>
                  <div className="pl-4 space-y-1 text-xs">
                    <div>1️⃣ Fromage extra (+1€)</div>
                    <div>2️⃣ Bacon (+2€)</div>
                    <div>3️⃣ Sauce spéciale (+0.5€)</div>
                    <div>4️⃣ Sans supplément (0€)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bot' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">🤖 Comportement dans le Bot WhatsApp</h3>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📱 Affichage automatique</h4>
                <p className="text-sm mb-3">
                  Le bot adapte automatiquement l\'affichage selon vos paramètres :
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">✅ Étape Obligatoire (required: true)</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>🍕 Choisissez votre plat principal :</div>
                    <div className="mt-2">
                      <div>1️⃣ Pizza Margherita</div>
                      <div>2️⃣ Burger Classic (+2€)</div>
                      <div>3️⃣ Salade César</div>
                    </div>
                    <div className="mt-2 text-yellow-400">Votre choix :</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">→ Le client DOIT choisir une option</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">⚠️ Étape Optionnelle (required: false)</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>🧀 Ajoutez des suppléments (optionnel) :</div>
                    <div className="mt-2">
                      <div className="text-yellow-400">0️⃣ Passer cette étape</div>
                      <div>1️⃣ Fromage extra (+1€)</div>
                      <div>2️⃣ Bacon (+2€)</div>
                      <div>3️⃣ Sauce spéciale (+0.5€)</div>
                    </div>
                    <div className="mt-2 text-yellow-400">Vos choix (ex: 1,3 ou 0) :</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">→ Le client peut taper "0" pour passer</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">🔢 Choix Multiples (max_selections {'>'} 1)</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div>🥗 Choisissez vos garnitures (max 3) :</div>
                    <div className="mt-2">
                      <div>1️⃣ Tomates</div>
                      <div>2️⃣ Oignons</div>
                      <div>3️⃣ Cornichons</div>
                      <div>4️⃣ Salade</div>
                      <div>5️⃣ Olives</div>
                    </div>
                    <div className="mt-2 text-yellow-400">Vos choix (ex: 1,3,5) :</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">→ Format de réponse : "1,3,5" pour plusieurs choix</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚡ Règles automatiques</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Prix livraison = Prix base + 1€ (automatique)</li>
                  <li>Option "0" apparaît seulement si required: false</li>
                  <li>Le bot valide le nombre max de sélections</li>
                  <li>Format virgule pour choix multiples : "1,2,3"</li>
                  <li>Session timeout après 30 minutes d\'inactivité</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">📝 Exemples Concrets Détaillés</h3>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-blue-800">
                  Ces exemples sont tirés de cas réels en production. Chaque configuration génère un workflow 100% fonctionnel dans le bot WhatsApp.
                </p>
              </div>

              <div className="space-y-8">
                {/* MENU ENFANT - Exemple réel de Pizzaiolo */}
                <div className="border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-center mb-4">
                    <h4 className="font-bold text-lg text-orange-700">🍔 MENU ENFANT (Exemple Pizzaiolo)</h4>
                    <span className="ml-auto bg-green-100 px-2 py-1 rounded text-xs font-medium">EN PRODUCTION</span>
                  </div>

                  <div className="mb-4 p-3 bg-white rounded">
                    <p className="font-medium text-sm mb-2">Informations produit :</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Nom :</strong> MENU ENFANT</div>
                      <div><strong>Prix base :</strong> 8.00€</div>
                      <div><strong>Prix livraison :</strong> 9.00€ (+1€ auto)</div>
                      <div><strong>Type workflow :</strong> composite_workflow</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h5 className="font-semibold mb-2">📋 Étape 1 : Plat principal</h5>
                      <div className="bg-white p-3 rounded space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Configuration :</span>
                          <div className="ml-4 mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                            {`{
  "prompt": "Choisissez votre plat principal",
  "option_groups": ["Plat principal"],
  "required": true,
  "max_selections": 1
}`}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Options disponibles :</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• 1️⃣ Cheeseburger (0.00€)</li>
                            <li>• 2️⃣ Nuggets (0.00€)</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-xs">
                          <strong>Dans le bot :</strong> Client DOIT choisir (pas d'option 0)
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-orange-400 pl-4">
                      <h5 className="font-semibold mb-2">🥤 Étape 2 : Boisson</h5>
                      <div className="bg-white p-3 rounded space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Configuration :</span>
                          <div className="ml-4 mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                            {`{
  "prompt": "Choisissez votre boisson",
  "option_groups": ["Boisson enfant"],
  "required": true,
  "max_selections": 1
}`}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Options disponibles :</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• 1️⃣ Compote (0.00€)</li>
                            <li>• 2️⃣ Caprisun (0.00€)</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-xs">
                          <strong>Dans le bot :</strong> Client DOIT choisir (pas d'option 0)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded font-mono text-xs">
                    <div className="text-yellow-400">🤖 Simulation Bot WhatsApp:</div>
                    <div className="mt-2">
                      <div>📱 Message 1:</div>
                      <div className="ml-4">Choisissez votre plat principal</div>
                      <div className="ml-4">1️⃣ Cheeseburger</div>
                      <div className="ml-4">2️⃣ Nuggets</div>
                      <div className="ml-4 mt-2 text-blue-400">Client tape: 1</div>
                    </div>
                    <div className="mt-3">
                      <div>📱 Message 2:</div>
                      <div className="ml-4">Choisissez votre boisson</div>
                      <div className="ml-4">1️⃣ Compote</div>
                      <div className="ml-4">2️⃣ Caprisun</div>
                      <div className="ml-4 mt-2 text-blue-400">Client tape: 2</div>
                    </div>
                    <div className="mt-3 text-green-300">
                      ✅ Commande: Menu Enfant avec Cheeseburger + Caprisun = 8€
                    </div>
                  </div>
                </div>

                {/* BOWL - Exemple avec suppléments */}
                <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
                  <div className="flex items-center mb-4">
                    <h4 className="font-bold text-lg text-purple-700">🥗 BOWL (3 étapes - Tous obligatoires)</h4>
                    <span className="ml-auto bg-green-100 px-2 py-1 rounded text-xs font-medium">EN PRODUCTION</span>
                  </div>

                  <div className="mb-4 p-3 bg-white rounded">
                    <p className="font-medium text-sm mb-2">Informations produit :</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Nom :</strong> BOWL</div>
                      <div><strong>Prix base :</strong> 12.00€</div>
                      <div><strong>Prix livraison :</strong> 13.00€ (+1€ auto)</div>
                      <div><strong>Type workflow :</strong> composite_workflow</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h5 className="font-semibold mb-2">🍖 Étape 1 : Choix viande</h5>
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm">
                          <span className="font-medium">Configuration :</span>
                          <div className="ml-4 mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                            {`{
  "prompt": "Choisissez votre viande :",
  "required": true,
  "option_groups": ["Choix viande"],
  "max_selections": 1
}`}
                          </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-600">
                          Options: Poulet grillé, Bœuf teriyaki, Saumon, Tofu (végé)
                        </p>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-400 pl-4">
                      <h5 className="font-semibold mb-2">🥤 Étape 2 : Boisson incluse</h5>
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm">
                          <span className="font-medium">Configuration :</span>
                          <div className="ml-4 mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                            {`{
  "prompt": "Choisissez votre boisson (incluse) :",
  "required": true,
  "option_groups": ["Boisson 33CL incluse"],
  "max_selections": 1
}`}
                          </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-600">
                          Options: Coca 33cl, Sprite 33cl, Eau 50cl, Ice Tea
                        </p>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-400 pl-4">
                      <h5 className="font-semibold mb-2">➕ Étape 3 : Suppléments</h5>
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm">
                          <span className="font-medium">Configuration :</span>
                          <div className="ml-4 mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                            {`{
  "prompt": "SUPPLÉMENTS :",
  "required": true,  // ⚠️ Obligatoire mais peut choisir "Sans"
  "option_groups": ["Suppléments"],
  "max_selections": 1
}`}
                          </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-600">
                          Options: Sans supplément (0€), Avocat (+2€), Double protéine (+4€)
                        </p>
                        <div className="bg-yellow-50 p-2 rounded text-xs mt-2">
                          <strong>Note:</strong> Même si required:true, une option "Sans" à 0€ est proposée
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Burger avec options facultatives */}
                <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center mb-4">
                    <h4 className="font-bold text-lg text-green-700">🍔 BURGER CUSTOM (Mix obligatoire/optionnel)</h4>
                    <span className="ml-auto bg-blue-100 px-2 py-1 rounded text-xs font-medium">EXEMPLE AVANCÉ</span>
                  </div>

                  <div className="mb-4 p-3 bg-white rounded">
                    <p className="font-medium text-sm mb-2">Configuration détaillée :</p>
                    <div className="text-xs space-y-1">
                      <div>✅ <strong>2 étapes obligatoires</strong> (taille, viande)</div>
                      <div>⚠️ <strong>2 étapes facultatives</strong> (sauces, extras)</div>
                      <div>🔢 <strong>Choix multiples</strong> pour sauces et extras</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border-l-4 border-green-400 pl-4">
                        <h5 className="font-semibold mb-2">📏 Étape 1 : Taille</h5>
                        <div className="bg-white p-3 rounded">
                          <div className="text-xs space-y-1">
                            <div><strong>Required:</strong> ✅ true</div>
                            <div><strong>Max selections:</strong> 1</div>
                            <div><strong>Options:</strong></div>
                            <ul className="ml-4">
                              <li>• Classic (0€)</li>
                              <li>• XL (+3€)</li>
                              <li>• XXL (+5€)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <h5 className="font-semibold mb-2">🥩 Étape 2 : Viande</h5>
                        <div className="bg-white p-3 rounded">
                          <div className="text-xs space-y-1">
                            <div><strong>Required:</strong> ✅ true</div>
                            <div><strong>Max selections:</strong> 1</div>
                            <div><strong>Options:</strong></div>
                            <ul className="ml-4">
                              <li>• Bœuf 150g (0€)</li>
                              <li>• Poulet pané (0€)</li>
                              <li>• Végétarien (-1€)</li>
                              <li>• Double bœuf (+4€)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-yellow-400 pl-4">
                        <h5 className="font-semibold mb-2">🍯 Étape 3 : Sauces</h5>
                        <div className="bg-white p-3 rounded">
                          <div className="text-xs space-y-1">
                            <div><strong>Required:</strong> ❌ false</div>
                            <div><strong>Max selections:</strong> 3</div>
                            <div className="bg-yellow-100 p-2 rounded mt-2">
                              Bot affiche: <strong>"0️⃣ Sans sauce"</strong>
                            </div>
                            <div><strong>Options:</strong></div>
                            <ul className="ml-4">
                              <li>• Ketchup (0€)</li>
                              <li>• Mayo (0€)</li>
                              <li>• BBQ (0€)</li>
                              <li>• Sauce burger (+0.5€)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-yellow-400 pl-4">
                        <h5 className="font-semibold mb-2">➕ Étape 4 : Extras</h5>
                        <div className="bg-white p-3 rounded">
                          <div className="text-xs space-y-1">
                            <div><strong>Required:</strong> ❌ false</div>
                            <div><strong>Max selections:</strong> 5</div>
                            <div className="bg-yellow-100 p-2 rounded mt-2">
                              Bot affiche: <strong>"0️⃣ Pas d'extras"</strong>
                            </div>
                            <div><strong>Options:</strong></div>
                            <ul className="ml-4">
                              <li>• Fromage (+1€)</li>
                              <li>• Bacon (+2€)</li>
                              <li>• Œuf (+1.5€)</li>
                              <li>• Oignons frits (+1€)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded font-mono text-xs">
                    <div className="text-yellow-400">🤖 Parcours client dans le bot:</div>
                    <div className="mt-2">
                      <div>Étape 1: "Choisissez la taille" → Client: "2" (XL)</div>
                      <div>Étape 2: "Choisissez votre viande" → Client: "1" (Bœuf)</div>
                      <div>Étape 3: "Sauces (max 3)" → Client: "0" ou "1,3,4"</div>
                      <div>Étape 4: "Extras" → Client: "1,2" (Fromage+Bacon)</div>
                      <div className="mt-2 text-green-300">
                        Total: 10€ (base) + 3€ (XL) + 3€ (extras) = 16€
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseils importants */}
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">⚠️ Points Critiques à Retenir</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">1.</span>
                      <div>
                        <strong>Required true :</strong> Le client DOIT choisir, pas d'option 0
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">2.</span>
                      <div>
                        <strong>Required false :</strong> Le bot ajoute automatiquement "0️⃣" en première option
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">3.</span>
                      <div>
                        <strong>Max selections {'>'} 1 :</strong> Format réponse "1,2,3" avec virgules
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">4.</span>
                      <div>
                        <strong>Prix livraison :</strong> Toujours +1€ automatiquement
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">5.</span>
                      <div>
                        <strong>Option "Sans" :</strong> Pour un step obligatoire où le client peut ne rien ajouter, créez une option "Sans supplément" à 0€
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">❓ Questions Fréquentes</h3>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Comment le bot gère-t-il les options facultatives ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Quand <code className="bg-gray-100 px-1 rounded">required: false</code>, le bot ajoute
                    automatiquement l\'option "0️⃣ Passer cette étape" en première position. Le client peut
                    taper "0" pour continuer sans choisir.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Puis-je réorganiser les étapes après création ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Oui ! Vous pouvez supprimer et recréer les étapes dans l\'ordre souhaité. Les numéros
                    se réajustent automatiquement.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Comment gérer les prix de livraison ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Le prix de livraison est calculé automatiquement : <strong>Prix base + 1€</strong>.
                    Vous n\'avez pas besoin de le configurer manuellement.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Quelle est la différence avec les templates classiques ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Le Workflow Universel est <strong>100% générique</strong>. Pas besoin de dupliquer ou
                    modifier du code. Un seul système pour tous vos workflows, modifiable visuellement.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Le SQL généré est-il sûr à exécuter ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Oui ! Le SQL utilise des transactions (<code className="bg-gray-100 px-1 rounded">BEGIN/COMMIT</code>)
                    et inclut des vérifications. En cas d\'erreur, vous pouvez faire un ROLLBACK.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Combien d\'étapes maximum puis-je créer ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Techniquement illimité, mais nous recommandons <strong>5-6 étapes maximum</strong> pour
                    une meilleure expérience client dans le bot WhatsApp.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    Comment tester mon workflow ?
                  </h4>
                  <p className="text-sm text-gray-700">
                    1. Générez le SQL et exécutez-le en base<br/>
                    2. Utilisez la "Simulation Bot" pour prévisualiser<br/>
                    3. Testez directement dans WhatsApp avec la commande "resto"
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold mb-2">💡 Astuce Pro</h4>
                <p className="text-sm">
                  Commencez avec les exemples rapides (Menu Simple ou Menu Complexe) puis modifiez-les
                  selon vos besoins. C\'est plus rapide que de partir de zéro !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Workflow Universel V2 - 100% Compatible Bot WhatsApp
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
}