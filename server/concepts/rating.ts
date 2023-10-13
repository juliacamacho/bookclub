import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface RatingDoc extends BaseDoc {
  owner: ObjectId;
  book: ObjectId;
  value: number;
}

export default class RatingConcept {
  public readonly ratings = new DocCollection<RatingDoc>("ratings");

  async getRatings(query: Filter<RatingDoc>) {
    const ratings = await this.ratings.readMany(query);
    return ratings;
  }

  async addRating(user: ObjectId, bookId: ObjectId, value: number) {
    // first check if rating already exists for this book and user:
    const rating = await this.ratings.readOne({ owner: user, book: bookId });
    if (rating !== null) {
      throw new NotAllowedError(`Rating for this book by this user already exists!`);
    }
    const _id = await this.ratings.createOne({ owner: user, book: bookId, value });
    return { msg: "Rating successfully created!", folder: await this.ratings.readOne({ _id }) };
  }

  async deleteRating(user: ObjectId, bookId: ObjectId) {
    await this.ratings.deleteOne({ owner: user, book: bookId });
    return { msg: "Rating deleted successfully!" };
  }
}
