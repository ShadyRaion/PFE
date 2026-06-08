UPDATE "Subject"
SET "technologies" = ARRAY[]::TEXT[]
WHERE cardinality("technologies") > 0;
