import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ProfileDoc extends BaseDoc {
  user: ObjectId;
  name: String;
  friends: [ObjectId];
  booksReading: [ObjectId];
  booksRead: [ObjectId];
  booksToRead: [ObjectId];
  
}

export default class ProfileConcept {
    public readonly profiles = new DocCollection<ProfileDoc>("profiles");



    
}