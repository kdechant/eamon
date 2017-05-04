SELECT * FROM adventure_artifact WHERE (NAME LIKE '%magic%' OR NAME LIKE '%wand%' OR NAME LIKE '%orb%') AND TYPE IN (2,3) AND weapon_type = 2 AND NAME != 'magic bow'
UNION
SELECT * FROM adventure_artifact WHERE NAME = 'Magic blue sphere'  -- from prince's tavern