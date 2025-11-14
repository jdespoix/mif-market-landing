/*
  # Email Marketing System - Répertoire Producteurs

  ## Vue d'ensemble
  Système complet de marketing automation pour la gestion des campagnes email
  avec Brevo (anciennement Sendinblue).

  ## 1. Nouvelles Tables

  ### `email_templates`
  Modèles d'emails réutilisables
  - `id` (uuid, primary key) - Identifiant unique
  - `name` (text, required) - Nom du template
  - `subject` (text, required) - Sujet de l'email
  - `content` (text, required) - Contenu HTML/texte de l'email
  - `variables` (jsonb) - Variables dynamiques disponibles (ex: {prenom}, {entreprise})
  - `created_by` (uuid, foreign key) - Créateur du template
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de modification

  ### `campaigns`
  Campagnes d'emailing
  - `id` (uuid, primary key) - Identifiant unique
  - `name` (text, required) - Nom de la campagne
  - `description` (text) - Description
  - `template_id` (uuid, foreign key) - Template utilisé
  - `status` (text) - Statut: 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  - `scheduled_at` (timestamptz) - Date d'envoi programmée
  - `sent_at` (timestamptz) - Date d'envoi effectif
  - `total_recipients` (integer) - Nombre total de destinataires
  - `sent_count` (integer) - Nombre d'envois réussis
  - `failed_count` (integer) - Nombre d'échecs
  - `created_by` (uuid, foreign key) - Créateur de la campagne
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de modification

  ### `campaign_recipients`
  Liste des destinataires par campagne
  - `id` (uuid, primary key) - Identifiant unique
  - `campaign_id` (uuid, foreign key) - Campagne associée
  - `producer_id` (uuid, foreign key) - Producteur destinataire (nullable si import externe)
  - `email` (text, required) - Email du destinataire
  - `first_name` (text) - Prénom
  - `last_name` (text) - Nom
  - `company_name` (text) - Entreprise
  - `custom_data` (jsonb) - Données personnalisées pour variables
  - `status` (text) - Statut: 'pending', 'sent', 'failed', 'bounced'
  - `sent_at` (timestamptz) - Date d'envoi
  - `brevo_message_id` (text) - ID message Brevo
  - `error_message` (text) - Message d'erreur si échec
  - `created_at` (timestamptz) - Date de création

  ### `import_history`
  Historique des imports CSV/Google Sheets
  - `id` (uuid, primary key) - Identifiant unique
  - `filename` (text, required) - Nom du fichier importé
  - `source` (text, required) - Source: 'csv', 'google_sheets'
  - `total_rows` (integer) - Nombre total de lignes
  - `imported_rows` (integer) - Lignes importées avec succès
  - `failed_rows` (integer) - Lignes en échec
  - `errors` (jsonb) - Détails des erreurs
  - `imported_by` (uuid, foreign key) - Importateur
  - `created_at` (timestamptz) - Date d'import

  ## 2. Sécurité (RLS)
  
  Toutes les tables sont accessibles uniquement aux admins
  - Seuls les admins peuvent lire, créer, modifier, supprimer
  
  ## 3. Index
  
  Pour optimiser les performances des requêtes
  - Index sur campaign_id pour campaign_recipients
  - Index sur status pour campaigns et campaign_recipients
  - Index sur scheduled_at pour campaigns
  - Index sur created_at pour toutes les tables
*/

-- Table des modèles d'emails
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des destinataires de campagne
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  producer_id uuid REFERENCES producers(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  company_name text,
  custom_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamptz,
  brevo_message_id text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Table de l'historique des imports
CREATE TABLE IF NOT EXISTS import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  source text NOT NULL CHECK (source IN ('csv', 'google_sheets')),
  total_rows integer DEFAULT 0,
  imported_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at ON email_templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_email ON campaign_recipients(email);

CREATE INDEX IF NOT EXISTS idx_import_history_imported_by ON import_history(imported_by);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON import_history(created_at DESC);

-- Activer RLS sur toutes les tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS - Seuls les admins ont accès

-- email_templates
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- campaigns
CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- campaign_recipients
CREATE POLICY "Admins can manage campaign recipients"
  ON campaign_recipients FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- import_history
CREATE POLICY "Admins can view import history"
  ON import_history FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Triggers pour updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
