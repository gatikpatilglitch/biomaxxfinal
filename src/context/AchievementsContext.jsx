import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { soundFx } from '../utils/audioSynthesizer';

const AchievementsContext = createContext(null);

const STORAGE_KEY = 'biomaxxx_achievements_system_v1';

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);

const getFormattedDate = (dateStr = null) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// 10 Official BIOMAXXX Badges
const DEFAULT_BADGES = [
  {
    id: 'first_checkin',
    name: 'FIRST CHECK-IN',
    icon: '🌱',
    requirement: "Complete the user's first Guardian check.",
    description: 'Your first step toward staying connected with your health.',
    target: 1,
    unit: '',
    type: 'boolean',
    current: 1,
    qualifyingDates: ['2026-09-22'],
    completedActivities: 1,
    status: 'earned',
    earnedAt: 'Sep 22, 2026'
  },
  {
    id: 'guardian_7',
    name: 'GUARDIAN 7',
    icon: '🛡️',
    requirement: 'Check the Guardian section on 7 different days.',
    description: '7 days of staying connected with your health.',
    target: 7,
    unit: 'DAYS',
    type: 'unique_days',
    current: 5,
    qualifyingDates: ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'],
    completedActivities: 5,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'first_breath',
    name: 'FIRST BREATH',
    icon: '🌬️',
    requirement: 'Complete the first Breathe & Play session.',
    description: 'Your first step toward building a mindful breathing routine.',
    target: 1,
    unit: '',
    type: 'boolean',
    current: 1,
    qualifyingDates: ['2026-09-24'],
    completedActivities: 1,
    status: 'earned',
    earnedAt: 'Sep 24, 2026'
  },
  {
    id: 'calm_explorer',
    name: 'CALM EXPLORER',
    icon: '🌿',
    requirement: 'Complete 5 relaxation activities.',
    description: 'Complete 5 relaxation sessions across Breathe & Play, Mindful Maze, Color Calm, or Memory Match.',
    target: 5,
    unit: 'ACTIVITIES',
    type: 'count',
    current: 3,
    qualifyingDates: ['2026-09-24', '2026-09-25', '2026-09-26'],
    completedActivities: 3,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'mindful_routine',
    name: 'MINDFUL ROUTINE',
    icon: '🧘',
    requirement: 'Use at least one relaxation activity on 14 different days.',
    description: 'Small moments, repeated consistently.',
    target: 14,
    unit: 'DAYS',
    type: 'unique_days',
    current: 8,
    qualifyingDates: [
      '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-21', 
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'
    ],
    completedActivities: 11,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'air_aware',
    name: 'AIR AWARE',
    icon: '🌍',
    requirement: 'Check environmental conditions/AQI on 7 different days.',
    description: 'Stay aware of the environment around you.',
    target: 7,
    unit: 'DAYS',
    type: 'unique_days',
    current: 4,
    qualifyingDates: ['2026-09-22', '2026-09-24', '2026-09-25', '2026-09-26'],
    completedActivities: 4,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'first_sync',
    name: 'FIRST SYNC',
    icon: '⚡',
    requirement: 'Successfully connect and sync WHOOP for the first time.',
    description: 'Your wearable data is now connected to BIOMAXXX.',
    target: 1,
    unit: '',
    type: 'boolean',
    current: 1,
    qualifyingDates: ['2026-09-20'],
    completedActivities: 1,
    status: 'earned',
    earnedAt: 'Sep 20, 2026'
  },
  {
    id: 'sleep_observer',
    name: 'SLEEP OBSERVER',
    icon: '🌙',
    requirement: 'Review sleep data on 7 different days.',
    description: 'Start paying attention to your recovery rhythm.',
    target: 7,
    unit: 'DAYS',
    type: 'unique_days',
    current: 5,
    qualifyingDates: ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-25', '2026-09-26'],
    completedActivities: 5,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'routine_keeper',
    name: 'ROUTINE KEEPER',
    icon: '📋',
    requirement: 'Complete health tracking activities on 7 different days.',
    description: 'Consistency turns information into a routine.',
    target: 7,
    unit: 'DAYS',
    type: 'unique_days',
    current: 6,
    qualifyingDates: ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'],
    completedActivities: 9,
    status: 'in_progress',
    earnedAt: null
  },
  {
    id: 'health_guardian',
    name: 'HEALTH GUARDIAN',
    icon: '💠',
    requirement: 'Stay consistently engaged with BIOMAXXX for 30 different days.',
    description: '30 days of staying connected with your health.',
    target: 30,
    unit: 'DAYS',
    type: 'unique_days',
    current: 23,
    qualifyingDates: Array.from({ length: 23 }, (_, i) => {
      const d = new Date('2026-09-26');
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }),
    completedActivities: 47,
    status: 'in_progress',
    earnedAt: null
  }
];

