/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render } from '../test-utils';
import { act } from "react-dom/test-utils";
import {screen} from '@testing-library/dom'

import {ArtifactLink, EffectLink, MonsterLink, RoomLink} from "./common";

describe("RoomLink", () => {

  test("render room 0", () => {
    act(() => {
      // TODO: investigate render() with automatic wrapper
      //  (https://testing-library.com/docs/react-testing-library/setup/)
      render(
        <RoomLink id={0} />
      , {});
    });
    const link = screen.getByText("no connection");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });

  test("render room 1", () => {
    act(() => {
      render(
        <RoomLink id={1} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#1: Entrance"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/rooms/1');
  });

  test("render room 2", () => {
    act(() => {
      render(
        <RoomLink id={2} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#2: Tunnel"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/rooms/2');
  });

  test("render exit", () => {
    act(() => {
      render(
        <RoomLink id={-999} />
      , {});
    });
    const link = screen.getByText("Adventure exit (#-999)");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });

  test("render special connection", () => {
    act(() => {
      render(
        <RoomLink id={-1} />
      , {});
    });
    const link = screen.getByText("Special Connection: #-1");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("ArtifactLink", () => {

  test("render with no id", () => {
    act(() => {
      render(
        <ArtifactLink id={null} />
      , {});
    });
    const link = screen.getByText("-");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });

  test("render art 1", () => {
    act(() => {
      render(
        <ArtifactLink id={1} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#1: Chest"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/artifacts/1');
  });

  test("render unknown art", () => {
    act(() => {
      render(
        <ArtifactLink id={999} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#999: unknown"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/artifacts/999');
  });

});

describe("EffectLink", () => {

  test("render with no id", () => {
    act(() => {
      render(
        <EffectLink id={null} />
      , {});
    });
    const link = screen.getByText("-");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });

  test("render eff 1", () => {
    act(() => {
      render(
        <EffectLink id={1} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#1: blah blah blah"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/effects/1');
  });

  test("render unknown eff", () => {
    act(() => {
      render(
        <EffectLink id={999} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#999: unknown"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/effects/999');
  });

});

describe("MonsterLink", () => {

  test("render with no id", () => {
    act(() => {
      render(
        <MonsterLink id={null}/>
      , {});
    });
    const link = screen.getByText("-");
    expect(link).toBeInstanceOf(HTMLSpanElement);
  });

  test("render mon 1", () => {
    act(() => {
      render(
        <MonsterLink id={1} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#1: Guard"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/monsters/1');
  });

  test("render unknown mon", () => {
    act(() => {
      render(
        <MonsterLink id={999} />
      , {});
    });
    const link = screen.getByRole('link', {name: "#999: unknown"}) as HTMLAnchorElement;
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link.href).toBe('http://localhost:8000/designer/test-adv/monsters/999');
  });

});
