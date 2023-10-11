import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface InvitationDoc extends BaseDoc {
  userFrom: ObjectId;
  usersPending: ObjectId[];
  usersAccepted: ObjectId[];
  book: ObjectId;
}

export default class RatingConcept {
  public readonly invitations = new DocCollection<InvitationDoc>("folders");

  async getInvitations(query: Filter<InvitationDoc>) {
    const invitations = await this.invitations.readMany(query);
    return invitations;
  }

  async postInvitation(userFrom: ObjectId, book: ObjectId) {
    const _id = await this.invitations.createOne({ userFrom, usersPending: [], usersAccepted: [], book });
    return { msg: "Invitation successfully created!", folder: await this.invitations.readOne({ _id }) };
  }

  async updateInvitation(_id: ObjectId, update: Partial<InvitationDoc>) {
    this.sanitizeUpdate(update);
    await this.invitations.updateOne({ _id }, update);
    return { msg: "Invitation successfully updated!" };
  }

  private sanitizeUpdate(update: Partial<InvitationDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["usersPending", "usersAccepted"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}
