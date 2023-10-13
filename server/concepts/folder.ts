import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface FolderDoc extends BaseDoc {
  owner: ObjectId;
  name: String;
  items: ObjectId[];
}

export default class FolderConcept {
  public readonly folders = new DocCollection<FolderDoc>("folders");

  async getFolders(query: Filter<FolderDoc>) {
    const folders = await this.folders.readMany(query, {
      sort: { dateCreated: -1 },
    });
    return folders;
  }

  async getUserFolderContents(query: Filter<FolderDoc>) {
    const folder = await this.folders.readOne(query);
    if (folder !== null) {
      return folder.items;
    } else {
      throw new NotFoundError(`Folder does not exist!`);
    }
  }

  async addNewFolder(owner: ObjectId, name: String) {
    const _id = await this.folders.createOne({ owner, name, items: [] });
    return { msg: "Folder successfully created!", folder: await this.folders.readOne({ _id }) };
  }

  // async addToFolder(query: Filter<FolderDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
  async addToFolder(query: Filter<FolderDoc>, item: ObjectId) {
    const folder = await this.folders.readOne(query);
    if (folder !== null) {
      // folder.items = folder.items.concat(items);
      const newItems = [...folder.items, item];
      console.log("ITEMS:", newItems);
      await this.folders.updateOne({ _id: folder._id }, { items: newItems });
      return { msg: "Added item to folder!" };
    } else {
      throw new NotFoundError(`Folder does not exist!`);
    }
  }

  async removeFromFolder(query: Filter<FolderDoc>, owner: ObjectId, name: string, items: ObjectId[]) {
    const folder = await this.folders.readOne(query);
    if (folder !== null) {
      folder.items = folder.items.filter(function (x) {
        return !items.includes(x);
      });
    } else {
      throw new NotFoundError(`Folder does not exist!`);
    }
    return { msg: "Removed item from folder!" };
  }
}
