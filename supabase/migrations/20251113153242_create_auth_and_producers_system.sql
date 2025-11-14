/*
  # Système d'authentification et gestion des producteurs - MIF Market

  ## Vue d'ensemble
  Ce système permet la gestion des producteurs avec deux niveaux d'accès :
  - **Producteurs** : Peuvent gérer leur propre fiche
  - **Administrateurs** : Contrôle complet sur toutes les fiches

  ## 1. Nouvelles Tables

  ### `user_roles`
  Table de gestion des rôles utilisateurs
  - `id` (uuid, primary key) - Identifiant unique
  - `user_id` (uuid, foreign key) - Référence à auth.users
  - `role` (text) - Type de rôle: 'admin' ou 'producer'
  - `created_at` (timestamptz) - Date de création

  ### `producers`
  Table des informations des producteurs
  - `id` (uuid, primary key) - Identifiant unique
  - `user_id` (uuid, foreign key) - Référence à auth.users
  - `company_name` (text, required) - Nom de l'entreprise
  - `contact_name` (text) - Nom du contact
  - `email` (text, required) - Email de contact
  - `phone` (text) - Téléphone
  - `address` (text) - Adresse complète
  - `postal_code` (text) - Code postal
  - `city` (text) - Ville
  - `region` (text) - Région
  - `products` (text[]) - Liste des produits
  - `categories` (text[]) - Catégories de produits
  - `description` (text) - Description de l'activité
  - `website` (text) - Site web
  - `logo_url` (text) - URL du logo
  - `is_visible` (boolean) - Visible dans le répertoire public
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de mise à jour

  ## 2. Sécurité (RLS)
  
  ### user_roles
  - Admins peuvent tout voir et gérer
  - Producteurs peuvent voir leur propre rôle
  
  ### producers
  - Lecture publique pour les fiches visibles
  - Producteurs peuvent modifier leur propre fiche
  - Admins ont accès complet

  ## 3. Notes importantes
  - Email admin par défaut : jdespoix@gmail.com
  - Les producteurs s'inscrivent via le formulaire public
  - Un trigger crée automatiquement le rôle 'producer' lors de l'inscription
*/

-- Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'producer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Table des producteurs
CREATE TABLE IF NOT EXISTS producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  address text,
  postal_code text,
  city text,
  region text,
  products text[] DEFAULT '{}',
  categories text[] DEFAULT '{}',
  description text,
  website text,
  logo_url text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_producers_region ON producers(region);
CREATE INDEX IF NOT EXISTS idx_producers_city ON producers(city);
CREATE INDEX IF NOT EXISTS idx_producers_company_name ON producers(company_name);
CREATE INDEX IF NOT EXISTS idx_producers_is_visible ON producers(is_visible);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Activer RLS sur toutes les tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_roles

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Les utilisateurs peuvent voir leur propre rôle
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Seuls les admins peuvent insérer des rôles
CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Seuls les admins peuvent mettre à jour des rôles
CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Seuls les admins peuvent supprimer des rôles
CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Politiques RLS pour producers

-- Tout le monde peut voir les producteurs visibles
CREATE POLICY "Anyone can view visible producers"
  ON producers FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

-- Les admins peuvent voir tous les producteurs
CREATE POLICY "Admins can view all producers"
  ON producers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Les producteurs peuvent voir leur propre fiche
CREATE POLICY "Producers can view own profile"
  ON producers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins peuvent insérer des producteurs
CREATE POLICY "Admins can insert producers"
  ON producers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Les producteurs peuvent mettre à jour leur propre fiche
CREATE POLICY "Producers can update own profile"
  ON producers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent mettre à jour tous les producteurs
CREATE POLICY "Admins can update all producers"
  ON producers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Les producteurs peuvent supprimer leur propre fiche
CREATE POLICY "Producers can delete own profile"
  ON producers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins peuvent supprimer tous les producteurs
CREATE POLICY "Admins can delete all producers"
  ON producers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at sur producers
DROP TRIGGER IF EXISTS update_producers_updated_at ON producers;
CREATE TRIGGER update_producers_updated_at
  BEFORE UPDATE ON producers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
