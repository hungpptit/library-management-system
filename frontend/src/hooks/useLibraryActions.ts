import { toast } from 'react-hot-toast';
import { useLibrary } from '../contexts/LibraryContext';
import { Book, Loan, UserProfile } from '../types';

export const useLibraryActions = () => {
  const { borrowBook, returnBookItem, addNewBook, updateBookDetails, addUser, updateUser } = useLibrary();

  const handleBorrow = async (book: Book) => {
    try {
      await borrowBook(book);
      toast.success("Book borrowed successfully");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to borrow book";
      toast.error(message);
      throw error;
    }
  };

  const handleReturn = async (loan: Loan) => {
    try {
      const returnedLoan = await returnBookItem(loan);
      if (returnedLoan.fee > 0) {
        toast.success(`Book returned. Overdue fee (20% cover price): $${returnedLoan.fee.toFixed(2)}`);
      } else {
        toast.success("Book returned successfully");
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to return book";
      toast.error(message);
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
            // Update existing user
            await updateUser(selectedUser.uid, data);
            toast.success("User updated");
        } else {
            // Add new user
            await addUser(data);
            toast.success("User added");
        }
        closeModal();
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Failed to save user";
        toast.error(message);
    }
};

  return { handleBorrow, handleReturn, handleBookSubmit, handleUserSubmit };
};
