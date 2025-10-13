/**
 * Test data fixtures for E2E tests
 */

export const testParents = {
  express: {
    email: 'parent.express@test.inklusif.fr',
    password: 'TestPass123!',
    profile: {
      first_name: 'Marie',
      last_name: 'Dupont',
    },
  },
  full: {
    email: 'parent.full@test.inklusif.fr',
    password: 'TestPass123!',
    profile: {
      first_name: 'Jean',
      last_name: 'Martin',
      phone: '+33612345678',
      address: '15 rue de la République, 69001 Lyon',
    },
  },
};

export const testChildren = {
  minimal: {
    first_name: 'Lucas',
    dob: '2015-03-15',
  },
  withNeeds: {
    first_name: 'Emma',
    dob: '2014-08-22',
    accessibility_flags: {
      wheelchair: true,
      hearing_impaired: false,
      visual_impaired: false,
    },
    needs_json: {
      medical_notes: 'Allergie aux arachides',
      special_requirements: 'Nécessite accompagnant',
    },
  },
  teen: {
    first_name: 'Sophie',
    dob: '2010-06-10',
    email: 'sophie.martin@test.inklusif.fr',
  },
};

export const testActivities = {
  tennis: {
    title: 'Tennis - TC Villeurbannais',
    structure_name: 'Tennis Club de Villeurbanne',
    expected_price: 180,
    expected_category: 'Sport',
  },
};

export const testSlots = {
  available: {
    // Slot dans le futur pour tests
    start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
    seats_remaining: 5,
  },
  almostFull: {
    start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 jours
    seats_remaining: 1,
  },
};

export const testAids = {
  caf: {
    type: 'CAF',
    amount: 50,
    reference: 'CAF123456',
  },
  passSport: {
    type: 'PassSport',
    amount: 30,
    reference: 'PS789012',
  },
};

export const generateIdempotencyKey = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};
