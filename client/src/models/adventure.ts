import GameObject from "./game-object";

/**
 * Adventure class. Represents adventures the player can go on.
 */
export default class Adventure extends GameObject {

  description: string;
  full_description: string;
  slug: string;
  featured_month: string;
  date_published: string;
  times_played: string;
  authors: string[];
  authors_display: string;
  tags: string[];

}
