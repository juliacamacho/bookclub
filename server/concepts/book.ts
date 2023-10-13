import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface BookDoc extends BaseDoc {
  title: String;
  author: String;
  description: String;
}

export default class BookConcept {
  public readonly books = new DocCollection<BookDoc>("books");

  async getBooks(query: Filter<BookDoc>) {
    const books = await this.books.readMany(query, {
      sort: { dateCreated: -1 },
    });
    return books;
  }

  async getBookByTitle(title: string) {
    const book = await this.books.readOne({ title: title });
    if (book === null) {
      throw new NotFoundError(`Book not found!`);
    }
    return book;
  }

  async addBook(title: string, author: string, description: string) {
    const _id = await this.books.createOne({ title, author, description });
    return { msg: "Book successfully created!", book: await this.books.readOne({ _id }) };
  }

  async deleteBook(_id: ObjectId) {
    await this.books.deleteOne({ _id });
    return { msg: "Book deleted successfully!" };
  }
}
