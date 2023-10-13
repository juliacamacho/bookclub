import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface InvitationDoc extends BaseDoc {
  userFrom: ObjectId;
  usersPending: ObjectId[];
  usersAccepted: ObjectId[];
  book: ObjectId;
}

export default class InvitationConcept {
  public readonly invitations = new DocCollection<InvitationDoc>("invitations");

  async getInvitations(query: Filter<InvitationDoc>) {
    const invitations = await this.invitations.readMany(query);
    return invitations;
  }

  async postInvitation(userFrom: ObjectId, usersTo: ObjectId[], book: ObjectId) {
    const _id = await this.invitations.createOne({ userFrom, usersPending: [...usersTo], usersAccepted: [], book });
    return { msg: "Invitation successfully created!", folder: await this.invitations.readOne({ _id }) };
  }

  async acceptInvitation(_id: ObjectId, userId: ObjectId) {
    const invitation = await this.invitations.readOne({ _id });
    if (invitation !== null) {
      const newList = [...invitation.usersAccepted, userId];
      await this.invitations.updateOne({ _id: invitation._id }, { usersAccepted: newList });
      return { msg: "Accepted invitation!" };
    } else {
      throw new NotFoundError(`Invitation does not exist!`);
    }
  }

  async declineInvitation(_id: ObjectId, userId: ObjectId) {
    const invitation = await this.invitations.readOne({ _id });
    if (invitation !== null) {
      const newList = invitation.usersPending.filter((id) => id !== userId);
      await this.invitations.updateOne({ _id: invitation._id }, { usersPending: newList });
      return { msg: "Declined invitation!" };
    } else {
      throw new NotFoundError(`Invitation does not exist!`);
    }
  }
}
