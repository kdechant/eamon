/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import {render, waitFor, within} from '@testing-library/react'
import {Route} from "react-router";
import {MemoryRouter} from "react-router-dom";
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import AdventureList from "./AdventureList";
import {screen} from '@testing-library/dom'

const server = setupServer(
  rest.get('/api/designer/adventures', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 1,
        name: "Beginner's Cave",
        slug: "beginners-cave",
        date_published: "2017-02-04",
        authors: [
            "Donald Brown"
        ],
      },
      {
        id: 206,
        name: "Curse of the Hellsblade",
        slug: "curse-of-the-hellsblade",
        date_published: "2018-01-10",
        authors: [
            "Tom Zuchowski",
            "John Nelson"
        ],
      },
      {
        id: 230,
        name: "The Well of the Great Ones",
        slug: "well-of-the-great-ones",
        date_published: "2019-12-30",
        authors: [
            "Tom Zuchowski",
            "Mike Ellis"
        ],
      }
    ]))
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads and displays list in a table', async () => {
  render(
    <MemoryRouter initialEntries={["/designer/"]}>
      <Route path="/designer/">
        <AdventureList/>
      </Route>
    </MemoryRouter>
  );

  const table = await waitFor(() => screen.getByRole('table'))
  const col_heading1 = within(table).getByRole('columnheader', {name: '#'});
  expect(col_heading1).toBeInstanceOf(HTMLTableCellElement);
  const col_heading2 = within(table).getByRole('columnheader', {name: 'Name'});
  expect(col_heading2).toBeInstanceOf(HTMLTableCellElement);
  const col_heading3 = within(table).getByRole('columnheader', {name: 'Authors'});
  expect(col_heading3).toBeInstanceOf(HTMLTableCellElement);
});
