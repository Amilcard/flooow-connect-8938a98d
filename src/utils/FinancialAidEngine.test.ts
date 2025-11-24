import { describe, it, expect } from 'vitest';
import { calculateAllAids, SimulationContext } from './FinancialAidEngine';

describe('FinancialAidEngine', () => {
  it('should calculate PassSport for eligible child', () => {
    const ctx: SimulationContext = {
      age: 10,
      qf: 600,
      cityCode: '75000',
      activityPrice: 200,
      activityType: 'sport'
    };
    const aids = calculateAllAids(ctx);
    const passSport = aids.find(a => a.id === 'pass_sport');
    expect(passSport).toBeDefined();
    expect(passSport?.amount).toBe(50);
  });

  it('should NOT calculate PassSport if QF too high', () => {
    const ctx: SimulationContext = {
      age: 10,
      qf: 900,
      cityCode: '75000',
      activityPrice: 200,
      activityType: 'sport'
    };
    const aids = calculateAllAids(ctx);
    const passSport = aids.find(a => a.id === 'pass_sport');
    expect(passSport).toBeUndefined();
  });

  it('should calculate PassRegion for 16yo in sport', () => {
    const ctx: SimulationContext = {
      age: 16,
      qf: 1000,
      cityCode: '69000',
      activityPrice: 200,
      activityType: 'sport'
    };
    const aids = calculateAllAids(ctx);
    const passRegion = aids.find(a => a.id === 'pass_region');
    expect(passRegion).toBeDefined();
    expect(passRegion?.amount).toBe(30);
  });

  it('should calculate CAF Loire Temps Libre for 42 department', () => {
    const ctx: SimulationContext = {
      age: 10,
      qf: 500,
      cityCode: '42000', // St Etienne
      activityPrice: 200,
      activityType: 'sport'
    };
    const aids = calculateAllAids(ctx);
    const cafLoire = aids.find(a => a.id === 'caf_loire_temps_libre');
    expect(cafLoire).toBeDefined();
    // QF 500 -> Tranche 351-550 -> 60€
    expect(cafLoire?.amount).toBe(60);
  });

  it('should calculate St Etienne Social Tariff', () => {
    const ctx: SimulationContext = {
      age: 10,
      qf: 300, // Tranche A
      cityCode: '42000',
      activityPrice: 200,
      activityType: 'culture'
    };
    const aids = calculateAllAids(ctx);
    const tarifSocial = aids.find(a => a.id === 'tarifs_sociaux_st_etienne');
    expect(tarifSocial).toBeDefined();
    // Culture Tranche A -> 70€
    expect(tarifSocial?.amount).toBe(70);
  });

  it('should accumulate multiple aids', () => {
    const ctx: SimulationContext = {
      age: 10,
      qf: 300,
      cityCode: '42000', // St Etienne
      activityPrice: 300,
      activityType: 'sport'
    };
    const aids = calculateAllAids(ctx);
    
    // Should have:
    // 1. Pass'Sport (50€)
    // 2. CAF Loire (80€ for QF<=350)
    // 3. Cheques Loisirs 42 (30€)
    // 4. Tarif Social St Etienne (60€ for Sport Tranche A)
    
    expect(aids.find(a => a.id === 'pass_sport')).toBeDefined();
    expect(aids.find(a => a.id === 'caf_loire_temps_libre')).toBeDefined();
    expect(aids.find(a => a.id === 'cheques_loisirs_42')).toBeDefined();
    expect(aids.find(a => a.id === 'tarifs_sociaux_st_etienne')).toBeDefined();
    expect(aids.find(a => a.id === 'tarif_social_interne')).toBeDefined();
    
    const total = aids.reduce((sum, a) => sum + a.amount, 0);
    expect(total).toBe(50 + 80 + 30 + 60 + 15); // 235€
  });
});
