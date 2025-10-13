-- Enable PostGIS extension for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('family', 'structure', 'territory_admin', 'partner', 'superadmin');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('en_attente', 'validee', 'refusee', 'annulee');

-- Territories table (multi-tenant root)
CREATE TABLE public.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  covered BOOLEAN DEFAULT false,
  config_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, territory_id)
);

-- Profiles table (extended user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  profile_json JSONB DEFAULT '{}'::jsonb,
  territory_id UUID REFERENCES public.territories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  dob DATE NOT NULL,
  needs_json JSONB DEFAULT '{}'::jsonb,
  accessibility_flags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Structures table
CREATE TABLE public.structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_json JSONB DEFAULT '{}'::jsonb,
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  accessibility_profile JSONB DEFAULT '{}'::jsonb,
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID REFERENCES public.structures(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  accepts_aid_types JSONB DEFAULT '[]'::jsonb,
  payment_echelonned BOOLEAN DEFAULT false,
  payment_plans JSONB DEFAULT '[]'::jsonb,
  age_min INTEGER,
  age_max INTEGER,
  accessibility JSONB DEFAULT '{}'::jsonb,
  covoiturage_enabled BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  location GEOGRAPHY(POINT, 4326),
  capacity_policy JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability slots table
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  start TIMESTAMPTZ NOT NULL,
  "end" TIMESTAMPTZ NOT NULL,
  recurrence JSONB DEFAULT '{}'::jsonb,
  seats_total INTEGER NOT NULL DEFAULT 0,
  seats_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.availability_slots(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'en_attente',
  reason_code TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aids table
CREATE TABLE public.aids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports metrics table
CREATE TABLE public.reports_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value JSONB,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_territory_id ON public.user_roles(territory_id);
CREATE INDEX idx_profiles_territory_id ON public.profiles(territory_id);
CREATE INDEX idx_children_user_id ON public.children(user_id);
CREATE INDEX idx_structures_territory_id ON public.structures(territory_id);
CREATE INDEX idx_structures_location ON public.structures USING GIST(location);
CREATE INDEX idx_activities_structure_id ON public.activities(structure_id);
CREATE INDEX idx_activities_location ON public.activities USING GIST(location);
CREATE INDEX idx_availability_slots_activity_id ON public.availability_slots(activity_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_child_id ON public.bookings(child_id);
CREATE INDEX idx_bookings_activity_id ON public.bookings(activity_id);
CREATE INDEX idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX idx_reviews_activity_id ON public.reviews(activity_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_reports_metrics_territory_id ON public.reports_metrics(territory_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_metrics ENABLE ROW LEVEL SECURITY;

-- Security Definer function to check user role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security Definer function to get user territory
CREATE OR REPLACE FUNCTION public.get_user_territory(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT territory_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, profile_json, territory_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at on all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON public.structures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aids_updated_at BEFORE UPDATE ON public.aids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON public.territories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for territories
CREATE POLICY "Territories visible to all authenticated users" ON public.territories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Superadmins can manage all territories" ON public.territories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins and territory admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'superadmin') OR
    (public.has_role(auth.uid(), 'territory_admin') AND territory_id = public.get_user_territory(auth.uid()))
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles in their territory" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'superadmin') OR
    (public.has_role(auth.uid(), 'territory_admin') AND territory_id = public.get_user_territory(auth.uid()))
  );

-- RLS Policies for children
CREATE POLICY "Users can manage their own children" ON public.children
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Structures can view children in their bookings" ON public.children
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.activities a ON b.activity_id = a.id
      JOIN public.structures s ON a.structure_id = s.id
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      WHERE b.child_id = children.id
    )
  );

-- RLS Policies for structures
CREATE POLICY "Structures visible to all authenticated users" ON public.structures
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Structures can manage their own data" ON public.structures
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'structure'
    )
  );

CREATE POLICY "Territory admins can manage structures in their territory" ON public.structures
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'territory_admin') AND
    territory_id = public.get_user_territory(auth.uid())
  );

-- RLS Policies for activities
CREATE POLICY "Activities visible to all authenticated users" ON public.activities
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Structures can manage their own activities" ON public.activities
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.structures s
      WHERE s.id = activities.structure_id
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.structures s
      WHERE s.id = activities.structure_id
    )
  );

-- RLS Policies for availability_slots
CREATE POLICY "Slots visible to all authenticated users" ON public.availability_slots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Structures can manage slots for their activities" ON public.availability_slots
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.activities a
      JOIN public.structures s ON a.structure_id = s.id
      WHERE a.id = availability_slots.activity_id
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings for their children" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Structures can view and manage bookings for their activities" ON public.bookings
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'structure') AND
    EXISTS (
      SELECT 1 FROM public.activities a
      JOIN public.structures s ON a.structure_id = s.id
      WHERE a.id = bookings.activity_id
    )
  );

-- RLS Policies for aids
CREATE POLICY "Aids visible to all authenticated users" ON public.aids
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage aids" ON public.aids
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'superadmin') OR
    public.has_role(auth.uid(), 'territory_admin')
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews visible to all authenticated users" ON public.reviews
  FOR SELECT TO authenticated
  USING (published_at IS NOT NULL);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.user_id = auth.uid()
        AND b.child_id = reviews.child_id
        AND b.activity_id = reviews.activity_id
        AND b.status = 'validee'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reports_metrics
CREATE POLICY "Territory admins can view metrics for their territory" ON public.reports_metrics
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'territory_admin') AND
    territory_id = public.get_user_territory(auth.uid())
  );

CREATE POLICY "Superadmins can view all metrics" ON public.reports_metrics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));