-- Seed May-2026 scheme sheet into authoritative DB.
-- Source: Onepager May-2026 image shared in chat.
-- Safe to run multiple times.

BEGIN;

-- 1) Insert schemes for all active Pixel models if not already present for May-2026.
WITH models AS (
  SELECT id, name
  FROM public.mobile_models
),
seed AS (
  SELECT
    m.id AS model_id,
    'published'::scheme_status AS status,
    v.mop::numeric(10,2) AS mop,
    v.dealer_landing::numeric(10,2) AS dealer_landing,
    v.consumer_offer_gst::numeric(10,2) AS consumer_offer_gst,
    NULL::text AS consumer_offer_note,
    v.cashback_hdfc_emi::numeric(10,2) AS cashback_hdfc_emi,
    v.cashback_hdfc_full::numeric(10,2) AS cashback_hdfc_full,
    v.min_swipe::numeric(10,2) AS min_swipe,
    v.max_swipe::numeric(10,2) AS max_swipe,
    v.swipe_type::swipe_type AS swipe_type,
    v.emi_months::text[] AS emi_months,
    DATE '2026-05-01' AS valid_from,
    DATE '2026-05-31' AS valid_to,
    'Seeded from May-2026 onepager sheet.'::text AS notes,
    NULL::uuid AS created_by
  FROM models m
  JOIN (
    VALUES
      -- model_name, mop, dealer_landing, consumer_offer_gst, hdfc_emi, hdfc_full, min_swipe, max_swipe, swipe_type, emi_months
      ('Pixel 9a',       49999,  46999,  847,  3000,    0,  25999,  49999, 'NCEMI',             ARRAY['6']::text[]),
      ('Pixel 10',       79999,  75199,  423,  5000, 4000,  48749,  79999, 'Full Swipe/NCEMI', ARRAY['6','9','12']::text[]),
      ('Pixel 10 Pro',  109999, 103399,    0, 10000, 8000,  71499, 109999, 'Full Swipe/NCEMI', ARRAY['6','9','12']::text[]),
      ('Pixel 10 Pro XL',124999, 117499,    0, 10000, 8000,  81249, 124999, 'Full Swipe/NCEMI', ARRAY['6','9','12']::text[]),
      ('Pixel 10 Pro Fold',172999,162619,   0, 10000, 8000, 112449, 172999, 'Full Swipe/NCEMI', ARRAY['6','9','12']::text[]),
      ('Pixel 10a',      49999,  46999,    0,  2000, 1000,  32499,  49999, 'Full Swipe/NCEMI', ARRAY['5']::text[])
  ) AS v(model_name, mop, dealer_landing, consumer_offer_gst, cashback_hdfc_emi, cashback_hdfc_full, min_swipe, max_swipe, swipe_type, emi_months)
    ON v.model_name = m.name
)
INSERT INTO public.schemes (
  model_id,
  status,
  mop,
  dealer_landing,
  consumer_offer_gst,
  consumer_offer_note,
  cashback_hdfc_emi,
  cashback_hdfc_full,
  min_swipe,
  max_swipe,
  swipe_type,
  emi_months,
  valid_from,
  valid_to,
  notes,
  created_by
)
SELECT s.*
FROM seed s
WHERE NOT EXISTS (
  SELECT 1
  FROM public.schemes x
  WHERE x.model_id = s.model_id
    AND x.valid_from = s.valid_from
    AND x.valid_to = s.valid_to
);

