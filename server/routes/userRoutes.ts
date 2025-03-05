import express from 'express';
import { Database } from 'sqlite';
import { User } from '../types';

const router = express.Router();

export default function userRoutes(db: Database) {
    // Get all users
    router.get('/', async (req, res) => {
        try {
            const users = await db.all('SELECT * FROM users');
            res.json({ data: users });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    });

    // Get users not in any leg
    router.get('/unassigned', async (req, res) => {
        try {
            const users = await db.all('SELECT * FROM users WHERE leg IS NULL');
            res.json({ data: users });
        } catch (error) {
            console.error('Error getting unassigned users:', error);
            res.status(500).json({ error: 'Failed to fetch unassigned users' });
        }
    });

    // Get user's downline
    router.get('/:id/downline', async (req, res) => {
        try {
            const downline = await db.all(
                'SELECT * FROM users WHERE added_under_id = ?',
                req.params.id
            );
            res.json({ data: downline });
        } catch (error) {
            console.error('Error getting downline:', error);
            res.status(500).json({ error: 'Failed to get downline' });
        }
    });

    // Create new user
    router.post('/', async (req, res) => {
        try {
            const { name, leg, added_under_id, mobile_no, address, work, remarks, userid, password } = req.body;
            
            // Check if userid already exists
            const existingUser = await db.get('SELECT id FROM users WHERE userid = ?', userid);
            if (existingUser) {
                return res.status(400).json({ error: 'User ID already exists' });
            }

            const result = await db.run(
                `INSERT INTO users (name, leg, added_under_id, mobile_no, address, work, remarks, userid, password)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, leg, added_under_id, mobile_no, address, work, remarks, userid, password]
            );

            if (result.lastID) {
                const newUser = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
                res.status(201).json({ data: newUser });
            } else {
                throw new Error('Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });

    // Update user
    router.put('/:id', async (req, res) => {
        try {
            const user: User = req.body;
            
            // If userid is being changed, check if new userid already exists
            if (user.userid) {
                const existingUser = await db.get(
                    'SELECT id FROM users WHERE userid = ? AND id != ?', 
                    [user.userid, req.params.id]
                );
                if (existingUser) {
                    return res.status(400).json({ error: 'User ID already exists' });
                }
            }

            await db.run(
                `UPDATE users 
                 SET name = ?, leg = ?, added_under_id = ?, mobile_no = ?, 
                     address = ?, work = ?, remarks = ?, userid = ?, password = ?
                 WHERE id = ?`,
                [
                    user.name, user.leg, user.added_under_id, user.mobile_no,
                    user.address, user.work, user.remarks, user.userid, user.password,
                    req.params.id
                ]
            );
            res.json({ id: parseInt(req.params.id), ...user });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update user' });
        }
    });

    // Get user details with sales and payments
    router.get('/:id/details', async (req, res) => {
        try {
            const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const sales = await db.all(
                `SELECT s.*, p.product_name 
                 FROM sales s 
                 JOIN products p ON s.product_id = p.id 
                 WHERE s.user_id = ? 
                 ORDER BY s.date DESC`,
                req.params.id
            );

            const payments = await db.all(
                'SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC',
                req.params.id
            );

            const totalPurchases = sales.reduce((sum, sale) => sum + sale.final_amount, 0);
            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const balanceAmount = totalPurchases - totalPaid;
            const totalSP = sales.reduce((sum, sale) => sum + (sale.sp * sale.quantity), 0);

            console.log('Sending response:', {
                data: {
                    user,
                    sales,
                    payments,
                    summary: {
                        totalPurchases,
                        totalPaid,
                        balanceAmount,
                        totalSP
                    }
                }
            });

            res.json({
                data: {
                    user,
                    sales,
                    payments,
                    summary: {
                        totalPurchases,
                        totalPaid,
                        balanceAmount,
                        totalSP
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ error: 'Failed to fetch user details' });
        }
    });

    // Get user by ID
    router.get('/:id', async (req, res) => {
        try {
            const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
            if (user) {
                res.json({ data: user });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    });

    return router;
} 