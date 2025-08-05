-- Update Cruzteca Mexican Kitchen with proper coordinates
UPDATE restaurants 
SET 
  latitude = 30.2263,  -- Approximate latitude for 5207 Brodie Ln, Austin, TX
  longitude = -97.8689  -- Approximate longitude for 5207 Brodie Ln, Austin, TX
WHERE name = 'Cruzteca Mexican Kitchen' AND address LIKE '%5207 Brodie Ln%';