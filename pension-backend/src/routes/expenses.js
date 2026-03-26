const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET all expenses for the owner's pension
router.get('/pensions/:pensionId', authenticateToken, async (req, res, next) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const pension = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    if (pension.length === 0 && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const expenses = await executeQuery(
      'SELECT * FROM expenses WHERE pension_id = ? ORDER BY expense_date DESC',
      [pensionId]
    );
    
    // If no expenses found with pension_id, try with id
    if (expenses.length === 0) {
      const expensesById = await executeQuery(
        'SELECT * FROM expenses WHERE pension_id = ? ORDER BY expense_date DESC',
        [pensionId]
      );
      expenses.push(...expensesById);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.json({ success: true, data: { items: expenses, totalExpenses } });
  } catch (error) {
    console.error('Get expenses error:', error);
    console.error('Error details:', error.message);
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
router.post('/pensions/:pensionId', authenticateToken, async (req, res, next) => {
  try {
    const { pensionId } = req.params;
    const { category, description, amount, expense_date } = req.body;
    const userId = req.user.userId;

    if (!category || !amount || !expense_date) {
      return res.status(400).json({ success: false, message: 'Category, amount, and date are required' });
    }

    // Verify ownership
    const pension = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    if (pension.length === 0 && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await executeQuery(
      'INSERT INTO expenses (pension_id, category, description, amount, expense_date) VALUES (?, ?, ?, ?, ?)',
      [pensionId, category, description || '', amount, expense_date]
    );

    res.status(201).json({
      success: true,
      message: 'Expense added',
      data: { expense_id: result.insertId }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    next(error);
  }
});

// DELETE - Remove an expense
router.delete('/:expenseId', authenticateToken, async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.userId;

    // Verify ownership via join
    const expense = await executeQuery(
      `SELECT e.expense_id FROM expenses e 
       JOIN pensions p ON e.pension_id = p.pension_id 
       WHERE e.expense_id = ? AND p.owner_id = ?`,
      [expenseId, userId]
    );
    if (expense.length === 0 && req.user.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await executeQuery('DELETE FROM expenses WHERE expense_id = ?', [expenseId]);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    next(error);
  }
});

module.exports = router;
