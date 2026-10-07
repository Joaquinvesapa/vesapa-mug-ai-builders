-- Avatar colors are now limited to the app palette (RF-17); move any other color to violet.
UPDATE "User"
SET "avatarColor" = '#7c3aed'
WHERE lower("avatarColor") NOT IN ('#7c3aed', '#c026d3', '#db2777', '#ea580c', '#d97706', '#059669', '#0284c7', '#2563eb');
