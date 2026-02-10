 # Politique de securite
 
 ## Signaler une vulnerabilite
 - Envoyez un email a security@getroom.io avec une description claire, etapes de reproduction et impact.
 - Ne publiez pas de details avant un correctif coordonne.
 
 ## Fenetres de reponse
 - Accuse de reception: 2 jours ouvrables
 - Evaluation initiale: 5 jours ouvrables
 - Correctif cible: selon severite et complexite
 
 ## Perimetre
 - Ce depot et ses dependances directes
 - Les environnements d'execution et la configuration associee
 
 ## Bonnes pratiques requises
 - Secrets uniquement via variables d'environnement, jamais dans le code
 - Acces admin limite par `ADMIN_EMAILS` et/ou `ADMIN_USER_IDS`
 - Journalisation structuree et retention selon exigences internes
 
 ## Conformite
 Ce depot fournit des controles techniques de base. La conformite ISO 27001 et SOC 2 exige aussi
 des processus organisationnels (gestion des acces, revues, politiques, formation, audits).
