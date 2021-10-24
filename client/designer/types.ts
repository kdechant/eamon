
export type RouteParams = {
  slug: string,
  id?: string
}

export type roomSource = {
    id: number,
    name: string,
    exits: Record<string, string | number>[]
}
