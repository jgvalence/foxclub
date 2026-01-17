/**
 * French translations for Fox Club
 * All user-facing text should be defined here
 */

export const fr = {
  // Common
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    submit: "Soumettre",
    confirm: "Confirmer",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    search: "Rechercher",
    filter: "Filtrer",
    actions: "Actions",
    noResults: "Aucun résultat",
    error: "Une erreur est survenue",
    success: "Succès",
  },

  // Navigation
  nav: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    myForm: "Mon formulaire",
    admin: "Administration",
    logout: "Déconnexion",
    login: "Connexion",
    register: "S'inscrire",
  },

  // Authentication
  auth: {
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    name: "Nom",
    loginTitle: "Connexion à Fox Club",
    registerTitle: "Créer un compte",
    forgotPassword: "Mot de passe oublié ?",
    noAccount: "Pas de compte ?",
    hasAccount: "Déjà un compte ?",
    loginButton: "Se connecter",
    registerButton: "S'inscrire",
    pendingApproval:
      "Votre compte est en attente d'approbation par un administrateur.",
  },

  // User Management
  users: {
    title: "Gestion des utilisateurs",
    list: "Liste des utilisateurs",
    approved: "Approuvé",
    pending: "En attente",
    role: "Rôle",
    status: "Statut",
    approve: "Approuver",
    reject: "Rejeter",
    viewForm: "Voir le formulaire",
    viewProfile: "Voir le profil",
    totalUsers: "Utilisateurs",
    pendingUsers: "En attente",
    approvedUsers: "Approuvés",
  },

  // Question Families
  questionFamilies: {
    title: "Familles de questions",
    create: "Créer une famille",
    edit: "Modifier la famille",
    delete: "Supprimer la famille",
    label: "Nom de la famille",
    type: "Type de questions",
    order: "Ordre d'affichage",
    type1: "Type 1 (Top/Bot/Talk)",
    type2: "Type 2 (Include/Talk)",
    confirmDelete:
      "Êtes-vous sûr de vouloir supprimer cette famille de questions ? Toutes les questions associées seront également supprimées.",
  },

  // Questions
  questions: {
    title: "Questions",
    create: "Créer une question",
    edit: "Modifier la question",
    delete: "Supprimer la question",
    text: "Texte de la question",
    family: "Famille de questions",
    order: "Ordre d'affichage",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette question ?",
  },

  // Form
  form: {
    title: "Formulaire de préférences",
    save: "Enregistrer mes réponses",
    submit: "Soumettre le formulaire",
    draft: "Brouillon",
    submitted: "Soumis",
    score: "Score",
    notes: "Notes",
    top: "Top",
    bot: "Bot",
    talk: "À discuter",
    include: "Inclure",
    confirmSubmit:
      "Une fois soumis, vous ne pourrez plus modifier vos réponses. Êtes-vous sûr ?",
    reopen: "Autoriser la modification",
    reopenTitle: "Rouvrir le formulaire ?",
    reopenDescription:
      "Le formulaire repassera en brouillon et l'utilisateur pourra modifier ses réponses.",
    reopenSuccess: "Le formulaire est repassé en brouillon",
    saveSuccess: "Vos réponses ont été enregistrées",
    submitSuccess: "Votre formulaire a été soumis avec succès",
    notApproved:
      "Vous devez être approuvé par un administrateur pour remplir le formulaire.",
  },

  // Score labels
  scores: {
    1: "1 - ❤️ Fantasme",
    2: "2 - ✅ Ok de le pratiquer",
    3: "3 - 🤔 Curieux / Doucement",
    4: "4 - ⚫ Non / Limite",
  },

  // Admin Notes
  adminNotes: {
    title: "Notes administrateur",
    add: "Ajouter une note",
    edit: "Modifier la note",
    delete: "Supprimer la note",
    content: "Contenu",
    pinned: "Épinglée",
    pin: "Épingler",
    unpin: "Désépingler",
    noNotes: "Aucune note",
    privateNote: "Note privée (visible uniquement par les administrateurs)",
  },

  // Admin Dashboard
  admin: {
    dashboard: "Tableau de bord admin",
    questionManagement: "Gestion des questions",
    userManagement: "Gestion des utilisateurs",
    statistics: "Statistiques",
    totalQuestions: "Questions",
    totalFamilies: "Familles",
  },

  // Errors
  errors: {
    required: "Ce champ est requis",
    invalidEmail: "Email invalide",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    unauthorized: "Non autorisé",
    forbidden: "Accès interdit",
    notFound: "Non trouvé",
    serverError: "Erreur serveur",
    networkError: "Erreur réseau",
  },

  // Toast messages
  toast: {
    createSuccess: "Créé avec succès",
    updateSuccess: "Mis à jour avec succès",
    deleteSuccess: "Supprimé avec succès",
    approveSuccess: "Utilisateur approuvé",
    rejectSuccess: "Utilisateur rejeté",
  },
} as const;

export type TranslationKeys = typeof fr;
