SELECT r.room_id, r.name, re.direction, re.room_from_id, re.room_to, re.door_id, re.id FROM adventure_roomexit re INNER JOIN adventure_room r ON re.room_from_id = r.id WHERE r.adventure_id = 85
