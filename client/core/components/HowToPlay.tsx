import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const HowToPlay = (props) => {
   return (
      <Modal isOpen={props.visible} toggle={props.toggle} size="xl">
        <ModalHeader toggle={props.toggle}>
          Welcome to Eamon!
        </ModalHeader>
        <ModalBody>
          {props.game.demo && (
            <div>
              <p>You are playing as the demo character. You can explore the adventure as normal, but you won't be able to save your progress or keep any items or treasure you collect after you exit the adventure.</p>
              <p>You can create your own character later from the Main Hall if you want to keep your items and take them on future adventures.</p>
            </div>
          )}
          <p>Eamon takes a simple set of adventuring commands, like:</p>
          <ul>
            <li>You can move by typing the first letter of the direction to move, e.g., 'n' (north), 's' (south), etc.</li>
            <li>All adventures support moving in the six usual directions (n, s, e, w, u, d). Some adventures also support diagonal moves (ne, se, sw, nw).</li>
            <li>To pick up an item, type GET followed by the item name. For example, 'get sword'</li>
            <li>'get all' will attempt to pick up everything you see.</li>
            <li>You may change your active weapon using the READY command, e.g., 'ready sword'</li>
            <li>You may put on different armor or other wearable items using the WEAR command. For example, 'wear chain mail' or 'wear shield'</li>
            <li>You may remove something you are wearing with the REMOVE command. For example, 'remove chain mail' or 'remove pirate hat'</li>
            <li>To initiate combat, use the ATTACK command. For example, 'attack orc'</li>
            <li>If you ATTACK a neutral or friendly monster, they're likely to get angry and attack you right back.</li>
            <li>To see an NPC's health and what they are carrying, you can LOOK at them. For example, 'look eddie'</li>
            <li>Some items are containers which can be OPENed. For example, 'open chest'</li>
            <li>Chests and doors may be locked. You can unlock them using the OPEN command. If you have the correct key in your inventory, they will open.</li>
            <li>Containers may have things inside them, which can be removed using the REMOVE command. For example, 'remove jewels from chest'</li>
            <li>You may also PUT things into containers. For example, 'put jewels into chest'</li>
            <li>Hidden items and secret passages can be found by reading the room description and trying to inspect various things described there. For example, you might find a secret door by typing 'look wall' or 'examine bookshelf'</li>
            <li>NPCs can carry items, and sometimes they react when you GIVE them a certain item. For example, 'give key to eddie'</li>
            <li>You may also REQUEST an item from an NPC. If they are friendly, they will usually give it to you. For example, 'request key from eddie'</li>
            <li>To cast spells, just type the spell name: 'blast', 'heal', 'power', or 'speed'</li>
            <li>Some adventures may have custom commands as well. Click the &quot;Command List&quot; button to see the entire list of commands.</li>
          </ul>
          <p>Eamon also supports partial word matches to save typing. e.g., 'at dra' is the same as 'attack dragon'.</p>
          <p>Hit enter to repeat the last command, or use the up and down arrows to recall previous commands.</p>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-primary" onClick={props.toggle}>Close</button>
        </ModalFooter>
      </Modal>
   );
}

export default HowToPlay;
