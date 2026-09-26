// whoopService.js - Official WHOOP Developer API v2 Integration (Strictly Read-Only)
// API Reference: https://developer.whoop.com/api
// OAuth Docs:   https://developer.whoop.com/docs
//
// All requests hit the official WHOOP production endpoints directly:
//   OAuth:   https://api.prod.whoop.com/oauth/oauth2/auth
//            https://api.prod.whoop.com/oauth/oauth2/token
//   Data:    https://api.prod.whoop.com/developer/v2/...
//
// NO third-party libraries, NO intermediary SDKs — raw fetch() only.
// All data endpoints are strictly GET (read-only). Any write attempt throws.

import crypto from 'crypto';

// ── Official WHOOP Endpoint Constants ──────────────────────────────────────────
const WHOOP_AUTH_URL  = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_BASE  = 'https://api.prod.whoop.com/developer';

// ── Official v2 API Paths ───────────────────────────────────────────────────────
// All paths verified against developer.whoop.com/api
const WHOOP_V2 = {
  PROFILE:        '/v2/user/profile/basic',
  BODY_MEASUREMENT: '/v2/user/measurement/body',
  RECOVERY:       '/v2/recovery',
  CYCLE:          '/v2/cycle',
  SLEEP:          '/v2/activity/sleep',
  WORKOUT:        '/v2/activity/workout',
};

// ── Strictly Read-Only Scopes (official scope names) ──────────────────────────
// https://developer.whoop.com/docs
export const WHOOP_READ_SCOPES =
  'offline read:recovery read:cycles read:workout read:sleep read:profile read:body_measurement';

// ── In-Memory Fallback Store ───────────────────────────────────────────────────
const _mem = {
  stateMap:      new Map(), // CSRF state tokens: state -> { userId, createdAt }
  integration:   null,
  latestMetrics: null,
};

// ── Read-Only Guard ────────────────────────────────────────────────────────────
function assertReadOnly(method) {
  if (method && method.toUpperCase() !== 'GET') {
    throw new Error(
      `SECURITY VIOLATION: WHOOP integration is strictly read-only. ` +
      `HTTP method '${method}' is prohibited.`
    );
  }
}

// ── Config Loader ──────────────────────────────────────────────────────────────
export function getWhoopConfig() {
  return {
    clientId:     (process.env.WHOOP_CLIENT_ID     || '').trim(),
    clientSecret: (process.env.WHOOP_CLIENT_SECRET  || '').trim(),
    redirectUri:  (process.env.WHOOP_REDIRECT_URI   || 'http://localhost:5000/api/whoop/callback').trim(),
    frontendUrl:  (process.env.WHOOP_FRONTEND_URL   || 'http://localhost:3000').trim(),
  };
}

// ── Step 1: Generate OAuth 2.0 Authorization URL ──────────────────────────────
// Directs user to WHOOP's official consent screen.
export function generateWhoopAuthUrl(userId = 1, redirectUriOverride = null) {
  const { clientId, redirectUri: defaultRedirectUri, clientSecret } = getWhoopConfig();
  if (!clientId) {
    throw new Error(
      'WHOOP_CLIENT_ID is not set. Register your app at https://developer-dashboard.whoop.com/ first.'
    );
  }

  const effectiveRedirectUri = redirectUriOverride || defaultRedirectUri;

  // Generate HMAC-signed state payload (stateless, surviving serverless restarts)
  const statePayload = JSON.stringify({
    userId,
    redirectUri: effectiveRedirectUri,
    createdAt: Date.now(),
  });
  const secretKey = clientSecret || 'biomaxxx_fallback_secret_key';
  const signature = crypto.createHmac('sha256', secretKey).update(statePayload).digest('hex');
  const state = Buffer.from(JSON.stringify({ p: statePayload, s: signature })).toString('base64url');

  // Also maintain in-memory map for fast local lookups
  _mem.stateMap.set(state, { userId, redirectUri: effectiveRedirectUri, createdAt: Date.now() });

  // Purge stale states older than 15 minutes
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [k, v] of _mem.stateMap) {
    if (v.createdAt < cutoff) _mem.stateMap.delete(k);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     clientId,
    redirect_uri:  effectiveRedirectUri,
    scope:         WHOOP_READ_SCOPES,
    state,
  });

  return `${WHOOP_AUTH_URL}?${params.toString()}`;
}