export function AchievementsProvider({ children }) {
  const [badges, setBadges] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all 10 badges exist and preserve order
        return DEFAULT_BADGES.map(def => {
          const match = parsed.find(p => p.id === def.id);
          return match ? { ...def, ...match } : def;
        });
      }
    } catch (e) {
      console.warn('Failed to load achievements from localStorage:', e);
    }
    return DEFAULT_BADGES;
  });

  // Modal states
  const [unlockedBadge, setUnlockedBadge] = useState(null); // Triggers celebratory unlock modal
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState(null); // Triggers badge inspection modal

  // Save to localStorage whenever badges change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
    } catch (e) {
      console.warn('Failed to save achievements:', e);
    }
  }, [badges]);

  // Overall journey metrics
  const overallProgress = useMemo(() => {
    const earnedCount = badges.filter(b => b.status === 'earned').length;
    const totalCount = badges.length;
    const percent = Math.round((earnedCount / totalCount) * 100);
    return { earnedCount, totalCount, percent };
  }, [badges]);

  // Next to unlock: Unfinished badge with highest percentage progress toward completion
  const nextBadgeToUnlock = useMemo(() => {
    const unfinished = badges.filter(b => b.status !== 'earned');
    if (unfinished.length === 0) return null;

    // Sort by completion ratio descending
    const sorted = [...unfinished].sort((a, b) => {
      const ratioA = a.current / a.target;
      const ratioB = b.current / b.target;
      return ratioB - ratioA;
    });

    const candidate = sorted[0];
    const remaining = Math.max(1, candidate.target - candidate.current);
    const unitLabel = candidate.unit === 'DAYS' ? (remaining === 1 ? 'DAY' : 'DAYS') : (remaining === 1 ? 'ACTIVITY' : 'ACTIVITIES');
    const progressPercent = Math.min(100, Math.round((candidate.current / candidate.target) * 100));

    return {
      badge: candidate,
      remaining,
      remainingLabel: `${remaining} ${unitLabel} TO GO`,
      progressPercent
    };
  }, [badges]);

  // Segregated badge lists
  const earnedBadges = useMemo(() => badges.filter(b => b.status === 'earned'), [badges]);
  const upcomingBadges = useMemo(() => badges.filter(b => b.status !== 'earned'), [badges]);

  // Centralized action tracker with day deduplication
  const trackAction = useCallback((actionType, payload = {}) => {
    const today = getTodayDateStr();
    let justUnlocked = null;

    setBadges(prev => {
      let changed = false;

      const next = prev.map(badge => {
        let isAffected = false;
        let incrementCount = false;
        let isDayAction = false;

        switch (actionType) {
          case 'guardian_check':
            if (badge.id === 'first_checkin' || badge.id === 'guardian_7' || badge.id === 'health_guardian') {
              isAffected = true;
              isDayAction = true;
            }
            break;

          case 'air_aware':
            if (badge.id === 'air_aware' || badge.id === 'health_guardian') {
              isAffected = true;
              isDayAction = true;
            }
            break;

          case 'sleep_observer':
            if (badge.id === 'sleep_observer' || badge.id === 'health_guardian') {
              isAffected = true;
              isDayAction = true;
            }
            break;

          case 'relaxation_activity':
            if (payload?.game === 'breathe_and_play' && badge.id === 'first_breath') {
              isAffected = true;
            }
            if (badge.id === 'calm_explorer') {
              isAffected = true;
              incrementCount = true;
            }
            if (badge.id === 'mindful_routine' || badge.id === 'health_guardian') {
              isAffected = true;
              isDayAction = true;
            }
            break;

          case 'whoop_sync':
            if (badge.id === 'first_sync' || badge.id === 'health_guardian') {
              isAffected = true;
              if (badge.id === 'health_guardian') isDayAction = true;
            }
            break;

          case 'health_tracking':
            if (badge.id === 'routine_keeper' || badge.id === 'health_guardian') {
              isAffected = true;
              isDayAction = true;
            }
            break;

          default:
            break;
        }

        if (!isAffected) return badge;

        // Clone badge data
        const updatedDates = Array.isArray(badge.qualifyingDates) ? [...badge.qualifyingDates] : [];
        let updatedActivities = badge.completedActivities || 0;
        let updatedCurrent = badge.current || 0;
        let wasAlreadyEarned = badge.status === 'earned';

        if (incrementCount) {
          updatedActivities += 1;
          updatedCurrent = updatedActivities;
        }

        if (isDayAction) {
          if (!updatedDates.includes(today)) {
            updatedDates.push(today);
            if (badge.type === 'unique_days') {
              updatedCurrent = updatedDates.length;
            }
          }
          updatedActivities += 1;
        }

        if (badge.type === 'boolean') {
          updatedCurrent = 1;
        }

        // Determine if target is reached
        const targetReached = updatedCurrent >= badge.target;
        let nextStatus = wasAlreadyEarned ? 'earned' : (targetReached ? 'earned' : (updatedCurrent > 0 ? 'in_progress' : 'locked'));
        let earnedAt = badge.earnedAt;

        if (targetReached && !wasAlreadyEarned) {
          earnedAt = getFormattedDate();
          justUnlocked = { ...badge, current: updatedCurrent, status: 'earned', earnedAt };
          changed = true;
        } else if (updatedCurrent !== badge.current || updatedDates.length !== (badge.qualifyingDates?.length || 0)) {
          changed = true;
        }

        return {
          ...badge,
          current: updatedCurrent,
          qualifyingDates: updatedDates,
          completedActivities: updatedActivities,
          status: nextStatus,
          earnedAt
        };
      });

      return changed ? next : prev;
    });

    if (justUnlocked) {
      soundFx.playBadgeUnlockSound();
      setUnlockedBadge(justUnlocked);
    }
  }, []);

  const openBadgeDetail = useCallback((badge) => {
    soundFx.playPopSound(1.2);
    setSelectedBadgeDetail(badge);
  }, []);

  const closeBadgeDetail = useCallback(() => {
    setSelectedBadgeDetail(null);
  }, []);

  const dismissUnlockModal = useCallback(() => {
    soundFx.playPopSound(1.0);
    setUnlockedBadge(null);
  }, []);

  const viewUnlockedBadgeDetail = useCallback(() => {
    if (unlockedBadge) {
      setSelectedBadgeDetail(unlockedBadge);
      setUnlockedBadge(null);
    }
  }, [unlockedBadge]);

  // Global event listener for decoupled tracking from anywhere
  useEffect(() => {
    const handleGlobalEvent = (e) => {
      if (e?.detail?.action) {
        trackAction(e.detail.action, e.detail.payload || {});
      }
    };
    window.addEventListener('biomaxxx_achievement_action', handleGlobalEvent);
    return () => window.removeEventListener('biomaxxx_achievement_action', handleGlobalEvent);
  }, [trackAction]);

  return (
    <AchievementsContext.Provider
      value={{
        badges,
        overallProgress,
        nextBadgeToUnlock,
        earnedBadges,
        upcomingBadges,
        trackAction,
        unlockedBadge,
        dismissUnlockModal,
        viewUnlockedBadgeDetail,
        selectedBadgeDetail,
        openBadgeDetail,
        closeBadgeDetail
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}

export const dispatchAchievementAction = (action, payload = {}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('biomaxxx_achievement_action', { detail: { action, payload } }));
  }
};

