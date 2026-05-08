import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = express.Router();

interface ExpenseData {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
}

// GET all expenses for the owner's pension
router.get('/pensions/:pensionId', authenticateToken as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const pId = parseInt(pensionId);

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: pId,
        owner_id: userId
      }
    });

    if (!pension && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const expenses = await prisma.expense.findMany({
      where: { pension_id: pId },
      orderBy: { expense_date: 'desc' }
    });
    
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount.toString()), 0);

    res.json({ success: true, data: { items: expenses, totalExpenses } });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    // Don't fail the entire load if expenses fail
    res.json({ 
      success: true, 
      data: { 
        items: [], 
        totalExpenses: 0 
      }
    });
  }
});

// POST - Add a new expense
router.post('/pensions/:pensionId', authenticateToken as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const { category, description, amount, expense_date }: ExpenseData = req.body;
    const userId = req.user.userId;
    const pId = parseInt(pensionId);

    if (!category || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: 'Category, amount, and date are required' });
    }

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { 
        pension_id: pId,
        owner_id: userId
      }
    });

    if (!pension && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const expense = await prisma.expense.create({
      data: {
        pension_id: pId,
        category,
        description: description || '',
        amount: new Prisma.Decimal(amount),
        expense_date: new Date(expense_date)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Expense added',
      data: { expense_id: expense.expense_id }
    });
  } catch (error: any) {
    console.error('Add expense error:', error);
    next(error);
  }
});

// DELETE - Remove an expense
router.delete('/:expenseId', authenticateToken as any, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.userId;
    const eId = parseInt(expenseId);

    // Verify ownership via relationship
    const expense = await prisma.expense.findUnique({
      where: { expense_id: eId },
      include: {
        pension: {
          select: { owner_id: true }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.pension?.owner_id !== userId && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.expense.delete({
      where: { expense_id: eId }
    });

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    next(error);
  }
});

export default router;
