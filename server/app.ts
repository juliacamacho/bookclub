import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
import BookConcept from "./concepts/book";
import FolderConcept from "./concepts/folder";
import RecConcept from "./concepts/recommendation";
import InvitationConcept from "./concepts/invitation";
import RatingConcept from "./concepts/rating";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Book = new BookConcept();
export const Folder = new FolderConcept();
export const Rec = new RecConcept();
export const Invitation = new InvitationConcept();
export const Rating = new RatingConcept();
