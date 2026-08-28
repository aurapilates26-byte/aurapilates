# Déploiement VPS (Docker)

Après chaque mise à jour du code sur le serveur, **reconstruire l’image** et **appliquer les migrations** Prisma.  
`npx prisma generate` est déjà exécuté **pendant le build Docker** ; en production il faut surtout **migrer la base**.

## Commandes sur le VPS

```bash
cd /chemin/vers/aurapilates

# 1. Récupérer le code
git pull

# 2. Reconstruire et redémarrer (generate + build + migrate au démarrage)
docker compose build --no-cache web
docker compose up -d

# 3. Vérifier les logs (migration + démarrage)
docker compose logs -f web
```

Au démarrage du conteneur `web`, le script `docker-entrypoint.sh` lance automatiquement :

```bash
prisma migrate deploy
```

Vous devez voir dans les logs : `Running prisma migrate deploy...` puis `Starting Next.js...`

## Si la page Présence affiche « Chargement impossible »

1. **Vérifier les logs** :
   ```bash
   docker compose logs web --tail=80
   ```
   Erreur fréquente : `Invalid value for argument in. Expected SessionProspectStatus` → migration non appliquée ou image non reconstruite.

2. **Forcer la migration à la main** (une fois) :
   ```bash
   docker compose exec web sh -c "npm exec --package=prisma@6.19.3 -- prisma migrate deploy"
   ```

3. **Reconstruire sans cache** (client Prisma obsolète dans l’image) :
   ```bash
   docker compose build --no-cache web
   docker compose up -d
   ```

## Déploiement sans Docker (PM2 / Node direct)

```bash
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart aurapilates   # ou votre commande de redémarrage
```

## Rappel

| Étape | Docker | Manuel |
|--------|--------|--------|
| `prisma generate` | Build (`Dockerfile` ligne `RUN npx prisma generate`) | `npx prisma generate` |
| Mise à jour BDD | `migrate deploy` au démarrage du conteneur | `npx prisma migrate deploy` |
| Ne pas utiliser en prod | `prisma db push` (sauf urgence locale) | idem |
