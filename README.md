# 🌊 NIAGARA v3 — MariaDB / XAMPP Edition

Identique à la v2 mais utilise **MariaDB** (via XAMPP) au lieu de MongoDB.  
**ORM** : Sequelize 6 · **Driver** : mysql2

---

## ⚡ Démarrage en 5 étapes

### 1. Démarrer XAMPP

Ouvrez le **Panneau de contrôle XAMPP** et démarrez :
- ✅ **Apache** (pour phpMyAdmin)
- ✅ **MySQL** (MariaDB)

### 2. Créer la base de données

Allez sur **http://localhost/phpmyadmin** et exécutez :

```sql
CREATE DATABASE niagara_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Ou cliquez **"Nouvelle base de données"** → nom : `niagara_db` → `utf8mb4_unicode_ci`.

### 3. Configurer le Backend

```bash
cd Backend
cp .env.example .env
# Éditez .env : remplissez JWT_ACCESS_SECRET et JWT_REFRESH_SECRET
npm install
npm run dev
```

> **Note** : Si vous avez défini un mot de passe XAMPP, ajoutez `DB_PASS=votre_mdp` dans `.env`.  
> Par défaut XAMPP utilise `root` sans mot de passe.

**Les tables sont créées automatiquement** au premier démarrage (`sequelize.sync`).

### 4. Seed (données de démo)

```bash
npm run seed
```

Crée les catégories, 4 produits de démonstration, et 2 comptes.

### 5. Démarrer le Frontend

```bash
cd ../Frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 👤 Comptes de démo

| Rôle    | Email                 | Mot de passe |
|---------|-----------------------|--------------|
| Admin   | admin@niagara.gn      | Admin123!    |
| Client  | client@niagara.gn     | Client123!   |

**Panel admin** : http://localhost:5173/admin

---

## 🗄️ Structure des tables MariaDB

| Table               | Description                          |
|---------------------|--------------------------------------|
| `users`             | Comptes clients et admins            |
| `user_addresses`    | Adresses de livraison                |
| `categories`        | Catégories (arbre parent/enfant)     |
| `products`          | Produits (prix, statut, SEO…)        |
| `product_images`    | Images des produits                  |
| `product_variants`  | Variantes (taille, couleur, stock)   |
| `orders`            | Commandes                            |
| `order_items`       | Lignes de commande                   |
| `coupons`           | Codes promo                          |
| `reviews`           | Avis clients                         |
| `wishlists`         | Favoris                              |
| `cart_items`        | Panier persistant                    |
| `blog_posts`        | Articles de blog                     |
| `collections`       | Groupes de produits                  |
| `collection_products` | Produits ↔ Collections             |
| `gift_cards`        | Cartes-cadeaux                       |
| `stock_movements`   | Mouvements de stock                  |
| `purchase_orders`   | Bons de commande fournisseurs        |
| `campaigns`         | Campagnes marketing                  |
| `customer_segments` | Segments de clients                  |
| `shop_settings`     | Paramètres de la boutique            |

---

## ⚙️ Variables d'environnement (Backend/.env)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MariaDB (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=niagara_db
DB_USER=root
DB_PASS=          # Vide par défaut avec XAMPP

# JWT (obligatoire — mettez des chaînes aléatoires longues)
JWT_ACCESS_SECRET=remplacez_par_une_chaine_aleatoire_longue
JWT_REFRESH_SECRET=remplacez_par_une_autre_chaine_aleatoire

# Cloudinary (optionnel — pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🔄 Différences v2 (MongoDB) → v3 (MariaDB)

| Aspect              | v2 MongoDB              | v3 MariaDB              |
|---------------------|-------------------------|-------------------------|
| ORM / Driver        | Mongoose                | Sequelize + mysql2      |
| IDs                 | ObjectId (hex)          | Integer auto-increment  |
| Documents imbriqués | Sous-documents natifs   | Tables séparées         |
| Images produit      | Array dans le document  | Table `product_images`  |
| Variantes           | Array dans le document  | Table `product_variants`|
| JSON dynamique      | Natif BSON              | Colonne TEXT + JSON.parse |
| Migrations          | Automatique (Mongoose)  | `sequelize.sync` en dev |
| Redis               | Optionnel (cache)       | Non requis              |

---

## 🛠️ Technologies

- **Express 5** · **Sequelize 6** · **mysql2** · **MariaDB (XAMPP)**
- **React 19** · **Vite 6** · **Redux Toolkit** · **Tailwind CSS 4**
- **JWT** (access + refresh tokens) · **Cloudinary** · **Nodemailer**
