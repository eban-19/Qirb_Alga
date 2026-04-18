import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/hooks/use-language";
import { TranslationText } from "@/components/TranslationText";

interface TransactionsSectionProps {
  transactions: any[];
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions
}) => {
  const { language } = useLanguage();
  
  return (
    <Card className="border-none shadow-lg bg-white overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold"><TranslationText text="Date" language={language} /></TableHead>
                <TableHead className="font-bold"><TranslationText text="Description" language={language} /></TableHead>
                <TableHead className="font-bold"><TranslationText text="Category" language={language} /></TableHead>
                <TableHead className="text-right font-bold"><TranslationText text="Amount" language={language} /></TableHead>
                <TableHead className="font-bold"><TranslationText text="Status" language={language} /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-sm font-medium text-slate-500">{transaction.date}</TableCell>
                  <TableCell className="font-bold text-slate-900">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase tracking-wider">
                      <TranslationText text={transaction.type === 'income' ? 'Revenue' : 'Expense'} language={language} />
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-black ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}ETB {transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                    } text-white font-bold text-[10px] px-2 shadow-sm`}>
                      <TranslationText text="Completed" language={language} />
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