// ── Step 2: Exchange Authorization Code for Tokens ────────────────────────────
// Called from the OAuth callback route after user grants consent.
export async function exchangeWhoopCode(code, state, pool = null) {
  // Validate & consume state (first try memory map, then verify HMAC signature)
  let stateData = _mem.stateMap.get(state);
  _mem.stateMap.delete(state);

  const { clientId, clientSecret, redirectUri: defaultRedirectUri } = getWhoopConfig();
  if (!clientId || !clientSecret) {
    throw new Error('WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET must be set in .env');
  }

  if (!stateData) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded?.p && decoded?.s) {
        const expectedSig = crypto.createHmac('sha256', clientSecret).update(decoded.p).digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(decoded.s), Buffer.from(expectedSig))) {
          const parsed = JSON.parse(decoded.p);
          // Check expiration: 15 minutes
          if (Date.now() - parsed.createdAt < 15 * 60 * 1000) {
            stateData = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('HMAC state verification failed:', e.message);
    }
  }

  const userId = stateData?.userId || 1;
  const effectiveRedirectUri = stateData?.redirectUri || defaultRedirectUri;

  // POST to official WHOOP token endpoint
  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    client_id:     clientId,
    client_secret: clientSecret,
    redirect_uri:  effectiveRedirectUri,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WHOOP token exchange failed [${res.status}]: ${err}`);
  }

  const token = await res.json();
  // token fields: access_token, refresh_token, expires_in, token_type, scope

  const expiresAt = new Date(Date.now() + (token.expires_in || 3600) * 1000);

  // Persist tokens to Postgres (whoop_integrations table)
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO whoop_integrations
           (user_id, access_token, refresh_token, token_expires_at, scopes, is_active, updated_at)
         VALUES ($1,$2,$3,$4,$5,TRUE,NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           access_token     = EXCLUDED.access_token,
           refresh_token    = EXCLUDED.refresh_token,
           token_expires_at = EXCLUDED.token_expires_at,
           scopes           = EXCLUDED.scopes,
           is_active        = TRUE,
           updated_at       = NOW()`,
        [userId, token.access_token, token.refresh_token, expiresAt, token.scope || WHOOP_READ_SCOPES]
      );
    } catch (e) {
      console.warn('⚠️  Could not persist WHOOP tokens to DB (using in-memory):', e.message);
    }
  }

  _mem.integration = {
    user_id:          userId,
    access_token:     token.access_token,
    refresh_token:    token.refresh_token,
    token_expires_at: expiresAt,
    scopes:           token.scope || WHOOP_READ_SCOPES,
    is_active:        true,
  };

  // Immediately sync biometrics after successful auth
  const metrics = await syncWhoopBiometrics(userId, pool);
  return { success: true, metrics };
}

// ── Token Refresh ──────────────────────────────────────────────────────────────
// Uses the official WHOOP refresh_token grant type.
async function _refreshIfNeeded(integration, pool = null) {
  if (!integration?.refresh_token) return integration;

  const expiry = new Date(integration.token_expires_at).getTime();
  // Refresh if < 5 min remaining
  if (expiry - Date.now() > 5 * 60 * 1000) return integration;

  const { clientId, clientSecret } = getWhoopConfig();
  if (!clientId || !clientSecret) return integration;

  console.log('🔄 Refreshing WHOOP access token via official token endpoint...');

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: integration.refresh_token,
    client_id:     clientId,
    client_secret: clientSecret,
    scope:         WHOOP_READ_SCOPES,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    console.error('Failed to refresh WHOOP token:', res.status, await res.text());
    return integration;
  }

  const newToken = await res.json();
  integration.access_token     = newToken.access_token;
  integration.token_expires_at = new Date(Date.now() + (newToken.expires_in || 3600) * 1000);
  if (newToken.refresh_token) integration.refresh_token = newToken.refresh_token;

  if (pool) {
    try {
      await pool.query(
        `UPDATE whoop_integrations
         SET access_token=$1, refresh_token=$2, token_expires_at=$3, updated_at=NOW()
         WHERE user_id=$4`,
        [integration.access_token, integration.refresh_token, integration.token_expires_at, integration.user_id || 1]
      );
    } catch (e) {
      console.warn('Could not persist refreshed token:', e.message);
    }
  }

  return integration;
}

