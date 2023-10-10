import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface InvitationDoc extends BaseDoc {
  owner: ObjectId;
  name: String;
  items: ObjectId[];
}

export default class InvitationConcept {
  public readonly invitations = new DocCollection<InvitationDoc>("folders");

  async getFolders(query: Filter<InvitationDoc>) {
    const folders = await this.invitations.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return folders;
  }

  async getUserFolderContents(query: Filter<InvitationDoc>) {
    const items = await this.invitations.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return items;
  }

  async addNewFolder(owner: ObjectId, name: String) {
    const _id = await this.invitations.createOne({ owner, name });
    return { msg: "Folder successfully created!", folder: await this.invitations.readOne({ _id }) };
  }

  async addToFolder(query: Filter<InvitationDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.invitations.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    for (const folder of folders) {
      folder.items.concat(items);
    }
    return { msg: "Added item to folder!" };
  }

  async removeFromFolder(query: Filter<InvitationDoc>, owner: ObjectId, name: String, items: ObjectId[]) {
    const folders = await this.invitations.readMany(query, {
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
