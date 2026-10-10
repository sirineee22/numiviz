import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode2,
  Layers
} from 'lucide-react';

export interface MethodTheoryInfo {
  id: string;
  title: string;
  category: string;
  tag: string;
  intuition: string;
  formula: string;
  formulaDescription: string;
  convergence: string;
  convergenceOrder: string;
  conditions: string[];
  steps: string[];
  tips: string;
}

export const METHOD_THEORY_DATA: Record<string, MethodTheoryInfo> = {
  // ── Nonlinear Equations ──────────────────────────────────────────────────
  newton: {
    id: 'newton',
    title: 'Méthode de Newton-Raphson',
    category: 'Équations non linéaires',
    tag: 'Convergence Quadratique O(ε²)',
    intuition:
      "À chaque étape, on remplace la courbe f(x) par sa tangente au point courant. L'intersection de cette tangente avec l'axe des abscisses donne l'approximation suivante, se rapprochant très rapidement de la racine.",
    formula: 'x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)}',
    formulaDescription:
      "Où x_n est l'estimation courante, f(x_n) la valeur de la fonction et f'(x_n) sa dérivée première.",
    convergence:
      "Quadratique (ordre 2) : le nombre de décimales exactes double approximativement à chaque itération près de la racine.",
    convergenceOrder: 'O(ε²)',
    conditions: [
      "La dérivée f'(x) doit être non nulle au voisinage de la racine (f'(x) ≠ 0).",
      "Le point de départ x₀ doit être suffisamment proche de la racine cherchée.",
      "La fonction doit être deux fois continûment dérivable (C²)."
    ],
    steps: [
      "Choisir une valeur initiale x₀ proche de la racine estimée.",
      "Calculer la valeur f(x_n) et la pente de la tangente f'(x_n).",
      "Calculer la nouvelle estimation : x_{n+1} = x_n - f(x_n) / f'(x_n).",
      "Vérifier le critère d'arrêt : |x_{n+1} - x_n| < tolérance ou |f(x_{n+1})| < tolérance."
    ],
    tips:
      "Attention aux points où la dérivée est quasi-nulle (tangente horizontale) : l'algorithme peut osciller, diverger ou sauter vers une racine lointaine."
  },
  bisection: {
    id: 'bisection',
    title: 'Méthode de Dichotomie (Bisection)',
    category: 'Équations non linéaires',
    tag: 'Convergence Garantie O(1/2ⁿ)',
    intuition:
      "Basée sur le théorème des valeurs intermédiaires : si f(a) et f(b) sont de signes opposés, il existe au moins une racine dans [a, b]. On divise l'intervalle par 2 à chaque étape jusqu'à encadrer la racine avec la précision voulue.",
    formula: 'm = \\frac{a + b}{2}, \\quad \\text{Erreur} \\le \\frac{b - a}{2^{n+1}}',
    formulaDescription:
      "m est le milieu de l'intervalle [a, b]. À chaque itération n, la largeur de l'intervalle est divisée par deux.",
    convergence:
      "Linéaire (ordre 1) : lente mais absolument garantie de converger si l'encadrement initial est valide.",
    convergenceOrder: 'O(0.5ⁿ)',
    conditions: [
      "La fonction f doit être continue sur l'intervalle [a, b].",
      "Condition d'encadrement stricte : f(a) · f(b) < 0 (changement de signe)."
    ],
    steps: [
      "Vérifier que f(a) et f(b) ont des signes opposés (f(a)·f(b) < 0).",
      "Calculer le milieu m = (a + b) / 2 et évaluer f(m).",
      "Si f(m) = 0, la racine exacte est trouvée.",
      "Sinon, si f(a)·f(m) < 0, la racine est dans [a, m] (poser b = m), sinon poser a = m.",
      "Répéter jusqu'à ce que (b - a)/2 soit inférieur à la tolérance."
    ],
    tips:
      "Idéale pour obtenir rapidement un intervalle de confiance robuste avant d'accélérer avec Newton-Raphson."
  },
  fixedpoint: {
    id: 'fixedpoint',
    title: 'Méthode du Point Fixe',
    category: 'Équations non linéaires',
    tag: 'Contraction de Banach',
    intuition:
      "On transforme l'équation f(x) = 0 sous la forme équivalente x = g(x). Trouver la racine revient à trouver le point où la courbe y = g(x) croise la droite bissectrice y = x (trajectoire en toile d'araignée).",
    formula: 'x_{n+1} = g(x_n)',
    formulaDescription:
      "L'itération converge vers un point fixe x* tel que x* = g(x*), ce qui correspond à la solution de f(x*) = 0.",
    convergence:
      "Linéaire sous condition de contraction : la vitesse dépend de la valeur absolue de |g'(x)|.",
    convergenceOrder: 'Linéaire (|g\'| < 1)',
    conditions: [
      "Condition de contraction de Banach : |g'(x)| < 1 sur l'intervalle contenant la racine.",
      "Plus |g'(x*)| est proche de 0, plus la convergence est rapide.",
      "Si |g'(x*)| > 1, la méthode diverge en spirale."
    ],
    steps: [
      "Mettre l'équation f(x) = 0 sous la forme x = g(x).",
      "Vérifier que |g'(x)| < 1 autour de la racine présumée.",
      "Partir d'un point x₀ et calculer récursivement x_{n+1} = g(x_n).",
      "Arrêter lorsque |x_{n+1} - x_n| < tolérance."
    ],
    tips:
      "Il existe souvent plusieurs formulations possibles de g(x) pour une même équation f(x) = 0. Choisissez celle pour laquelle la pente |g'| est la plus plate."
  },
  secant: {
    id: 'secant',
    title: 'Méthode de la Sécante',
    category: 'Équations non linéaires',
    tag: 'Super-linéaire (Nombre d\'or φ ≈ 1.618)',
    intuition:
      "Variante de Newton-Raphson qui n'exige pas de calculer la dérivée formelle f'(x). La pente de la tangente est remplacée par la pente de la droite sécante passant par les deux estimations précédentes.",
    formula: 'x_{n+1} = x_n - f(x_n) \\cdot \\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}',
    formulaDescription:
      "On utilise les deux derniers points (x_{n-1}, x_n) pour projeter la sécante sur l'axe des abscisses.",
    convergence:
      "Super-linéaire d'ordre φ = (1 + √5)/2 ≈ 1.618 : presque aussi rapide que Newton sans nécessiter le calcul analytique de la dérivée.",
    convergenceOrder: 'O(ε^{1.618})',
    conditions: [
      "Deux approximations initiales x₀ et x₁ sont requises.",
      "f(x_n) ≠ f(x_{n-1}) pour éviter une division par zéro.",
      "La fonction doit être continue au voisinage de la racine."
    ],
    steps: [
      "Choisir deux points de départ x₀ et x₁ distincts.",
      "Calculer la pente sécante : s = [f(x₁) - f(x₀)] / (x₁ - x₀).",
      "Poser le nouveau point : x₂ = x₁ - f(x₁) / s.",
      "Mettre à jour les deux derniers points et réitérer jusqu'à convergence."
    ],
    tips:
      "Excellente alternative à Newton lorsque f'(x) est difficile ou très coûteuse à calculer mathématiquement."
  },

  // ── Linear Systems ───────────────────────────────────────────────────────
  'linear-2x2': {
    id: 'linear-2x2',
    title: 'Solveur Géométrique 2×2',
    category: 'Systèmes linéaires',
    tag: 'Résolution Exacte (Cramer)',
    intuition:
      "Un système de 2 équations à 2 inconnues représente l'intersection de deux droites dans le plan cartésien. La solution unique correspond au point d'intersection géométrique (x*, y*).",
    formula: 'x = \\frac{c_1 b_2 - c_2 b_1}{\\det(A)}, \\quad y = \\frac{a_1 c_2 - a_2 c_1}{\\det(A)}',
    formulaDescription:
      "Où det(A) = a₁b₂ - a₂b₁ est le déterminant de la matrice des coefficients.",
    convergence:
      "Directe / Instantanée (Méthode analytique de Cramer en temps constant O(1)).",
    convergenceOrder: 'O(1) Exact',
    conditions: [
      "Le déterminant doit être non nul : det(A) ≠ 0 (droites non parallèles).",
      "Si det(A) = 0 et droites confondues : infinité de solutions.",
      "Si det(A) = 0 et droites disjointes : aucune solution (système incompatible)."
    ],
    steps: [
      "Écrire le système sous forme matricielle Ax = b.",
      "Calculer le déterminant principal D = a₁b₂ - a₂b₁.",
      "Si D ≠ 0, calculer les déterminants partiels Dx et Dy.",
      "Déduire les coordonnées d'intersection : x = Dx / D, y = Dy / D."
    ],
    tips:
      "Permet de visualiser graphiquement la notion de conditionnement : deux droites presque parallèles créent une intersection très sensible aux petites erreurs de mesure."
  },
  jacobi: {
    id: 'jacobi',
    title: 'Méthode Itérative de Jacobi',
    category: 'Systèmes linéaires',
    tag: 'Déplacement Simultané',
    intuition:
      "On isole chaque inconnue x_i sur la diagonale principale. À chaque itération, on calcule le nouveau vecteur complet x^{(k+1)} en utilisant exclusivement les valeurs de l'itération précédente x^{(k)} (idéal pour le calcul parallèle).",
    formula: 'x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j \\ne i} a_{ij} x_j^{(k)} \\right)',
    formulaDescription:
      "La matrice A est décomposée sous la forme A = D - L - U, où D est diagonale.",
    convergence:
      "Linéaire sous condition de dominance diagonale stricte ou rayon spectral ρ(D⁻¹(L+U)) < 1.",
    convergenceOrder: 'Linéaire',
    conditions: [
      "Tous les éléments diagonaux doivent être non nuls : a_{ii} ≠ 0.",
      "Condition suffisante : A est à diagonale strictement dominante par lignes.",
      "Rayon spectral de la matrice d'itération : ρ(M_J) < 1."
    ],
    steps: [
      "Partir d'un vecteur initial x^{(0)} (souvent le vecteur nul).",
      "Calculer simultanément toutes les composantes du nouveau vecteur x^{(k+1)}.",
      "Calculer la norme de l'erreur résiduelle : ||Ax^{(k+1)} - b|| ou ||x^{(k+1)} - x^{(k)}||.",
      "Répéter jusqu'à ce que l'erreur soit inférieure à la tolérance."
    ],
    tips:
      "Si la matrice n'est pas à diagonale dominante, essayez de permuter les lignes (pivotage) pour placer les plus grands coefficients sur la diagonale."
  },
  'gauss-seidel': {
    id: 'gauss-seidel',
    title: 'Méthode de Gauss-Seidel',
    category: 'Systèmes linéaires',
    tag: 'Déplacement Successif (2× plus rapide)',
    intuition:
      "Amélioration de Jacobi : dès qu'une composante x_i^{(k+1)} est calculée, elle est immédiatement réinjectée dans le calcul des composantes suivantes de la même itération. Le chemin géométrique forme un escalier orthogonal caractéristique.",
    formula: 'x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j < i} a_{ij} x_j^{(k+1)} - \\sum_{j > i} a_{ij} x_j^{(k)} \\right)',
    formulaDescription:
      "On utilise les valeurs déjà mises à jour pour j < i et les anciennes valeurs pour j > i.",
    convergence:
      "Converge généralement deux fois plus rapidement que Jacobi pour une même matrice.",
    convergenceOrder: 'Linéaire (accélérée)',
    conditions: [
      "Matrice à diagonale strictement dominante, OU matrice symétrique définie positive.",
      "Tous les coefficients diagonaux doivent être non nuls (a_{ii} ≠ 0)."
    ],
    steps: [
      "Initialiser le vecteur x^{(0)}.",
      "Pour chaque ligne i = 1 à n, calculer x_i en utilisant les nouvelles valeurs déjà obtenues.",
      "Évaluer la norme de la différence ||x^{(k+1)} - x^{(k)}||.",
      "Répéter jusqu'à atteindre la précision souhaitée."
    ],
    tips:
      "Gauss-Seidel nécessite moins de mémoire que Jacobi car on peut écraser le vecteur en place pendant le calcul."
  },
  'matrix-lab': {
    id: 'matrix-lab',
    title: 'Laboratoire d\'Algèbre Matricielle & LU',
    category: 'Systèmes linéaires',
    tag: 'Décomposition Directe O(n³)',
    intuition:
      "Factorisation d'une matrice A sous forme A = L · U, où L est triangulaire inférieure et U triangulaire supérieure. Une fois factorisée, n'importe quel système Ax = b se résout en deux descentes triangulaires rapides O(n²).",
    formula: 'A = L \\cdot U, \\quad L y = b \\implies U x = y',
    formulaDescription:
      "Permet de résoudre plusieurs systèmes ayant la même matrice A sans recalculer l'élimination de Gauss.",
    convergence:
      "Méthode directe exacte (en arithmétique sans erreur d'arrondi).",
    convergenceOrder: 'O(n³) Direct',
    conditions: [
      "Tous les mineurs principaux de A doivent être non nuls (sans pivotage).",
      "Avec pivotage partiel (PA = LU), la factorisation existe pour toute matrice inversible."
    ],
    steps: [
      "Appliquer l'élimination de Gauss pour obtenir la matrice triangulaire supérieure U.",
      "Enregistrer les multiplicateurs d'élimination dans la matrice triangulaire inférieure L.",
      "Résoudre par descente Ly = b.",
      "Résoudre par remontée Ux = y pour trouver le vecteur solution final x."
    ],
    tips:
      "Surveillez le nombre de conditionnement cond(A) = ||A|| · ||A⁻¹|| : s'il est très grand (> 10⁶), le système est mal conditionné et les erreurs d'arrondi peuvent détruire la solution."
  },

  // ── Integration ──────────────────────────────────────────────────────────
  trapezoidal: {
    id: 'trapezoidal',
    title: 'Règle des Trapèzes',
    category: 'Intégration numérique',
    tag: 'Quadrature Linéaire O(h²)',
    intuition:
      "On découpe l'intervalle [a, b] en sous-intervalles de largeur h. Sur chaque sous-intervalle, la courbe f(x) est approchée par le segment de droite joignant ses deux extrémités, formant des trapèzes dont l'aire se calcule simplement.",
    formula: 'I \\approx \\frac{h}{2} \\left[ f(a) + 2 \\sum_{i=1}^{n-1} f(x_i) + f(b) \\right], \\quad h = \\frac{b - a}{n}',
    formulaDescription:
      "Les points intérieurs ont un poids 2 car ils appartiennent à deux trapèzes adjacents, tandis que les bords a et b ont un poids 1.",
    convergence:
      "Erreur d'ordre O(h²) proportionnelle à f''(ξ) : doubler le nombre de subdivisions divise l'erreur par 4.",
    convergenceOrder: 'O(h²)',
    conditions: [
      "La fonction f doit être continue et au moins deux fois dérivable sur [a, b].",
      "Le pas h = (b - a)/n doit être suffisamment petit pour capturer les courbures."
    ],
    steps: [
      "Définir le nombre d'intervalles n et calculer le pas h = (b - a) / n.",
      "Calculer les nœuds d'échantillonnage x_i = a + i·h pour i = 0 à n.",
      "Sommer les termes : f(a) + 2·∑f(x_i) + f(b).",
      "Multiplier la somme globale par h / 2."
    ],
    tips:
      "Pour des fonctions périodiques très lisses intégrées sur une période complète, la règle des trapèzes converge à une vitesse exponentielle (propriété remarquable d'Euler-Maclaurin) !"
  },
  simpson13: {
    id: 'simpson13',
    title: 'Règle de Simpson 1/3',
    category: 'Intégration numérique',
    tag: 'Quadrature Parabolique O(h⁴)',
    intuition:
      "Au lieu d'approcher la courbe par des droites, on l'approche par des arcs de paraboles (polynômes de degré 2) passant par 3 points consécutifs. Grâce à la symétrie, l'ordre d'exactitude gagne un degré supplémentaire !",
    formula: 'I \\approx \\frac{h}{3} \\left[ f(x_0) + 4 \\sum_{\\text{impairs}} f(x_i) + 2 \\sum_{\\text{pairs}} f(x_i) + f(x_n) \\right]',
    formulaDescription:
      "Le nombre d'intervalles n doit être un entier pair. Le motif des coefficients est [1, 4, 2, 4, 2, ..., 4, 1].",
    convergence:
      "Erreur d'ordre O(h⁴) : diviser le pas h par 2 réduit l'erreur par un facteur 16 !",
    convergenceOrder: 'O(h⁴)',
    conditions: [
      "Le nombre de sous-intervalles n doit obligatoirement être PAIR.",
      "La fonction f doit être 4 fois continûment dérivable (C⁴ sur [a, b]).",
      "La méthode est rigoureusement exacte pour tous les polynômes de degré ≤ 3."
    ],
    steps: [
      "Choisir un nombre pair n de subdivisions et calculer h = (b - a) / n.",
      "Calculer les valeurs de la fonction aux bornes : f(a) et f(b).",
      "Multiplier par 4 les points d'indices impairs (x₁, x₃, x₅...).",
      "Multiplier par 2 les points d'indices pairs intérieurs (x₂, x₄, x₆...).",
      "Faire la somme et multiplier par h / 3."
    ],
    tips:
      "Bien que basée sur des paraboles de degré 2, Simpson 1/3 intègre parfaitement les fonctions cubiques x³ grâce à l'annulation par symétrie du terme d'erreur en f'''."
  },
  simpson38: {
    id: 'simpson38',
    title: 'Règle de Simpson 3/8',
    category: 'Intégration numérique',
    tag: 'Quadrature Cubique O(h⁴)',
    intuition:
      "Généralisation de Simpson basée sur l'interpolation cubique passant par 4 points équidistants. Très utile lorsque le nombre de subdivisions n est un multiple de 3 ou combinée avec Simpson 1/3 pour des nombres impairs d'intervalles.",
    formula: 'I \\approx \\frac{3h}{8} \\left[ f(x_0) + 3f(x_1) + 3f(x_2) + 2f(x_3) + \\dots + f(x_n) \\right]',
    formulaDescription:
      "Le motif répétitif des poids est [1, 3, 3, 2, 3, 3, 2, ..., 1].",
    convergence:
      "Erreur d'ordre O(h⁴), similaire à Simpson 1/3 avec une constante d'erreur légèrement plus petite.",
    convergenceOrder: 'O(h⁴)',
    conditions: [
      "Le nombre de sous-intervalles n doit être un multiple de 3.",
      "La fonction f doit être de classe C⁴."
    ],
    steps: [
      "Vérifier que n est divisible par 3 et poser h = (b - a) / n.",
      "Appliquer les coefficients périodiques 3, 3, 2 sur les points intérieurs.",
      "Multiplier la somme par 3h / 8."
    ],
    tips:
      "Permet de traiter un nombre impair quelconque d'intervalles en appliquant Simpson 1/3 sur les premiers intervalles pairs et Simpson 3/8 sur les 3 derniers."
  },
  'gauss-legendre': {
    id: 'gauss-legendre',
    title: 'Quadrature de Gauss-Legendre',
    category: 'Intégration numérique',
    tag: 'Haute Précision Exacte (2n - 1)',
    intuition:
      "Au lieu d'imposer des points d'échantillonnage équidistants, on optimise à la fois l'emplacement des nœuds et la valeur de leurs poids. Avec seulement n points bien choisis, on intègre exactement n'importe quel polynôme jusqu'au degré 2n - 1 !",
    formula: '\\int_{-1}^{1} f(t)\\,dt \\approx \\sum_{i=1}^{n} w_i \\, f(t_i)',
    formulaDescription:
      "Les nœuds t_i sont les racines des polynômes de Legendre P_n(t) et les w_i sont les poids gaussiens.",
    convergence:
      "Convergence spectrale exponentielle pour les fonctions analytiques lisses.",
    convergenceOrder: 'Exact pour degré ≤ 2n-1',
    conditions: [
      "Nécessite de transformer l'intervalle quelconque [a, b] vers l'intervalle de référence [-1, 1].",
      "Fonction f lisse sans singularités ou discontinuités dans l'intervalle."
    ],
    steps: [
      "Appliquer le changement de variable affine x = (b - a)/2 · t + (a + b)/2.",
      "Consulter la table des racines t_i et des poids w_i pour l'ordre n choisi.",
      "Évaluer la fonction aux points gaussiens t_i.",
      "Calculer la somme pondérée et multiplier par le jacobien (b - a) / 2."
    ],
    tips:
      "Avec seulement 4 ou 5 points gaussiens, vous obtenez souvent une précision supérieure à celle d'une méthode des trapèzes avec 1 000 subdivisions !"
  },
  romberg: {
    id: 'romberg',
    title: 'Intégration de Romberg',
    category: 'Intégration numérique',
    tag: 'Extrapolation de Richardson',
    intuition:
      "On calcule des approximations successives avec la règle des trapèzes en divisant le pas h par 2 à chaque niveau. Ensuite, on combine astucieusement les résultats dans un tableau triangulaire pour éliminer systématiquement les puissances d'erreur h², h⁴, h⁶...",
    formula: 'R(j, k) = \\frac{4^k \\cdot R(j, k-1) - R(j-1, k-1)}{4^k - 1}',
    formulaDescription:
      "R(j, 0) représente la règle des trapèzes avec 2^j intervalles. Chaque colonne k élimine un ordre d'erreur supplémentaire.",
    convergence:
      "Super-accélération : atteint des précisions d'ordre O(h²ᵏ) avec un nombre très modéré d'évaluations.",
    convergenceOrder: 'O(h^{2k})',
    conditions: [
      "La fonction f doit être indéfiniment dérivable (C^{2k}) sur l'intervalle [a, b].",
      "Les pas successifs doivent être strictement divisés par 2 (h, h/2, h/4, h/8...)."
    ],
    steps: [
      "Remplir la première colonne R(j, 0) par la règle des trapèzes pour n = 1, 2, 4, 8...",
      "Calculer la colonne suivante par la formule d'extrapolation de Richardson.",
      "Construire le tableau jusqu'à ce que la différence entre deux diagonales soit inférieure à la tolérance."
    ],
    tips:
      "La colonne k=1 correspond exactement à la règle de Simpson, et la colonne k=2 correspond à la formule de Boole !"
  },

  // ── Ordinary Differential Equations (ODEs) ──────────────────────────────
  euler: {
    id: 'euler',
    title: 'Méthode d\'Euler Explicite',
    category: 'Équations différentielles',
    tag: 'Ordre 1 O(h)',
    intuition:
      "La méthode la plus fondamentale pour résoudre y' = f(t, y) avec y(t₀) = y₀. On projette la solution sur le pas de temps suivant h en suivant la pente tangente donnée par l'équation différentielle.",
    formula: 'y_{n+1} = y_n + h \\cdot f(t_n, y_n), \\quad t_{n+1} = t_n + h',
    formulaDescription:
      "À chaque pas, on avance d'une distance h le long du vecteur vitesse f(t_n, y_n).",
    convergence:
      "Ordre 1 global O(h) : diviser le pas par 2 ne divise l'erreur que par 2.",
    convergenceOrder: 'O(h)',
    conditions: [
      "Condition de stabilité de pas : pour les équations raides (stiff), h doit être extrêmement petit sous peine d'explosion numérique.",
      "La fonction f(t, y) doit être lipschitzienne par rapport à y."
    ],
    steps: [
      "Fixer la condition initiale (t₀, y₀) et le pas de discrétisation h.",
      "Calculer la pente locale k = f(t_n, y_n).",
      "Avancer : y_{n+1} = y_n + h · k et t_{n+1} = t_n + h.",
      "Répéter jusqu'au temps final T."
    ],
    tips:
      "Simple à comprendre mais peu précise en pratique ; préférez Heun ou RK4 pour des simulations physiques réelles."
  },
  heun: {
    id: 'heun',
    title: 'Méthode de Heun (Euler Amélioré)',
    category: 'Équations différentielles',
    tag: 'Prédicteur-Correcteur O(h²)',
    intuition:
      "Méthode en 2 temps : on prédit d'abord une estimation y* avec Euler, puis on calcule la pente au point d'arrivée. La progression finale s'effectue en utilisant la moyenne arithmétique de la pente de départ et de la pente d'arrivée.",
    formula: 'y_{n+1} = y_n + \\frac{h}{2} \\left[ f(t_n, y_n) + f(t_{n+1}, y_n + h f(t_n, y_n)) \\right]',
    formulaDescription:
      "Équivalent à appliquer la règle des trapèzes sur l'équation intégrale de Volterra y(t_{n+1}) - y(t_n) = ∫ f(t, y) dt.",
    convergence:
      "Ordre 2 global O(h²) : deux fois plus d'ordre qu'Euler pour seulement une évaluation supplémentaire de f par pas.",
    convergenceOrder: 'O(h²)',
    conditions: [
      "Fonction f de classe C².",
      "Stabilité conditionnelle selon la constante de Lipschitz de f."
    ],
    steps: [
      "Calculer la pente au départ : k₁ = f(t_n, y_n).",
      "Prédire la position suivante : y* = y_n + h · k₁.",
      "Calculer la pente à l'arrivée : k₂ = f(t_n + h, y*).",
      "Corriger avec la pente moyenne : y_{n+1} = y_n + h · (k₁ + k₂) / 2."
    ],
    tips:
      "Aussi connue sous le nom de méthode de Runge-Kutta d'ordre 2 (RK2)."
  },
  rk4: {
    id: 'rk4',
    title: 'Runge-Kutta d\'Ordre 4 (RK4)',
    category: 'Équations différentielles',
    tag: 'Standard Industriel O(h⁴)',
    intuition:
      "Le standard de référence mondial pour la simulation numérique des EDO. Il effectue 4 sondages de pente pondérés (départ, deux au milieu de l'intervalle avec corrections successives, et un à l'arrivée) combinés selon la règle de Simpson.",
    formula: 'y_{n+1} = y_n + \\frac{h}{6} (k_1 + 2k_2 + 2k_3 + k_4)',
    formulaDescription:
      "k₁ = f(t_n, y_n), k₂ = f(t_n + h/2, y_n + h·k₁/2), k₃ = f(t_n + h/2, y_n + h·k₂/2), k₄ = f(t_n + h, y_n + h·k₃).",
    convergence:
      "Ordre 4 global O(h⁴) : diviser le pas de temps par 2 réduit l'erreur globale par un facteur 16 !",
    convergenceOrder: 'O(h⁴)',
    conditions: [
      "Fonction f de classe C⁴.",
      "Stabilité remarquable pour une vaste classe de problèmes non raides."
    ],
    steps: [
      "Calculer la pente initiale k₁ au début de l'intervalle.",
      "Estimer la solution au milieu du pas et calculer la pente k₂.",
      "Réestimer le milieu avec k₂ et calculer la pente affinée k₃.",
      "Estimer la fin du pas et calculer la pente terminale k₄.",
      "Combiner les 4 pentes par la moyenne pondérée (k₁ + 2k₂ + 2k₃ + k₄) / 6."
    ],
    tips:
      "C'est la méthode intégrée par défaut dans la plupart des moteurs physiques de jeux vidéo, simulateurs aérospatiaux et logiciels de calcul formel."
  },
  'ode-system': {
    id: 'ode-system',
    title: 'Systèmes d\'Équations Différentielles',
    category: 'Équations différentielles',
    tag: 'Dynamique Couplée Multi-Variables',
    intuition:
      "Résolution de plusieurs équations différentielles couplées dépendant les unes des autres (ex. modèle Proies-Prédateurs de Lotka-Volterra ou pendule non linéaire [θ, ω]). Le vecteur d'état complet Y = [y₁, y₂] est mis à jour simultanément via RK4.",
    formula: '\\frac{d\\mathbf{Y}}{dt} = \\mathbf{F}(t, \\mathbf{Y}), \\quad \\mathbf{Y}_{n+1} = \\mathbf{Y}_n + \\frac{h}{6}(\\mathbf{K}_1 + 2\\mathbf{K}_2 + 2\\mathbf{K}_3 + \\mathbf{K}_4)',
    formulaDescription:
      "Les opérations vectorielles s'appliquent composante par composante sur l'espace des phases.",
    convergence:
      "Ordre 4 O(h⁴) sur toutes les composantes du vecteur d'état.",
    convergenceOrder: 'O(h⁴) Vectoriel',
    conditions: [
      "Toutes les équations du système doivent être résolues avec le même pas temporel h.",
      "Permet de transformer n'importe quelle EDO d'ordre supérieur en un système d'ordre 1."
    ],
    steps: [
      "Définir le vecteur d'état initial Y₀ = [x₀, y₀].",
      "Calculer les 4 vecteurs de pentes K₁, K₂, K₃, K₄ dans l'espace des phases.",
      "Mettre à jour les deux variables en même temps.",
      "Tracer la trajectoire dans le plan de phase (portrait de phase)."
    ],
    tips:
      "Visualiser les trajectoires dans l'espace des phases (x en abscisse, y en ordonnée) permet d'identifier instantanément les cycles limites, points d'équilibre et régimes chaotiques."
  },

  // ── Differentiation ──────────────────────────────────────────────────────
  diff: {
    id: 'diff',
    title: 'Différences Finies Numériques',
    category: 'Différentiation',
    tag: 'Formules Centrées & Décentrées',
    intuition:
      "Approximation de la dérivée continue f'(x) = lim (h→0) [f(x+h) - f(x)]/h en prenant un pas h petit mais non nul. La formule centrée est beaucoup plus précise car les erreurs d'asymétrie s'annulent.",
    formula: 'f\'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h} \\quad (\\text{Centrée}), \\quad \\frac{f(x+h) - f(x)}{h} \\quad (\\text{Progressive})',
    formulaDescription:
      "La formule progressive est d'ordre O(h), tandis que la formule centrée est d'ordre O(h²).",
    convergence:
      "Ordre 2 pour la différence centrée : diviser h par 10 divise l'erreur par 100.",
    convergenceOrder: 'O(h²)',
    conditions: [
      "Ne pas choisir h excessivement petit (en dessous de 10⁻⁸ en arithmétique flottante standard IEEE 754), car l'erreur d'annulation numérique (soustraction de deux nombres quasi-égaux) devient prépondérante sur l'erreur d'approximation mathématique."
    ],
    steps: [
      "Choisir le pas h (idéalement h ≈ 10⁻⁵ à 10⁻⁷ pour une précision double).",
      "Évaluer la fonction en x + h et en x - h.",
      "Effectuer la division [f(x+h) - f(x-h)] / (2h).",
      "Comparer avec différentes valeurs de h pour observer le compromis troncature / arrondi."
    ],
    tips:
      "Il existe un pas optimal h* qui minimise l'erreur totale : pour la formule centrée, h* ≈ ε_{machine}^{1/3} ≈ 10⁻⁵."
  },
  richardson: {
    id: 'richardson',
    title: 'Extrapolation de Richardson',
    category: 'Différentiation',
    tag: 'Haute Précision O(h⁴) et O(h⁶)',
    intuition:
      "Technique d'accélération remarquable : en combinant l'approximation D(h) avec l'approximation D(h/2), on élimine mathématiquement le terme d'erreur dominant proportionnel à h² pour obtenir une formule d'ordre 4 sans calculer de dérivée d'ordre supérieur.",
    formula: 'D_{\\text{extrapolé}} = \\frac{4 D(h/2) - D(h)}{3} = f\'(x) + O(h^4)',
    formulaDescription:
      "Permet de passer d'un ordre O(h²) à un ordre O(h⁴) par une simple combinaison linéaire.",
    convergence:
      "Ordre 4 O(h⁴) ou Ordre 6 O(h⁶) selon le nombre de niveaux d'extrapolation appliqués.",
    convergenceOrder: 'O(h^{2k})',
    conditions: [
      "Le développement de Taylor de la méthode sous-jacente doit ne comporter que des puissances paires de h (comme la différence finie centrée)."
    ],
    steps: [
      "Calculer la dérivée centrée avec un pas h : D₁ = D(h).",
      "Calculer la dérivée centrée avec un demi-pas h/2 : D₂ = D(h/2).",
      "Combiner : D* = (4·D₂ - D₁) / 3.",
      "Vérifier le gain spectaculaire de précision par rapport à la valeur exacte."
    ],
    tips:
      "C'est exactement le même principe mathématique que celui utilisé par l'intégration de Romberg !"
  },

  // ── Interpolation ────────────────────────────────────────────────────────
  lagrange: {
    id: 'lagrange',
    title: 'Interpolation de Lagrange',
    category: 'Interpolation',
    tag: 'Polynôme Unique de Degré n',
    intuition:
      "Étant donnés n+1 points de mesure, il existe un unique polynôme de degré au plus n qui passe exactement par tous ces points. Lagrange le construit directement comme une combinaison de polynômes de base L_i(x) qui valent 1 au point i et 0 sur tous les autres points.",
    formula: 'P_n(x) = \\sum_{i=0}^{n} y_i L_i(x), \\quad L_i(x) = \\prod_{j \\ne i} \\frac{x - x_j}{x_i - x_j}',
    formulaDescription:
      "Chaque polynôme cardinal L_i(x) s'annule sur tous les nœuds sauf en x_i où il vaut 1.",
    convergence:
      "Exactitude parfaite aux points donnés P(x_i) = y_i. L'erreur hors des points dépend de la dérivée (n+1)-ième de la fonction d'origine.",
    convergenceOrder: 'Exact aux nœuds',
    conditions: [
      "Tous les nœuds x_i doivent être deux à deux distincts.",
      "Attention au phénomène de Runge : avec des points équidistants et un degré élevé (n > 10), le polynôme oscille violemment près des bords."
    ],
    steps: [
      "Identifier les n+1 paires de points (x_i, y_i).",
      "Pour chaque point i, construire la base de Lagrange L_i(x).",
      "Multiplier chaque base par l'ordonnée correspondante y_i.",
      "Sommer pour obtenir l'expression du polynôme d'interpolation."
    ],
    tips:
      "Pour éviter les oscillations de Runge à degré élevé, utilisez les nœuds de Tchebychev au lieu de points régulièrement espacés."
  },
  'newton-dd': {
    id: 'newton-dd',
    title: 'Différences Divisées de Newton',
    category: 'Interpolation',
    tag: 'Algorithme Progressif & Récursif',
    intuition:
      "Représentation alternative du même polynôme d'interpolation que Lagrange, mais sous une forme progressive P(x) = a₀ + a₁(x - x₀) + a₂(x - x₀)(x - x₁) + ... Si l'on ajoute un nouveau point de mesure, il suffit d'ajouter une ligne au tableau sans recalculer tout le polynôme !",
    formula: 'P_n(x) = f[x_0] + \\sum_{k=1}^{n} f[x_0, x_1, \\dots, x_k] \\prod_{j=0}^{k-1} (x - x_j)',
    formulaDescription:
      "Les coefficients f[x₀, ..., x_k] sont calculés de proche en proche dans une table triangulaire de différences divisées.",
    convergence:
      "Identique à Lagrange, avec une complexité de calcul nettement inférieure O(n²) et une mise à jour incrémentale en O(n).",
    convergenceOrder: 'Exact aux nœuds O(n²)',
    conditions: [
      "Les abscisses x_i doivent être toutes distinctes.",
      "Le tableau triangulaire s'évalue de gauche à droite."
    ],
    steps: [
      "Placer les abscisses x_i et les ordonnées f[x_i] dans les deux premières colonnes.",
      "Calculer la colonne suivante : f[x_i, x_{i+1}] = (f[x_{i+1}] - f[x_i]) / (x_{i+1} - x_i).",
      "Répéter pour les ordres supérieurs jusqu'à obtenir le tableau complet.",
      "Les coefficients du polynôme correspondent à la première ligne diagonale du tableau."
    ],
    tips:
      "Format privilégié en ingénierie et informatique car il s'évalue très rapidement par l'algorithme de Horner."
  },
  spline: {
    id: 'spline',
    title: 'Splines Cubiques Naturelles',
    category: 'Interpolation',
    tag: 'Lissage Continu C² sans Runge',
    intuition:
      "Au lieu d'utiliser un seul polynôme global de degré élevé qui oscille, on relie chaque paire de points voisins par un petit polynôme cubique (degré 3). On impose que les morceaux se raccordent avec une continuité parfaite de la position, de la pente et de la courbure (continuité C²).",
    formula: 'S_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3, \\quad S\'\'(a) = S\'\'(b) = 0',
    formulaDescription:
      "La condition 'naturelle' impose une courbure nulle (dérivée seconde = 0) aux deux extrémités.",
    convergence:
      "Optimalité mathématique : la spline cubique naturelle minimise l'énergie de courbure globale ∫ [S''(x)]² dx (principe de la règle souple de dessinateur).",
    convergenceOrder: 'C² Lisse',
    conditions: [
      "Nœuds ordonnés strictement croissants : x₀ < x₁ < ... < x_n.",
      "Résolution d'un système tridiagonal symétrique strictement à diagonale dominante (très rapide en O(n) via l'algorithme de Thomas)."
    ],
    steps: [
      "Calculer les espacements entre nœuds h_i = x_{i+1} - x_i.",
      "Poser le système tridiagonal pour déterminer les dérivées secondes c_i aux nœuds.",
      "Résoudre le système tridiagonal en temps linéaire O(n).",
      "Déduire les coefficients b_i et d_i pour chaque segment cubique."
    ],
    tips:
      "La méthode reine en CAO, infographie et modélisation géométrique car elle élimine totalement les oscillations indésirables."
  },
  'least-squares': {
    id: 'least-squares',
    title: 'Moindres Carrés (Régression)',
    category: 'Interpolation',
    tag: 'Ajustement Optimal & Filtrage du Bruit',
    intuition:
      "Lorsque les données proviennent d'expériences physiques réelles et contiennent du bruit de mesure, on ne cherche PAS à passer exactement par tous les points. On cherche la courbe globale de degré fixé (droite, parabole...) qui minimise la somme des carrés des écarts verticaux.",
    formula: '\\min \\sum_{i=1}^{m} [y_i - P(x_i)]^2 \\iff A^T A \\mathbf{c} = A^T \\mathbf{y}',
    formulaDescription:
      "Les coefficients c du modèle sont donnés par la résolution des équations normales A^T A c = A^T y.",
    convergence:
      "Résolution directe via les équations normales, la décomposition QR ou la SVD.",
    convergenceOrder: 'Minimisation L₂',
    conditions: [
      "Le nombre de points de mesure m doit être supérieur ou égal au nombre de paramètres (degré + 1).",
      "La matrice de Vandermonde A doit être de rang plein (points distincts)."
    ],
    steps: [
      "Choisir le degré du modèle polynomial (degré 1 = droite affine y = ax + b).",
      "Construire la matrice de Vandermonde associée aux points expérimentaux.",
      "Former le système symétrique des équations normales (A^T A) c = A^T y.",
      "Résoudre pour trouver les coefficients optimaux et calculer le coefficient de détermination R²."
    ],
    tips:
      "Un coefficient R² proche de 1 (ex. R² = 0.998) indique un excellent ajustement du modèle aux données observées."
  },

  // ── Eigenvalues ──────────────────────────────────────────────────────────
  power: {
    id: 'power',
    title: 'Méthode de la Puissance Itérée',
    category: 'Valeurs propres',
    tag: 'Valeur Propre Dominante |λ₁|',
    intuition:
      "Permet de trouver la plus grande valeur propre (en module) d'une matrice A ainsi que son vecteur propre associé. On multiplie un vecteur quelconque par A de manière répétée : le vecteur s'aligne progressivement et naturellement selon la direction propre dominante !",
    formula: 'v_{k+1} = \\frac{A v_k}{\\|A v_k\\|}, \\quad \\lambda_1 \\approx \\frac{v_k^T A v_k}{v_k^T v_k} \\quad (\\text{Quotient de Rayleigh})',
    formulaDescription:
      "La normalisation à chaque pas évite le débordement numérique (overflow) ou l'évanouissement (underflow).",
    convergence:
      "Linéaire, gouvernée par le rapport |λ₂ / λ₁| : plus la deuxième valeur propre est petite devant la première, plus la convergence est fulgurante.",
    convergenceOrder: 'O(|λ₂ / λ₁|ᵏ)',
    conditions: [
      "La matrice A doit posséder une valeur propre dominante unique (|λ₁| > |λ₂|).",
      "Le vecteur initial v₀ ne doit pas être orthogonal au sous-espace propre dominant."
    ],
    steps: [
      "Choisir un vecteur initial non nul normalisé v₀ (ex. [1, 1, ..., 1]^T / √n).",
      "Multiplier par la matrice : w = A · v_k.",
      "Calculer le quotient de Rayleigh pour estimer λ : λ ≈ (v_k^T · w) / (v_k^T · v_k).",
      "Normaliser le nouveau vecteur : v_{k+1} = w / ||w||.",
      "Répéter jusqu'à stabilisation de λ et de v."
    ],
    tips:
      "C'est le principe fondamental de l'algorithme PageRank initialement développé par Google pour classer la popularité des pages web à l'échelle mondiale !"
  },
  'inverse-power': {
    id: 'inverse-power',
    title: 'Méthode de la Puissance Inverse avec Shift',
    category: 'Valeurs propres',
    tag: 'Valeur Propre la Plus Proche de σ',
    intuition:
      "En appliquant la méthode de la puissance à la matrice inverse décalée (A - σI)⁻¹, les valeurs propres deviennent 1 / (λ - σ). La valeur propre la plus proche du décalage σ devient alors la valeur propre dominante et converge à une vitesse spectaculaire !",
    formula: '(A - \\sigma I) w_{k+1} = v_k, \\quad v_{k+1} = \\frac{w_{k+1}}{\\|w_{k+1}\\|}',
    formulaDescription:
      "On résout un système linéaire à chaque étape plutôt que d'inverser explicitement la matrice.",
    convergence:
      "Convergence super-rapide dès que le shift σ est proche d'une valeur propre.",
    convergenceOrder: 'Accélération par shift',
    conditions: [
      "La matrice (A - σI) doit être inversible (σ ne doit pas être exactement égal à une valeur propre).",
      "On factorise (A - σI) sous forme LU une seule fois au début, puis chaque itération ne coûte qu'une descente/remontée en O(n²)."
    ],
    steps: [
      "Choisir une estimation de décalage σ (si σ = 0, on cherche la plus petite valeur propre en module).",
      "Calculer la factorisation LU de la matrice décalée (A - σI).",
      "À chaque étape, résoudre (A - σI) w = v_k par descente/remontée.",
      "Normaliser le vecteur v_{k+1} = w / ||w||.",
      "Déduire l'approximation de la valeur propre d'origine λ ≈ σ + 1 / quotient."
    ],
    tips:
      "Essentielle en analyse modale et génie civil pour identifier les fréquences de résonance fondamentales d'un pont ou d'un bâtiment."
  },

  // ── Graphing ─────────────────────────────────────────────────────────────
  desmos: {
    id: 'desmos',
    title: 'Calculateur Graphique Interactif',
    category: 'Visualisation',
    tag: 'Moteur Graphique 2D',
    intuition:
      "Visualisation directe de fonctions mathématiques, courbes paramétriques, tangentes et points d'intersection. Permet d'explorer intuitivement le comportement d'une fonction f(x) avant de lancer un algorithme numérique.",
    formula: 'y = f(x), \\quad f(x) = 0 \\iff \\text{Intersection avec l\'axe des } x',
    formulaDescription:
      "Manipulez les curseurs et zoomez pour repérer visuellement les extrema, asymptotes et zéros de fonctions.",
    convergence:
      "Rendu géométrique dynamique en temps réel 60 FPS.",
    convergenceOrder: 'Temps réel',
    conditions: [
      "Prend en charge la syntaxe mathématique standard (sin, cos, exp, log, polynômes)."
    ],
    steps: [
      "Saisir l'expression de la fonction f(x).",
      "Ajuster la fenêtre d'affichage (zoom / déplacement).",
      "Repérer les intervalles contenant des zéros pour initialiser les solveurs numériques."
    ],
    tips:
      "Idéal pour vérifier visuellement si l'intervalle [a, b] choisi pour la dichotomie contient bien une racine."
  }
};

