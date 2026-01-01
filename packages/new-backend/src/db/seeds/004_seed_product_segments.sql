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
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'EAD Factoring', 'EAD Factoring', 'EAD Factoring', 'EAD Segment', true, 1),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'EAD Lending All Segment', 'EAD Lending All Segment', 'EAD Lending All Segment', 'EAD Segment', true, 2),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'EAD Repo', 'EAD Repo', 'EAD Repo', 'EAD Segment', true, 3),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'EAD Treasury', 'EAD Treasury', 'EAD Treasury', 'EAD Segment', true, 4),

-- LGD Segments
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'LGD Factoring', 'LGD Factoring', 'LGD Factoring', 'LGD Segment', true, 5),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'LGD Lending All Segment', 'LGD Lending All Segment', 'LGD Lending All Segment', 'LGD Segment', true, 6),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'LGD Repo', 'LGD Repo', 'LGD Repo', 'LGD Segment', true, 7),
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'LGD Treasury', 'LGD Treasury', 'LGD Treasury', 'LGD Segment', true, 8),

-- PD Segments
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'PD Factoring', 'PD Factoring', 'PD Factoring', 'PD Segment', true, 9),

-- Portfolio Segments
('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'Factoring', 'Factoring', 'Factoring', 'Portfolio Segment', true, 10)

ON CONFLICT (tenant_id, group_segment, segment, sub_segment) DO NOTHING;

SELECT 'SUCCESS: Product segments seeded!' as result;
