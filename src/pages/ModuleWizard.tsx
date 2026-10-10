import React, { useState } from "react";
import { API_BASE } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "Équations différentielles",
  "Systèmes linéaires",
  "Optimisation",
  "Intégration numérique",
  "Autre",
];
const niveaux = ["Débutant", "Intermédiaire", "Avancé"];

const ModuleWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    titre: "",
    categorie: "",
    niveau: "Débutant",
    duree: "",
    description: "",
    theorie: "",
    objectifs: [],
    lecons: [],
    type: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveModule = async () => {
    if (!user) {
      setError("Vous devez être connecté pour créer un module.");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_enseignant: user.id,
          contenu: form.theorie || "",
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du module");
      const data = await res.json();
      // Ajout des leçons
      for (let i = 0; i < form.lecons.length; i++) {
        const lecon = form.lecons[i];
        const lessonRes = await fetch(`${API_BASE}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titre: lecon.titre,
            contenu: lecon.contenu,
            id_module: data.id,
            id_enseignant: user.id,
            ordre: i + 1,
          }),
        });
        if (!lessonRes.ok) throw new Error(`Erreur lors de l'ajout de la leçon ${lecon.titre}`);
      }
      navigate(`/module/${data.id}`);
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)) || "Erreur lors de la création du module ou des leçons");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Wizard */}
        <div className="bg-blue-700 rounded-xl p-6 mb-8 text-white shadow">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <span className="text-3xl">📘</span> Interface Professeur
          </h1>
          <p className="mb-4">Créez et structurez votre nouveau cours d'analyse numérique</p>
          <div className="flex gap-4 justify-center">
            <button
              className={`flex-1 py-2 rounded-lg ${step === 1 ? "bg-white text-blue-700 font-bold" : "bg-blue-600 text-white"}`}
              onClick={() => setStep(1)}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">Étape 1</span>
                <span className="text-sm">Informations générales</span>
              </div>
            </button>
            <button
              className={`flex-1 py-2 rounded-lg ${step === 2 ? "bg-white text-blue-700 font-bold" : "bg-blue-600 text-white"}`}
              onClick={() => setStep(2)}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold">Étape 2</span>
                <span className="text-sm">Théorie et objectifs</span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 1: Informations générales */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow p-8 mb-8">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <span className="text-blue-700">📘</span> Informations générales du cours
            </h2>
            <p className="text-gray-500 mb-6">Définissez les caractéristiques principales de votre cours</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block font-medium mb-1">Titre du cours *</label>
                <Input
                  name="titre"
                  value={form.titre}
                  onChange={handleChange}
                  placeholder="Ex: Équations différentielles ordinaires"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Catégorie *</label>
                <select
                  name="categorie"
                  value={form.categorie}
                  onChange={handleChangeSelect}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Niveau de difficulté *</label>
                <select
                  name="niveau"
                  value={form.niveau}
                  onChange={handleChangeSelect}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  {niveaux.map(niv => (
                    <option key={niv} value={niv}>{niv}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Durée estimée *</label>
                <Input
                  name="duree"
                  value={form.duree}
                  onChange={handleChange}
                  placeholder="Ex: 4-6 heures"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Type de module *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChangeSelect}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Choisir un type</option>
                  <option value="calculatrice">Calculatrice</option>
                  <option value="visualisation">Visualisation</option>
                  <option value="apprentissage">Apprentissage</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Description du cours *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Décrivez brièvement ce que les étudiants apprendront dans ce cours..."
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
            <Button type="button" className="bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSaveModule}>Enregistrer le module</Button>
            </div>
          </div>
        )}

        

        {/* FIN DU WIZARD */}
      </div>
    </div>
  );
};

export default ModuleWizard; 