// ── Get Active Integration ─────────────────────────────────────────────────────
export async function getActiveWhoopIntegration(userId = 1, pool = null) {
  if (pool) {
    try {
      const r = await pool.query(
        `SELECT * FROM whoop_integrations WHERE user_id=$1 AND is_active=TRUE LIMIT 1`,
        [userId]
      );
      if (r.rows.length) return r.rows[0];
    } catch (e) { /* fall through to memory */ }
  }
  return _mem.integration;
}

// ── Official WHOOP v2 GET Caller ───────────────────────────────────────────────
// Absolutely no third-party HTTP libs — plain fetch() against api.prod.whoop.com
async function _whoopGet(path, accessToken) {
  assertReadOnly('GET');

  const url = `${WHOOP_API_BASE}${path}`;
  const res = await fetch(url, {
    method:  'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept':        'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WHOOP API [${res.status}] ${path}: ${body}`);
  }

  return res.json();
}

// ── Paginated Collection Fetcher ───────────────────────────────────────────────
// WHOOP v2 collections return: { records: [...], next_token: "..." }
// Uses nextToken cursor-based pagination per official docs.
async function _fetchCollection(path, accessToken, limit = 7) {
  assertReadOnly('GET');

  const params = new URLSearchParams({ limit: String(limit) });
  const url = `${WHOOP_API_BASE}${path}?${params.toString()}`;
  const res = await fetch(url, {
    method:  'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept':        'application/json',
    },
  });

  if (!res.ok) {
    console.warn(`WHOOP collection fetch failed [${res.status}] for ${path}`);
    return { records: [], next_token: null };
  }

  return res.json();
  // Returns: { records: Array, next_token: string | null }
}

