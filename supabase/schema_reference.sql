-- ============================================================================
-- SCHEMA_REFERENCE.sql
-- Snapshot documentaire du schéma Supabase Flooow Connect
-- Date: 2025-12-12
--
-- ATTENTION: Ce fichier est DOCUMENTAIRE uniquement
-- NE PAS EXÉCUTER - Utilisez les migrations officielles
-- Aucune instruction DROP ou DELETE
-- ============================================================================

-- ============================================================================
-- 1. TABLE: activities (Table principale des activités)
-- ============================================================================
-- Source: types.ts + migrations récentes
-- 29 activités de démo actuellement en base

CREATE TABLE IF NOT EXISTS public.activities (
    -- Identifiant
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informations de base
    title TEXT NOT NULL,
    description TEXT,

    -- Classification
    categories TEXT[],                      -- Ex: ['sport', 'collectif']
    category_id UUID REFERENCES activity_categories(id),
    tags JSONB,                             -- Tags libres en JSON

    -- Tranches d'âge
    age_min INTEGER,                        -- Âge minimum (ex: 6)
    age_max INTEGER,                        -- Âge maximum (ex: 17)

    -- Prix
    price_base NUMERIC(10,2),               -- Prix de base en euros
    price_unit TEXT DEFAULT 'séance',       -- Unité: séance, mois, an, séjour

    -- Aides acceptées
    accepts_aid_types JSONB,                -- Ex: ["PASS_SPORT", "CARTE_BOGE"]

    -- Période
    period_type TEXT,                       -- 'saison_scolaire' | 'vacances'
    vacation_periods JSONB,                 -- Périodes de vacances spécifiques
    vacation_type TEXT,                     -- Type de vacances si applicable

    -- Dates
    date_debut DATE,
    date_fin DATE,
    jours_horaires TEXT,                    -- Ex: "Mercredi 14h-16h"
    creneaux JSONB,                         -- Créneaux structurés

    -- Localisation
    lieu_nom TEXT,                          -- Nom du lieu
    venue_name TEXT,                        -- Alias pour compatibilité
    address TEXT,
    city TEXT,
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Image
    image_url TEXT,                         -- URL de l'image principale

    -- Organisme (dénormalisé)
    organism_id UUID REFERENCES organisms(id),
    organism_name TEXT,
    organism_type TEXT,                     -- Ex: 'association', 'mairie', 'entreprise'
    organism_phone TEXT,
    organism_email TEXT,
    organism_website TEXT,

    -- Mobilité / Transport
    transport_info TEXT,
    mobility_tc TEXT,                       -- Info transports en commun
    mobility_velo BOOLEAN DEFAULT FALSE,
    mobility_covoit BOOLEAN DEFAULT FALSE,
    mobility_types TEXT[],                  -- Types consolidés
    bike_friendly BOOLEAN,
    walking_friendly BOOLEAN,
    public_transport_nearby BOOLEAN,

    -- Séjours / Nuitées
    duration_days INTEGER,                  -- Durée en jours
    has_accommodation BOOLEAN DEFAULT FALSE,
    is_overnight BOOLEAN,
    acm_type TEXT,                          -- Type ACM si applicable

    -- Santé & Prérequis
    sante_tags TEXT[],                      -- Ex: ['certificat_medical', 'allergie_info']
    prerequis TEXT[],                       -- Ex: ['savoir_nager', 'apporter_velo']
    pieces_a_fournir TEXT[],                -- Documents requis

    -- Capacité
    max_participants INTEGER,

    -- Accessibilité
    has_accessibility BOOLEAN,
    has_free_trial BOOLEAN,

    -- Sessions textuelles (legacy)
    sessions TEXT,

    -- Publication
    is_published BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur activities
CREATE INDEX IF NOT EXISTS idx_activities_is_published ON activities(is_published);
CREATE INDEX IF NOT EXISTS idx_activities_categories ON activities USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city);
CREATE INDEX IF NOT EXISTS idx_activities_postal_code ON activities(postal_code);
CREATE INDEX IF NOT EXISTS idx_activities_period_type ON activities(period_type);
CREATE INDEX IF NOT EXISTS idx_activities_age_range ON activities(age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_activities_price_base ON activities(price_base);
CREATE INDEX IF NOT EXISTS idx_activities_organism_id ON activities(organism_id);

-- ============================================================================
-- 2. TABLE: activity_categories (Catégories d'activités)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,                         -- Nom de l'icône Lucide
    color TEXT,                             -- Code couleur hex
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLE: activity_sessions (Sessions/Créneaux d'activités)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

    -- Horaires
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week INTEGER,                    -- 0=Dimanche, 1=Lundi, ..., 6=Samedi

    -- Dates
    start_date DATE,
    end_date DATE,

    -- Capacité
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,

    -- Spécificités session
    age_min INTEGER,
    age_max INTEGER,
    price NUMERIC(10,2),
    location TEXT,
    period_type TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_activity_id ON activity_sessions(activity_id);
CREATE INDEX IF NOT EXISTS idx_sessions_day_of_week ON activity_sessions(day_of_week);

-- ============================================================================
-- 4. TABLE: availability_slots (Créneaux de disponibilité)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

    -- Période
    start TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,

    -- Capacité
    seats_total INTEGER,
    seats_remaining INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slots_activity_id ON availability_slots(activity_id);
CREATE INDEX IF NOT EXISTS idx_slots_start ON availability_slots(start);

-- ============================================================================
-- 5. TABLE: activity_prices (Tarifs par tranche QF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

    price_type TEXT NOT NULL,               -- Ex: 'standard', 'reduit', 'gratuit'
    amount NUMERIC(10,2) NOT NULL,

    -- Tranches QF
    quotient_min INTEGER,
    quotient_max INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prices_activity_id ON activity_prices(activity_id);

-- ============================================================================
-- 6. TABLE: activity_media (Médias associés aux activités)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,               -- 'image' | 'video' | 'pdf'
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_activity_id ON activity_media(activity_id);

-- ============================================================================
-- 7. TABLE: organisms (Organismes / Associations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organisms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    type TEXT,                              -- 'association', 'mairie', 'entreprise', etc.
    description TEXT,

    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,

    -- Adresse
    address TEXT,
    city TEXT,
    postal_code TEXT,

    -- Référent
    profile_id UUID REFERENCES profiles(id),

    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    is_validated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organisms_city ON organisms(city);
CREATE INDEX IF NOT EXISTS idx_organisms_is_active ON organisms(is_active);

-- ============================================================================
-- 8. TABLE: financial_aids (Aides financières)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_aids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    description TEXT,

    -- Montant
    amount NUMERIC(10,2),
    amount_type TEXT,                       -- 'fixe' | 'variable' | 'pourcentage'
    percentage NUMERIC(5,2),

    -- Critères d'éligibilité (JSONB flexible)
    eligibility_criteria JSONB,

    -- Validité
    valid_from DATE,
    valid_until DATE,

    -- Partenaire
    partner_id UUID REFERENCES financial_partners(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aids_partner_id ON financial_aids(partner_id);
CREATE INDEX IF NOT EXISTS idx_aids_valid_dates ON financial_aids(valid_from, valid_until);

-- ============================================================================
-- 9. TABLE: financial_partners (Partenaires financiers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    type TEXT,                              -- 'caf', 'region', 'departement', 'commune', etc.

    -- Contact
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,

    -- Référent
    profile_id UUID REFERENCES profiles(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. TABLE: profiles (Profils utilisateurs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identité
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,

    -- Rôle
    role TEXT DEFAULT 'parent',             -- 'parent' | 'organism' | 'admin' | 'super_admin'

    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    is_validated BOOLEAN DEFAULT FALSE,

    -- Données sociales
    quotient_familial INTEGER,
    allocataire_caf BOOLEAN DEFAULT FALSE,

    -- Géographique
    address TEXT,
    city TEXT,
    postal_code TEXT,
    est_qpv BOOLEAN DEFAULT FALSE,

    -- Préférences
    notification_preferences JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- ============================================================================
-- 11. TABLE: families (Familles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Référent
    parent_id UUID REFERENCES profiles(id),

    -- Données familiales
    name TEXT,
    quotient_familial INTEGER,
    allocataire_caf BOOLEAN DEFAULT FALSE,
    family_situation TEXT,                  -- 'couple' | 'monoparental' | 'recompose'

    -- Adresse
    address TEXT,
    city TEXT,
    postal_code TEXT,
    est_qpv BOOLEAN DEFAULT FALSE,

    -- Statut
    is_validated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_families_parent_id ON families(parent_id);

-- ============================================================================
-- 12. TABLE: children (Enfants)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identité
    first_name TEXT NOT NULL,
    last_name TEXT,
    birth_date DATE,
    gender TEXT,                            -- 'M' | 'F' | 'autre'

    -- Famille
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES profiles(id),

    -- Scolarité
    school_level TEXT,                      -- 'maternelle', 'primaire', 'college', 'lycee'
    school_name TEXT,

    -- Santé
    has_medical_info BOOLEAN DEFAULT FALSE,
    medical_info JSONB,
    allergies TEXT[],

    -- Aides sociales
    beneficie_ARS BOOLEAN DEFAULT FALSE,
    beneficie_AEEH BOOLEAN DEFAULT FALSE,
    beneficie_bourse BOOLEAN DEFAULT FALSE,

    -- Statut
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_family_id ON children(family_id);
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_birth_date ON children(birth_date);

-- ============================================================================
-- 13. TABLE: registrations (Inscriptions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Références
    child_id UUID REFERENCES children(id),
    activity_id UUID REFERENCES activities(id),
    session_id UUID REFERENCES activity_sessions(id),
    family_id UUID REFERENCES families(id),

    -- Statut
    status TEXT DEFAULT 'pending',          -- 'pending' | 'confirmed' | 'cancelled' | 'waitlist'

    -- Paiement
    payment_status TEXT DEFAULT 'pending',  -- 'pending' | 'partial' | 'paid' | 'refunded'
    amount_due NUMERIC(10,2),
    amount_paid NUMERIC(10,2) DEFAULT 0,

    -- Aides appliquées
    aids_applied JSONB,                     -- Ex: [{"code": "PASS_SPORT", "amount": 50}]

    -- Documents
    documents_status TEXT,

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_child_id ON registrations(child_id);
CREATE INDEX IF NOT EXISTS idx_registrations_activity_id ON registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_registrations_family_id ON registrations(family_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- ============================================================================
-- 14. TABLE: reservations (Réservations de créneaux)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Références
    child_id UUID REFERENCES children(id),
    slot_id UUID REFERENCES availability_slots(id),
    activity_id UUID REFERENCES activities(id),
    parent_id UUID REFERENCES profiles(id),

    -- Statut
    status TEXT DEFAULT 'pending',

    -- Validation parent
    parent_validated BOOLEAN DEFAULT FALSE,
    parent_validation_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_child_id ON reservations(child_id);
CREATE INDEX IF NOT EXISTS idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- ============================================================================
-- 15. TABLE: notifications (Notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Destinataire
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

    -- Contenu
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,                              -- 'info' | 'warning' | 'success' | 'error'

    -- Référence optionnelle
    reference_type TEXT,                    -- 'activity' | 'registration' | 'child' | etc.
    reference_id UUID,

    -- Statut
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- 16. TABLE: favorites (Favoris activités)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_activity_id ON favorites(activity_id);

-- ============================================================================
-- 17. VUES PRINCIPALES
-- ============================================================================

-- Vue: activities_with_sessions
-- Combine les activités avec leurs sessions pour le front familles
-- Voir migration 20251210150000 pour la définition complète

-- Vue: activities_with_age_groups
-- Agrège les groupes d'âge par activité

-- Vue: vw_enfants_infos_sante
-- Vue sécurisée des infos santé des enfants

-- Vue: vw_fratrie_groups
-- Vue des groupes de fratrie par famille

-- Vue: vw_inscriptions_stats
-- Statistiques d'inscriptions

-- ============================================================================
-- 18. ENUMS IMPLICITES (utilisés comme TEXT avec contraintes applicatives)
-- ============================================================================

-- user_role: 'parent' | 'organism' | 'admin' | 'super_admin'
-- registration_status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
-- payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
-- gender: 'M' | 'F' | 'autre'
-- family_situation: 'couple' | 'monoparental' | 'recompose'
-- period_type: 'saison_scolaire' | 'vacances'
-- amount_type: 'fixe' | 'variable' | 'pourcentage'

-- ============================================================================
-- 19. RELATIONS CLÉS
-- ============================================================================

-- activities <-> organisms (1:N via organism_id)
-- activities <-> activity_categories (N:1 via category_id)
-- activities <-> activity_sessions (1:N)
-- activities <-> availability_slots (1:N)
-- activities <-> activity_prices (1:N)
-- activities <-> activity_media (1:N)

-- profiles <-> families (1:N via parent_id)
-- families <-> children (1:N)

-- children + activities -> registrations (N:M)
-- children + availability_slots -> reservations (N:M)

-- financial_partners <-> financial_aids (1:N)

-- ============================================================================
-- FIN DU SCHÉMA DE RÉFÉRENCE
-- ============================================================================
