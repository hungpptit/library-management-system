import { toast } from 'react-hot-toast';
import { useLibrary } from '../contexts/LibraryContext';
import { Book, Loan, UserProfile } from '../types';

export const useLibraryActions = () => {
  const { borrowBook, returnBookItem, addNewBook, updateBookDetails, addUser } = useLibrary();

  const handleBorrow = async (book: Book) => {
    try {
      await borrowBook(book);
      toast.success("Book borrowed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to borrow book");
    }
  };

  const handleReturn = async (loan: Loan) => {
    try {
      await returnBookItem(loan);
      toast.success("Book returned successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to return book");
    }
  };

  const handleBookSubmit = async (data: Partial<Book>, selectedBook: Book | null, closeModal: () => void) => {
    try {
        if (selectedBook?.id) {
            await updateBookDetails({ ...data, id: selectedBook.id });
            toast.success("Book updated");
        } else {
            await addNewBook(data);
            toast.success("Book added");
        }
        closeModal();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save book");
    }
};

const handleUserSubmit = async (data: Partial<UserProfile>, selectedUser: UserProfile | null, closeModal: () => void) => {
    try {
        if (selectedUser?.uid) {
             toast.error("Update user feature requires context update");
        } else {
            await addUser(data);
            toast.success("User added");
        }
        closeModal();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save user");
    }
};

  return { handleBorrow, handleReturn, handleBookSubmit, handleUserSubmit };
};
