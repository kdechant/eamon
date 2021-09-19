import * as React from "react";
import {useEffect, useState} from "react";
import AdventureContext, {UserContext} from "../context";
import {Route, useParams} from "react-router";
import Adventure from "../models/adventure";
import RoomRepository from "../repositories/room.repo";
import ArtifactRepository from "../repositories/artifact.repo";
import EffectRepository from "../repositories/effect.repo";
import MonsterRepository from "../repositories/monster.repo";
import HintRepository from "../repositories/hint.repo";
import RoomList from "./RoomList";
import RoomDetail from "./RoomDetail";
import ArtifactList from "./ArtifactList";
import ArtifactDetail from "./ArtifactDetail";
import EffectList from "./EffectList";
import MonsterList from "./MonsterList";
import MonsterDetail from "./MonsterDetail";
import AdventureDetail from "./AdventureDetail";

import update from 'immutability-helper';


function AdventureMainMenu(): JSX.Element {
    const [state, setState] = useState(null);
    const [timeouts, setTimeouts] = useState({});
    const user_context = React.useContext(UserContext);
    const {slug} = useParams<{ slug: string }>();

    // get the adventure details from the API
    async function loadAdventureData(slug) {
        const [adv_data, rooms_data, artifacts_data, effects_data, monsters_data, hints_data] = await Promise.all([
            fetch(`/api/designer/adventures/${slug}`).then(response => response.json()),
            fetch(`/api/designer/adventures/${slug}/rooms`).then(response => response.json()),
            fetch(`/api/designer/adventures/${slug}/artifacts`).then(response => response.json()),
            fetch(`/api/designer/adventures/${slug}/effects`).then(response => response.json()),
            fetch(`/api/designer/adventures/${slug}/monsters`).then(response => response.json()),
            fetch(`/api/designer/adventures/${slug}/hints`).then(response => response.json()),
        ]);
        const adventure = new Adventure();
        adventure.init(adv_data);
        adventure.authors_display = "";
        if (adventure.authors) {
            adventure.authors_display = adventure.authors.join(' and ');
        }
        setState({
            adventure: adventure,
            rooms: new RoomRepository(rooms_data),
            artifacts: new ArtifactRepository(artifacts_data),
            effects: new EffectRepository(effects_data),
            monsters: new MonsterRepository(monsters_data),
            hints: new HintRepository(hints_data),
        })
    }

    async function saveAdventureField(field: string): Promise<void> {
        const body: Record<string, string | number> = {};
        body[field] = state.adventure[field];
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        const token = await user_context.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        fetch(`/api/designer/adventures/${slug}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: headers
        }).then(response => response.json()).then(data => {
            const adventure = state.adventure;
            adventure[field] = data[field];
            setState({
                ...state,
                adventure,
            })
            setTimeouts(timeouts);
        });
    }

    function setAdventureField(field: string, value: string) {
        const adventure = state.adventure;
        adventure[field] = value;
        setState({
            ...state,
            adventure
        });
        if (timeouts[field]) {
            clearTimeout(timeouts[field]);
        }
        timeouts['adventure'][field] = setTimeout(() => {
            saveAdventureField(field)
        }, 2000);
        setTimeouts(timeouts);
    }

    async function saveRoomField(id: number, field: string, value: string): Promise<void> {
        const body: Record<string, string | number> = {};
        body[field] = value;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        const token = await user_context.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        fetch(`/api/designer/adventures/${slug}/rooms/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: headers
        }).then(response => response.json()).then(data => {
          _setRoomField(id, field, data[field]);
        });
    }

    /**
     * Helper function for setting room data in the state
     * @param id
     * @param field
     * @param value
     */
    function _setRoomField(id: number, field: string, value: string) {
        const room = state.rooms.get(id);
        const new_r = update(room, {[field]: {$set: value}});
        const idx = state.rooms.getIndex(id);
        const new_repo = update(state.rooms, {'all': {[idx]: {$set: new_r}}});
        setState(update(state, {rooms: {$set: new_repo}}));
    }

    function setRoomField(id: number, field: string, value: string) {
        const timeout_name = `rooms-${id}-${field}`;
        if (timeouts[timeout_name]) {
            clearTimeout(timeouts[timeout_name]);
        }
        _setRoomField(id, field, value);
        const timeouts_to_update = {
          [timeout_name]: {$set: setTimeout(() => saveRoomField(id, field, value), 2000)}
        }
        setTimeouts(update(timeouts, timeouts_to_update));
    }

    async function saveArtifactField(id: number, field: string, value: string): Promise<void> {
        const body: Record<string, string | number> = {};
        body[field] = value;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        const token = await user_context.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        fetch(`/api/designer/adventures/${slug}/artifacts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: headers
        }).then(response => response.json()).then(data => {
          _setRoomField(id, field, data[field]);
        });
    }

    /**
     * Helper function for setting room data in the state
     * @param id
     * @param field
     * @param value
     */
    function _setArtifactField(id: number, field: string, value: string) {
        const art = state.artifacts.get(id);
        const new_a = update(art, {[field]: {$set: value}});
        const idx = state.artifacts.getIndex(id);
        const new_repo = update(state.artifacts, {'all': {[idx]: {$set: new_a}}});
        setState(update(state, {artifacts: {$set: new_repo}}));
    }

    function setArtifactField(id: number, field: string, value: string) {
        const timeout_name = `artifacts-${id}-${field}`;
        if (timeouts[timeout_name]) {
            clearTimeout(timeouts[timeout_name]);
        }
        _setArtifactField(id, field, value);

        const timeouts_to_update = {
          [timeout_name]: {
            $set: setTimeout(() => saveArtifactField(id, field, value), 2000)
          }
        };
        setTimeouts(update(timeouts, timeouts_to_update));
    }
    const context_value = {
      ...state,
      setAdventureField,
      setRoomField,
      setArtifactField
    };

    useEffect(() => {
        loadAdventureData(slug);
    }, [slug]);

    if (!state || !state.adventure) {
        return <p>Loading {slug}...</p>;
    }

    return (
        <AdventureContext.Provider value={context_value}>
            <div className="container-fluid" id="AdventureDetail">
                <div className="row">
                    <div className="col-sm-2 d-none d-sm-block">
                        <img src="/static/images/ravenmore/128/map.png" width="64" alt="Map"/>
                    </div>
                    <div className="col-sm-10">
                        <div className="float-right text-secondary d-none d-md-block adv-id">#{state.adventure.id}</div>
                        <h3>{state.adventure.name}</h3>
                        <p>{state.adventure.authors_display.length ? "By: " + state.adventure.authors_display : ""}</p>
                    </div>
                </div>
                <Route exact path='/designer/:slug' render={() => (
                    <AdventureDetail/>
                )}/>

                <Route exact path='/designer/:slug/rooms' render={() => (
                    <RoomList/>
                )}/>
                <Route path='/designer/:slug/rooms/:id' render={() => (
                    <RoomDetail/>
                )}/>

                <Route exact path='/designer/:slug/artifacts' render={() => (
                    <ArtifactList/>
                )}/>
                <Route path='/designer/:slug/artifacts/:id' render={() => (
                    <ArtifactDetail/>
                )}/>

                <Route exact path='/designer/:slug/effects' render={() => (
                    <EffectList/>
                )}/>

                <Route exact path='/designer/:slug/monsters' render={() => (
                    <MonsterList/>
                )}/>
                <Route path='/designer/:slug/monsters/:id' render={() => (
                    <MonsterDetail/>
                )}/>
            </div>
        </AdventureContext.Provider>
    );
}

export default AdventureMainMenu;
