UPDATE "User"
SET "specialty" = 'Computer Science'
WHERE LOWER(TRIM("specialty")) IN ('informatique', 'computer science', 'cs', 'info');

UPDATE "User"
SET "specialty" = 'Finance'
WHERE LOWER(TRIM("specialty")) IN ('finances', 'finance');

UPDATE "Subject"
SET "department" = 'Computer Science'
WHERE LOWER(TRIM("department")) IN ('informatique', 'computer science', 'cs', 'info');

UPDATE "Subject"
SET "department" = 'Finance'
WHERE LOWER(TRIM("department")) IN ('finances', 'finance');
