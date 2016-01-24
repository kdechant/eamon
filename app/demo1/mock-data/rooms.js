System.register([], function(exports_1) {
    var ROOMS;
    return {
        setters:[],
        execute: function() {
            /**
             * JSON data that mocks what would come from the back-end API
             */
            exports_1("ROOMS", ROOMS = [
                {
                    'id': 1,
                    'name': 'Entrance',
                    'description': 'You are standing at the castle entrance.',
                    'exits': [
                        { 'direction': 'n', 'room_to': 2 },
                        { 'direction': 's', 'room_to': -99 },
                    ],
                },
                {
                    'id': 2,
                    'name': 'Great Hall',
                    'description': 'You are in the great hall of the castle.',
                    'exits': [
                        { 'direction': 'n', 'room_to': 3 },
                        { 'direction': 's', 'room_to': 1 },
                    ],
                },
                {
                    'id': 3,
                    'name': 'Throne Room',
                    'description': 'You are in the throne room. There is a large throne on the north wall. A locked door leads east.',
                    'exits': [
                        { 'direction': 'e', 'room_to': 4 },
                        { 'direction': 's', 'room_to': 2 },
                    ],
                },
                {
                    'id': 4,
                    'name': 'Treasure Vault',
                    'description': 'You are in a dark treasure vault. There are many valuables.',
                    'exits': [
                        { 'direction': 'w', 'room_to': 3 }
                    ],
                }
            ]);
        }
    }
});
//# sourceMappingURL=rooms.js.map