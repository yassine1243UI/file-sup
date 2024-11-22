# File's Up

## C'est quoi ?

FileSup est une application web permettant de gérer l'upload, le stockage, la consultation et le téléchargement de fichiers. Elle permet également d'ajouter un stockage supplémentaire via un système de paiement, de gérer les factures des utilisateurs et de suivre leur consommation de stockage.

## Fonctionnalités

- **Gestion de comptes utilisateurs** : Inscription, connexion, et mise à jour des informations utilisateur.
- **Téléchargement de fichiers** : Possibilité de télécharger, supprimer et afficher des fichiers.
- **Gestion des factures** : Génération de factures en PDF et téléchargement des factures.
- **Ajout de stockage supplémentaire** : L'utilisateur peut acheter plus d'espace de stockage via un paiement sécurisé.
- **Affichage des statistiques de stockage** : L'utilisateur peut visualiser son utilisation de stockage et les fichiers qu'il a téléchargés.

## Technologies utilisées

### Frontend :
- React.js
- Axios pour les requêtes HTTP
- React Router pour la gestion des routes
- Stripe pour le paiement

### Backend :
- Node.js avec Express.js
- MySQL pour la gestion des données
- PDFKit pour la génération de factures PDF
- Stripe pour le traitement des paiements

### Sécurité :
- JSON Web Token (JWT) pour l'authentification et l'autorisation
- Bcrypt pour le hachage des mots de passe

## Installation backend

1. Clonez le dépôt du backend :

    ```bash
    git clone https://github.com/username/file-sup-backend.git
    ```

2. Installez les dépendances :

    ```bash
    cd file-sup-backend
    npm install
    ```

3. Configurez les variables d'environnement dans un fichier `.env` à la racine du projet :

    ```ini
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=password
    DB_NAME=filesup
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

4. Démarrez le serveur backend :

    ```bash
    npm start
    ```

    Le serveur backend sera disponible sur `http://localhost:5000`.

## Installation frontend

1. Clonez le dépôt du frontend :

    ```bash
    git clone https://github.com/username/file-sup-frontend.git
    ```

2. Installez les dépendances :

    ```bash
    cd file-sup-frontend
    npm install
    ```

3. Configurez les variables d'environnement dans un fichier `.env` à la racine du projet :

    ```ini
    REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
    ```

4. Démarrez le serveur frontend :

    ```bash
    npm start
    ```

    Le frontend sera disponible sur `http://localhost:3000`.

## API

### Authentication
- **POST** `/api/auth/signup` : Inscription d'un nouvel utilisateur
- **POST** `/api/auth/login` : Connexion d'un utilisateur
- **POST** `/api/auth/logout` : Déconnexion de l'utilisateur

### Files
- **GET** `/api/files` : Récupérer la liste des fichiers de l'utilisateur
- **POST** `/api/files/upload` : Uploader un fichier
- **DELETE** `/api/files/:fileId` : Supprimer un fichier
- **GET** `/api/files/download/:fileId` : Télécharger un fichier

### Storage
- **GET** `/api/auth/storage-stats` : Obtenir les statistiques de stockage de l'utilisateur (utilisation et restant)

### Invoices
- **GET** `/api/invoice/:invoiceId` : Télécharger la facture au format PDF pour un utilisateur
- **POST** `/api/auth/payment-success` : Traiter le paiement et activer le stockage supplémentaire

## Fonctionnalités spécifiques

### Ajout de stockage supplémentaire
1. Lorsqu'un utilisateur souhaite augmenter son espace de stockage, il peut payer via Stripe.
2. Lorsqu'un paiement est validé, l'espace de stockage de l'utilisateur est mis à jour dans la base de données.

### Gestion des factures
1. Les utilisateurs peuvent consulter et télécharger leurs factures en PDF.
2. Les factures contiennent des informations sur l'achat effectué (montant, date, etc.).

## Contribuer

1. Forkez le projet.
2. Créez une branche pour vos fonctionnalités : `git checkout -b feature/feature-name`.
3. Faites vos modifications et committez-les : `git commit -am 'Add new feature'`.
4. Poussez votre branche : `git push origin feature/feature-name`.
5. Soumettez une pull request.