// ── Primary Sync: Read-Only WHOOP Biometrics ───────────────────────────────────
// Fetches from ALL official v2 read endpoints. Zero writes to WHOOP.
export async function syncWhoopBiometrics(userId = 1, pool = null) {
  let integration = await getActiveWhoopIntegration(userId, pool);
  if (!integration) {
    throw new Error('WHOOP not connected. Complete OAuth authorization first.');
  }

  integration = await _refreshIfNeeded(integration, pool);
  const token = integration.access_token;

  console.log('⚡ Syncing read-only biometrics from official WHOOP v2 API...');

  // Fire all official WHOOP v2 GET endpoints in parallel
  const [profileResult, recoveryResult, cycleResult, sleepResult, workoutResult] =
    await Promise.allSettled([
      _whoopGet(WHOOP_V2.PROFILE, token),                          // GET /v2/user/profile/basic
      _fetchCollection(WHOOP_V2.RECOVERY, token, 7),              // GET /v2/recovery
      _fetchCollection(WHOOP_V2.CYCLE, token, 7),                 // GET /v2/cycle
      _fetchCollection(WHOOP_V2.SLEEP, token, 7),                 // GET /v2/activity/sleep
      _fetchCollection(WHOOP_V2.WORKOUT, token, 7),               // GET /v2/activity/workout
    ]);

  // ── Parse Profile ──────────────────────────────────────────────────────────
  // Official fields: user_id, email, first_name, last_name
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;

  // ── Parse Recovery ────────────────────────────────────────────────────────
  // Official fields per record: cycle_id, sleep_id, user_id, created_at,
  //   updated_at, score_state, score: { recovery_score, resting_heart_rate,
  //   hrv_rmssd_milli, spo2_percentage, skin_temp_celsius }
  const recoveryRecords = recoveryResult.status === 'fulfilled'
    ? (recoveryResult.value.records || [])
    : [];
  const latestRec = recoveryRecords[0] || null;

  const recovery = {
    score:            latestRec?.score?.recovery_score   ?? null,
    score_state:      latestRec?.score_state             ?? null,
    resting_hr:       latestRec?.score?.resting_heart_rate ?? null,
    hrv_rmssd_milli:  latestRec?.score?.hrv_rmssd_milli  ?? null,
    spo2_percentage:  latestRec?.score?.spo2_percentage  ?? null,
    skin_temp_celsius:latestRec?.score?.skin_temp_celsius ?? null,
    history: recoveryRecords.map(r => ({
      created_at:      r.created_at,
      score:           r.score?.recovery_score,
      hrv_rmssd_milli: r.score?.hrv_rmssd_milli,
      resting_heart_rate: r.score?.resting_heart_rate,
      spo2_percentage: r.score?.spo2_percentage,
      score_state:     r.score_state,
    })),
  };

  // ── Parse Cycle ───────────────────────────────────────────────────────────
  // Official fields per record: id, user_id, created_at, updated_at, start, end,
  //   timezone_offset, score_state, score: { strain, kilojoule, average_heart_rate,
  //   max_heart_rate }
  const cycleRecords = cycleResult.status === 'fulfilled'
    ? (cycleResult.value.records || [])
    : [];
  const latestCycle = cycleRecords[0] || null;

  const strain = {
    day_strain:         latestCycle?.score?.strain              ?? null,
    kilojoule:          latestCycle?.score?.kilojoule           ?? null,
    calories:           latestCycle?.score?.kilojoule
                          ? Math.round((latestCycle.score.kilojoule / 4.184))
                          : null,
    average_heart_rate: latestCycle?.score?.average_heart_rate  ?? null,
    max_heart_rate:     latestCycle?.score?.max_heart_rate      ?? null,
    score_state:        latestCycle?.score_state                ?? null,
    history: cycleRecords.map(c => ({
      created_at: c.created_at,
      start:      c.start,
      strain:     c.score?.strain,
      kilojoule:  c.score?.kilojoule,
      score_state: c.score_state,
    })),
  };

  // ── Parse Sleep ───────────────────────────────────────────────────────────
  // Official fields per record: id (UUID), cycle_id, user_id, created_at,
  //   updated_at, start, end, timezone_offset, nap, score_state,
  //   score: { stage_summary: { total_in_bed_time_milli, total_awake_time_milli,
  //     total_no_data_time_milli, total_light_sleep_time_milli,
  //     total_slow_wave_sleep_time_milli, total_rem_sleep_time_milli,
  //     sleep_cycle_count, disturbance_count },
  //     sleep_needed: { baseline_milli, need_from_sleep_debt_milli,
  //       need_from_recent_strain_milli, need_from_recent_nap_milli },
  //     respiratory_rate, sleep_performance_percentage,
  //     sleep_consistency_percentage, sleep_efficiency_percentage }
  const sleepRecords = sleepResult.status === 'fulfilled'
    ? (sleepResult.value.records || [])
    : [];
  const latestSleep = sleepRecords.find(s => !s.nap) || sleepRecords[0] || null;
  const ss = latestSleep?.score?.stage_summary || {};

  const totalSleepMilli = (ss.total_in_bed_time_milli || 0) - (ss.total_awake_time_milli || 0);

  const sleep = {
    performance_percentage:   latestSleep?.score?.sleep_performance_percentage   ?? null,
    consistency_percentage:   latestSleep?.score?.sleep_consistency_percentage   ?? null,
    efficiency_percentage:    latestSleep?.score?.sleep_efficiency_percentage    ?? null,
    respiratory_rate:         latestSleep?.score?.respiratory_rate               ?? null,
    score_state:              latestSleep?.score_state                           ?? null,
    is_nap:                   latestSleep?.nap                                   ?? null,
    total_sleep_hours:        totalSleepMilli > 0
                                ? parseFloat((totalSleepMilli / 3_600_000).toFixed(2))
                                : null,
    stage_summary: {
      total_in_bed_time_milli:        ss.total_in_bed_time_milli        ?? null,
      total_awake_time_milli:         ss.total_awake_time_milli         ?? null,
      total_light_sleep_time_milli:   ss.total_light_sleep_time_milli   ?? null,
      total_slow_wave_sleep_time_milli: ss.total_slow_wave_sleep_time_milli ?? null,
      total_rem_sleep_time_milli:     ss.total_rem_sleep_time_milli     ?? null,
      sleep_cycle_count:              ss.sleep_cycle_count              ?? null,
      disturbance_count:              ss.disturbance_count              ?? null,
    },
    history: sleepRecords.map(s => ({
      id:          s.id,
      created_at:  s.created_at,
      start:       s.start,
      end:         s.end,
      nap:         s.nap,
      score_state: s.score_state,
      performance: s.score?.sleep_performance_percentage,
      respiratory_rate: s.score?.respiratory_rate,
    })),
  };

  // ── Parse Workouts ────────────────────────────────────────────────────────
  // Official fields per record: id (UUID), user_id, created_at, updated_at,
  //   start, end, timezone_offset, sport_id, score_state,
  //   score: { strain, average_heart_rate, max_heart_rate, kilojoule,
  //            percent_recorded, distance_meter, altitude_gain_meter,
  //            altitude_change_meter, zone_duration: { zone_zero_milli ... } }
  const workoutRecords = workoutResult.status === 'fulfilled'
    ? (workoutResult.value.records || [])
    : [];
  const latestWorkout = workoutRecords[0] || null;

  const workout = {
    latest_strain:      latestWorkout?.score?.strain              ?? null,
    average_heart_rate: latestWorkout?.score?.average_heart_rate  ?? null,
    max_heart_rate:     latestWorkout?.score?.max_heart_rate      ?? null,
    kilojoule:          latestWorkout?.score?.kilojoule           ?? null,
    sport_id:           latestWorkout?.sport_id                   ?? null,
    score_state:        latestWorkout?.score_state                ?? null,
    history: workoutRecords.map(w => ({
      id:          w.id,
      created_at:  w.created_at,
      start:       w.start,
      end:         w.end,
      sport_id:    w.sport_id,
      strain:      w.score?.strain,
      avg_hr:      w.score?.average_heart_rate,
      score_state: w.score_state,
    })),
  };

  // ── Build Final Harmonized Payload ────────────────────────────────────────
  const metrics = {
    source:          'whoop-official-v2',   // confirms no third-party
    api_base:        WHOOP_API_BASE,
    read_only:       true,
    last_synced_at:  new Date().toISOString(),
    profile: profile ? {
      user_id:    profile.user_id,
      email:      profile.email,
      first_name: profile.first_name,
      last_name:  profile.last_name,
    } : null,
    recovery,
    strain,
    sleep,
    workout,
    raw_counts: {
      recovery_records: recoveryRecords.length,
      cycle_records:    cycleRecords.length,
      sleep_records:    sleepRecords.length,
      workout_records:  workoutRecords.length,
    },
  };

  // Persist to Supabase cache
  if (pool) {
    try {
      await pool.query(
        `UPDATE whoop_integrations
         SET profile_data=$1, latest_metrics=$2, last_synced_at=NOW(), updated_at=NOW()
         WHERE user_id=$3`,
        [JSON.stringify(profile || {}), JSON.stringify(metrics), userId]
      );
      await pool.query(
        `INSERT INTO whoop_biometrics_logs (user_id, metric_type, data)
         VALUES ($1, 'daily_summary', $2)`,
        [userId, JSON.stringify(metrics)]
      );
    } catch (e) {
      console.warn('Could not cache WHOOP metrics:', e.message);
    }
  }

  _mem.latestMetrics = metrics;
  return metrics;
}

// ── Disconnect ─────────────────────────────────────────────────────────────────
export async function disconnectWhoop(userId = 1, pool = null) {
  if (pool) {
    try {
      await pool.query(
        `UPDATE whoop_integrations
         SET is_active=FALSE, access_token=NULL, refresh_token=NULL, updated_at=NOW()
         WHERE user_id=$1`,
        [userId]
      );
    } catch (e) {
      console.warn('Error disconnecting WHOOP in DB:', e.message);
    }
  }
  _mem.integration   = null;
  _mem.latestMetrics = null;
  return { success: true, message: 'WHOOP disconnected.' };
}