-- 2) Insert exchange offers for Pixel 10 series + 10a (Servify + Cashify), if missing.
WITH may_schemes AS (
  SELECT s.id AS scheme_id, m.name
  FROM public.schemes s
  JOIN public.mobile_models m ON m.id = s.model_id
  WHERE s.valid_from = DATE '2026-05-01'
    AND s.valid_to = DATE '2026-05-31'
),
exchange_seed AS (
  SELECT
    ms.scheme_id,
    e.platform,
    e.bonus_label,
    e.tier_3_10k::numeric(10,2) AS tier_3_10k,
    e.tier_10_15k::numeric(10,2) AS tier_10_15k,
    e.tier_15k_plus::numeric(10,2) AS tier_15k_plus
  FROM may_schemes ms
  JOIN (
    VALUES
      -- model_name, platform, label, 3k-10k, 10k-15k, 15k+
      ('Pixel 10',          'Servify', 'Exchange bonus (10 series)', 5000, 5000, 5000),
      ('Pixel 10 Pro',      'Servify', 'Exchange bonus (10 series)', 5000, 5000, 5000),
      ('Pixel 10 Pro XL',   'Servify', 'Exchange bonus (10 series)', 5000, 5000, 5000),
      ('Pixel 10 Pro Fold', 'Servify', 'Exchange bonus (10 series)', 5000, 5000, 5000),
      ('Pixel 10a',         'Servify', 'Exchange bonus (10a)',       1000, 1000, 1000),

      ('Pixel 10',          'Cashify', 'Exchange bonus (10 series)', 5000, 6000, 7000),
      ('Pixel 10 Pro',      'Cashify', 'Exchange bonus (10 series)', 5000, 6000, 7000),
      ('Pixel 10 Pro XL',   'Cashify', 'Exchange bonus (10 series)', 5000, 6000, 7000),
      ('Pixel 10 Pro Fold', 'Cashify', 'Exchange bonus (10 series)', 5000, 6000, 7000),
      ('Pixel 10a',         'Cashify', 'Exchange bonus (10a)',       1000, 1000, 1000)
  ) AS e(model_name, platform, bonus_label, tier_3_10k, tier_10_15k, tier_15k_plus)
    ON e.model_name = ms.name
)
INSERT INTO public.exchange_offers (
  scheme_id,
  platform,
  bonus_label,
  tier_3_10k,
  tier_10_15k,
  tier_15k_plus
)
SELECT e.*
FROM exchange_seed e
WHERE NOT EXISTS (
  SELECT 1
  FROM public.exchange_offers x
  WHERE x.scheme_id = e.scheme_id
    AND lower(x.platform) = lower(e.platform)
    AND COALESCE(x.bonus_label, '') = COALESCE(e.bonus_label, '')
);

-- 3) Insert finance schemes for all May-2026 schemes (same partner options across models), if missing.
WITH may_schemes AS (
  SELECT s.id AS scheme_id
  FROM public.schemes s
  WHERE s.valid_from = DATE '2026-05-01'
    AND s.valid_to = DATE '2026-05-31'
),
finance_seed AS (
  SELECT
    ms.scheme_id,
    f.partner::finance_partner AS partner,
    f.tenure_options,
    2.00::numeric(5,2) AS dealer_charge_pct,
    f.notes
  FROM may_schemes ms
  CROSS JOIN (
    VALUES
      ('Bajaj Finance', '9/0,12/0,15/0,18/0,24/0,24/1,24/2,24/3,18/1,18/2,18/3,18/4,18/6,15/3,21/0,21/3,24/4,24/8,30/6,36/12', 'Dealer charge 2.0% (paid by retailer to financier directly).'),
      ('IDFC Paper Finance', '6/0,9/0,12/0,15/0,18/0,24/0,24/1,24/2,24/3,18/1,18/2,18/3,18/6,9/3,12/3,15/3', 'Dealer charge 2.0% (paid by retailer to financier directly).'),
      ('TVS Credit', '9/0,12/0,18/0,24/0,24/1,24/2,24/3,24/4,15/3,18/6,24/8', 'Dealer charge 2.0% (paid by retailer to financier directly).')
  ) AS f(partner, tenure_options, notes)
)
INSERT INTO public.finance_schemes (
  scheme_id,
  partner,
  tenure_options,
  dealer_charge_pct,
  notes
)
SELECT f.*
FROM finance_seed f
WHERE NOT EXISTS (
  SELECT 1
  FROM public.finance_schemes x
  WHERE x.scheme_id = f.scheme_id
    AND x.partner = f.partner
);

COMMIT;
