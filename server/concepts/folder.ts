import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface FolderDoc extends BaseDoc {
  owner: ObjectId;
  name: String;
  items: ObjectId[];
}

export default class BookConcept {
  public readonly folders = new DocCollection<FolderDoc>("folders");

  async getFolders(query: Filter<FolderDoc>) {
    const folders = await this.folders.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return folders;
  }

  async getUserFolderContents(query: Filter<FolderDoc>) {
    const folders = await this.folders.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    const items: ObjectId[] = [];
    for (const folder of folders) {
      items.concat(folder.items);
    }
    return items;
  }

  async addNewFolder(owner: ObjectId, name: String) {
    const _id = await this.folders.createOne({ owner, name, items: [] });
    return { msg: "Folder successfully created!", folder: await this.folders.readOne({ _id }) };
  }

  // async addToFolder(query: Filter<FolderDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
  async addToFolder(query: Filter<FolderDoc>, items: ObjectId[]) {
    const folders = await this.folders.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    for (const folder of folders) {
      folder.items = folder.items.concat(items);
    }
    return { msg: "Added item to folder!" };
  }

  async removeFromFolder(query: Filter<FolderDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.folders.readMany(query, {
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
