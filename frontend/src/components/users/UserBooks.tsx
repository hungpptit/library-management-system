/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loan } from '../../types';
import { BorrowingProgress } from '../loans/BorrowingProgress';
import { SectionHeader } from '../ui/SectionHeader';
import { LoanTable } from '../loans/LoanTable';
import { EmptyState } from '../ui/EmptyState';
import { BookOpen } from 'lucide-react';

interface UserBooksProps {
  activeLoans: Loan[];
  loanHistory: Loan[];
  onReturn: (loan: Loan) => void;
}

export const UserBooks: React.FC<UserBooksProps> = ({
  activeLoans,
  loanHistory,
  onReturn,
}) => {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-8">
        <SectionHeader
          title="Books I'm Borrowing"
          subtitle="Track your current loans and deadlines"
        />
        {activeLoans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLoans.map((loan) => (
                <BorrowingProgress key={loan.id} loan={loan} />
              ))}
            </div>

            <LoanTable loans={activeLoans} onReturn={onReturn} showActionColumn={false} />
          </>
        ) : (
          <EmptyState
            title="No active loans"
            description="You are not currently borrowing any books."
            icon={<BookOpen className="w-12 h-12" />}
          />
        )}
      </div>

      <div className="flex flex-col gap-8">
        <SectionHeader
          title="Borrow History"
          subtitle="A record of your past library activity"
        />
        {loanHistory.length > 0 ? (
          <LoanTable loans={loanHistory} onReturn={onReturn} showActionColumn={false} />
        ) : (
          <EmptyState
            title="No history"
            description="Your borrowing history will appear here."
          />
        )}
      </div>
    </div>
  );
};

