# Documentation de l'API Backend Filesup
## **Routes d'authentification**

### **POST /api/auth/signup**
- **Description :** Crée un nouveau compte utilisateur.
- **Corps de la requête :**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securepassword",
    "phone": "123456789",
    "billing_address": {
      "street": "123 Main St",
      "city": "Paris",
      "zip": "75001"
    }
  }
  ```
- **Réponse :**
  ```json
  {
    "message": "Inscription réussie",
    "userId": 1
  }
  ```
- **Remarques :** L'utilisateur est créé avec un stockage par défaut de 20 Go.

### **POST /api/auth/login**
- **Description :** Connecte un utilisateur et renvoie un jeton JWT.
- **Corps de la requête :**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "securepassword"
  }
  ```
- **Réponse :**
  ```json
  {
    "token": "jwt-token-here"
  }
  ```
- **Remarques :** Le jeton JWT est requis pour accéder aux routes protégées.

### **POST /api/auth/payment-success**
- **Description :** Gère le processus de succès de paiement et met à jour le stockage de l'utilisateur.
- **Corps de la requête :**
  ```json
  {
<<<<<<< HEAD
    "paymentIntentId": "pi_12345",
=======
    "paymentIntentId": "pi_12345_secret",
>>>>>>> 2e5465a5d6e81682ad41c143e644b9a6e6c0a175
    "password": "newpassword"
  }
  ```
- **Réponse :**
  ```json
  {
    "message": "Paiement effectué avec succès"
  }
  ```
- **Remarques :** Utilisé pour les paiements d'inscription des nouveaux utilisateurs et les achats de stockage supplémentaires.

---

## **Routes Administrateur**

### **GET /api/admin/users**
- **Description :** Récupère une liste de tous les utilisateurs avec leurs statistiques de fichiers et l'utilisation de leur stockage.
- **Réponse :**
  ```json
  [
    {
      "userId": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "totalStorage": 20480,
      "usedStorage": 10240,
      "remainingStorage": 10240
    }
  ]
  ```

### **GET /api/admin/stats/files**
- **Description :** Récupère les statistiques des fichiers téléchargés (uploads par jour/semaine).
- **Réponse :**
  ```json
  {
    "uploadsByDay": {
      "2024-11-17": 10,
      "2024-11-18": 15
    },
    "uploadsByWeek": {
      "Semaine 46": 50
    }
  }
  ```

### **GET /api/admin/stats/users**
- **Description :** Récupère les statistiques des utilisateurs, y compris les utilisateurs actifs et inactifs.
- **Réponse :**
  ```json
  {
    "activeUsers": 20,
    "inactiveUsers": 5
  }
  ```

### **GET /api/admin/files**
- **Description :** Récupère une liste de fichiers téléchargés par tous les utilisateurs avec des options de filtrage.
- **Paramètres de requête :**
  - `userId` (optionnel) : Filtrer les fichiers par utilisateur.
  - `extension` (optionnel) : Filtrer les fichiers par extension.
- **Réponse :**
  ```json
  [
    {
      "fileId": 1,
      "fileName": "document.pdf",
      "size": 1048576,
      "uploadedBy": "John Doe",
      "uploadDate": "2024-11-17"
    }
  ]
  ```

### **POST /api/admin/files/download/:fileId**
- **Description :** Télécharge un fichier spécifique au nom d'un utilisateur.
- **Paramètres de l'URL :**
  - `fileId` : L'ID du fichier à télécharger.
- **Réponse :** Télécharge directement le fichier.

### **DELETE /api/admin/delete-user/:userId**
- **Description :** Supprime un utilisateur et tous ses fichiers.
- **Paramètres de l'URL :**
  - `userId` : L'ID de l'utilisateur à supprimer.
- **Réponse :**
  ```json
  {
    "message": "Utilisateur et 10 fichiers supprimés avec succès"
  }
  ```

---

## **Routes de Gestion des Fichiers**

### **POST /api/files/upload**
- **Description :** Télécharge un fichier pour l'utilisateur authentifié.
- **Requête :**
  - Content-Type : `multipart/form-data`
  - Nom du champ fichier : `file`
- **Réponse :**
  ```json
  {
    "message": "Fichier téléchargé avec succès"
  }
  ```
- **Remarques :** Valide les limites de stockage avant d'autoriser les téléchargements.

### **GET /api/files**
- **Description :** Récupère une liste de fichiers pour l'utilisateur authentifié.
- **Paramètres de requête :**
  - `extension` (optionnel) : Filtrer les fichiers par extension.
  - `name` (optionnel) : Rechercher des fichiers par nom.
- **Réponse :**
  ```json
  [
    {
      "fileId": 1,
      "fileName": "document.pdf",
      "size": 1048576,
      "uploadDate": "2024-11-17"
    }
  ]
  ```

### **DELETE /api/files/:fileId**
- **Description :** Supprime un fichier spécifique.
- **Paramètres de l'URL :**
  - `fileId` : L'ID du fichier à supprimer.
- **Réponse :**
  ```json
  {
    "message": "Fichier supprimé avec succès"
  }
  ```

---

## **Routes de Paiement**

### **POST /api/payment/create-payment-intent**
- **Description :** Crée une intention de paiement pour un stockage supplémentaire.
- **Corps de la requête :**
  ```json
  {
    "userId": 1,
    "storageAmount": 20,
    "billingAddress": {
      "street": "123 Main St",
      "city": "Paris",
      "zip": "75001"
    },
    "purpose": "additional_storage"
  }
  ```
- **Réponse :**
  ```json
  {
    "clientSecret": "pi_123456_secret_abcdef"
  }
  ```

---

## **Gestion des Erreurs**
Toutes les routes renvoient des messages d'erreur appropriés et des codes d'état HTTP pour les erreurs de validation, les échecs d'authentification ou les problèmes internes. Exemple :

```json
{
  "message": "Message d'erreur ici",
  "error": "Explication détaillée de l'erreur"
}
```

