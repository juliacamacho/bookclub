import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface BookDoc extends BaseDoc {
  title: String;
  author: String;
  description: String;
  avgRating: Number;
}

export default class BookConcept {
  public readonly books = new DocCollection<BookDoc>("books");

  async getBooks(query: Filter<BookDoc>) {
    const posts = await this.books.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return posts;
  }

  private sanitizeUpdate(update: Partial<BookDoc>) {
    // Make sure the update cannot change the title, author, or description.
    const allowedUpdates = ["avgRating"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }

  async update(_id: ObjectId, update: Partial<BookDoc>) {
    this.sanitizeUpdate(update);
    await this.books.updateOne({ _id }, update);
    return { msg: "Post successfully updated!" };
  }
}