import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface RatingDoc extends BaseDoc {
  owner: ObjectId;
  name: String;
  items: ObjectId[];
}

export default class RatingConcept {
  public readonly ratings = new DocCollection<RatingDoc>("folders");

  async getFolders(query: Filter<RatingDoc>) {
    const folders = await this.ratings.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return folders;
  }

  async getUserFolderContents(query: Filter<RatingDoc>) {
    const items = await this.ratings.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return items;
  }

  async addNewFolder(owner: ObjectId, name: String) {
    const _id = await this.ratings.createOne({ owner, name });
    return { msg: "Folder successfully created!", folder: await this.ratings.readOne({ _id }) };
  }

  async addToFolder(query: Filter<RatingDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.ratings.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    for (const folder of folders) {
      folder.items.concat(items);
    }
    return { msg: "Added item to folder!" };
  }

  async removeFromFolder(query: Filter<RatingDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.ratings.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    for (const folder of folders) {
      folder.items = folder.items.filter(function (x) {
        return !items.includes(x);
      });
    }
    return { msg: "Removed item from folder!" };
  }
}
