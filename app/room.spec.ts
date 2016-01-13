import {Room} from './room';
import {RoomExit} from './room';

describe("Room exits", function() {
    
    var r1 = new Room(1, "the entrance", '', [
      new RoomExit('n', -99),
      new RoomExit('s', 2)
    ]);
    
    it("should get the room to the north", function() {
        var x = r1.getExit('n');
        expect(x.direction).toEqual('n');
        expect(x.room_id).toEqual(RoomExit.MAIN_HALL);
    });
 
    it("should get the room to the south", function() {
        var x = r1.getExit('s');
        expect(x.direction).toEqual('s');
        expect(x.room_id).toEqual(2);
    });
    
    it("should NOT get the room to the east", function() {
        expect(r1.getExit('e')).toEqual(null);
    });
});
