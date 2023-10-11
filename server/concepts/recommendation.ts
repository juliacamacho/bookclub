import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface RecDoc extends BaseDoc {
  userFrom: ObjectId;
  userTo: ObjectId;
  book: ObjectId;
}

export default class RecConcept {
  public readonly recs = new DocCollection<RecDoc>("recs");

  async getUserRecs(query: Filter<RecDoc>) {
    const recs = await this.recs.readMany(query);
    return recs;
  }

  async sendRec(userFrom: ObjectId, userTo: ObjectId, book: ObjectId) {
    const _id = await this.recs.createOne({ userFrom, userTo, book });
    return { msg: "Reccomendation successfully created!", folder: await this.recs.readOne({ _id }) };
  }
}
