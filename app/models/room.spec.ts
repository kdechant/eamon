import {Room} from './room';
import {RoomExit} from './room';

import {ROOMS} from '../demo1/mock-data/rooms';

describe("Room exits", function() {

    var r1 = new Room();
    r1.init(ROOMS[0]);

    it("should get the room to the north", function() {
        var x = r1.getExit('n');
        expect(x.direction).toEqual('n');
        expect(x.room_to).toEqual(2);
    });

    it("should get the room to the south", function() {
        var x = r1.getExit('s');
        expect(x.direction).toEqual('s');
        expect(x.room_to).toEqual(RoomExit.EXIT);
    });

    it("should NOT get the room to the east", function() {
        expect(r1.getExit('e')).toEqual(null);
    });
});
