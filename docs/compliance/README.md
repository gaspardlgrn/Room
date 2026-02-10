 # Conformite ISO 27001 et SOC 2
 
 Ce dossier contient les elements de base pour aligner l'application avec les exigences ISO 27001 et SOC 2.
 La certification exige des preuves organisationnelles et operationnelles en plus des controles techniques.
 
 ## Elements techniques couverts dans ce depot
 - En-tetes de securite HTTP via `helmet`
 - Limitation de trafic via `express-rate-limit`
 - Journalisation structuree des requetes via `pino-http`
 - CORS restreint et configurable
 - Controle d'acces admin via Clerk
 
 ## Elements organisationnels a mettre en place
 - Politique de gestion des acces et revues periodiques
 - Gestion des incidents et post-mortems
 - Gestion des changements (PR, revue, approbation)
 - Gestion des fournisseurs et evaluation des risques
 - Sauvegardes, restauration et tests de reprise
 - Formation securite et onboarding
 
 ## Preuves attendues (exemples)
 - Liste des acces admin et date de revue
 - Journal des incidents et actions correctives
 - Registre des changements significatifs
 - Preuves de sauvegardes et tests de restauration
