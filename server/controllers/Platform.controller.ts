import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { Rating } from '../models/document';
import { Customer } from '../models/relational';

// Get all ratings
export const getRatings = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const ratings = await Rating.find();
        res.status(200).json({ ratings });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get rating by ID
export const getRatingById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const ratingId = req.params.id;

    try {
        const rating = await Rating.findById(ratingId);

        if (!rating) {
            res.status(404).json({ message: 'Rating not found' });
            return;
        }

        res.status(200).json({ rating });
    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new rating
export const createRating = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { username, firstName, lastName, userProfession, rating, review } =
        req.body;

    try {
        // Find the user based on username
        const user = await Customer.findOne({ where: { username } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Create new rating
        const newRating = await Rating.create({
            userId: user.id,
            username,
            firstName,
            lastName,
            userProfession,
            rating,
            review,
        });

        res.status(201).json({ newRating });
    } catch (error) {
        console.error('Error creating rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a rating
export const updateRating = async (
    req: Request,
    res: Response
): Promise<void> => {
    const ratingId = req.params.id;

    try {
        const { firstName, lastName, userProfession, rating, review } =
            req.body;

        const updatedRating = await Rating.findByIdAndUpdate(
            ratingId,
            { firstName, lastName, userProfession, rating, review },
            { new: true }
        );

        if (!updatedRating) {
            res.status(404).json({ message: 'Rating not found' });
            return;
        }

        res.status(200).json({ updatedRating });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a rating
export const deleteRating = async (
    req: Request,
    res: Response
): Promise<void> => {
    const ratingId = req.params.id;

    try {
        const deletedRating = await Rating.findByIdAndDelete(ratingId);

        if (deletedRating) {
            res.status(200).json({ message: 'Rating deleted successfully' });
        } else {
            res.status(404).json({ message: 'Rating not found' });
        }
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
