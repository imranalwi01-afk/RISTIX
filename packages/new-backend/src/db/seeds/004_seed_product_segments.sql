-- =====================================================================
-- Product Segments Seed Data
-- =====================================================================
-- Purpose: Seed product segmentation configuration for IAF tenant
-- Schema: ifrs9.product_segments
-- =====================================================================

-- Seed product segments for IAF tenant
INSERT INTO ifrs9.product_segments (
    tenant_id,
    group_segment,
    segment,
    sub_segment,
    segment_type,
    is_active,
    display_order
) VALUES
-- EAD Segments
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'EAD Factoring', 'EAD Factoring', 'EAD Factoring', 'EAD Segment', true, 1),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'EAD Lending All Segment', 'EAD Lending All Segment', 'EAD Lending All Segment', 'EAD Segment', true, 2),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'EAD Repo', 'EAD Repo', 'EAD Repo', 'EAD Segment', true, 3),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'EAD Treasury', 'EAD Treasury', 'EAD Treasury', 'EAD Segment', true, 4),

-- LGD Segments
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'LGD Factoring', 'LGD Factoring', 'LGD Factoring', 'LGD Segment', true, 5),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'LGD Lending All Segment', 'LGD Lending All Segment', 'LGD Lending All Segment', 'LGD Segment', true, 6),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'LGD Repo', 'LGD Repo', 'LGD Repo', 'LGD Segment', true, 7),
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'LGD Treasury', 'LGD Treasury', 'LGD Treasury', 'LGD Segment', true, 8),

-- PD Segments
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'PD Factoring', 'PD Factoring', 'PD Factoring', 'PD Segment', true, 9),

-- Portfolio Segments
('f7b3a087-8a42-40c4-baca-9dc92cc0a2be', 'Factoring', 'Factoring', 'Factoring', 'Portfolio Segment', true, 10)

ON CONFLICT (tenant_id, group_segment, segment, sub_segment) DO NOTHING;

SELECT 'SUCCESS: Product segments seeded!' as result;