interface MethodTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
}

export default function MethodTheoryModal({
  isOpen,
  onClose,
  toolId,
}: MethodTheoryModalProps) {
  const info = METHOD_THEORY_DATA[toolId] || {
    id: toolId,
    title: 'Guide Théorique & Algorithme',
    category: 'Analyse Numérique',
    tag: 'Fiche Méthode',
    intuition:
      "Cette méthode numérique permet de résoudre le problème de manière discrétisée en approximant la solution continue par des calculs itératifs pas à pas.",
    formula: 'x_{k+1} = \\Phi(x_k)',
    formulaDescription: "Relation de récurrence liant l'état courant à l'état suivant.",
    convergence: "Convergence déterminée par les propriétés spectrales et la régularité du problème.",
    convergenceOrder: 'Standard',
    conditions: ['Problème bien posé au sens d\'Hadamard.', 'Paramètres de discrétisation adaptés.'],
    steps: [
      'Initialiser les données d\'entrée et les conditions limites.',
      'Exécuter la boucle de calcul itérative.',
      'Contrôler le résidu et la convergence.',
      'Restituer la solution approchée.'
    ],
    tips: "Testez différentes valeurs de paramètres dans le laboratoire pour observer la sensibilité numérique."
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-[32px] border-2 border-white/90 shadow-2xl p-6 sm:p-8 animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader className="pb-3 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full uppercase tracking-wider">
              {info.category}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
              {info.tag}
            </span>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>{info.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* 1. Intuition & Principe */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white rounded-2xl p-5 border border-blue-100 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-900">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Principe & Intuition Géométrique</span>
            </div>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {info.intuition}
            </p>
          </div>

          {/* 2. Formule Mathématique Clé */}
          <div className="bg-stone-50/90 rounded-2xl p-5 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <FileCode2 className="w-4 h-4 text-blue-600" />
              <span>Formule Mathématique Clé</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-inner font-mono text-sm sm:text-base text-slate-900 font-bold text-center overflow-x-auto">
              {info.formula}
            </div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              {info.formulaDescription}
            </p>
          </div>

          {/* 3. Vitesse & Propriétés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vitesse */}
            <div className="bg-emerald-50/60 rounded-2xl p-4.5 border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Vitesse de Convergence</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {info.convergence}
              </p>
            </div>

            {/* Hypothèses & Pièges */}
            <div className="bg-amber-50/60 rounded-2xl p-4.5 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Conditions & Pièges à Éviter</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                {info.conditions.map((cond, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Algorithme Pas à Pas */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-900">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Algorithme Pas à Pas</span>
            </div>
            <div className="space-y-2">
              {info.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conseil pro */}
          {info.tips && (
            <div className="p-4 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-700 font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Conseil pratique :</strong> {info.tips}
              </p>
            </div>
          )}

          {/* Action button: close and practice */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>J'ai compris, passer à la pratique</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
