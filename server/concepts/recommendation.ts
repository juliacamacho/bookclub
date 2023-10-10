import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface RecDoc extends BaseDoc {
  owner: ObjectId;
  name: String;
  items: ObjectId[];
}

export default class RecConcept {
  public readonly recs = new DocCollection<RecDoc>("folders");

  async getFolders(query: Filter<RecDoc>) {
    const folders = await this.recs.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return folders;
  }

  async getUserFolderContents(query: Filter<RecDoc>) {
    const items = await this.recs.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return items;
  }

  async addNewFolder(owner: ObjectId, name: String) {
    const _id = await this.recs.createOne({ owner, name });
    return { msg: "Folder successfully created!", folder: await this.recs.readOne({ _id }) };
  }

  async addToFolder(query: Filter<RecDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.recs.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    for (const folder of folders) {
      folder.items.concat(items);
    }
    return { msg: "Added item to folder!" };
  }

  async removeFromFolder(query: Filter<RecDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.recs.readMany(query, {
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
