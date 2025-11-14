/*
  # Ajout du rôle super_admin et statut de blocage

  ## Modifications

  ### 1. Table user_roles
  - Ajout du rôle 'super_admin' dans les valeurs possibles
  - Le super_admin a tous les droits et ne peut pas être supprimé

  ### 2. Table producers
  - Ajout de la colonne `is_blocked` pour bloquer/débloquer un producteur
  - Un producteur bloqué ne peut pas se connecter

  ## Sécurité
  - Seul le super_admin peut gérer les admins
  - Les admins peuvent gérer les producteurs
  - Le super_admin ne peut pas être supprimé

  ## Notes
  - L'email jdespoix@gmail.com est protégé en tant que super_admin
*/

-- Modifier la contrainte de la table user_roles pour inclure super_admin
ALTER TABLE user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('super_admin', 'admin', 'producer'));

-- Ajouter la colonne is_blocked à la table producers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'producers' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE producers ADD COLUMN is_blocked boolean DEFAULT false;
  END IF;
END $$;

-- Créer un index sur is_blocked
CREATE INDEX IF NOT EXISTS idx_producers_is_blocked ON producers(is_blocked);

-- Fonction pour vérifier si l'utilisateur est super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est admin ou super_admin
CREATE OR REPLACE FUNCTION is_admin_or_super()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la fonction is_admin existante pour inclure super_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour le rôle du super admin (jdespoix@gmail.com) si il existe déjà
UPDATE user_roles
SET role = 'super_admin'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jdespoix@gmail.com'
)
AND role = 'admin';

-- Politique pour empêcher la suppression du super_admin
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (
    is_admin() 
    AND role != 'super_admin'
    AND user_id != (SELECT id FROM auth.users WHERE email = 'jdespoix@gmail.com')
  );

-- Politique pour permettre au super_admin de tout gérer
DROP POLICY IF EXISTS "Super admin can manage all roles" ON user_roles;

CREATE POLICY "Super admin can manage all roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
