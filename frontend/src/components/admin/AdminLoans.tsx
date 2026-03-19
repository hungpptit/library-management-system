/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loan } from '../../types';
import { LoanTable } from '../loans/LoanTable';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { Scan } from 'lucide-react';

interface AdminLoansProps {
  loans: Loan[];
  onReturn: (loan: Loan) => void;
  onScan: () => void;
}

export const AdminLoans: React.FC<AdminLoansProps> = ({
  loans,
  onReturn,
  onScan,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Loan Management"
        subtitle="Track all active and past book loans"
        action={
          <Button onClick={onScan} variant="secondary" className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            <span>Scan Book</span>
          </Button>
        }
      />
      <LoanTable loans={loans} onReturn={onReturn} isAdmin />
    </div>
  );
};

