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
UPDATE adventure_artifact SET dice = 1, weapon_type = 5 WHERE adventure_id = 18 AND artifact_id = 6; -- dagger
UPDATE adventure_artifact SET weapon_type = 5 WHERE adventure_id = 18 AND artifact_id = 34; -- rapier
UPDATE adventure_monster SET weapon_sides = 3 WHERE adventure_id = 18 AND monster_id = 14; -- tentacles

-- beginner's forest
UPDATE adventure_artifact SET synonyms = 'green arch,vine covered arch,arch,vines,wrought iron gate,gate,words' WHERE adventure_id = 3 AND artifact_id IN (19,20);
UPDATE adventure_effect SET next = NULL where adventure_id = 3 and effect_id = 4;

