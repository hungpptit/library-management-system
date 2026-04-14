/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Book as BookIcon, Calendar, Building, DollarSign, MapPin, Check, AlertTriangle, Trash2 } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => Promise<void> | void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => Promise<void> | void;
  isAdmin?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const safeQuantity = Number(book.quantity || 0);
  const safeAvailable = safeQuantity > 0
    ? Math.min(safeQuantity, Math.max(0, Number(book.available || 0)))
    : Math.max(0, Number(book.available || 0));

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleBorrow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onBorrow) return;

    setIsBorrowing(true);
    try {
      await onBorrow(book);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        return;
      }
      console.error(error);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete?.(book);
      setShowDeleteModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete book';
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteError(null);
  };

  const isOutOfStock = safeAvailable === 0;

  return (
    <>
      <div 
        className="relative h-[480px] w-full perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl border border-slate-100 p-4 flex flex-col shadow-sm group-hover:shadow-md transition-shadow">
            <div className="relative h-[300px] rounded-xl overflow-hidden bg-slate-100 shrink-0 mb-4">
              <img
                src={book.coverUrl || (book as any).cover_url || `https://picsum.photos/seed/${book.id}/300/400`}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={safeAvailable > 0 ? 'success' : 'danger'}>
                  {safeAvailable > 0 ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-sky-500 shadow-sm">
                <Info className="w-4 h-4" />
              </div>
            </div>

              <div className="flex flex-col gap-1 overflow-hidden mb-2">
              <h3 className="font-bold text-slate-900 line-clamp-2 text-lg leading-tight">{book.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-1 font-medium">
                {Array.isArray(book.authors) && book.authors.length > 0
                  ? book.authors.map((a: any) => a.name).join(', ')
                  : typeof book.author === 'string'
                  ? book.author
                  : typeof book.author === 'object' && book.author !== null
                  ? (book.author as any).name
                  : 'Unknown Author'}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {safeAvailable}/{safeQuantity} copies
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase">Click for details</span>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 shadow-md rotate-y-180"
            onClick={(e) => e.stopPropagation()} // Prevent flip when clicking buttons on back
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 shrink-0">
              <BookIcon className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-slate-900 line-clamp-1">Book Details</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Year</span>
                    <span className="text-sm font-medium">{book.year || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Building className="w-4 h-4 text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Publisher</span>
                    <span className="text-sm font-medium">
                      {typeof book.publisher === 'object' && book.publisher !== null 
                        ? (book.publisher as any).name 
                        : (book.publisher || 'N/A')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <DollarSign className="w-4 h-4 text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Price</span>
                    <span className="text-sm font-medium">${book.price?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Location</span>
                    <span className="text-sm font-medium">{book.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Description</span>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {book.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 shrink-0">
              {isAdmin ? (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(book);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="danger" 
                    onClick={handleDeleteClick}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <Button
                  size="md"
                  className={`w-full flex items-center gap-2 transition-all duration-300 ${isOutOfStock ? '!bg-slate-300 !text-slate-500 !cursor-not-allowed' : ''}`}
                  variant={isSuccess ? 'success' : 'primary'}
                  disabled={isOutOfStock || isSuccess}
                  isLoading={isBorrowing}
                  onClick={handleBorrow}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Success</span>
                    </>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    'Borrow Now'
                  )}
                </Button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="text-[10px] text-slate-400 font-bold uppercase hover:text-sky-500 transition-colors"
              >
                Back to Cover
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Delete Book"
          maxWidth="md"
        >
          <div className="flex flex-col gap-6 items-center text-center py-2">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 animate-in fade-in zoom-in duration-300">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Confirm Deletion</h3>
              <p className="text-slate-500 max-w-[320px]">
                Are you sure you want to delete <span className="font-semibold text-slate-700">"{book.title}"</span>? 
                This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 mb-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="font-bold">!</span>
                </div>
                <p className="text-left font-medium leading-relaxed">
                  {deleteError}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-4 px-2">
              <Button 
                variant="outline" 
                onClick={closeDeleteModal}
                className="flex-1 py-2.5"
                disabled={isDeleting}
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 flex items-center justify-center gap-2" 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Book</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
