-- cave of the mind
UPDATE adventure_artifact SET quantity = 99, TYPE = 6 WHERE adventure_id = 37 AND artifact_id = 16;

-- furioso
UPDATE adventure_artifact SET armor_penalty = 20 WHERE adventure_id = 18 AND artifact_id = 16;
UPDATE adventure_artifact SET synonyms = 'scratch marks,floor,north wall' WHERE adventure_id = 18 AND artifact_id IN (51, 52);
UPDATE adventure_artifact SET synonyms = 'scratch marks,floor,south wall' WHERE adventure_id = 18 AND artifact_id IN (53, 54);
UPDATE adventure_artifact SET synonyms = 'lever,east wall' WHERE adventure_id = 18 AND artifact_id = 55;
UPDATE adventure_artifact SET synonyms = 'lever,west wall' WHERE adventure_id = 18 AND artifact_id = 56;
UPDATE adventure_artifact SET synonyms = 'poster,south wall' WHERE adventure_id = 18 AND artifact_id = 57;
UPDATE adventure_artifact SET synonyms = 'paneling,west wall' WHERE adventure_id = 18 AND artifact_id = 58;
