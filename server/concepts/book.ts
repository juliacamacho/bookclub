import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface BookDoc extends BaseDoc {
  title: String;
  author: String;
  description: String;
  numberOfReviews: Number;
  avgRating: Number;
}

export default class BookConcept {
  public readonly books = new DocCollection<BookDoc>("books");

  async getBooks(query: Filter<BookDoc>) {
    const books = await this.books.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return books;
  }

  async updateInfo(_id: ObjectId, update: Partial<BookDoc>) {
    this.sanitizeUpdate(update);
    await this.books.updateOne({ _id }, update);
    return { msg: "Book info successfully updated!" };
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
}
